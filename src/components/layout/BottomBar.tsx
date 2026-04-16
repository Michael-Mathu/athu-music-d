import { Avatar, Box, Drawer, IconButton, List, ListItemButton, ListItemText, Slider, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Track } from '../../types/library';

interface BottomBarProps {
  currentTrack: Track | null;
  queueTracks: Track[];
  queueIndex: number;
  isPlaying: boolean;
  playbackPosMs: number;
  volume: number;
  shuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onTogglePlayback: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (value: number) => void;
  onSeek: (posMs: number) => void;
  onPlayQueueIndex: (idx: number) => void;
  onRemoveQueueTrack: (trackId: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeatMode: () => void;
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const BottomBar = ({
  currentTrack,
  queueTracks,
  queueIndex,
  isPlaying,
  playbackPosMs,
  volume,
  shuffleEnabled,
  repeatMode,
  onTogglePlayback,
  onPrevious,
  onNext,
  onVolumeChange,
  onSeek,
  onPlayQueueIndex,
  onRemoveQueueTrack,
  onToggleShuffle,
  onCycleRepeatMode,
}: BottomBarProps) => {
  const [queueOpen, setQueueOpen] = useState(false);
  const durationMs = currentTrack ? currentTrack.duration * 1000 : 0;
  const clampedPos = Math.max(0, Math.min(playbackPosMs, durationMs || playbackPosMs));
  const posSeconds = Math.floor(clampedPos / 1000);
  const repeatIcon = useMemo(() => {
    if (repeatMode === 'one') return <RepeatOneIcon />;
    return <RepeatIcon />;
  }, [repeatMode]);
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        bgcolor: 'background.paper',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Box sx={{ width: '30%', display: 'flex', alignItems: 'center' }}>
        <Avatar
          variant="rounded"
          src={currentTrack?.cover_art_data_url ?? undefined}
          sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.1)', mr: 2 }}
        >
          <MusicNoteIcon />
        </Avatar>
        <Box component={Link} to="/now-playing" sx={{ color: 'inherit', textDecoration: 'none' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {currentTrack?.title ?? 'No track selected'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentTrack ? `${currentTrack.artist} • ${currentTrack.album}` : 'Scan and play a track'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton onClick={onPrevious}><SkipPreviousIcon /></IconButton>
          <IconButton color="primary" sx={{ bgcolor: 'rgba(255, 171, 64, 0.1)' }} onClick={onTogglePlayback}>
            {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
          </IconButton>
          <IconButton onClick={onNext}><SkipNextIcon /></IconButton>
        </Stack>
        <Box sx={{ width: '100%', maxWidth: 400, display: 'flex', alignItems: 'center', gap: 2, mt: -1 }}>
          <Typography variant="caption" color="text.secondary">
            {currentTrack ? formatDuration(posSeconds) : '0:00'}
          </Typography>
          <Slider
            size="small"
            value={durationMs ? clampedPos : 0}
            min={0}
            max={durationMs || 0}
            step={250}
            disabled={!currentTrack || !durationMs}
            onChangeCommitted={(_, value) => onSeek(value as number)}
          />
          <Typography variant="caption" color="text.secondary">
            {currentTrack ? formatDuration(currentTrack.duration) : '0:00'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
        <IconButton color={shuffleEnabled ? 'primary' : 'default'} onClick={onToggleShuffle}>
          <ShuffleIcon fontSize="small" />
        </IconButton>
        <IconButton color={repeatMode === 'off' ? 'default' : 'primary'} onClick={onCycleRepeatMode}>
          {repeatIcon}
        </IconButton>
        <IconButton onClick={() => setQueueOpen(true)}>
          <QueueMusicIcon />
        </IconButton>
        <IconButton component={Link} to="/now-playing">
          <OpenInFullIcon />
        </IconButton>
        <VolumeUpIcon sx={{ color: 'text.secondary', mr: 1 }} />
        <Slider
          size="small"
          value={Math.round(volume * 100)}
          onChange={(_, value) => onVolumeChange((value as number) / 100)}
          sx={{ width: 100 }}
        />
      </Box>
      <Drawer
        anchor="right"
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        slotProps={{ paper: { sx: { width: 360, bgcolor: 'background.paper' } } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Queue</Typography>
          <IconButton onClick={() => setQueueOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 1 }}>
          {queueTracks.map((track, idx) => (
            <ListItemButton
              key={`${track.id}-${idx}`}
              onClick={() => onPlayQueueIndex(idx)}
              sx={{ borderRadius: 1, mb: 0.5, bgcolor: idx === queueIndex ? 'rgba(255, 171, 64, 0.14)' : 'transparent' }}
            >
              <ListItemText
                primary={track.title}
                secondary={`${track.artist} • ${track.album}`}
              />
              <IconButton
                edge="end"
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveQueueTrack(track.id);
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};
