import { Alert, Avatar, Box, Button, CircularProgress, IconButton, List, ListItemButton, ListItemAvatar, ListItemText, Menu, MenuItem, Paper, TextField, Typography, alpha } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SearchIcon from '@mui/icons-material/Search';
import type { ArtistBioPayload, LyricsPayload, Track } from '../types/library';
import { Virtuoso } from 'react-virtuoso';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppTheme } from '../lib/ThemeContext';

interface TracksProps {
  tracks: Track[];
  loading: boolean;
  scanning: boolean;
  error: string | null;
  scanPath: string;
  currentTrackId: number | null;
  currentTrack: Track | null;
  lyrics: LyricsPayload | null;
  lyricsLoading: boolean;
  artistBio: ArtistBioPayload | null;
  artistBioLoading: boolean;
  playbackPosMs: number;
  onScanPathChange: (value: string) => void;
  onScan: () => void;
  onPlayTrack: (track: Track) => void;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const Tracks = ({
  tracks,
  loading,
  scanning,
  error,
  scanPath,
  currentTrackId,
  currentTrack,
  lyrics,
  lyricsLoading,
  artistBio,
  artistBioLoading,
  playbackPosMs,
  onScanPathChange,
  onScan,
  onPlayTrack,
  onPlayNext,
  onAddToQueue,
}: TracksProps) => {
  const lyricRowRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);
  const { primaryColor } = useAppTheme();

  const activeLyricIndex = useMemo(() => {
    if (!lyrics || lyrics.lines.length === 0) {
      return -1;
    }
    let idx = -1;
    for (let i = 0; i < lyrics.lines.length; i += 1) {
      if (lyrics.lines[i].timestamp_ms <= playbackPosMs) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [lyrics, playbackPosMs]);

  useEffect(() => {
    if (activeLyricIndex < 0 || !lyrics) {
      return;
    }
    const line = lyrics.lines[activeLyricIndex];
    const el = lyricRowRefs.current.get(line.timestamp_ms);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeLyricIndex, lyrics]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, letterSpacing: -1.5 }}>
        Tracks
      </Typography>

      <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 6, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SearchIcon color="primary" /> Scan Library
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Paste folder path (e.g. C:\Users\Music)"
            value={scanPath}
            onChange={(event) => onScanPathChange(event.target.value)}
            sx={{ 
              flex: 1, 
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                bgcolor: 'action.hover'
              }
            }}
          />
          <Button 
            variant="contained" 
            onClick={onScan} 
            disabled={scanning}
            sx={{ px: 4, height: 56, boxShadow: `0 8px 20px ${alpha(primaryColor, 0.3)}` }}
          >
            {scanning ? 'Scanning...' : 'Scale Folder'}
          </Button>
        </Box>
      </Paper>

      {error ? <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert> : null}

      {currentTrack ? (
        <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 6, bgcolor: alpha(primaryColor, 0.03), border: '1px solid', borderColor: alpha(primaryColor, 0.1) }}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 4 }}>
            <Avatar
              variant="rounded"
              src={currentTrack.cover_art_data_url ?? undefined}
              sx={{ width: 80, height: 80, borderRadius: 3, bgcolor: 'background.paper', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              <MusicNoteIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{currentTrack.title}</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>{currentTrack.artist} • {currentTrack.album}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontSize: '1rem' }}>Lyrics</Typography>
              {lyricsLoading ? (
                <CircularProgress size={24} sx={{ my: 2 }} />
              ) : lyrics ? (
                <Paper variant="outlined" sx={{ maxHeight: 300, overflowY: 'auto', p: 2, borderRadius: 4, bgcolor: 'background.default' }}>
                  {lyrics.lines.length > 0 ? lyrics.lines.map((line, index) => {
                    const isActive = index === activeLyricIndex;
                    return (
                      <Box
                        key={`${line.timestamp_ms}-${index}`}
                        ref={(el: HTMLDivElement | null) => {
                          lyricRowRefs.current.set(line.timestamp_ms, el);
                        }}
                        sx={{
                          py: 1,
                          px: 2,
                          borderRadius: 3,
                          mb: 0.5,
                          transition: '0.3s',
                          bgcolor: isActive ? alpha(primaryColor, 0.15) : 'transparent',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: isActive ? 'primary.main' : 'text.secondary',
                            fontWeight: isActive ? 800 : 500,
                            opacity: isActive ? 1 : 0.6,
                            transition: '0.3s'
                          }}
                        >
                          {line.text || '...'}
                        </Typography>
                      </Box>
                    );
                  }) : (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', opacity: 0.8 }}>
                      {lyrics.plain_text}
                    </Typography>
                  )}
                </Paper>
              ) : (
                <Typography color="text.secondary" variant="body2">No lyrics found.</Typography>
              )}
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontSize: '1rem' }}>Artist Bio</Typography>
              {artistBioLoading ? (
                <CircularProgress size={24} sx={{ my: 2 }} />
              ) : artistBio ? (
                <Paper variant="outlined" sx={{ maxHeight: 300, overflowY: 'auto', p: 3, borderRadius: 4, bgcolor: 'background.default' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, opacity: 0.8 }}>
                    {artistBio.biography}
                  </Typography>
                </Paper>
              ) : (
                <Typography color="text.secondary" variant="body2">No bio found.</Typography>
              )}
            </Box>
          </Box>
        </Paper>
      ) : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!loading && tracks.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Empty Library</Typography>
          <Typography color="text.secondary">Scan a folder to begin your collection.</Typography>
        </Paper>
      ) : null}

      {!loading && tracks.length > 0 ? (
        <List sx={{ minHeight: 600 }}>
          <Virtuoso
            style={{ height: '100%', minHeight: 600 }}
            data={tracks}
            itemContent={(_, track) => (
              <ListItemButton
                key={track.id}
                onClick={() => void onPlayTrack(track)}
                sx={{
                  borderRadius: 4,
                  mb: 1,
                  mx: 0.5,
                  transition: '0.2s',
                  bgcolor: currentTrackId === track.id ? alpha(primaryColor, 0.1) : 'transparent',
                  '&:hover': { bgcolor: alpha(primaryColor, 0.05) }
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={track.cover_art_data_url ?? undefined}
                    sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'background.paper' }}
                  >
                    <MusicNoteIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body1" sx={{ fontWeight: 700, color: currentTrackId === track.id ? 'primary.main' : 'text.primary' }}>{track.title}</Typography>}
                  secondary={<Typography variant="body2" sx={{ opacity: 0.6 }}>{track.artist} • {track.album}</Typography>}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mr: 4, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {formatDuration(track.duration)}
                </Typography>
                <IconButton
                  edge="end"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuAnchor(event.currentTarget);
                    setMenuTrack(track);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemButton>
            )}
          />
        </List>
      ) : null}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && menuTrack)}
        onClose={() => {
          setMenuAnchor(null);
          setMenuTrack(null);
        }}
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <MenuItem
          sx={{ borderRadius: 2 }}
          onClick={() => {
            if (menuTrack) onPlayNext(menuTrack);
            setMenuAnchor(null);
            setMenuTrack(null);
          }}
        >
          Play next
        </MenuItem>
        <MenuItem
          sx={{ borderRadius: 2 }}
          onClick={() => {
            if (menuTrack) onAddToQueue(menuTrack);
            setMenuAnchor(null);
            setMenuTrack(null);
          }}
        >
          Add to queue
        </MenuItem>
      </Menu>
    </Box>
  );
};
