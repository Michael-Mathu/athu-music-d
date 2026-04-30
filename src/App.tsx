import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { HeaderBar } from './components/layout/HeaderBar';
import { NavRail } from './components/layout/NavRail';
import { NowPlaying } from './views/NowPlaying';
import { Queue } from './views/Queue';
import { Tracks } from './views/Tracks';
import { Albums } from './views/Albums';
import { Artists } from './views/Artists';
import { Playlists } from './views/Playlists';
import { Settings } from './views/Settings';
import { LyricsEditor } from './views/LyricsEditor';
import { fetchAlbumArt, getPlaybackPosMs, listTracks, listAlbums, listArtists, listPlaylists, listPlaylistTracks, createPlaylist as apiCreatePlaylist, addTrackToPlaylist, removeTrackFromPlaylist, scanLocalFiles, pauseAudio, playAudio, resumeAudio, seekPlaybackMs, setVolume as setPlayerVolume, updateOsMetadata } from './lib/tauri';
import { fetchSyncedLyrics } from './lib/metadata';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type { LyricsPayload, Track, Album, Artist, Playlist, PlaylistTrack, NavView } from './types/library';
import { ThemeProvider, useTheme as useAppTheme } from './lib/ThemeContext';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getAppTheme } from './theme';

function AppContent() {
  const { theme: appTheme, accentColor } = useAppTheme();

  const resolvedMode = useMemo(() => {
    if (appTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return appTheme as 'light' | 'dark';
  }, [appTheme]);

  const muiTheme = useMemo(
    () => getAppTheme(resolvedMode, accentColor ?? '#3584E4'),
    [resolvedMode, accentColor]
  );

  const vinyl = muiTheme.vinyl;
  
  const [navState, setNavState] = useState({
    view: 'queue' as NavView,
    detail: null as string | number | null,
    scrollY: 0,
    previousView: null as NavView | null,
  });

  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistTracks, setPlaylistTracks] = useState<Record<number, PlaylistTrack[]>>({});

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
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const loadLibrary = useCallback(async () => {
    try {
      const [nextTracks, nextAlbums, nextArtists, nextPlaylists] = await Promise.all([
        listTracks(),
        listAlbums(),
        listArtists(),
        listPlaylists(),
      ]);

      setTracks(nextTracks);
      setAlbums(nextAlbums);
      setArtists(nextArtists);
      setPlaylists(nextPlaylists);

      const tracksMap: Record<number, PlaylistTrack[]> = {};
      for (const pl of nextPlaylists) {
        tracksMap[pl.id] = await listPlaylistTracks(pl.id);
      }
      setPlaylistTracks(tracksMap);

      setQueueTrackIds((prev) => {
        const valid = prev.filter((id) => nextTracks.some((track) => track.id === id));
        return valid.length > 0 ? valid : nextTracks.map((track) => track.id);
      });
    } catch (err) {
      console.error(err);
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
      return;
    }

    let cancelled = false;

    const loadTrackLyrics = async () => {

      try {
        const nextLyrics = await fetchSyncedLyrics(
          currentTrack.artist,
          currentTrack.title,
          currentTrack.duration,
          currentTrack.id
        );
        if (!cancelled) {
          setLyrics(nextLyrics);
        }
      } catch (err) {
        if (!cancelled) {
          setLyrics(null);
        }
      }
    };

    void loadTrackLyrics();


    return () => {
      cancelled = true;
    };
  }, [currentTrack]);

  const refreshLyrics = useCallback(async () => {
    if (!currentTrack) return;
    try {
      const nextLyrics = await fetchSyncedLyrics(
        currentTrack.artist,
        currentTrack.title,
        currentTrack.duration,
        currentTrack.id
      );
      setLyrics(nextLyrics);
    } catch (err) {
      setLyrics(null);
    }
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

  const handlePlayTrack = useCallback(async (trackId: number) => {
    const track = tracks.find((item) => item.id === trackId);
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
    } catch (err) {
      console.error(err);
    }
  }, [tracks]);

  const handleTogglePlayback = useCallback(async () => {
    if (!currentTrack) {
      if (tracks.length > 0) {
        await handlePlayTrack(tracks[0].id);
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
      console.error(err);
    }
  }, [currentTrack, handlePlayTrack, isPlaying, tracks]);

  const [isSeeking, setIsSeeking] = useState(false);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSeek = useCallback(async (posMs: number) => {
    try {
      setIsSeeking(true);
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
      
      await seekPlaybackMs(Math.max(0, Math.floor(posMs)));
      setPlaybackPosMs(Math.max(0, Math.floor(posMs)));
      
      // Keep guard active for a moment to let backend stabilize
      seekTimeoutRef.current = setTimeout(() => {
        setIsSeeking(false);
      }, 1000);
    } catch {
      setIsSeeking(false);
    }
  }, []);

  useEffect(() => {
    if (!currentTrack || !isPlaying || isSeeking) {
      return;
    }

    let cancelled = false;
    const interval = window.setInterval(() => {
      void (async () => {
        try {
          const next = await getPlaybackPosMs();
          if (!cancelled && !isSeeking) {
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
  }, [currentTrack, isPlaying, isSeeking]);

  const handleSkip = useCallback(async (direction: -1 | 1, fromTrackEnd = false) => {
    if (tracks.length === 0 || queueTrackIds.length === 0) {
      return;
    }

    if (repeatMode === 'one' && fromTrackEnd && currentTrack) {
      await handlePlayTrack(currentTrack.id);
      return;
    }

    const currentIdx = queueIndex >= 0 ? queueIndex : 0;
    const nextIdx = currentIdx + direction;

    if (nextIdx < 0) {
      if (repeatMode === 'all') {
        const wrapped = queueTrackIds.length - 1;
        const wrappedTrack = tracks.find((track) => track.id === queueTrackIds[wrapped]);
        if (wrappedTrack) await handlePlayTrack(wrappedTrack.id);
      }
      return;
    }

    if (nextIdx >= queueTrackIds.length) {
      if (repeatMode === 'all') {
        const wrappedTrack = tracks.find((track) => track.id === queueTrackIds[0]);
        if (wrappedTrack) await handlePlayTrack(wrappedTrack.id);
      } else if (fromTrackEnd) {
        setIsPlaying(false);
      }
      return;
    }

    const nextTrack = tracks.find((track) => track.id === queueTrackIds[nextIdx]);
    if (nextTrack) {
      await handlePlayTrack(nextTrack.id);
    }
  }, [tracks, queueTrackIds, repeatMode, currentTrack, queueIndex, handlePlayTrack]);

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

  const handleNavChange = (view: NavView) => {
    setNavState(prev => ({
      view,
      detail: null,
      scrollY: 0,
      previousView: prev.view
    }));
    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTop = 0;
    }
  };

  const renderRightPanelContent = () => {
    if (navState.view === 'queue') {
      return (
        <Queue 
          tracks={queueTrackIds.map((id) => tracks.find((t) => t.id === id)).filter((t): t is Track => t !== undefined)} 
          currentTrackId={currentTrackId ?? undefined}
          onPlayTrack={(id) => void handlePlayTrack(id)} 
        />
      );
    }
    if (navState.view === 'tracks') {
      return (
        <Tracks 
          tracks={tracks}
          currentTrackId={currentTrackId ?? undefined}
          onPlayTrack={(id) => void handlePlayTrack(id)}
          onScanLocalFiles={async (path) => {
            try {
              await scanLocalFiles(path);
              await loadLibrary();
            } catch (err) {
              console.error(err);
            }
          }}
        />
      );
    }
    if (navState.view === 'albums') {
      return (
        <Albums 
          albums={albums} 
          detailId={navState.detail as number | null}
          tracks={tracks}
          onSelectAlbum={(id) => setNavState({ ...navState, view: 'albums', detail: id, scrollY: rightPanelRef.current?.scrollTop || 0 })} 
          onBack={() => {
            const scroll = navState.scrollY;
            setNavState({ ...navState, detail: null });
            if (rightPanelRef.current) {
              setTimeout(() => {
                if (rightPanelRef.current) rightPanelRef.current.scrollTop = scroll;
              }, 0);
            }
          }}
          onPlayTrack={(id) => void handlePlayTrack(id)}
        />
      );
    }
    if (navState.view === 'artists') {
      return (
        <Artists 
          artists={artists} 
          detailId={navState.detail as number | null}
          albums={albums}
          tracks={tracks}
          onSelectArtist={(id) => setNavState({ ...navState, view: 'artists', detail: id, scrollY: rightPanelRef.current?.scrollTop || 0 })} 
          onBack={() => {
            const scroll = navState.scrollY;
            setNavState({ ...navState, detail: null });
            if (rightPanelRef.current) {
              setTimeout(() => {
                if (rightPanelRef.current) rightPanelRef.current.scrollTop = scroll;
              }, 0);
            }
          }}
          onPlayTrack={(id) => void handlePlayTrack(id)}
        />
      );
    }
    if (navState.view === 'playlists') {
      return (
        <Playlists 
          playlists={playlists}
          playlistTracks={playlistTracks}
          currentTrack={currentTrack}
          onAddCurrentTrack={async (playlistId) => {
            if (currentTrackId) {
              await addTrackToPlaylist(playlistId, currentTrackId);
              await loadLibrary();
            }
          }}
          onRemoveTrack={async (playlistId, trackId) => {
            await removeTrackFromPlaylist(playlistId, trackId);
            await loadLibrary();
          }}
          onCreatePlaylist={async (name) => {
            await apiCreatePlaylist(name);
            await loadLibrary();
          }}
        />
      );
    }
    if (navState.view === 'settings') {
      return <Settings />;
    }
    if (navState.view === 'lyrics-editor') {
      return (
        <LyricsEditor 
          currentTrack={currentTrack}
          playbackPosMs={playbackPosMs}
          onBack={() => setNavState(prev => ({ ...prev, view: prev.previousView ?? 'queue' }))}
          onSeek={handleSeek}
        />
      );
    }
    return null;
  };

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex', 
          height: '100vh', 
          width: '100vw', 
          overflow: 'hidden', 
          borderRadius: `${vinyl?.radius?.window ?? 12}px`,
          border: '0.5px solid rgba(0,0,0,0.15)',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
        }}
      >
      {/* Left Panel: Player / Lyrics */}
      <Box 
        sx={{ 
          width: 320, 
          flexShrink: 0, 
          backgroundColor: vinyl?.radius ? (resolvedMode === 'dark' ? '#242424' : '#FFFFFF') : 'transparent',
          display: 'flex',
          flexDirection: 'column',
          borderTopLeftRadius: `${vinyl?.radius?.window ?? 12}px`,
          borderBottomLeftRadius: `${vinyl?.radius?.window ?? 12}px`,
          position: 'relative',
        }}
      >
        <NowPlaying
          currentTrack={currentTrack}
          lyrics={lyrics}
          playbackPosMs={playbackPosMs}
          isPlaying={isPlaying}
          volume={volume}
          shuffleEnabled={shuffleEnabled}
          repeatMode={repeatMode}
          onTogglePlayback={handleTogglePlayback}
          onPrevious={() => void handleSkip(-1)}
          onNext={() => void handleSkip(1)}
          onSeek={handleSeek}
          onVolumeChange={setVolume}
          onToggleShuffle={() => setShuffleEnabled(!shuffleEnabled)}
          onCycleRepeatMode={() => setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off')}
          onRefreshLyrics={refreshLyrics}
        />

      </Box>

      {/* Right Panel: Queue */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          backgroundColor: resolvedMode === 'dark' ? '#2A2A2A' : '#F5F5F5',
          display: 'flex',
          flexDirection: 'column',
          borderTopRightRadius: `${vinyl?.radius?.window ?? 12}px`,
          borderBottomRightRadius: `${vinyl?.radius?.window ?? 12}px`,
        }}
      >
        <HeaderBar onNavigate={(view) => setNavState(prev => ({ ...prev, previousView: prev.view, view }))} />
        <NavRail activeView={navState.view} onChange={handleNavChange} />
        <Box 
          ref={rightPanelRef}
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden',
            display: 'flex',
          }}
        >
          {renderRightPanelContent()}
        </Box>
      </Box>
    </Box>
    </MuiThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

