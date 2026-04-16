import { Alert, Avatar, Box, Button, CircularProgress, Divider, IconButton, List, ListItemButton, ListItemAvatar, ListItemText, Menu, MenuItem, Paper, TextField, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import type { ArtistBioPayload, LyricsPayload, Track } from '../types/library';
import { useEffect, useMemo, useRef, useState } from 'react';

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
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Tracks
      </Typography>

      <Paper sx={{ p: 2.5, mb: 3, bgcolor: 'rgba(255,255,255,0.03)' }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Scan local music folder
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            label="Folder path"
            placeholder="C:\\Users\\you\\Music"
            value={scanPath}
            onChange={(event) => onScanPathChange(event.target.value)}
            sx={{ flex: 1, minWidth: 320 }}
          />
          <Button variant="contained" onClick={onScan} disabled={scanning}>
            {scanning ? 'Scanning...' : 'Scan Library'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Paste a Windows music folder path and the app will index supported files from disk.
        </Typography>
      </Paper>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {currentTrack ? (
        <Paper sx={{ p: 2.5, mb: 3, bgcolor: 'rgba(255,255,255,0.03)' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Avatar
              variant="rounded"
              src={currentTrack.cover_art_data_url ?? undefined}
              sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.1)' }}
            >
              <MusicNoteIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{currentTrack.title}</Typography>
              <Typography color="text.secondary">{currentTrack.artist} • {currentTrack.album}</Typography>
              <Typography variant="caption" color="text.secondary">
                Lyrics and artist bio are cached locally after the first fetch.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '1.3fr 1fr' } }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Synced Lyrics</Typography>
              {lyricsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : lyrics ? (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    Source: {lyrics.provider}{lyrics.embedded ? ' • embedded into MP3 tag' : lyrics.stored_path ? ` • sidecar: ${lyrics.stored_path}` : ''}
                  </Typography>
                  <Paper variant="outlined" sx={{ maxHeight: 260, overflowY: 'auto', p: 1.5, bgcolor: 'rgba(255,255,255,0.02)' }}>
                    {lyrics.lines.length > 0 ? lyrics.lines.map((line, index) => {
                      const isActive = index === activeLyricIndex;
                      return (
                        <Box
                          key={`${line.timestamp_ms}-${index}`}
                          ref={(el: HTMLDivElement | null) => {
                            lyricRowRefs.current.set(line.timestamp_ms, el);
                          }}
                          sx={{
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor: isActive ? 'rgba(255, 171, 64, 0.14)' : 'transparent',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: isActive ? 'text.primary' : 'text.secondary',
                              fontWeight: isActive ? 600 : 400,
                            }}
                          >
                            {line.text || '...'}
                          </Typography>
                        </Box>
                      );
                    }) : (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {lyrics.plain_text}
                      </Typography>
                    )}
                  </Paper>
                </>
              ) : (
                <Typography color="text.secondary">No lyrics loaded for this track yet.</Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Artist Bio</Typography>
              {artistBioLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : artistBio ? (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    Source: {artistBio.provider}
                  </Typography>
                  <Paper variant="outlined" sx={{ maxHeight: 260, overflowY: 'auto', p: 1.5, bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {artistBio.biography}
                    </Typography>
                  </Paper>
                </>
              ) : (
                <Typography color="text.secondary">No artist bio available for this track yet.</Typography>
              )}
            </Box>
          </Box>
        </Paper>
      ) : null}

      <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!loading && tracks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.03)' }}>
          <Typography variant="h6" gutterBottom>No tracks yet</Typography>
          <Typography color="text.secondary">
            Scan a folder with MP3, FLAC, WAV, or M4A files to populate the library.
          </Typography>
        </Paper>
      ) : null}

      {!loading && tracks.length > 0 ? (
        <List>
          {tracks.map((track) => (
            <ListItemButton
              key={track.id}
              onClick={() => void onPlayTrack(track)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: currentTrackId === track.id ? 'rgba(255, 171, 64, 0.12)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  variant="rounded"
                  src={track.cover_art_data_url ?? undefined}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                >
                  <MusicNoteIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant="body1" sx={{ fontWeight: 500 }}>{track.title}</Typography>}
                secondary={`${track.artist} • ${track.album}`}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
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
          ))}
        </List>
      ) : null}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && menuTrack)}
        onClose={() => {
          setMenuAnchor(null);
          setMenuTrack(null);
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuTrack) onPlayNext(menuTrack);
            setMenuAnchor(null);
            setMenuTrack(null);
          }}
        >
          Play next
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuTrack) onAddToQueue(menuTrack);
            setMenuAnchor(null);
            setMenuTrack(null);
          }}
        >
          Add to queue
        </MenuItem>
      </Menu>
    </>
  );
};
