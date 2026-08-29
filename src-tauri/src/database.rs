use base64::Engine;
use lofty::picture::PictureType;
use lofty::prelude::TaggedFileExt;
use lofty::probe::Probe;
use rusqlite::{params, Connection, OptionalExtension, Result};
use serde::Serialize;
use std::path::Path;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct DbState {
    pub conn: Arc<Mutex<Connection>>,
}

#[derive(Serialize)]
pub struct TrackRecord {
    pub id: i64,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration: i64,
    pub file_path: String,
    pub date_modified: i64,
    pub album_id: Option<i64>,
    pub artist_id: Option<i64>,
    pub cover_art_data_url: Option<String>,
}

#[derive(Serialize)]
pub struct AlbumRecord {
    pub id: i64,
    pub title: String,
    pub artist: String,
    pub track_count: i64,
    pub date_modified: i64,
    pub year: Option<i64>,
    pub artist_id: Option<i64>,
    pub cover_art_data_url: Option<String>,
}

#[derive(Serialize)]
pub struct ArtistRecord {
    pub id: i64,
    pub name: String,
    pub track_count: i64,
    pub album_count: i64,
    pub date_modified: i64,
}

#[allow(dead_code)]
#[derive(Clone)]
pub struct TrackMetadata {
    pub id: i64,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub file_path: String,
    pub artist_id: Option<i64>,
    pub album_id: Option<i64>,
}

#[derive(Serialize, Clone)]
pub struct LyricsLine {
    pub timestamp_ms: u32,
    pub text: String,
}

#[derive(Serialize, Clone)]
pub struct LyricsPayload {
    pub track_id: i64,
    pub provider: String,
    pub raw_lrc: String,
    pub plain_text: String,
    pub synced: bool,
    pub embedded: bool,
    pub stored_path: Option<String>,
    pub lines: Vec<LyricsLine>,
}

#[derive(Serialize, Clone)]
pub struct ArtistBioPayload {
    pub artist_id: i64,
    pub artist_name: String,
    pub biography: String,
    pub provider: String,
    pub source_url: Option<String>,
}

#[derive(Serialize, Clone)]
pub struct AlbumArtPayload {
    pub album_id: i64,
    pub provider: String,
    pub local_path: String,
    pub cover_art_data_url: String,
}

#[derive(Serialize, Clone)]
pub struct PlaylistRecord {
    pub id: i64,
    pub name: String,
    pub track_count: i64,
}

#[derive(Serialize, Clone)]
pub struct PlaylistTrackRecord {
    pub playlist_id: i64,
    pub track_id: i64,
    pub position: i64,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration: i64,
}

pub fn init_db(app_dir: &std::path::Path) -> Result<Connection> {
    let db_path = app_dir.join("library.db");
    let conn = Connection::open(&db_path)?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS artists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            image_path TEXT
        );

        CREATE TABLE IF NOT EXISTS albums (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            artist_id INTEGER,
            cover_image_path TEXT,
            year INTEGER,
            UNIQUE(title, artist_id),
            FOREIGN KEY(artist_id) REFERENCES artists(id)
        );

        CREATE TABLE IF NOT EXISTS tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            file_path TEXT NOT NULL UNIQUE,
            duration INTEGER NOT NULL,
            track_number INTEGER,
            disc_number INTEGER,
            album_id INTEGER,
            artist_id INTEGER,
            date_modified INTEGER DEFAULT 0,
            FOREIGN KEY(album_id) REFERENCES albums(id),
            FOREIGN KEY(artist_id) REFERENCES artists(id)
        );

        CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS playlist_tracks (
            playlist_id INTEGER,
            track_id INTEGER,
            position INTEGER,
            PRIMARY KEY(playlist_id, track_id),
            FOREIGN KEY(playlist_id) REFERENCES playlists(id),
            FOREIGN KEY(track_id) REFERENCES tracks(id)
        );

        CREATE TABLE IF NOT EXISTS lyrics_cache (
            track_id INTEGER PRIMARY KEY,
            provider TEXT NOT NULL,
            raw_lrc TEXT NOT NULL,
            plain_text TEXT NOT NULL,
            synced INTEGER NOT NULL DEFAULT 0,
            embedded INTEGER NOT NULL DEFAULT 0,
            stored_path TEXT,
            fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(track_id) REFERENCES tracks(id)
        );

        CREATE TABLE IF NOT EXISTS artist_bios (
            artist_id INTEGER PRIMARY KEY,
            provider TEXT NOT NULL,
            biography TEXT NOT NULL,
            source_url TEXT,
            fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(artist_id) REFERENCES artists(id)
        );

        CREATE TABLE IF NOT EXISTS artist_metadata (
            artist_name TEXT PRIMARY KEY,
            image_url TEXT,
            bio TEXT,
            extra_data TEXT,
            source TEXT,
            fetched_at INTEGER
        );

        CREATE INDEX IF NOT EXISTS idx_tracks_album_id ON tracks(album_id);
        CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
        CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON albums(artist_id);
        "
    )?;

    // Migration: Add date_modified column to tracks if it doesn't exist
    let has_date_modified: i64 = conn.query_row(
        "SELECT count(*) FROM pragma_table_info('tracks') WHERE name='date_modified'",
        [],
        |row| row.get(0),
    ).unwrap_or(0);

    if has_date_modified == 0 {
        conn.execute("ALTER TABLE tracks ADD COLUMN date_modified INTEGER DEFAULT 0", [])?;
    }

    Ok(conn)
}

