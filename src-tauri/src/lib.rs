mod database;
mod scanner;
mod audio;
mod metadata;

use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{Manager, State, Emitter};
use souvlaki::{MediaControlEvent, MediaControls, MediaMetadata, MediaPlayback, PlatformConfig};

pub struct AppState {
    pub app_dir: PathBuf,
}

pub struct OSControlsState {
    pub controls: Mutex<Option<MediaControls>>,
}

// Commands
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
fn fetch_artist_bio(
    artist_id: i64,
    state: State<'_, database::DbState>,
) -> Result<database::ArtistBioPayload, String> {
    let conn = state.conn.lock().unwrap();
    metadata::fetch_artist_bio(&conn, artist_id)
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
fn update_os_metadata(
    title: String,
    artist: String,
    album: String,
    duration_ms: u64,
    is_playing: bool,
    state: State<'_, OSControlsState>,
) -> Result<(), String> {
    let mut controls_guard = state.controls.lock().unwrap();
    if let Some(controls) = controls_guard.as_mut() {
        let _ = controls.set_metadata(MediaMetadata {
            title: Some(&title),
            artist: Some(&artist),
            album: Some(&album),
            duration: Some(std::time::Duration::from_millis(duration_ms)),
            ..Default::default()
        });
        let _ = controls.set_playback(if is_playing {
            MediaPlayback::Playing { progress: None }
        } else {
            MediaPlayback::Paused { progress: None }
        });
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
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

            let mut hwnd = None;
            #[cfg(target_os = "windows")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    if let Ok(h) = window.hwnd() {
                        hwnd = Some(h.0 as *mut std::ffi::c_void);
                    }
                }
            }

            let config = PlatformConfig {
                dbus_name: "athu_music_d",
                display_name: "Athu Music D",
                hwnd,
            };

            let app_handle = app.handle().clone();
            let mut controls = MediaControls::new(config).ok();
            if let Some(ref mut c) = controls {
                let _ = c.attach(move |event: MediaControlEvent| {
                    match event {
                        MediaControlEvent::Play => { let _ = app_handle.emit("os-media-action", "play"); },
                        MediaControlEvent::Pause => { let _ = app_handle.emit("os-media-action", "pause"); },
                        MediaControlEvent::Next => { let _ = app_handle.emit("os-media-action", "next"); },
                        MediaControlEvent::Previous => { let _ = app_handle.emit("os-media-action", "previous"); },
                        _ => {}
                    }
                });
            }

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
            fetch_artist_bio,
            fetch_album_art,
            update_os_metadata
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
