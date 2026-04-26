use crate::database::{self, DbState};
use lofty::file::TaggedFileExt;
use lofty::tag::{Accessor, TagExt, ItemKey};
use lofty::probe::Probe;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct LyricsResult {
    pub lrc_content: String,
    pub synced: bool,
    pub source: String,
    pub embedded: bool,
    pub sidecar_path: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LrclibResponse {
    synced_lyrics: Option<String>,
    plain_lyrics: Option<String>,
}

#[tauri::command]
pub async fn download_and_embed_lyrics(
    track_id: i64,
    artist: String,
    title: String,
    album: Option<String>,
    duration: Option<f64>,
    file_path: String,
    state: State<'_, DbState>,
) -> Result<LyricsResult, String> {
    // 1. Fetch from LRCLIB
    let mut url = format!(
        "https://lrclib.net/api/get?artist_name={}&track_name={}",
        urlencoding::encode(&artist),
        urlencoding::encode(&title)
    );
    if let Some(alb) = album {
        url.push_str(&format!("&album_name={}", urlencoding::encode(&alb)));
    }
    if let Some(dur) = duration {
        url.push_str(&format!("&duration={}", dur.round()));
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .user_agent("AthuMusicD (https://github.com/Michael-Mathu/athu-music-d)")
        .build()
        .map_err(|e| e.to_string())?;

    let res = client.get(url).send().await.map_err(|e| e.to_string())?;
    
    if res.status().as_u16() == 404 {
        return Err("No lyrics found for this track online.".to_string());
    }

    let data: LrclibResponse = res.json().await.map_err(|e| e.to_string())?;
    
    let synced = data.synced_lyrics.is_some();
    let lrc_content = data.synced_lyrics
        .or(data.plain_lyrics)
        .ok_or_else(|| "No lyrics found for this track.".to_string())?;

    // 2. Save sidecar
    let sidecar_path = save_lrc_sidecar(&file_path, &lrc_content);

    // 3. Embed into audio file
    let embedded = embed_lyrics_metadata(&file_path, &lrc_content).is_ok();

    // 4. Update Database Cache
    {
        let conn = state.conn.lock().unwrap();
        let lines = database::parse_lrc_lines(&lrc_content);
        let payload = database::LyricsPayload {
            track_id,
            provider: "lrclib".to_string(),
            raw_lrc: lrc_content.clone(),
            plain_text: if lines.is_empty() { lrc_content.clone() } else { lines.iter().map(|l| l.text.clone()).collect::<Vec<_>>().join("\n") },
            synced,
            embedded,
            stored_path: sidecar_path.clone(),
            lines,
        };
        let _ = database::upsert_lyrics_cache(&conn, &payload);
    }

    Ok(LyricsResult {
        lrc_content,
        synced,
        source: "lrclib".to_string(),
        embedded,
        sidecar_path,
    })
}

fn save_lrc_sidecar(file_path: &str, content: &str) -> Option<String> {
    let path = Path::new(file_path);
    let lrc_path = path.with_extension("lrc");
    fs::write(&lrc_path, content).ok()?;
    Some(lrc_path.to_string_lossy().to_string())
}

fn embed_lyrics_metadata(file_path: &str, content: &str) -> Result<(), String> {
    let path = Path::new(file_path);
    let mut tagged_file = Probe::open(path)
        .map_err(|e| e.to_string())?
        .read()
        .map_err(|e| e.to_string())?;

    let file_type = tagged_file.file_type();
    let tag = tagged_file.primary_tag_mut()
        .or_else(|| tagged_file.first_tag_mut())
        .ok_or("No tags found in file to embed lyrics")?;

    match file_type {
        lofty::file::FileType::MPEG => {
            // ID3v2 USLT
            tag.insert_text(ItemKey::Lyrics, content.to_string());
        },
        lofty::file::FileType::FLAC => {
            // Vorbis Comment LYRICS
            tag.insert_text(ItemKey::Unknown("LYRICS".to_string()), content.to_string());
        },
        _ => return Err("Unsupported file format for embedding".to_string()),
    }

    tag.save_to_path(path)
        .map_err(|e| format!("Failed to save embedded lyrics: {}", e))?;

    Ok(())
}