pub fn get_tracks(conn: &Connection) -> Result<Vec<TrackRecord>> {
    let mut stmt = conn.prepare(
        "
        SELECT
            t.id,
            t.title,
            COALESCE(ar.name, 'Unknown Artist') AS artist,
            COALESCE(al.title, 'Unknown Album') AS album,
            t.duration,
            t.file_path,
            t.album_id,
            t.artist_id,
            al.cover_image_path,
            t.date_modified
        FROM tracks t
        LEFT JOIN artists ar ON ar.id = t.artist_id
        LEFT JOIN albums al ON al.id = t.album_id
        ORDER BY artist COLLATE NOCASE, album COLLATE NOCASE, t.disc_number, t.track_number, t.title COLLATE NOCASE
        ",
    )?;

    let rows = stmt.query_map([], |row| {
        let file_path: String = row.get(5)?;
        let album_id: Option<i64> = row.get(6)?;
        let artist_id: Option<i64> = row.get(7)?;
        let cover_image_path: Option<String> = row.get(8)?;

        Ok(TrackRecord {
            id: row.get(0)?,
            title: row.get(1)?,
            artist: row.get(2)?,
            album: row.get(3)?,
            duration: row.get(4)?,
            album_id,
            artist_id,
            cover_art_data_url: cover_image_path
                .as_deref()
                .and_then(|path| data_url_from_path(Path::new(path)))
                .or_else(|| extract_cover_art_data_url(Path::new(&file_path))),
            file_path,
            date_modified: row.get(9)?,
        })
    })?;

    rows.collect()
}

pub fn get_playlists(conn: &Connection) -> Result<Vec<PlaylistRecord>> {
    let mut stmt = conn.prepare(
        "
        SELECT p.id, p.name, COUNT(pt.track_id) AS track_count
        FROM playlists p
        LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id
        GROUP BY p.id, p.name
        ORDER BY p.created_at DESC, p.id DESC
        ",
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(PlaylistRecord {
            id: row.get(0)?,
            name: row.get(1)?,
            track_count: row.get(2)?,
        })
    })?;
    rows.collect()
}

pub fn create_playlist(conn: &Connection, name: &str) -> Result<PlaylistRecord> {
    conn.execute(
        "INSERT INTO playlists (name) VALUES (?1)",
        params![name.trim()],
    )?;
    let id = conn.last_insert_rowid();
    Ok(PlaylistRecord {
        id,
        name: name.trim().to_string(),
        track_count: 0,
    })
}

pub fn add_track_to_playlist(conn: &Connection, playlist_id: i64, track_id: i64) -> Result<()> {
    let next_position: i64 = conn.query_row(
        "SELECT COALESCE(MAX(position), 0) + 1 FROM playlist_tracks WHERE playlist_id = ?1",
        params![playlist_id],
        |row| row.get(0),
    )?;

    conn.execute(
        "
        INSERT INTO playlist_tracks (playlist_id, track_id, position)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(playlist_id, track_id) DO UPDATE SET position = excluded.position
        ",
        params![playlist_id, track_id, next_position],
    )?;
    Ok(())
}

