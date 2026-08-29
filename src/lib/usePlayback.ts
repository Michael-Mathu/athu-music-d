import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchAlbumArt,
  getPlaybackPosMs,
  pauseAudio,
  playAudio,
  resumeAudio,
  seekPlaybackMs,
  setVolume as setPlayerVolume,
  updateOsMetadata,
} from './tauri';
import { fetchSyncedLyrics } from './metadata';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type { LyricsPayload, Track } from '../types/library';
import { shuffleArray } from '../hooks/useLibrary';

interface UsePlaybackOptions {
  tracks: Track[];
  loadLibrary: () => Promise<Track[]>;
}

export function usePlayback({ tracks, loadLibrary }: UsePlaybackOptions) {
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [lyrics, setLyrics] = useState<LyricsPayload | null>(null);
  const [artworkLoading, setArtworkLoading] = useState(false);
  const [playbackPosMs, setPlaybackPosMs] = useState(0);
  const [queueTrackIds, setQueueTrackIds] = useState<number[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  const trackEndHandledRef = useRef<number | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync volume
  useEffect(() => {
    void setPlayerVolume(volume);
  }, [volume]);

  // Keep queueIndex in sync with currentTrackId
  useEffect(() => {
    if (currentTrackId === null) return;
    const idx = queueTrackIds.indexOf(currentTrackId);
    if (idx >= 0 && idx !== queueIndex) setQueueIndex(idx);
  }, [currentTrackId, queueIndex, queueTrackIds]);

  // Clamp queueIndex
  useEffect(() => {
    if (queueTrackIds.length === 0) { setQueueIndex(-1); return; }
    if (queueIndex >= queueTrackIds.length) setQueueIndex(queueTrackIds.length - 1);
  }, [queueIndex, queueTrackIds]);

  const currentTrack = tracks.find((t) => t.id === currentTrackId) ?? null;

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!currentTrack) { setLyrics(null); return; }
    let cancelled = false;
    fetchSyncedLyrics(currentTrack.artist, currentTrack.title, currentTrack.duration, currentTrack.id)
      .then((l) => { if (!cancelled) setLyrics(l); })
      .catch(() => { if (!cancelled) setLyrics(null); });
    return () => { cancelled = true; };
  }, [currentTrack]);

  const refreshLyrics = useCallback(async () => {
    if (!currentTrack) return;
    try {
      const l = await fetchSyncedLyrics(currentTrack.artist, currentTrack.title, currentTrack.duration, currentTrack.id);
      setLyrics(l);
    } catch { setLyrics(null); }
  }, [currentTrack]);

  // Update OS media metadata
  useEffect(() => {
    if (!currentTrack) return;
    updateOsMetadata(currentTrack.title, currentTrack.artist, currentTrack.album, currentTrack.duration * 1000, isPlaying).catch(console.error);
  }, [currentTrack, isPlaying]);

  // Fetch album art if missing
  useEffect(() => {
    if (!currentTrack || currentTrack.cover_art_data_url || currentTrack.album_id === null || artworkLoading) return;
    let cancelled = false;
    setArtworkLoading(true);
    fetchAlbumArt(currentTrack.album_id!)
      .then(() => { if (!cancelled) return loadLibrary(); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setArtworkLoading(false); });
    return () => { cancelled = true; };
  }, [artworkLoading, currentTrack, loadLibrary]);

  // Playback position polling
  useEffect(() => {
    if (!currentTrack || !isPlaying || isSeeking) return;
    let cancelled = false;
    const interval = window.setInterval(async () => {
      try {
        const next = await getPlaybackPosMs();
        if (!cancelled && !isSeeking) setPlaybackPosMs(next);
      } catch { /* ignore */ }
    }, 500);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [currentTrack, isPlaying, isSeeking]);

  const handlePlayTrack = useCallback(async (trackId: number) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;
    try {
      await playAudio(track.file_path);
      setCurrentTrackId(track.id);
      setIsPlaying(true);
      setPlaybackPosMs(0);
      setQueueTrackIds((prev) => {
        if (prev.includes(track.id)) {
          setQueueIndex(prev.indexOf(track.id));
          return prev;
        }
        const next = [...prev, track.id];
        setQueueIndex(next.length - 1);
        return next;
      });
      trackEndHandledRef.current = null;
    } catch (err) { console.error(err); }
  }, [tracks]);

  const handleTogglePlayback = useCallback(async () => {
    if (!currentTrack) {
      if (tracks.length > 0) await handlePlayTrack(tracks[0].id);
      return;
    }
    try {
      if (isPlaying) { await pauseAudio(); setIsPlaying(false); }
      else { await resumeAudio(); setIsPlaying(true); }
    } catch (err) { console.error(err); }
  }, [currentTrack, handlePlayTrack, isPlaying, tracks]);

  const handleSeek = useCallback(async (posMs: number) => {
    try {
      setIsSeeking(true);
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
      await seekPlaybackMs(Math.max(0, Math.floor(posMs)));
      setPlaybackPosMs(Math.max(0, Math.floor(posMs)));
      seekTimeoutRef.current = setTimeout(() => setIsSeeking(false), 1000);
    } catch { setIsSeeking(false); }
  }, []);

  const handleSkip = useCallback(async (direction: -1 | 1, fromTrackEnd = false) => {
    if (tracks.length === 0 || queueTrackIds.length === 0) return;

    if (repeatMode === 'one' && fromTrackEnd && currentTrack) {
      await handlePlayTrack(currentTrack.id);
      return;
    }

    const currentIdx = queueIndex >= 0 ? queueIndex : 0;
    const nextIdx = currentIdx + direction;

    if (nextIdx < 0) {
      if (repeatMode === 'all') {
        const wrappedTrack = tracks.find((t) => t.id === queueTrackIds[queueTrackIds.length - 1]);
        if (wrappedTrack) await handlePlayTrack(wrappedTrack.id);
      }
      return;
    }

    if (nextIdx >= queueTrackIds.length) {
      if (repeatMode === 'all') {
        const wrappedTrack = tracks.find((t) => t.id === queueTrackIds[0]);
        if (wrappedTrack) await handlePlayTrack(wrappedTrack.id);
      } else if (fromTrackEnd) {
        setIsPlaying(false);
      }
      return;
    }

    const nextTrack = tracks.find((t) => t.id === queueTrackIds[nextIdx]);
    if (nextTrack) await handlePlayTrack(nextTrack.id);
  }, [tracks, queueTrackIds, repeatMode, currentTrack, queueIndex, handlePlayTrack]);

  // Track end detection
  useEffect(() => {
    if (!isPlaying || !currentTrack) return;
    const durationMs = currentTrack.duration * 1000;
    if (durationMs <= 0) return;
    if (playbackPosMs >= durationMs - 300 && trackEndHandledRef.current !== currentTrack.id) {
      trackEndHandledRef.current = currentTrack.id;
      void handleSkip(1, true);
    }
  }, [currentTrack, handleSkip, isPlaying, playbackPosMs]);

  // Listen for OS media actions
  useEffect(() => {
    let unlisten: UnlistenFn | null = null;
    void listen<string>('os-media-action', (event) => {
      if (event.payload === 'play' && !isPlaying) handleTogglePlayback();
      else if (event.payload === 'pause' && isPlaying) handleTogglePlayback();
      else if (event.payload === 'next') void handleSkip(1);
      else if (event.payload === 'previous') void handleSkip(-1);
    }).then((fn) => { unlisten = fn; });
    return () => { if (unlisten) unlisten(); };
  }, [handleTogglePlayback, handleSkip, isPlaying]);

  // Shuffle toggle — actually shuffles the queue
  const handleToggleShuffle = useCallback(() => {
    setShuffleEnabled((prev) => {
      const next = !prev;
      if (next && queueTrackIds.length > 1) {
        // Shuffle but keep current track first
        const withoutCurrent = queueTrackIds.filter((id) => id !== currentTrackId);
        const shuffled = shuffleArray(withoutCurrent);
        const newQueue = currentTrackId ? [currentTrackId, ...shuffled] : shuffled;
        setQueueTrackIds(newQueue);
        setQueueIndex(currentTrackId ? 0 : -1);
      }
      return next;
    });
  }, [currentTrackId, queueTrackIds]);

  // Cycle repeat mode
  const handleCycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  }, []);

  // Play next - insert track after current track in queue
  const handlePlayNext = useCallback((trackId: number) => {
    setQueueTrackIds((prev) => {
      const currentIdx = prev.indexOf(currentTrackId ?? -1);
      const insertIdx = currentIdx >= 0 ? currentIdx + 1 : prev.length;
      const newQueue = [...prev];
      newQueue.splice(insertIdx, 0, trackId);
      return newQueue;
    });
  }, [currentTrackId]);

  // Add to queue - append track to end
  const handleAddToQueue = useCallback((trackId: number) => {
    setQueueTrackIds((prev) => [...prev, trackId]);
  }, []);

  return {
    currentTrack,
    currentTrackId,
    isPlaying,
    volume,
    setVolume,
    lyrics,
    playbackPosMs,
    queueTrackIds,
    setQueueTrackIds,
    queueIndex,
    shuffleEnabled,
    repeatMode,
    handlePlayTrack,
    handleTogglePlayback,
    handleSeek,
    handleSkip,
    handleToggleShuffle,
    handleCycleRepeatMode,
    handlePlayNext,
    handleAddToQueue,
    refreshLyrics,
  };
}
