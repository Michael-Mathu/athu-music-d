use lofty::probe::Probe;
use lofty::file::{AudioFile, TaggedFileExt};
use lofty::tag::Accessor;
use rusqlite::Connection;
use std::path::Path;
use walkdir::WalkDir;

pub fn scan_directory(dir: &str, conn: &mut Connection) -> rusqlite::Result<()> {
    let tx = conn.transaction()?;

    for entry in WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                if matches!(ext.to_lowercase().as_str(), "mp3" | "flac" | "wav" | "m4a") {
                    let _ = parse_and_insert(&tx, path);
                }
            }
        }
    }
    tx.commit()?;
    Ok(())
}

fn parse_and_insert(tx: &rusqlite::Transaction, path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let tagged_file = match Probe::open(path).and_then(|p| p.read()) {
        Ok(f) => f,
        Err(_) => return Ok(()),
    };

    let title = tagged_file.primary_tag().and_then(|t| t.title().as_deref().map(|s| s.to_string()))
        .unwrap_or_else(|| path.file_stem().and_then(|s| s.to_str()).unwrap_or("Unknown").to_string());
    let artist = tagged_file.primary_tag().and_then(|t| t.artist().as_deref().map(|s| s.to_string())).unwrap_or_else(|| "Unknown Artist".to_string());
    let album = tagged_file.primary_tag().and_then(|t| t.album().as_deref().map(|s| s.to_string())).unwrap_or_else(|| "Unknown Album".to_string());
    let duration = tagged_file.properties().duration().as_secs();
    let year: Option<i64> = None;
    let track_number = tagged_file.primary_tag().and_then(|t| t.track()).map(|track| track as i64);
    let disc_number = tagged_file.primary_tag().and_then(|t| t.disk()).map(|disc| disc as i64);

    let mtime = path.metadata()
        .and_then(|m| m.modified())
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e)))
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    tx.execute("INSERT OR IGNORE INTO artists (name) VALUES (?1)", rusqlite::params![&artist])?;
    let artist_id: i64 = tx.query_row("SELECT id FROM artists WHERE name = ?1", rusqlite::params![&artist], |row| row.get(0))?;

    tx.execute("INSERT OR IGNORE INTO albums (title, artist_id) VALUES (?1, ?2)", rusqlite::params![&album, artist_id])?;
    let album_id: i64 = tx.query_row("SELECT id FROM albums WHERE title = ?1 AND artist_id = ?2", rusqlite::params![&album, artist_id], |row| row.get(0))?;
    tx.execute(
        "UPDATE albums SET year = COALESCE(year, ?1) WHERE id = ?2",
        rusqlite::params![year, album_id]
    )?;

    let path_str = path.to_str().unwrap_or("");
    tx.execute(
        "INSERT OR REPLACE INTO tracks (title, file_path, duration, track_number, disc_number, album_id, artist_id, date_modified) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![&title, path_str, duration as i64, track_number, disc_number, album_id, artist_id, mtime]
    )?;

    Ok(())
}
