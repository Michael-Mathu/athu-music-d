use crate::database;
use lofty::config::WriteOptions;
use lofty::id3::v2::{Frame, Id3v2Tag, UnsynchronizedTextFrame};
use lofty::prelude::TagExt as _;
use lofty::TextEncoding;
use reqwest::blocking::Client;
use rusqlite::{params, Connection};
use serde::Deserialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Duration;

pub fn fetch_track_lyrics(
    app_dir: &Path,
    conn: &Connection,
    track_id: i64,
) -> Result<database::LyricsPayload, String> {
    if let Some(cached) = database::get_cached_lyrics(conn, track_id).map_err(|e| e.to_string())? {
        return Ok(cached);
    }

    let track = database::get_track_metadata(conn, track_id).map_err(|e| e.to_string())?;
    let response = search_lrclib(&track)?;
    let raw_lrc = response
        .synced_lyrics
        .or(response.plain_lyrics.clone())
        .ok_or_else(|| "No lyrics found for this track".to_string())?;

    let lines = database::parse_lrc_lines(&raw_lrc);
    let plain_text = if let Some(plain) = response.plain_lyrics {
        plain
    } else if !lines.is_empty() {
        lines
            .iter()
            .map(|line| line.text.clone())
            .collect::<Vec<_>>()
            .join("\n")
    } else {
        raw_lrc.clone()
    };

    let stored_path = write_lrc_sidecar(&track.file_path, &raw_lrc)
        .map(|path| path.to_string_lossy().to_string());
    let embedded = try_embed_mp3_lyrics(&track.file_path, &plain_text, &lines).unwrap_or(false);

    let payload = database::LyricsPayload {
        track_id,
        provider: "lrclib".to_string(),
        raw_lrc,
        plain_text,
        synced: !lines.is_empty(),
        embedded,
        stored_path,
        lines,
    };

    database::upsert_lyrics_cache(conn, &payload).map_err(|e| e.to_string())?;

    let _ = fs::create_dir_all(app_dir.join("lyrics-cache"));

    Ok(payload)
}

#[allow(dead_code)]
pub fn set_track_lyrics(
    app_dir: &Path,
    conn: &Connection,
    track_id: i64,
    raw_lrc: String,
) -> Result<database::LyricsPayload, String> {
    let track = database::get_track_metadata(conn, track_id).map_err(|e| e.to_string())?;

    let lines = database::parse_lrc_lines(&raw_lrc);
    let plain_text = if !lines.is_empty() {
        lines
            .iter()
            .map(|line| line.text.clone())
            .collect::<Vec<_>>()
            .join("\n")
    } else {
        raw_lrc.clone()
    };

    let stored_path = write_lrc_sidecar(&track.file_path, &raw_lrc)
        .map(|path| path.to_string_lossy().to_string());
    
    // Write plain text USLT regardless if it's synced. Lofty's SYLT construct is incredibly nested
    // but standard readers load plain text fallback cleanly.
    let embedded = try_embed_mp3_lyrics(&track.file_path, &plain_text, &lines).unwrap_or(false);

    let payload = database::LyricsPayload {
        track_id,
        provider: "manual".to_string(),
        raw_lrc,
        plain_text,
        synced: !lines.is_empty(),
        embedded,
        stored_path,
        lines,
    };

    database::upsert_lyrics_cache(conn, &payload).map_err(|e| e.to_string())?;
    let _ = fs::create_dir_all(app_dir.join("lyrics-cache"));

    Ok(payload)
}

