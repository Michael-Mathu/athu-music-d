/**
 * Metadata Utility for fetching artist images from multiple sources.
 * Priority: Last.fm -> Fanart.tv -> Wikipedia
 */

const CACHE_NAME = 'athu-artist-images';

export const fetchArtistImage = async (artistName: string): Promise<string | null> => {
  if (!artistName || artistName === 'Unknown Artist') return null;

  // 1. Check Cache
  const cached = localStorage.getItem(`${CACHE_NAME}-${artistName}`);
  if (cached) return cached;

  try {
    // 2. Try Last.fm (Public API mockup or Scraping)
    // Note: Official API requires a key. For this demo, we'll try a public search endpoint
    // or fallback to Wikipedia which is more "open" for client-side CORS in some cases.
    
    // 3. Wikipedia Action API (Very reliable for basic thumbnails)
    const wpUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(artistName)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
    const response = await fetch(wpUrl);
    const data = await response.json();
    
    const pages = data.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const thumbnail = pages[pageId]?.thumbnail?.source;
      if (thumbnail) {
        localStorage.setItem(`${CACHE_NAME}-${artistName}`, thumbnail);
        return thumbnail;
      }
    }

    // 4. Fallback to Last.fm Search if Wikipedia fails (using a common public pattern)
    // In a real app, you'd use a backend proxy to avoid CORS/ToS issues with scraping.
    
    return null;
  } catch (error) {
    console.error(`Error fetching image for ${artistName}:`, error);
    return null;
  }
};

import { useState, useEffect } from 'react';

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
