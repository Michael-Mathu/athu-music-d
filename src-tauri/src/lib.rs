mod database;
mod scanner;
mod audio;
mod metadata;
mod thumbnail_cache;
mod mpris_smtc;
mod apis;

use std::sync::Mutex;
use tauri::{Manager, State};
use crate::mpris_smtc::OSControlsState;

pub struct AppState {
    pub app_dir: std::path::PathBuf,
}

// Re-export commands from modules
use crate::thumbnail_cache::get_cover_thumbnail;
use crate::mpris_smtc::update_os_metadata;

#[tauri::command]
fn scan_local_files(dir: String, state: State<'_, database::DbState>) -> Result<String, String> {
    let mut conn = state.conn.lock().unwrap();
    scanner::scan_directory(&dir, &mut conn).map_err(|e| e.to_string())?;
    Ok("Scanning complete".to_string())
}

#[tauri::command]
fn list_tracks(state: State<'_, database::DbState>) -> Result<Vec<database::TrackRecord>, String> {
    let conn = state.conn.lock().unwrap();
    database::get_tracks(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_albums(state: State<'_, database::DbState>) -> Result<Vec<database::AlbumRecord>, String> {
    let conn = state.conn.lock().unwrap();
    database::get_albums(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_artists(state: State<'_, database::DbState>) -> Result<Vec<database::ArtistRecord>, String> {
    let conn = state.conn.lock().unwrap();
    database::get_artists(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_playlists(state: State<'_, database::DbState>) -> Result<Vec<database::PlaylistRecord>, String> {
    let conn = state.conn.lock().unwrap();
    database::get_playlists(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_playlist_tracks(
    playlist_id: i64,
    state: State<'_, database::DbState>,
) -> Result<Vec<database::PlaylistTrackRecord>, String> {
    let conn = state.conn.lock().unwrap();
    database::get_playlist_tracks(&conn, playlist_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_playlist(
    name: String,
    state: State<'_, database::DbState>,
) -> Result<database::PlaylistRecord, String> {
    if name.trim().is_empty() {
        return Err("Playlist name cannot be empty".to_string());
    }
    let conn = state.conn.lock().unwrap();
    database::create_playlist(&conn, &name).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_track_to_playlist(
    playlist_id: i64,
    track_id: i64,
    state: State<'_, database::DbState>,
) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    database::add_track_to_playlist(&conn, playlist_id, track_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove_track_from_playlist(
    playlist_id: i64,
    track_id: i64,
    state: State<'_, database::DbState>,
) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    database::remove_track_from_playlist(&conn, playlist_id, track_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn play_audio(path: String, state: State<'_, audio::AudioState>) -> Result<(), String> {
    state.tx.send(audio::AudioCommand::Play(path)).map_err(|e| e.to_string())
}

#[tauri::command]
fn pause_audio(state: State<'_, audio::AudioState>) -> Result<(), String> {
    state.tx.send(audio::AudioCommand::Pause).map_err(|e| e.to_string())
}

#[tauri::command]
fn resume_audio(state: State<'_, audio::AudioState>) -> Result<(), String> {
    state.tx.send(audio::AudioCommand::Resume).map_err(|e| e.to_string())
}

#[tauri::command]
fn set_volume(volume: f32, state: State<'_, audio::AudioState>) -> Result<(), String> {
    state
        .tx
        .send(audio::AudioCommand::SetVolume(volume.clamp(0.0, 1.0)))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_playback_pos_ms(state: State<'_, audio::AudioState>) -> Result<u64, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    state
        .tx
        .send(audio::AudioCommand::GetPos(tx))
        .map_err(|e| e.to_string())?;
    rx.recv().map_err(|e| e.to_string())
}

#[tauri::command]
fn seek_playback_ms(pos_ms: u64, state: State<'_, audio::AudioState>) -> Result<(), String> {
    state
        .tx
        .send(audio::AudioCommand::Seek(pos_ms))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn fetch_track_lyrics(
    track_id: i64,
    state: State<'_, database::DbState>,
    app_state: State<'_, AppState>,
) -> Result<database::LyricsPayload, String> {
    let conn = state.conn.lock().unwrap();
    metadata::fetch_track_lyrics(&app_state.app_dir, &conn, track_id)
}

#[tauri::command]
async fn fetch_artist_info(
    artist_name: String,
    state: State<'_, database::DbState>,
) -> Result<apis::ArtistMeta, String> {
    // 1. Check Cache (using a scoped block to drop the lock before .await)
    {
        let conn = state.conn.lock().unwrap();
        if let Some(cached) = database::get_cached_artist_metadata(&conn, &artist_name).map_err(|e| e.to_string())? {
            return Ok(cached);
        }
    }

    let client = reqwest::Client::new();
    let mut final_meta = apis::ArtistMeta {
        image_url: None,
        bio: None,
        details: None,
        source: "none".to_string(),
    };

    // 2. Waterfall
    // Tier 1: Deezer (Best for imagery)
    if let Ok(Some(deezer_meta)) = apis::deezer::search_artist(&client, &artist_name).await {
        final_meta.image_url = deezer_meta.image_url;
        final_meta.source = "deezer".to_string();
    }

    // Tier 2: TheAudioDB (Best for bio + details)
    // Use test key "1" by default
    if let Ok(Some(adb_meta)) = apis::theaudiodb::search_artist(&client, "1", &artist_name).await {
        if final_meta.image_url.is_none() {
            final_meta.image_url = adb_meta.image_url;
        }
        final_meta.bio = adb_meta.bio;
        final_meta.details = adb_meta.details;
        final_meta.source = if final_meta.source == "none" { "theaudiodb".to_string() } else { final_meta.source };
    }

    // Tier 3: Last.fm (Reliable fallback)
    // Using a default fallback key for convenience if none provided
    let lastfm_key = "4f8496155609607831d3e86f8a84620f"; 
    if final_meta.bio.is_none() || final_meta.image_url.is_none() {
        if let Ok(Some(lfm_meta)) = apis::lastfm::search_artist(&client, lastfm_key, &artist_name).await {
            if final_meta.image_url.is_none() {
                final_meta.image_url = lfm_meta.image_url;
            }
            if final_meta.bio.is_none() {
                final_meta.bio = lfm_meta.bio;
            }
            final_meta.source = if final_meta.source == "none" { "lastfm".to_string() } else { final_meta.source };
        }
    }

    if final_meta.source != "none" {
        let conn = state.conn.lock().unwrap();
        database::cache_artist_metadata(&conn, &artist_name, &final_meta).map_err(|e| e.to_string())?;
    }

    Ok(final_meta)
}

#[tauri::command]
fn fetch_album_art(
    album_id: i64,
    state: State<'_, database::DbState>,
    app_state: State<'_, AppState>,
) -> Result<database::AlbumArtPayload, String> {
    let conn = state.conn.lock().unwrap();
    metadata::fetch_album_art(&app_state.app_dir, &conn, album_id)
}

#[tauri::command]
async fn fetch_lyrics(title: String, artist: String) -> Result<String, String> {
    let url = format!(
        "https://lrclib.net/api/get?track_name={}&artist_name={}",
        urlencoding::encode(&title),
        urlencoding::encode(&artist)
    );

    let client = reqwest::Client::new();
    let res = client
        .get(url)
        .header("User-Agent", "AthuMusicD (https://github.com/Michael-Mathu/athu-music-d)")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
        
        if let Some(synced) = json.get("syncedLyrics").and_then(|v| v.as_str()) {
            if !synced.is_empty() {
                return Ok(synced.to_string());
            }
        }
        
        if let Some(plain) = json.get("plainLyrics").and_then(|v| v.as_str()) {
            if !plain.is_empty() {
                return Ok(plain.to_string());
            }
        }
        
        Err("No lyrics found for this track".to_string())
    } else {
        Err("No lyrics found for this track".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let app_dir = app.path().app_data_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
            std::fs::create_dir_all(&app_dir).unwrap();
            
            let conn = database::init_db(&app_dir).expect("Failed to initialize database");
            app.manage(database::DbState {
                conn: Mutex::new(conn),
            });
            app.manage(AppState {
                app_dir: app_dir.clone(),
            });
            
            let audio_tx = audio::init_audio_thread();
            app.manage(audio::AudioState { tx: audio_tx });

            let controls = mpris_smtc::setup_controls(&app.handle());
            app.manage(OSControlsState {
                controls: Mutex::new(controls),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            scan_local_files,
            list_tracks,
            list_albums,
            list_artists,
            list_playlists,
            list_playlist_tracks,
            create_playlist,
            add_track_to_playlist,
            remove_track_from_playlist,
            play_audio,
            pause_audio,
            resume_audio,
            set_volume,
            get_playback_pos_ms,
            seek_playback_ms,
            fetch_track_lyrics,
            fetch_artist_info,
            fetch_album_art,
            update_os_metadata,
            fetch_lyrics,
            get_cover_thumbnail
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
