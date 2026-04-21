/**
 * Tiered Metadata Fetching System for Athu Music D.
 * Cascades through multiple providers for lyrics, bios, and imagery.
 */

import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from 'react';
import type { ArtistBioPayload, LyricsPayload, LyricsLine } from '../types/library';

// --- API Key Configuration (User should provide these) ---
const LASTFM_API_KEY = ''; 
const FANART_TV_CLIENT_KEY = ''; 

// --- Interfaces ---

interface LRCLibResponse {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

interface LastFmArtistInfo {
  artist: {
    name: string;
    bio: {
      summary: string;
      content: string;
    };
    image: {
      "#text": string;
      size: string;
    }[];
  };
}

interface FanartArtistResponse {
  name: string;
  artistbackground?: { id: string; url: string; }[];
  hdmusiclogo?: { id: string; url: string; }[];
}

// --- Caching Utilities ---

const CACHE_PREFIX = 'athu-meta-';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const getCached = <T>(key: string): T | null => {
  const item = localStorage.getItem(CACHE_PREFIX + key);
  if (!item) return null;
  try {
    const { data, expiry } = JSON.parse(item);
    if (Date.now() > expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCached = <T>(key: string, data: T) => {
  const item = {
    data,
    expiry: Date.now() + CACHE_TTL,
  };
  localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
};

// --- Synced Lyrics (LRCLIB) ---

export const fetchSyncedLyrics = async (
  artist: string,
  track: string,
  duration: number,
  trackId?: number
): Promise<LyricsPayload | null> => {
  const cacheKey = `lyrics-${artist}-${track}`;
  const cached = getCached<LyricsPayload>(cacheKey);
  if (cached) return cached;

  try {
    // 1. Primary: LRCLIB Get
    const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(track)}&duration=${duration}`;
    const response = await fetch(url);
    if (response.ok) {
      const data: LRCLibResponse = await response.json();
      if (data.syncedLyrics || data.plainLyrics) {
        const payload = parseLRCLib(data, trackId || 0);
        setCached(cacheKey, payload);
        return payload;
      }
    }

    // 2. Secondary: Fallback to Rust Backend if trackId is provided
    if (trackId) {
      const backendLyrics = await invoke<LyricsPayload>("fetch_track_lyrics", { trackId });
      if (backendLyrics) {
        setCached(cacheKey, backendLyrics);
        return backendLyrics;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching synced lyrics:", error);
    return null;
  }
};

const parseLRCLib = (data: LRCLibResponse, trackId: number): LyricsPayload => {
  const raw_lrc = data.syncedLyrics || data.plainLyrics || "";
  const lines: LyricsLine[] = [];

  if (data.syncedLyrics) {
    const lrcLines = data.syncedLyrics.split('\n');
    for (const line of lrcLines) {
      const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseFloat(match[2]);
        const timestamp_ms = Math.floor((min * 60 + sec) * 1000);
        lines.push({ timestamp_ms, text: match[3].trim() });
      }
    }
  }

  return {
    track_id: trackId,
    provider: "lrclib",
    raw_lrc,
    plain_text: data.plainLyrics || "",
    synced: !!data.syncedLyrics,
    embedded: false,
    stored_path: null,
    lines,
  };
};

// --- Artist Metadata (Last.fm -> Wikipedia) ---

export const fetchArtistMetadata = async (artistName: string, artistId?: number): Promise<ArtistBioPayload | null> => {
  if (!artistName || artistName === 'Unknown Artist') return null;
  
  const cacheKey = `bio-${artistName}`;
  const cached = getCached<ArtistBioPayload>(cacheKey);
  if (cached) return cached;

  try {
    // 1. Last.fm (Requires Key)
    if (LASTFM_API_KEY) {
      const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json`;
      const response = await fetch(url);
      if (response.ok) {
        const data: LastFmArtistInfo = await response.json();
        const payload: ArtistBioPayload = {
          artist_id: artistId || 0,
          artist_name: artistName,
          biography: data.artist.bio.summary,
          provider: "lastfm",
          source_url: `https://www.last.fm/music/${encodeURIComponent(artistName)}`,
        };
        setCached(cacheKey, payload);
        return payload;
      }
    }

    // 2. Fallback to Wikipedia (via Rust backend or direct fetch)
    if (artistId) {
      const backendBio = await invoke<ArtistBioPayload>("fetch_artist_bio", { artistId });
      if (backendBio) {
        setCached(cacheKey, backendBio);
        return backendBio;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching artist metadata:", error);
    return null;
  }
};

// --- Artist Image (Fanart.tv -> Wikipedia) ---

export const fetchArtistImage = async (artistName: string): Promise<string | null> => {
  if (!artistName || artistName === 'Unknown Artist') return null;

  const cacheKey = `image-${artistName}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  try {
    // 1. Fanart.tv (Optional Key)
    if (FANART_TV_CLIENT_KEY) {
      // In reality, Fanart.tv needs a MusicBrainz ID or we search by name
      // This is a simplified search logic
      const url = `https://webservice.fanart.tv/v3/music/${encodeURIComponent(artistName)}?api_key=${FANART_TV_CLIENT_KEY}`;
      const response = await fetch(url);
      if (response.ok) {
        const data: FanartArtistResponse = await response.json();
        const img = data.artistbackground?.[0]?.url || data.hdmusiclogo?.[0]?.url;
        if (img) {
          setCached(cacheKey, img);
          return img;
        }
      }
    }

    // 2. Wikipedia (Public reliable fallback)
    const wpUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(artistName)}&prop=pageimages&format=json&pithumbsize=1000&origin=*`;
    const wpResponse = await fetch(wpUrl);
    const wpData = await wpResponse.json();
    const pages = wpData.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const thumbnail = pages[pageId]?.thumbnail?.source;
      if (thumbnail) {
        setCached(cacheKey, thumbnail);
        return thumbnail;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error fetching image for ${artistName}:`, error);
    return null;
  }
};

// --- Hooks ---

export const useArtistImage = (artistName: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const url = await fetchArtistImage(artistName);
      if (!cancelled) {
        setImageUrl(url);
        setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [artistName]);

  return { imageUrl, loading };
};

