import { Avatar, Box, Drawer, IconButton, List, ListItemButton, ListItemText, Slider, Stack, Typography, alpha } from '@mui/material';
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
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Track } from '../../types/library';
import { useAppTheme } from '../../lib/ThemeContext';

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
  const { primaryColor, mode } = useAppTheme();

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
        height: 100,
        bgcolor: alpha(mode === 'dark' ? '#1A1A1A' : '#F3F4F9', 0.95),
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        px: 4,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Current Track Info */}
      <Box sx={{ width: '30%', display: 'flex', alignItems: 'center' }}>
        <Avatar
          variant="rounded"
          src={currentTrack?.cover_art_data_url ?? undefined}
          sx={{ 
            width: 64, 
            height: 64, 
            borderRadius: 3, 
            bgcolor: 'background.paper', 
            mr: 2.5,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)' 
          }}
        >
          <MusicNoteIcon sx={{ opacity: 0.2 }} />
        </Avatar>
        <Box 
          component={Link} 
          to="/now-playing" 
          sx={{ 
            color: 'inherit', 
            textDecoration: 'none',
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          <Typography variant="body1" noWrap sx={{ fontWeight: 800, letterSpacing: -0.2 }}>
            {currentTrack?.title ?? 'No track selected'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 500, opacity: 0.7 }}>
            {currentTrack ? `${currentTrack.artist}` : 'Scan and play a track'}
          </Typography>
        </Box>
      </Box>

      {/* Playback Controls & Progress */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
          <IconButton onClick={onPrevious} size="medium"><SkipPreviousIcon /></IconButton>
          <IconButton 
            onClick={onTogglePlayback}
            sx={{ 
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: alpha(primaryColor, 0.8),
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s',
              boxShadow: `0 8px 24px ${alpha(primaryColor, 0.35)}`
            }}
          >
            {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
          </IconButton>
          <IconButton onClick={onNext} size="medium"><SkipNextIcon /></IconButton>
        </Stack>
        
        <Box sx={{ width: '100%', maxWidth: 500, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', opacity: 0.5 }}>
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
            sx={{
              color: 'primary.main',
              '& .MuiSlider-thumb': {
                width: 0,
                height: 0,
                transition: '0.2s',
              },
              '&:hover .MuiSlider-thumb': {
                width: 14,
                height: 14,
              },
              '& .MuiSlider-rail': {
                opacity: 0.1,
              }
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', opacity: 0.5 }}>
            {currentTrack ? formatDuration(currentTrack.duration) : '0:00'}
          </Typography>
        </Box>
      </Box>

      {/* Volume & Additional Actions */}
      <Box sx={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
        <IconButton 
          color={shuffleEnabled ? 'primary' : 'default'} 
          onClick={onToggleShuffle}
          sx={{ bgcolor: shuffleEnabled ? alpha(primaryColor, 0.1) : 'transparent' }}
        >
          <ShuffleIcon fontSize="small" />
        </IconButton>
        <IconButton 
          color={repeatMode === 'off' ? 'default' : 'primary'} 
          onClick={onCycleRepeatMode}
          sx={{ bgcolor: repeatMode !== 'off' ? alpha(primaryColor, 0.1) : 'transparent' }}
        >
          {repeatIcon}
        </IconButton>
        <IconButton onClick={() => setQueueOpen(true)}>
          <QueueMusicIcon fontSize="small" />
        </IconButton>
        
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', ml: 2, minWidth: 140 }}>
          <VolumeUpIcon sx={{ color: 'text.secondary', fontSize: 20, opacity: 0.5 }} />
          <Slider
            size="small"
            value={Math.round(volume * 100)}
            onChange={(_, value) => onVolumeChange((value as number) / 100)}
            sx={{ 
              width: 100,
              '& .MuiSlider-thumb': { width: 12, height: 12 }
            }}
          />
        </Stack>
      </Box>

      <Drawer
        anchor="right"
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        slotProps={{ 
          paper: { 
            sx: { 
              width: 400, 
              bgcolor: 'background.default',
              borderRadius: '24px 0 0 24px',
              p: 2
            } 
          } 
        }}
      >
        <Box sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Queue</Typography>
          <IconButton onClick={() => setQueueOpen(false)} sx={{ bgcolor: 'action.hover' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 1 }}>
          {queueTracks.map((track, idx) => (
            <ListItemButton
              key={`${track.id}-${idx}`}
              onClick={() => onPlayQueueIndex(idx)}
              sx={{ 
                borderRadius: 4, 
                mb: 1, 
                py: 1.5,
                bgcolor: idx === queueIndex ? alpha(primaryColor, 0.15) : 'transparent',
                '&:hover': { bgcolor: alpha(primaryColor, 0.05) }
              }}
            >
              <ListItemText
                primary={<Typography variant="body1" sx={{ fontWeight: 700 }}>{track.title}</Typography>}
                secondary={<Typography variant="body2" sx={{ opacity: 0.6 }}>{track.artist}</Typography>}
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