pub fn fetch_artist_bio(
    conn: &Connection,
    artist_id: i64,
) -> Result<database::ArtistBioPayload, String> {
    if let Some(cached) = database::get_cached_artist_bio(conn, artist_id).map_err(|e| e.to_string())? {
        return Ok(cached);
    }

    let artist_name: String = conn
        .query_row(
            "SELECT name FROM artists WHERE id = ?1",
            params![artist_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let client = http_client()?;
    let wiki_url = resolve_wikipedia_url(&client, &artist_name);
    let (source_url, summary_title) = if let Some(url) = wiki_url {
        let title = url.rsplit('/').next().unwrap_or(&artist_name).to_string();
        (Some(url), title)
    } else {
        (
            Some(format!("https://en.wikipedia.org/wiki/{}", urlencoding::encode(&artist_name.replace(' ', "_")))),
            artist_name.replace(' ', "_"),
        )
    };

    let summary = fetch_wikipedia_summary(&client, &summary_title)
        .or_else(|_| fetch_wikipedia_summary(&client, &format!("{}_musician", artist_name.replace(' ', "_"))))
        .map_err(|e| e.to_string())?;

    let payload = database::ArtistBioPayload {
        artist_id,
        artist_name,
        biography: summary.extract,
        provider: "wikipedia".to_string(),
        source_url: source_url.or(summary.content_urls.and_then(|urls| urls.desktop.and_then(|d| d.page))),
    };

    database::upsert_artist_bio(conn, &payload).map_err(|e| e.to_string())?;
    Ok(payload)
}

pub fn fetch_album_art(
    app_dir: &Path,
    conn: &Connection,
    album_id: i64,
) -> Result<database::AlbumArtPayload, String> {
    let (album_title, artist_name): (String, String) = conn
        .query_row(
            "
            SELECT al.title, COALESCE(ar.name, 'Unknown Artist')
            FROM albums al
            LEFT JOIN artists ar ON ar.id = al.artist_id
            WHERE al.id = ?1
            ",
            params![album_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| e.to_string())?;

    let client = http_client()?;
    let cover_url = search_deezer_cover(&client, &album_title, &artist_name)?;
    let image_bytes = client
        .get(&cover_url)
        .send()
        .and_then(|response| response.error_for_status())
        .map_err(|e| e.to_string())?
        .bytes()
        .map_err(|e| e.to_string())?;

    let covers_dir = app_dir.join("covers");
    fs::create_dir_all(&covers_dir).map_err(|e| e.to_string())?;
    let local_path = covers_dir.join(format!("album-{album_id}.jpg"));
    fs::write(&local_path, &image_bytes).map_err(|e| e.to_string())?;

    database::set_album_cover_path(conn, album_id, &local_path).map_err(|e| e.to_string())
}

fn http_client() -> Result<Client, String> {
    Client::builder()
        .timeout(Duration::from_secs(20))
        .user_agent("athu-music-d/0.1 (+https://example.invalid)")
        .build()
        .map_err(|e| e.to_string())
}

fn write_lrc_sidecar(file_path: &str, raw_lrc: &str) -> Option<PathBuf> {
    let sidecar = Path::new(file_path).with_extension("lrc");
    fs::write(&sidecar, raw_lrc).ok()?;
    Some(sidecar)
}

fn try_embed_mp3_lyrics(
    file_path: &str,
    plain_text: &str,
    _lines: &[database::LyricsLine],
) -> Result<bool, String> {
    let path = Path::new(file_path);
    let ext = path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();

    if ext != "mp3" {
        return Ok(false);
    }

    let mut tag = Id3v2Tag::new();
    
    // Always write fallback unsynchronized frame 
    tag.insert(Frame::UnsynchronizedText(UnsynchronizedTextFrame::new(
        TextEncoding::UTF8,
        *b"eng",
        String::new(),
        plain_text.to_string(),
    )));

    // SYLT embedding is disabled in this version to avoid lofty 0.24.0 API conflicts.
    // Clean display is maintained via sidecar files and database caching.
    /*
    if !lines.is_empty() {
        // ... (SYLT logic)
    }
    */

    tag.save_to_path(path, WriteOptions::default())
        .map_err(|e| e.to_string())?;
    Ok(true)
}

fn search_lrclib(track: &database::TrackMetadata) -> Result<LrclibResult, String> {
    let client = http_client()?;
    let url = format!(
        "https://lrclib.net/api/search?track_name={}&artist_name={}&album_name={}",
        urlencoding::encode(&track.title),
        urlencoding::encode(&track.artist),
        urlencoding::encode(&track.album),
    );

    let results = client
        .get(url)
        .send()
        .and_then(|response| response.error_for_status())
        .map_err(|e| e.to_string())?
        .json::<Vec<LrclibResult>>()
        .map_err(|e| e.to_string())?;

    results
        .into_iter()
        .find(|entry| entry.synced_lyrics.is_some() || entry.plain_lyrics.is_some())
        .ok_or_else(|| "No lyrics found in LRCLIB".to_string())
}

fn resolve_wikipedia_url(client: &Client, artist_name: &str) -> Option<String> {
    let search_url = format!(
        "https://musicbrainz.org/ws/2/artist?query={}&fmt=json&limit=1",
        urlencoding::encode(&format!("artist:{artist_name}"))
    );

    let search_result = client
        .get(search_url)
        .send()
        .ok()?
        .error_for_status()
        .ok()?
        .json::<MusicBrainzSearchResult>()
        .ok()?;

    let artist = search_result.artists.into_iter().next()?;
    let details_url = format!(
        "https://musicbrainz.org/ws/2/artist/{}?inc=url-rels&fmt=json",
        artist.id
    );

    let details = client
        .get(details_url)
        .send()
        .ok()?
        .error_for_status()
        .ok()?
        .json::<MusicBrainzArtistDetails>()
        .ok()?;

    details
        .relations
        .unwrap_or_default()
        .into_iter()
        .find(|relation| relation.relation_type.eq_ignore_ascii_case("wikipedia"))
        .and_then(|relation| relation.url)
        .map(|url| url.resource)
}

fn fetch_wikipedia_summary(client: &Client, title: &str) -> Result<WikipediaSummary, reqwest::Error> {
    let url = format!(
        "https://en.wikipedia.org/api/rest_v1/page/summary/{}",
        urlencoding::encode(title)
    );

    client
        .get(url)
        .send()?
        .error_for_status()?
        .json::<WikipediaSummary>()
}

fn search_deezer_cover(client: &Client, album_title: &str, artist_name: &str) -> Result<String, String> {
    let query = format!("album:\"{album_title}\" artist:\"{artist_name}\"");
    let url = format!(
        "https://api.deezer.com/search/album?q={}",
        urlencoding::encode(&query)
    );

    let result = client
        .get(url)
        .send()
        .and_then(|response| response.error_for_status())
        .map_err(|e| e.to_string())?
        .json::<DeezerSearchResult>()
        .map_err(|e| e.to_string())?;

    let album = result
        .data
        .into_iter()
        .next()
        .ok_or_else(|| "No album art found in Deezer".to_string())?;

    let cover = album
        .cover_xl
        .or(album.cover_big)
        .or(album.cover_medium)
        .or(album.cover)
        .ok_or_else(|| "Deezer returned no cover art URL".to_string())?;

    Ok(cover.replace("250x250", "1000x1000"))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LrclibResult {
    synced_lyrics: Option<String>,
    plain_lyrics: Option<String>,
}

#[derive(Deserialize)]
struct MusicBrainzSearchResult {
    artists: Vec<MusicBrainzArtist>,
}

#[derive(Deserialize)]
struct MusicBrainzArtist {
    id: String,
}

#[derive(Deserialize)]
struct MusicBrainzArtistDetails {
    relations: Option<Vec<MusicBrainzRelation>>,
}

#[derive(Deserialize)]
struct MusicBrainzRelation {
    #[serde(rename = "type")]
    relation_type: String,
    url: Option<MusicBrainzUrl>,
}

#[derive(Deserialize)]
struct MusicBrainzUrl {
    resource: String,
}

#[derive(Deserialize)]
struct WikipediaSummary {
    extract: String,
    content_urls: Option<WikipediaContentUrls>,
}

#[derive(Deserialize)]
struct WikipediaContentUrls {
    desktop: Option<WikipediaDesktopLink>,
}

#[derive(Deserialize)]
struct WikipediaDesktopLink {
    page: Option<String>,
}

#[derive(Deserialize)]
struct DeezerSearchResult {
    data: Vec<DeezerAlbum>,
}

#[derive(Deserialize)]
struct DeezerAlbum {
    cover: Option<String>,
    cover_medium: Option<String>,
    cover_big: Option<String>,
    cover_xl: Option<String>,
}