pub fn remove_track_from_playlist(conn: &Connection, playlist_id: i64, track_id: i64) -> Result<()> {
    conn.execute(
        "DELETE FROM playlist_tracks WHERE playlist_id = ?1 AND track_id = ?2",
        params![playlist_id, track_id],
    )?;
    Ok(())
}

pub fn get_playlist_tracks(conn: &Connection, playlist_id: i64) -> Result<Vec<PlaylistTrackRecord>> {
    let mut stmt = conn.prepare(
        "
        SELECT
            pt.playlist_id,
            pt.track_id,
            pt.position,
            COALESCE(t.title, 'Unknown') AS title,
            COALESCE(ar.name, 'Unknown Artist') AS artist,
            COALESCE(al.title, 'Unknown Album') AS album,
            COALESCE(t.duration, 0) AS duration
        FROM playlist_tracks pt
        LEFT JOIN tracks t ON t.id = pt.track_id
        LEFT JOIN artists ar ON ar.id = t.artist_id
        LEFT JOIN albums al ON al.id = t.album_id
        WHERE pt.playlist_id = ?1
        ORDER BY pt.position ASC
        ",
    )?;
    let rows = stmt.query_map(params![playlist_id], |row| {
        Ok(PlaylistTrackRecord {
            playlist_id: row.get(0)?,
            track_id: row.get(1)?,
            position: row.get(2)?,
            title: row.get(3)?,
            artist: row.get(4)?,
            album: row.get(5)?,
            duration: row.get(6)?,
        })
    })?;

    rows.collect()
}

pub fn get_albums(conn: &Connection) -> Result<Vec<AlbumRecord>> {
    let mut stmt = conn.prepare(
        "
        SELECT
            al.id,
            al.title,
            COALESCE(ar.name, 'Unknown Artist') AS artist,
            COUNT(t.id) AS track_count,
            al.year,
            MIN(t.file_path) AS sample_file_path,
            al.artist_id,
            al.cover_image_path,
            MAX(t.date_modified) AS date_modified
        FROM albums al
        LEFT JOIN artists ar ON ar.id = al.artist_id
        LEFT JOIN tracks t ON t.album_id = al.id
        GROUP BY al.id, al.title, artist, al.year
        ORDER BY artist COLLATE NOCASE, al.title COLLATE NOCASE
        ",
    )?;

    let rows = stmt.query_map([], |row| {
        let sample_file_path: Option<String> = row.get(5)?;
        let artist_id: Option<i64> = row.get(6)?;
        let cover_image_path: Option<String> = row.get(7)?;

        Ok(AlbumRecord {
            id: row.get(0)?,
            title: row.get(1)?,
            artist: row.get(2)?,
            track_count: row.get(3)?,
            year: row.get(4)?,
            artist_id,
            cover_art_data_url: cover_image_path
                .as_deref()
                .and_then(|path| data_url_from_path(Path::new(path)))
                .or_else(|| sample_file_path
                .as_deref()
                .and_then(|path| extract_cover_art_data_url(Path::new(path)))),
            date_modified: row.get(8).unwrap_or(0),
        })
    })?;

    rows.collect()
}

pub fn get_artists(conn: &Connection) -> Result<Vec<ArtistRecord>> {
    let mut stmt = conn.prepare(
        "
        SELECT
            ar.id,
            ar.name,
            COUNT(t.id) AS track_count,
            COUNT(DISTINCT al.id) AS album_count,
            MAX(t.date_modified) AS date_modified
        FROM artists ar
        LEFT JOIN tracks t ON t.artist_id = ar.id
        LEFT JOIN albums al ON al.artist_id = ar.id
        GROUP BY ar.id, ar.name
        ORDER BY ar.name COLLATE NOCASE
        ",
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(ArtistRecord {
            id: row.get(0)?,
            name: row.get(1)?,
            track_count: row.get(2)?,
            album_count: row.get(3)?,
            date_modified: row.get(4).unwrap_or(0),
        })
    })?;

    rows.collect()
}

