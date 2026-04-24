use std::fs;
use std::path::{Path, PathBuf};
use image::imageops::FilterType;
use sha2::{Sha256, Digest};

#[tauri::command]
pub fn get_cover_thumbnail(track_id: String, cover_path: String, app_dir: PathBuf) -> Result<String, String> {
    if cover_path.is_empty() {
        return Err("No cover path provided".to_string());
    }

    let thumbnails_dir = app_dir.join("thumbnails");
    if !thumbnails_dir.exists() {
        fs::create_dir_all(&thumbnails_dir).map_err(|e| e.to_string())?;
    }

    // Create a unique hash for the thumbnail filename
    let mut hasher = Sha256::new();
    hasher.update(cover_path.as_bytes());
    let hash = format!("{:x}", hasher.finalize());
    let thumb_name = format!("{}.jpg", hash);
    let thumb_path = thumbnails_dir.join(thumb_name);

    if thumb_path.exists() {
        return Ok(thumb_path.to_string_lossy().to_string());
    }

    // Generate thumbnail
    let img_path = Path::new(&cover_path);
    if !img_path.exists() {
        return Err("Original image not found".to_string());
    }

    let img = image::open(img_path).map_err(|e| format!("Failed to open image: {}", e))?;
    let thumbnail = img.fill(300, 300, FilterType::Lanczos3);
    
    thumbnail.save_with_format(&thumb_path, image::ImageFormat::Jpeg)
        .map_err(|e| format!("Failed to save thumbnail: {}", e))?;

    Ok(thumb_path.to_string_lossy().to_string())
}
