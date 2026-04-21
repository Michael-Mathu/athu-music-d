import { Avatar, Box, Drawer, IconButton, List, ListItemButton, ListItemText, Slider, Stack, Typography, alpha, useTheme } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const durationMs = currentTrack ? currentTrack.duration * 1000 : 0;
  const clampedPos = Math.max(0, Math.min(playbackPosMs, durationMs || playbackPosMs));
  const posSeconds = Math.floor(clampedPos / 1000);
  
  const repeatIcon = useMemo(() => {
    if (repeatMode === 'one') return <RepeatOneRoundedIcon />;
    return <RepeatRoundedIcon />;
  }, [repeatMode]);

  return (
    <Box
      sx={{
        height: 84,
        bgcolor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        px: 3,
        zIndex: 1100,
        boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.02)' : 'none',
      }}
    >
      {/* Current Track Info */}
      <Box sx={{ width: '30%', display: 'flex', alignItems: 'center' }}>
        <Avatar
          variant="rounded"
          src={currentTrack?.cover_art_data_url ?? undefined}
          sx={{ 
            width: 52, 
            height: 52, 
            borderRadius: '8px', 
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', 
            mr: 2,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <MusicNoteRoundedIcon sx={{ opacity: 0.1 }} />
        </Avatar>
        <Box 
          component={Link} 
          to="/now-playing" 
          sx={{ 
            color: 'inherit', 
            textDecoration: 'none',
            maxWidth: 'calc(100% - 70px)',
            overflow: 'hidden'
          }}
        >
          <Typography variant="body1" noWrap sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {currentTrack?.title ?? 'No track playing'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 500, opacity: 0.7, fontSize: '0.85rem' }}>
            {currentTrack ? `${currentTrack.artist}` : 'Select a track to play'}
          </Typography>
        </Box>
      </Box>

      {/* Playback Controls & Progress */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton onClick={onPrevious} size="small" sx={{ opacity: 0.8 }}><SkipPreviousRoundedIcon /></IconButton>
          <IconButton 
            onClick={onTogglePlayback}
            sx={{ 
              width: 44,
              height: 44,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)'
              },
              transition: '0.2s cubic-bezier(0.25, 0.1, 0.25, 1.0)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          </IconButton>
          <IconButton onClick={onNext} size="small" sx={{ opacity: 0.8 }}><SkipNextRoundedIcon /></IconButton>
        </Stack>
        
        <Box sx={{ width: '100%', maxWidth: 450, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', opacity: 0.5, width: 35 }}>
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
                width: 10,
                height: 10,
              },
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', opacity: 0.5, width: 35, textAlign: 'right' }}>
            {currentTrack ? formatDuration(currentTrack.duration) : '0:00'}
          </Typography>
        </Box>
      </Box>

      {/* Volume & Additional Actions */}
      <Box sx={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
        <IconButton 
          size="small"
          color={shuffleEnabled ? 'primary' : 'default'} 
          onClick={onToggleShuffle}
          sx={{ bgcolor: shuffleEnabled ? alpha(theme.palette.primary.main, 0.1) : 'transparent' }}
        >
          <ShuffleRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small"
          color={repeatMode === 'off' ? 'default' : 'primary'} 
          onClick={onCycleRepeatMode}
          sx={{ bgcolor: repeatMode !== 'off' ? alpha(theme.palette.primary.main, 0.1) : 'transparent' }}
        >
          {repeatIcon}
        </IconButton>
        <IconButton size="small" onClick={() => setQueueOpen(true)}>
          <QueueMusicRoundedIcon fontSize="small" />
        </IconButton>
        
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', ml: 1, width: 120 }}>
          <VolumeUpRoundedIcon sx={{ color: 'text.secondary', fontSize: 18, opacity: 0.5 }} />
          <Slider
            size="small"
            value={Math.round(volume * 100)}
            onChange={(_, value) => onVolumeChange((value as number) / 100)}
            sx={{ 
              width: 80,
              '& .MuiSlider-thumb': { width: 10, height: 10 }
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
              width: 380, 
              bgcolor: 'background.paper',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
              p: 2
            } 
          } 
        }}
      >
        <Box sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Queue</Typography>
          <IconButton onClick={() => setQueueOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 0.5 }}>
          {queueTracks.map((track, idx) => (
            <ListItemButton
              key={`${track.id}-${idx}`}
              onClick={() => onPlayQueueIndex(idx)}
              sx={{ 
                borderRadius: '6px', 
                mb: 0.5, 
                py: 1,
                bgcolor: idx === queueIndex ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }
              }}
            >
              <ListItemText
                primary={<Typography variant="body2" sx={{ fontWeight: idx === queueIndex ? 700 : 500 }}>{track.title}</Typography>}
                secondary={<Typography variant="caption" sx={{ opacity: 0.6 }}>{track.artist}</Typography>}
              />
              <IconButton
                edge="end"
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveQueueTrack(track.id);
                }}
                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
              >
                <CloseRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

