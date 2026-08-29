use serde::Deserialize;
use crate::apis::ArtistMeta;
use reqwest::Client;

#[derive(Deserialize)]
struct DeezerArtist {
    picture_big: Option<String>,
}

#[derive(Deserialize)]
struct DeezerSearchResponse {
    data: Vec<DeezerArtist>,
}

pub async fn search_artist(client: &Client, name: &str) -> Result<Option<ArtistMeta>, String> {
    let url = format!("https://api.deezer.com/search/artist?q={}", urlencoding::encode(name));
    
    let response = client.get(url)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<DeezerSearchResponse>()
        .await
        .map_err(|e| e.to_string())?;

    if let Some(artist) = response.data.into_iter().next() {
        return Ok(Some(ArtistMeta {
            image_url: artist.picture_big,
            bio: None,
            details: None,
            source: "deezer".to_string(),
        }));
    }

    Ok(None)
}
