import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { darkTheme } from './theme';
import { Sidebar } from './components/layout/Sidebar';
import { BottomBar } from './components/layout/BottomBar';
import { Tracks } from './views/Tracks';
import { Albums } from './views/Albums';
import { AlbumDetails } from './views/AlbumDetails';
import { Artists } from './views/Artists';
import { ArtistDetails } from './views/ArtistDetails';
import { Playlists } from './views/Playlists';
import { NowPlaying } from './views/NowPlaying';
import { addTrackToPlaylist, createPlaylist, fetchAlbumArt, fetchArtistBio, fetchTrackLyrics, getPlaybackPosMs, listAlbums, listArtists, listPlaylistTracks, listPlaylists, listTracks, pauseAudio, playAudio, removeTrackFromPlaylist, resumeAudio, scanLocalFiles, seekPlaybackMs, setVolume as setPlayerVolume, updateOsMetadata } from './lib/tauri';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type { Album, Artist, ArtistBioPayload, LyricsPayload, Playlist, PlaylistTrack, Track } from './types/library';

function AppContent() {
  const location = useLocation();
  const isNowPlaying = location.pathname.startsWith('/now-playing');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanPath, setScanPath] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [lyrics, setLyrics] = useState<LyricsPayload | null>(null);
  const [artistBio, setArtistBio] = useState<ArtistBioPayload | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [artistBioLoading, setArtistBioLoading] = useState(false);
  const [artworkLoading, setArtworkLoading] = useState(false);
  const [playbackPosMs, setPlaybackPosMs] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistTracks, setPlaylistTracks] = useState<Record<number, PlaylistTrack[]>>({});
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [queueTrackIds, setQueueTrackIds] = useState<number[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const trackEndHandledRef = useRef<number | null>(null);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextTracks, nextAlbums, nextArtists] = await Promise.all([
        listTracks(),
        listAlbums(),
        listArtists(),
      ]);
      const nextPlaylists = await listPlaylists();
      const playlistTrackEntries = await Promise.all(
        nextPlaylists.map(async (playlist) => [playlist.id, await listPlaylistTracks(playlist.id)] as const)
      );

      setTracks(nextTracks);
      setAlbums(nextAlbums);
      setArtists(nextArtists);
      setPlaylists(nextPlaylists);
      setPlaylistTracks(Object.fromEntries(playlistTrackEntries));
      setQueueTrackIds((prev) => {
        const valid = prev.filter((id) => nextTracks.some((track) => track.id === id));
        return valid.length > 0 ? valid : nextTracks.map((track) => track.id);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    void setPlayerVolume(volume);
  }, [volume]);

  const currentTrack = useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? null,
    [currentTrackId, tracks]
  );
  const queueTracks = useMemo(
    () => queueTrackIds.map((id) => tracks.find((track) => track.id === id)).filter(Boolean) as Track[],
    [queueTrackIds, tracks]
  );

  useEffect(() => {
    if (currentTrackId === null) {
      return;
    }
    const idx = queueTrackIds.indexOf(currentTrackId);
    if (idx >= 0 && idx !== queueIndex) {
      setQueueIndex(idx);
    }
  }, [currentTrackId, queueIndex, queueTrackIds]);

  useEffect(() => {
    if (queueTrackIds.length === 0) {
      setQueueIndex(-1);
      return;
    }
    if (queueIndex >= queueTrackIds.length) {
      setQueueIndex(queueTrackIds.length - 1);
    }
  }, [queueIndex, queueTrackIds]);

  useEffect(() => {
    if (!currentTrack) {
      setLyrics(null);
      setArtistBio(null);
      return;
    }

    let cancelled = false;

    const loadTrackMetadata = async () => {
      setLyricsLoading(true);
      try {
        const nextLyrics = await fetchTrackLyrics(currentTrack.id);
        if (!cancelled) {
          setLyrics(nextLyrics);
        }
      } catch (err) {
        if (!cancelled) {
          setLyrics(null);
          setError(err instanceof Error ? err.message : 'Failed to load lyrics');
        }
      } finally {
        if (!cancelled) {
          setLyricsLoading(false);
        }
      }

      if (currentTrack.artist_id === null) {
        setArtistBio(null);
        return;
      }

      setArtistBioLoading(true);
      try {
        const nextArtistBio = await fetchArtistBio(currentTrack.artist_id);
        if (!cancelled) {
          setArtistBio(nextArtistBio);
        }
      } catch (err) {
        if (!cancelled) {
          setArtistBio(null);
        }
      } finally {
        if (!cancelled) {
          setArtistBioLoading(false);
        }
      }
    };

    void loadTrackMetadata();

    return () => {
      cancelled = true;
    };
  }, [currentTrack]);

  useEffect(() => {
    if (!currentTrack) return;
    updateOsMetadata(
      currentTrack.title,
      currentTrack.artist,
      currentTrack.album,
      currentTrack.duration * 1000,
      isPlaying
    ).catch(console.error);
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (!currentTrack || currentTrack.cover_art_data_url || currentTrack.album_id === null || artworkLoading) {
      return;
    }

    let cancelled = false;

    const loadMissingArt = async () => {
      setArtworkLoading(true);
      try {
        await fetchAlbumArt(currentTrack.album_id!);
        if (!cancelled) {
          await loadLibrary();
        }
      } catch {
        // Ignore missing remote artwork and leave embedded art as the fallback.
      } finally {
        if (!cancelled) {
          setArtworkLoading(false);
        }
      }
    };

    void loadMissingArt();

    return () => {
      cancelled = true;
    };
  }, [artworkLoading, currentTrack, loadLibrary]);

  const handlePlayTrack = useCallback(async (track: Track) => {
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
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start playback');
    }
  }, []);

  const handleTogglePlayback = useCallback(async () => {
    if (!currentTrack) {
      if (tracks.length > 0) {
        await handlePlayTrack(tracks[0]);
      }
      return;
    }

    try {
      if (isPlaying) {
        await pauseAudio();
        setIsPlaying(false);
      } else {
        await resumeAudio();
        setIsPlaying(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change playback state');
    }
  }, [currentTrack, handlePlayTrack, isPlaying, tracks]);

  const handleSeek = useCallback(async (posMs: number) => {
    try {
      await seekPlaybackMs(Math.max(0, Math.floor(posMs)));
      setPlaybackPosMs(Math.max(0, Math.floor(posMs)));
    } catch {
      // seek is best-effort depending on decoder support
    }
  }, []);

  useEffect(() => {
    if (!currentTrack || !isPlaying) {
      return;
    }

    let cancelled = false;
    const interval = window.setInterval(() => {
      void (async () => {
        try {
          const next = await getPlaybackPosMs();
          if (!cancelled) {
            setPlaybackPosMs(next);
          }
        } catch {
          // ignore
        }
      })();
    }, 500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [currentTrack, isPlaying]);

  const handleSkip = useCallback(async (direction: -1 | 1, fromTrackEnd = false) => {
    if (tracks.length === 0 || queueTrackIds.length === 0) {
      return;
    }

    if (repeatMode === 'one' && fromTrackEnd && currentTrack) {
      await handlePlayTrack(currentTrack);
      return;
    }

    const currentIdx = queueIndex >= 0 ? queueIndex : 0;
    const nextIdx = currentIdx + direction;

    if (nextIdx < 0) {
      if (repeatMode === 'all') {
        const wrapped = queueTrackIds.length - 1;
        const wrappedTrack = tracks.find((track) => track.id === queueTrackIds[wrapped]);
        if (wrappedTrack) await handlePlayTrack(wrappedTrack);
      }
      return;
    }

    if (nextIdx >= queueTrackIds.length) {
      if (repeatMode === 'all') {
        const wrappedTrack = tracks.find((track) => track.id === queueTrackIds[0]);
        if (wrappedTrack) await handlePlayTrack(wrappedTrack);
      } else if (fromTrackEnd) {
        setIsPlaying(false);
      }
      return;
    }

    const nextTrack = tracks.find((track) => track.id === queueTrackIds[nextIdx]);
    if (nextTrack) {
      await handlePlayTrack(nextTrack);
    }
  }, [tracks, queueTrackIds, repeatMode, currentTrack, currentTrackId, queueIndex, handlePlayTrack]);

  useEffect(() => {
    if (!isPlaying || !currentTrack) {
      return;
    }
    const durationMs = currentTrack.duration * 1000;
    if (durationMs <= 0) return;
    if (playbackPosMs >= durationMs - 300 && trackEndHandledRef.current !== currentTrack.id) {
      trackEndHandledRef.current = currentTrack.id;
      void handleSkip(1, true);
    }
  }, [currentTrack, handleSkip, isPlaying, playbackPosMs]);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;
    void listen<string>('os-media-action', (event) => {
      if (event.payload === 'play' && !isPlaying) {
        handleTogglePlayback();
      } else if (event.payload === 'pause' && isPlaying) {
        handleTogglePlayback();
      } else if (event.payload === 'next') {
        void handleSkip(1);
      } else if (event.payload === 'previous') {
        void handleSkip(-1);
      }
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      if (unlisten) unlisten();
    };
  }, [handleTogglePlayback, handleSkip, isPlaying]);

  const handleScan = useCallback(async () => {
    if (!scanPath.trim()) {
      setError('Enter a music folder path to scan.');
      return;
    }

    setScanning(true);
    setError(null);

    try {
      await scanLocalFiles(scanPath.trim());
      await loadLibrary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan the selected folder');
    } finally {
      setScanning(false);
    }
  }, [loadLibrary, scanPath]);

  const handleCreatePlaylist = useCallback(async () => {
    if (!newPlaylistName.trim()) {
      setError('Enter a playlist name.');
      return;
    }
    try {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      await loadLibrary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playlist');
    }
  }, [loadLibrary, newPlaylistName]);

  const handleAddCurrentTrackToPlaylist = useCallback(async (playlistId: number) => {
    if (!currentTrack) {
      setError('No track selected.');
      return;
    }
    try {
      await addTrackToPlaylist(playlistId, currentTrack.id);
      await loadLibrary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add track to playlist');
    }
  }, [currentTrack, loadLibrary]);

  const handleRemoveTrackFromPlaylist = useCallback(async (playlistId: number, trackId: number) => {
    try {
      await removeTrackFromPlaylist(playlistId, trackId);
      await loadLibrary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove track from playlist');
    }
  }, [loadLibrary]);

  const handlePlayNext = useCallback((track: Track) => {
    setQueueTrackIds((prev) => {
      const without = prev.filter((id) => id !== track.id);
      const insertAt = queueIndex >= 0 ? queueIndex + 1 : 0;
      const next = [...without.slice(0, insertAt), track.id, ...without.slice(insertAt)];
      return next;
    });
  }, [queueIndex]);

  const handleAddToQueue = useCallback((track: Track) => {
    setQueueTrackIds((prev) => (prev.includes(track.id) ? prev : [...prev, track.id]));
  }, []);

  const handlePlayQueueIndex = useCallback(async (idx: number) => {
    const trackId = queueTrackIds[idx];
    const track = tracks.find((item) => item.id === trackId);
    if (!track) return;
    await handlePlayTrack(track);
  }, [handlePlayTrack, queueTrackIds, tracks]);

  const handleRemoveQueueTrack = useCallback((trackId: number) => {
    setQueueTrackIds((prev) => {
      const trackIdx = prev.indexOf(trackId);
      if (trackIdx === -1) return prev;
      
      if (trackIdx < queueIndex) {
        setQueueIndex(queueIndex - 1);
      }
      return prev.filter((id) => id !== trackId);
    });
  }, [queueIndex]);

  const handleToggleShuffle = useCallback(() => {
    setShuffleEnabled((prev) => {
      const next = !prev;
      if (next) {
        setQueueTrackIds((currentIds) => {
          if (queueIndex < 0) return currentIds;
          const before = currentIds.slice(0, queueIndex + 1);
          const remaining = currentIds.slice(queueIndex + 1);
          for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
          }
          return [...before, ...remaining];
        });
      }
      return next;
    });
  }, [queueIndex]);

  return (
    <>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {!isNowPlaying && <Sidebar />}
        <Box component="main" sx={{ flexGrow: 1, p: isNowPlaying ? 0 : 3, mb: '90px', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/tracks" replace />} />
              <Route
                path="/tracks"
                element={
                  <Tracks
                    tracks={tracks}
                    loading={loading}
                    scanning={scanning}
                    error={error}
                    scanPath={scanPath}
                    currentTrackId={currentTrackId}
                    currentTrack={currentTrack}
                    lyrics={lyrics}
                    lyricsLoading={lyricsLoading}
                    artistBio={artistBio}
                    artistBioLoading={artistBioLoading}
                    playbackPosMs={playbackPosMs}
                    onScanPathChange={setScanPath}
                    onScan={handleScan}
                    onPlayTrack={handlePlayTrack}
                    onPlayNext={handlePlayNext}
                    onAddToQueue={handleAddToQueue}
                  />
                }
              />
              <Route path="/albums" element={<Albums albums={albums} loading={loading} />} />
              <Route path="/albums/:id" element={
                <AlbumDetails 
                  albums={albums} 
                  tracks={tracks}
                  currentTrackId={currentTrackId}
                  onPlayTrack={handlePlayTrack}
                />
              } />
              <Route path="/artists" element={<Artists artists={artists} loading={loading} />} />
              <Route path="/artists/:id" element={
                <ArtistDetails 
                  artists={artists} 
                  tracks={tracks} 
                  currentTrackId={currentTrackId}
                  onPlayTrack={handlePlayTrack}
                />
              } />
              <Route
                path="/now-playing"
                element={
                  <NowPlaying
                    currentTrack={currentTrack}
                    lyrics={lyrics}
                    playbackPosMs={playbackPosMs}
                  />
                }
              />
              <Route
                path="/playlists"
                element={
                  <Playlists
                    playlists={playlists}
                    playlistTracks={playlistTracks}
                    currentTrack={currentTrack}
                    newPlaylistName={newPlaylistName}
                    onNewPlaylistNameChange={setNewPlaylistName}
                    onCreatePlaylist={handleCreatePlaylist}
                    onAddCurrentTrack={handleAddCurrentTrackToPlaylist}
                    onRemoveTrack={handleRemoveTrackFromPlaylist}
                  />
                }
              />
            </Routes>
          </Box>
          <BottomBar
            currentTrack={currentTrack}
            queueTracks={queueTracks}
            queueIndex={queueIndex}
            isPlaying={isPlaying}
            playbackPosMs={playbackPosMs}
            volume={volume}
            shuffleEnabled={shuffleEnabled}
            repeatMode={repeatMode}
            onTogglePlayback={handleTogglePlayback}
            onPrevious={() => void handleSkip(-1)}
            onNext={() => void handleSkip(1)}
            onVolumeChange={setVolume}
            onSeek={handleSeek}
            onPlayQueueIndex={(idx) => void handlePlayQueueIndex(idx)}
            onRemoveQueueTrack={handleRemoveQueueTrack}
            onToggleShuffle={handleToggleShuffle}
            onCycleRepeatMode={() => setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'))}
          />
        </Box>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ThemeProvider>
  );
}
