import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { HeaderBar } from './components/layout/HeaderBar';
import { NavRail } from './components/layout/NavRail';
import { SearchOverlay } from './components/SearchOverlay';
import { NowPlaying } from './views/NowPlaying';
import { Queue } from './views/Queue';
import { Tracks } from './views/Tracks';
import { Albums } from './views/Albums';
import { Artists } from './views/Artists';
import { Playlists } from './views/Playlists';
import { Settings } from './views/Settings';
import { LyricsEditor } from './views/LyricsEditor';
import { FullscreenNowPlaying } from './views/FullscreenNowPlaying';
import { ThemeProvider, useTheme as useAppTheme } from './lib/ThemeContext';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getAppTheme } from './theme';
import { useLibrary } from './hooks/useLibrary';
import { usePlayback } from './lib/usePlayback';
import { useDominantColor } from './hooks/useDominantColor';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { NavView } from './types/library';

function AppContent() {
  const { theme: appTheme, accentColor, dynamicColor, setDynamicColor } = useAppTheme();

  const resolvedMode = useMemo(() => {
    if (appTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return appTheme as 'light' | 'dark';
  }, [appTheme]);

  const muiTheme = useMemo(
    () => getAppTheme(resolvedMode, accentColor, dynamicColor),
    [resolvedMode, accentColor, dynamicColor]
  );

  const vinyl = muiTheme.vinyl;

  const {
    tracks,
    albums,
    artists,
    playlists,
    playlistTracks,
    loadLibrary,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    scanFolder,
  } = useLibrary();

  const {
    currentTrack,
    isPlaying,
    volume,
    setVolume,
    lyrics,
    playbackPosMs,
    queueTrackIds,
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
  } = usePlayback({ tracks, loadLibrary });

  const coverSrc = currentTrack?.cover_art_data_url ?? null;
  const dominantColor = useDominantColor(coverSrc, true);

  useEffect(() => {
    setDynamicColor(dominantColor);
  }, [dominantColor, setDynamicColor]);

  const [navState, setNavState] = useState({
    view: 'queue' as NavView,
    detail: null as string | number | null,
    scrollY: 0,
    previousView: null as NavView | null,
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [miniPlayer, setMiniPlayer] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const handleNavChange = (view: NavView) => {
    setNavState((prev) => ({
      view,
      detail: null,
      scrollY: 0,
      previousView: prev.view,
    }));
    if (rightPanelRef.current) rightPanelRef.current.scrollTop = 0;
  };

  useKeyboardShortcuts({
    onPlayPause: handleTogglePlayback,
    onNext: () => void handleSkip(1),
    onPrevious: () => void handleSkip(-1),
    onToggleSearch: () => setSearchOpen((o) => !o),
    onToggleLyrics: () => setNavState((prev) => ({ ...prev, view: 'lyrics-editor' })),
    onVolumeUp: () => setVolume((v) => Math.min(1, v + 0.1)),
    onVolumeDown: () => setVolume((v) => Math.max(0, v - 0.1)),
    onNavigate: (view) => handleNavChange(view as NavView),
    onShowQueue: () => handleNavChange('queue'),
  });

  const handleSelectAlbumFromSearch = useCallback((id: number) => {
    setNavState({ view: 'albums', detail: id, scrollY: 0, previousView: navState.view });
  }, [navState.view]);

  const handleSelectArtistFromSearch = useCallback((id: number) => {
    setNavState({ view: 'artists', detail: id, scrollY: 0, previousView: navState.view });
  }, [navState.view]);

  const renderRightPanelContent = () => {
    if (navState.view === 'queue') {
      return (
        <Queue
          tracks={queueTrackIds.map((id) => tracks.find((t) => t.id === id)).filter((t): t is typeof tracks[0] => t !== undefined)}
          currentTrackId={currentTrack?.id}
          onPlayTrack={(id) => void handlePlayTrack(id)}
        />
      );
    }
    if (navState.view === 'tracks') {
      return (
        <Tracks
          tracks={tracks}
          currentTrackId={currentTrack?.id}
          onPlayTrack={(id) => void handlePlayTrack(id)}
          onPlayNext={(id) => void handlePlayNext(id)}
          onAddToQueue={(id) => void handleAddToQueue(id)}
          onScanLocalFiles={async (path) => {
            try { await scanFolder(path); }
            catch (err) { console.error(err); }
          }}
          playlists={playlists}
          onAddToPlaylist={(playlistId, trackId) => void addToPlaylist(playlistId, trackId)}
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
              setTimeout(() => { if (rightPanelRef.current) rightPanelRef.current.scrollTop = scroll; }, 0);
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
              setTimeout(() => { if (rightPanelRef.current) rightPanelRef.current.scrollTop = scroll; }, 0);
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
          tracks={tracks}
          currentTrack={currentTrack}
          onAddCurrentTrack={async (playlistId) => {
            if (currentTrack) await addToPlaylist(playlistId, currentTrack.id);
          }}
          onAddToPlaylist={async (playlistId, trackId) => {
            await addToPlaylist(playlistId, trackId);
          }}
          onRemoveTrack={async (playlistId, trackId) => {
            await removeFromPlaylist(playlistId, trackId);
          }}
          onCreatePlaylist={async (name) => {
            await createPlaylist(name);
          }}
          onDeletePlaylist={async (playlistId) => {
            await deletePlaylist(playlistId);
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
          onBack={() => setNavState((prev) => ({ ...prev, view: prev.previousView ?? 'queue' }))}
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
          border: '0.5px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: miniPlayer ? 80 : 320,
            flexShrink: 0,
            bgcolor: vinyl.panelLeft,
            display: 'flex',
            flexDirection: 'column',
            borderTopLeftRadius: `${vinyl?.radius?.window ?? 12}px`,
            borderBottomLeftRadius: `${vinyl?.radius?.window ?? 12}px`,
            position: 'relative',
            backdropFilter: 'blur(60px) saturate(180%)',
            WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            transition: 'width 300ms var(--spring, cubic-bezier(0.34, 1.56, 0.64, 1))',
            overflow: 'hidden',
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
            onToggleShuffle={handleToggleShuffle}
            onCycleRepeatMode={handleCycleRepeatMode}
            onRefreshLyrics={refreshLyrics}
            onShowQueue={() => setNavState((prev) => ({ ...prev, view: 'queue' }))}
            onShowFullscreen={() => setFullscreenOpen(true)}
            compact={miniPlayer}
            onToggleCompact={() => setMiniPlayer((m) => !m)}
          />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            bgcolor: vinyl.panelRight,
            display: 'flex',
            flexDirection: 'column',
            borderTopRightRadius: `${vinyl?.radius?.window ?? 12}px`,
            borderBottomRightRadius: `${vinyl?.radius?.window ?? 12}px`,
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(40px) saturate(160%)',
            WebkitBackdropFilter: 'blur(40px) saturate(160%)',
          }}
        >
          <HeaderBar
            onNavigate={(view) => setNavState((prev) => ({ ...prev, previousView: prev.view, view }))}
            onToggleSearch={() => setSearchOpen((o) => !o)}
          />
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

          <SearchOverlay
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            tracks={tracks}
            albums={albums}
            artists={artists}
            onPlayTrack={(id) => { void handlePlayTrack(id); setNavState((prev) => ({ ...prev, view: 'queue' })); }}
            onSelectAlbum={(id) => { handleSelectAlbumFromSearch(id); }}
            onSelectArtist={(id) => { handleSelectArtistFromSearch(id); }}
          />

          <FullscreenNowPlaying
            open={fullscreenOpen}
            onClose={() => setFullscreenOpen(false)}
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
            onToggleShuffle={handleToggleShuffle}
            onCycleRepeatMode={handleCycleRepeatMode}
          />
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
