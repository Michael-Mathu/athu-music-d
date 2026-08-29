use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ArtistMeta {
    pub image_url: Option<String>,
    pub bio: Option<String>,
    pub details: Option<HashMap<String, String>>,
    pub source: String,
}

pub mod deezer;
pub mod theaudiodb;
pub mod lastfm;