pub fn get_track_metadata(conn: &Connection, track_id: i64) -> Result<TrackMetadata> {
    conn.query_row(
        "
        SELECT
            t.id,
            t.title,
            COALESCE(ar.name, 'Unknown Artist') AS artist,
            COALESCE(al.title, 'Unknown Album') AS album,
            t.file_path,
            t.artist_id,
            t.album_id
        FROM tracks t
        LEFT JOIN artists ar ON ar.id = t.artist_id
        LEFT JOIN albums al ON al.id = t.album_id
        WHERE t.id = ?1
        ",
        params![track_id],
        |row| {
            Ok(TrackMetadata {
                id: row.get(0)?,
                title: row.get(1)?,
                artist: row.get(2)?,
                album: row.get(3)?,
                file_path: row.get(4)?,
                artist_id: row.get(5)?,
                album_id: row.get(6)?,
            })
        },
    )
}

pub fn get_cached_lyrics(conn: &Connection, track_id: i64) -> Result<Option<LyricsPayload>> {
    conn.query_row(
        "
        SELECT provider, raw_lrc, plain_text, synced, embedded, stored_path
        FROM lyrics_cache
        WHERE track_id = ?1
        ",
        params![track_id],
        |row| {
            let raw_lrc: String = row.get(1)?;
            Ok(LyricsPayload {
                track_id,
                provider: row.get(0)?,
                plain_text: row.get(2)?,
                synced: row.get::<_, i64>(3)? != 0,
                embedded: row.get::<_, i64>(4)? != 0,
                stored_path: row.get(5)?,
                lines: parse_lrc_lines(&raw_lrc),
                raw_lrc,
            })
        },
    ).optional()
}

pub fn upsert_lyrics_cache(conn: &Connection, payload: &LyricsPayload) -> Result<()> {
    conn.execute(
        "
        INSERT INTO lyrics_cache (track_id, provider, raw_lrc, plain_text, synced, embedded, stored_path, fetched_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)
        ON CONFLICT(track_id) DO UPDATE SET
            provider = excluded.provider,
            raw_lrc = excluded.raw_lrc,
            plain_text = excluded.plain_text,
            synced = excluded.synced,
            embedded = excluded.embedded,
            stored_path = excluded.stored_path,
            fetched_at = CURRENT_TIMESTAMP
        ",
        params![
            payload.track_id,
            payload.provider,
            payload.raw_lrc,
            payload.plain_text,
            payload.synced as i64,
            payload.embedded as i64,
            payload.stored_path,
        ],
    )?;

    Ok(())
}

pub fn get_cached_artist_bio(conn: &Connection, artist_id: i64) -> Result<Option<ArtistBioPayload>> {
    conn.query_row(
        "
        SELECT ar.name, ab.provider, ab.biography, ab.source_url
        FROM artist_bios ab
        JOIN artists ar ON ar.id = ab.artist_id
        WHERE ab.artist_id = ?1
        ",
        params![artist_id],
        |row| {
            Ok(ArtistBioPayload {
                artist_id,
                artist_name: row.get(0)?,
                provider: row.get(1)?,
                biography: row.get(2)?,
                source_url: row.get(3)?,
            })
        },
    ).optional()
}

pub fn get_cached_artist_metadata(conn: &Connection, artist_name: &str) -> Result<Option<crate::apis::ArtistMeta>> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;
    let ttl = 7 * 24 * 60 * 60; // 7 days

    conn.query_row(
        "SELECT image_url, bio, extra_data, source FROM artist_metadata WHERE artist_name = ?1 AND fetched_at > ?2",
        params![artist_name, now - ttl],
        |row| {
            let extra_data: Option<String> = row.get(2)?;
            let details: Option<std::collections::HashMap<String, String>> = extra_data
                .and_then(|s| serde_json::from_str(&s).ok());

            Ok(crate::apis::ArtistMeta {
                image_url: row.get(0)?,
                bio: row.get(1)?,
                details,
                source: row.get(3)?,
            })
        },
    ).optional()
}

