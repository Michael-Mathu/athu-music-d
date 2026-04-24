use serde::Deserialize;
use crate::apis::ArtistMeta;
use reqwest::Client;
use std::collections::HashMap;

#[derive(Deserialize)]
struct AudioDBArtist {
    #[serde(rename = "strArtistThumb")]
    thumb: Option<String>,
    #[serde(rename = "strBiographyEN")]
    bio: Option<String>,
    #[serde(rename = "strGenre")]
    genre: Option<String>,
    #[serde(rename = "intFormedYear")]
    formed: Option<String>,
}

#[derive(Deserialize)]
struct AudioDBSearchResponse {
    artists: Option<Vec<AudioDBArtist>>,
}

pub async fn search_artist(client: &Client, api_key: &str, name: &str) -> Result<Option<ArtistMeta>, String> {
    let url = format!("https://www.theaudiodb.com/api/v1/json/{}/search.php?s={}", api_key, urlencoding::encode(name));
    
    let response = client.get(url)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<AudioDBSearchResponse>()
        .await
        .map_err(|e| e.to_string())?;

    if let Some(artists) = response.artists {
        if let Some(artist) = artists.into_iter().next() {
            let mut details = HashMap::new();
            if let Some(g) = artist.genre { details.insert("genre".to_string(), g); }
            if let Some(f) = artist.formed { details.insert("formed".to_string(), f); }

            return Ok(Some(ArtistMeta {
                image_url: artist.thumb,
                bio: artist.bio,
                details: Some(details),
                source: "theaudiodb".to_string(),
            }));
        }
    }

    Ok(None)
}
