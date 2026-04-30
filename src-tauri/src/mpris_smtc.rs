use souvlaki::{
    MediaControlEvent, MediaControls, MediaMetadata, MediaPlayback, PlatformConfig,
};
use tauri::{AppHandle, Emitter};
use std::sync::Mutex;

pub struct OSControlsState {
    pub controls: Mutex<Option<MediaControls>>,
}

pub fn setup_controls(app: &AppHandle) -> Option<MediaControls> {
    let hwnd;
    #[cfg(target_os = "windows")]
    {
        if let Some(window) = app.get_webview_window("main") {
            if let Ok(h) = window.hwnd() {
                hwnd = Some(h.0 as *mut std::ffi::c_void);
            } else {
                hwnd = None;
            }
        } else {
            hwnd = None;
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        hwnd = None;
    }


    let config = PlatformConfig {
        dbus_name: "athu_music_d",
        display_name: "Athu Music D",
        hwnd,
    };

    let app_handle = app.clone();
    let mut controls = MediaControls::new(config).ok();
    
    if let Some(ref mut c) = controls {
        let _ = c.attach(move |event: MediaControlEvent| {
            match event {
                MediaControlEvent::Play => { let _ = app_handle.emit("os-media-action", "play"); },
                MediaControlEvent::Pause => { let _ = app_handle.emit("os-media-action", "pause"); },
                MediaControlEvent::Toggle => { let _ = app_handle.emit("os-media-action", "toggle"); },
                MediaControlEvent::Next => { let _ = app_handle.emit("os-media-action", "next"); },
                MediaControlEvent::Previous => { let _ = app_handle.emit("os-media-action", "previous"); },
                MediaControlEvent::Seek(direction) => {
                    let offset = match direction {
                        souvlaki::SeekDirection::Forward => 10000,
                        souvlaki::SeekDirection::Backward => -10000,
                    };
                    let _ = app_handle.emit("os-media-action", format!("seek_offset:{}", offset));
                },
                _ => {}
            }
        });
    }

    controls
}

#[tauri::command]
pub fn update_os_metadata(
    title: String,
    artist: String,
    album: String,
    duration_ms: u64,
    is_playing: bool,
    state: tauri::State<'_, OSControlsState>,
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
