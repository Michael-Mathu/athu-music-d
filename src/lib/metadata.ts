/**
 * Tiered Metadata Fetching System for Athu Music D.
 * Handles lyrics fetch from LRCLIB with a Rust backend fallback.
 * 
 * Artist info (image, bio) is handled by metadataWaterfall.ts (waterfall hook).
 * All API keys are optional — the system gracefully degrades.
 */

import { invoke } from "@tauri-apps/api/core";
import type { LyricsPayload, LyricsLine } from '../types/library';

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

// --- Shared Cache Utilities ---

const CACHE_PREFIX = 'athu-meta-';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const getCached = <T>(key: string): T | null => {
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

export const setCached = <T>(key: string, data: T) => {
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
    // 1. Primary: LRCLIB
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

    // 2. Secondary: Fallback to Rust Backend
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
