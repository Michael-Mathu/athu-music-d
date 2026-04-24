use serde::Deserialize;
use crate::apis::ArtistMeta;
use reqwest::Client;

#[derive(Deserialize)]
struct LastFmImage {
    #[serde(rename = "#text")]
    url: String,
    size: String,
}

#[derive(Deserialize)]
struct LastFmBio {
    summary: String,
}

#[derive(Deserialize)]
struct LastFmArtist {
    image: Vec<LastFmImage>,
    bio: LastFmBio,
}

#[derive(Deserialize)]
struct LastFmArtistResponse {
    artist: LastFmArtist,
}

pub async fn search_artist(client: &Client, api_key: &str, name: &str) -> Result<Option<ArtistMeta>, String> {
    let url = format!(
        "https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist={}&api_key={}&format=json",
        urlencoding::encode(name),
        api_key
    );
    
    let response = client.get(url)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<LastFmArtistResponse>()
        .await
        .map_err(|e| e.to_string())?;

    let image_url = response.artist.image.iter()
        .find(|img| img.size == "extralarge" || img.size == "large")
        .map(|img| img.url.clone())
        .or_else(|| response.artist.image.first().map(|img| img.url.clone()));

    Ok(Some(ArtistMeta {
        image_url,
        bio: Some(response.artist.bio.summary),
        details: None,
        source: "lastfm".to_string(),
    }))
}
