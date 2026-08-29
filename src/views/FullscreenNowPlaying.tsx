import { Box, IconButton, Typography, Slider, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import type { LyricsPayload, Track } from '../types/library';
import { useTheme as useAppTheme } from '../lib/ThemeContext';
import { CoverArtImage } from '../components/CoverArtImage';
import { PlayingIndicator } from '../components/PlayingIndicator';

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

interface FullscreenNowPlayingProps {
  open: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  lyrics: LyricsPayload | null;
  playbackPosMs: number;
  isPlaying: boolean;
  volume: number;
  shuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onTogglePlayback: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (posMs: number) => void;
  onVolumeChange: (value: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeatMode: () => void;
}

const formatDuration = (durationMs: number) => {
  const seconds = Math.floor(durationMs / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const FullscreenNowPlaying = ({
  open,
  onClose,
  currentTrack,
  lyrics,
  playbackPosMs,
  isPlaying,
  volume,
  shuffleEnabled,
  repeatMode,
  onTogglePlayback,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onCycleRepeatMode,
}: FullscreenNowPlayingProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { dynamicColor } = useAppTheme();
  const accent = dynamicColor || theme.palette.primary.main;

  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const durationMs = currentTrack ? currentTrack.duration * 1000 : 0;
  const clampedPos = Math.max(0, Math.min(playbackPosMs, durationMs || playbackPosMs));

  const activeLyricIndex = (() => {
    if (!lyrics || lyrics.lines.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.lines.length; i += 1) {
      if (lyrics.lines[i].timestamp_ms <= playbackPosMs) idx = i;
      else break;
    }
    return idx;
  })();

  if (!open) return null;

  return (
    <Fade in={open}>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          bgcolor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(40px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
            filter: 'blur(80px)',
            opacity: isPlaying ? 0.6 : 0.2,
            transition: 'opacity 1000ms ease',
            pointerEvents: 'none',
          }}
        />

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, position: 'relative', zIndex: 1 }}>
          <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
            <ExpandMoreRoundedIcon />
          </IconButton>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.secondary' }}>
            Now Playing
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 4, position: 'relative', zIndex: 1 }}>
          {/* Cover Art */}
          <CoverArtImage
            src={currentTrack?.cover_art_data_url}
            size={320}
            borderRadius="20px"
            shadow
          />

          {/* Track Info */}
          <Box sx={{ textAlign: 'center', mt: 5, mb: 4, maxWidth: 400 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              {isPlaying && <PlayingIndicator size={16} />}
              <Typography sx={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em' }} noWrap>
                {currentTrack?.title || 'No track'}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 18, color: 'text.secondary', mb: 0.5 }} noWrap>
              {currentTrack?.artist || 'Unknown Artist'}
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.7 }} noWrap>
              {currentTrack?.album || 'Unknown Album'}
            </Typography>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ width: '100%', maxWidth: 500, mb: 4 }}>
            <Slider
              size="small"
              value={durationMs ? clampedPos : 0}
              min={0}
              max={durationMs || 0}
              onChange={(_, val) => onSeek(val as number)}
              sx={{
                color: accent,
                height: 6,
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                },
                '& .MuiSlider-track': { border: 'none' },
                '& .MuiSlider-rail': { opacity: 0.2 },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12 }}>
                {formatDuration(clampedPos)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12 }}>
                {formatDuration(durationMs)}
              </Typography>
            </Box>
          </Box>

          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4 }}>
            <IconButton onClick={onToggleShuffle} sx={{ color: shuffleEnabled ? accent : 'text.secondary' }}>
              <ShuffleRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
            <IconButton onClick={onPrevious} sx={{ color: 'text.primary' }}>
              <SkipPreviousRoundedIcon sx={{ fontSize: 40 }} />
            </IconButton>
            <IconButton
              onClick={onTogglePlayback}
              sx={{
                bgcolor: 'primary.main',
                color: '#FFF',
                width: 72,
                height: 72,
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              {isPlaying ? <PauseRoundedIcon sx={{ fontSize: 40 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 40 }} />}
            </IconButton>
            <IconButton onClick={onNext} sx={{ color: 'text.primary' }}>
              <SkipNextRoundedIcon sx={{ fontSize: 40 }} />
            </IconButton>
            <IconButton onClick={onCycleRepeatMode} sx={{ color: repeatMode !== 'off' ? accent : 'text.secondary' }}>
              {repeatMode === 'one' ? <RepeatOneRoundedIcon sx={{ fontSize: 24 }} /> : <RepeatRoundedIcon sx={{ fontSize: 24 }} />}
            </IconButton>
          </Box>

          {/* Volume & Lyrics Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', maxWidth: 400 }}>
            <VolumeDownRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Slider
              size="small"
              value={volume}
              min={0}
              max={1}
              step={0.01}
              onChange={(_, val) => onVolumeChange(val as number)}
              sx={{ color: accent }}
            />
            <VolumeUpRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Box sx={{ flex: 1 }} />
            <Typography
              onClick={() => setShowLyrics(!showLyrics)}
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: showLyrics ? accent : 'text.secondary',
                cursor: 'pointer',
                '&:hover': { color: accent },
              }}
            >
              Lyrics
            </Typography>
          </Box>
        </Box>

        {/* Lyrics Panel */}
        {showLyrics && lyrics && lyrics.lines.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              bgcolor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)',
              overflowY: 'auto',
              py: 4,
              px: 6,
            }}
          >
            {lyrics.lines.map((line, i) => (
              <Typography
                key={line.timestamp_ms}
                onClick={() => onSeek(line.timestamp_ms)}
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: activeLyricIndex === i ? accent : 'text.primary',
                  opacity: activeLyricIndex === i ? 1 : 0.5,
                  transition: 'all 300ms ease',
                  '&:hover': { opacity: 1 },
                }}
              >
                {line.text || '...'}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Fade>
  );
};
