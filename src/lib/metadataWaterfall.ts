import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from 'react';

// --- Interfaces ---

export interface ArtistMeta {
  image_url: string | null;
  bio: string | null;
  details: Record<string, string> | null;
  source: string;
}

// --- Caching ---

const CACHE_PREFIX = 'athu-meta-v2-';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

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

// --- Waterfall Command ---

export const fetchArtistInfo = async (artistName: string): Promise<ArtistMeta | null> => {
  if (!artistName || artistName === 'Unknown Artist') return null;

  const cacheKey = `artist-info-${artistName}`;
  const cached = getCached<ArtistMeta>(cacheKey);
  if (cached) return cached;

  try {
    const result = await invoke<ArtistMeta>("fetch_artist_info", { artistName });
    if (result) {
      setCached(cacheKey, result);
      return result;
    }
    return null;
  } catch (err) {
    console.error("Waterfall fetch failed:", err);
    return null;
  }
};

// --- Hooks ---

export const useArtistMetadata = (artistName: string) => {
  const [data, setData] = useState<ArtistMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const meta = await fetchArtistInfo(artistName);
      if (!cancelled) {
        setData(meta);
        setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [artistName]);

  return { data, loading };
};
