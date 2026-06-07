import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from 'react';
import { getCached, setCached } from './metadata';

// --- Interfaces ---

export interface ArtistMeta {
  image_url: string | null;
  bio: string | null;
  details: Record<string, string> | null;
  source: string;
}

// --- Waterfall Command ---
// Cache key uses 'artist-info-v7d' prefix to leverage the 7-day TTL
export const fetchArtistInfo = async (artistName: string): Promise<ArtistMeta | null> => {
  if (!artistName || artistName === 'Unknown Artist') return null;

  const cacheKey = `artist-info-v7d-${artistName}`;
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