pub fn cache_artist_metadata(conn: &Connection, artist_name: &str, meta: &crate::apis::ArtistMeta) -> Result<()> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;
    
    let extra_data = meta.details.as_ref().and_then(|d| serde_json::to_string(d).ok());

    conn.execute(
        "INSERT OR REPLACE INTO artist_metadata (artist_name, image_url, bio, extra_data, source, fetched_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![artist_name, meta.image_url, meta.bio, extra_data, meta.source, now],
    )?;
    Ok(())
}
pub fn upsert_artist_bio(conn: &Connection, payload: &ArtistBioPayload) -> Result<()> {
    conn.execute(
        "
        INSERT INTO artist_bios (artist_id, provider, biography, source_url, fetched_at)
        VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)
        ON CONFLICT(artist_id) DO UPDATE SET
            provider = excluded.provider,
            biography = excluded.biography,
            source_url = excluded.source_url,
            fetched_at = CURRENT_TIMESTAMP
        ",
        params![
            payload.artist_id,
            payload.provider,
            payload.biography,
            payload.source_url,
        ],
    )?;

    Ok(())
}

pub fn set_album_cover_path(conn: &Connection, album_id: i64, path: &Path) -> Result<AlbumArtPayload> {
    let path_str = path.to_string_lossy().to_string();
    conn.execute(
        "UPDATE albums SET cover_image_path = ?1 WHERE id = ?2",
        params![path_str, album_id],
    )?;

    let cover_art_data_url = data_url_from_path(path).unwrap_or_default();

    Ok(AlbumArtPayload {
        album_id,
        provider: "deezer".to_string(),
        local_path: path_str,
        cover_art_data_url,
    })
}

pub fn parse_lrc_lines(raw_lrc: &str) -> Vec<LyricsLine> {
    raw_lrc
        .lines()
        .flat_map(parse_lrc_line)
        .collect()
}

fn parse_lrc_line(line: &str) -> Vec<LyricsLine> {
    let mut timestamps = Vec::new();
    let mut rest = line;

    while let Some(stripped) = rest.strip_prefix('[') {
        if let Some(end_idx) = stripped.find(']') {
            let token = &stripped[..end_idx];
            if let Some(timestamp_ms) = parse_timestamp(token) {
                timestamps.push(timestamp_ms);
                rest = &stripped[end_idx + 1..];
                continue;
            }
        }
        break;
    }

    let text = rest.trim().to_string();
    timestamps
        .into_iter()
        .map(|timestamp_ms| LyricsLine {
            timestamp_ms,
            text: text.clone(),
        })
        .collect()
}

fn parse_timestamp(token: &str) -> Option<u32> {
    let mut parts = token.split(':');
    let minutes: u32 = parts.next()?.parse().ok()?;
    let seconds_part = parts.next()?;
    if parts.next().is_some() {
        return None;
    }

    let mut second_parts = seconds_part.split('.');
    let seconds: u32 = second_parts.next()?.parse().ok()?;
    let centis = second_parts.next().unwrap_or("0");
    let millis = match centis.len() {
        0 => 0,
        1 => centis.parse::<u32>().ok()? * 100,
        2 => centis.parse::<u32>().ok()? * 10,
        _ => centis[..3].parse::<u32>().ok()?,
    };

    Some(minutes * 60_000 + seconds * 1_000 + millis)
}

fn extract_cover_art_data_url(path: &Path) -> Option<String> {
    let tagged_file = Probe::open(path).ok()?.read().ok()?;
    let tag = tagged_file.primary_tag().or_else(|| tagged_file.first_tag())?;
    let picture = tag
        .pictures()
        .iter()
        .find(|picture| matches!(picture.pic_type(), PictureType::CoverFront))
        .or_else(|| tag.pictures().first())?;

    let mime = sniff_mime_type(picture.data());
    let encoded = base64::engine::general_purpose::STANDARD.encode(picture.data());

    Some(format!("data:{mime};base64,{encoded}"))
}

fn data_url_from_path(path: &Path) -> Option<String> {
    let bytes = std::fs::read(path).ok()?;
    let mime = sniff_mime_type(&bytes);
    let encoded = base64::engine::general_purpose::STANDARD.encode(bytes);
    Some(format!("data:{mime};base64,{encoded}"))
}

fn sniff_mime_type(bytes: &[u8]) -> &'static str {
    if bytes.starts_with(&[0x89, b'P', b'N', b'G']) {
        "image/png"
    } else if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {
        "image/jpeg"
    } else if bytes.starts_with(b"GIF8") {
        "image/gif"
    } else if bytes.starts_with(b"RIFF") && bytes.get(8..12) == Some(b"WEBP") {
        "image/webp"
    } else {
        "image/jpeg"
    }
}
