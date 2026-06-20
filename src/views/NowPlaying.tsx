import { Box, IconButton, Typography, Slider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, useRef, useEffect } from 'react';
import type { LyricsPayload, Track } from '../types/library';

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import CloudDownloadRoundedIcon from '@mui/icons-material/CloudDownloadRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import { downloadAndEmbedLyrics } from '../lib/tauri';
import { CoverArtImage } from '../components/CoverArtImage';

interface NowPlayingProps {
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
  onRefreshLyrics?: () => Promise<void>;
}

const formatDuration = (durationMs: number) => {
  const seconds = Math.floor(durationMs / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const NowPlaying = ({
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
  onRefreshLyrics,
}: NowPlayingProps) => {
  const theme = useTheme();
  const vinyl = theme.vinyl;
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState<'player' | 'lyrics'>('player');
  const lyricRefs = useRef<Map<number, HTMLElement | null>>(new Map());

  const activeLyricIndex = (() => {
    if (!lyrics || lyrics.lines.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.lines.length; i += 1) {
      if (lyrics.lines[i].timestamp_ms <= playbackPosMs) idx = i;
      else break;
    }
    return idx;
  })();

  useEffect(() => {
    if (activeTab === 'lyrics' && activeLyricIndex >= 0 && lyrics && lyrics.lines.length > 0) {
      const line = lyrics.lines[activeLyricIndex];
      const el = lyricRefs.current.get(line.timestamp_ms);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeLyricIndex, lyrics, activeTab]);

  const durationMs = currentTrack ? currentTrack.duration * 1000 : 0;
  const clampedPos = Math.max(0, Math.min(playbackPosMs, durationMs || playbackPosMs));

  const [isSeeking, setIsSeeking] = useState(false);
  const [localSeekPos, setLocalSeekPos] = useState(0);

  const handleSliderChange = (_: Event, value: number | number[]) => {
    setIsSeeking(true);
    setLocalSeekPos(value as number);
  };

  const handleSliderChangeCommitted = (_: React.SyntheticEvent | Event, value: number | number[]) => {
    onSeek(value as number);
    setIsSeeking(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        pt: 'var(--space-4)',
        px: 'var(--space-3)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -40,
          left: -80,
          width: 320,
          height: 320,
          background:
            'radial-gradient(circle, var(--accent-glow, rgba(250,45,72,0.24)) 0%, transparent 70%)',
          filter: 'blur(36px)',
          opacity: isPlaying ? 1 : 0.6,
          transition: 'opacity 600ms ease',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 'var(--space-4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 'var(--space-1-5, 6px)',
            py: '3px',
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
          }}
        >
          <Box
            onClick={() => setActiveTab('player')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 'var(--space-2)',
              py: '3px',
              borderRadius: '14px',
              cursor: 'pointer',
              bgcolor: activeTab === 'player' ? 'var(--accent-subtle, rgba(250,45,72,0.12))' : 'transparent',
              color:
                activeTab === 'player'
                  ? 'var(--accent-default, #FA2D48)'
                  : 'text.secondary',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
          >
            <MusicNoteRoundedIcon sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Player</Typography>
          </Box>
          <Box
            onClick={() => setActiveTab('lyrics')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 'var(--space-2)',
              py: '3px',
              borderRadius: '14px',
              cursor: 'pointer',
              bgcolor: activeTab === 'lyrics' ? 'var(--accent-subtle, rgba(250,45,72,0.12))' : 'transparent',
              color:
                activeTab === 'lyrics'
                  ? 'var(--accent-default, #FA2D48)'
                  : 'text.secondary',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
          >
            <TextFieldsRoundedIcon sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Lyrics</Typography>
          </Box>
        </Box>
      </Box>

      {activeTab === 'player' ? (
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <CoverArtImage
            src={currentTrack?.cover_art_data_url}
            size={200}
            borderRadius="20px"
            shadow
          />

          <Box sx={{ textAlign: 'center', mb: 'var(--space-5)', width: '100%', mt: 'var(--space-4)' }}>
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 700,
                mb: 'var(--space-1)',
                letterSpacing: '-0.01em',
              }}
              noWrap
            >
              {currentTrack?.title || 'No track'}
            </Typography>
            <Typography
              sx={{ fontSize: 13, color: 'text.secondary', mb: '2px' }}
              noWrap
            >
              {currentTrack?.artist || 'Unknown Artist'}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', opacity: 0.8 }} noWrap>
              {currentTrack?.album || 'Unknown Album'}
            </Typography>
          </Box>

          <Box sx={{ width: '100%', mb: 'var(--space-4)' }}>
            <Slider
              size="small"
              value={isSeeking ? localSeekPos : durationMs ? clampedPos : 0}
              min={0}
              max={durationMs || 0}
              onChange={handleSliderChange}
              onChangeCommitted={handleSliderChangeCommitted}
              valueLabelDisplay="auto"
              valueLabelFormat={(val) => formatDuration(val)}
              sx={{
                color: vinyl.adwBlue,
                height: 4,
                padding: 0,
                '& .MuiSlider-thumb': {
                  width: 14,
                  height: 14,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.24)',
                  transition: 'transform 150ms ease',
                  '&:hover, &.Mui-focusVisible': {
                    transform: 'scale(1.25)',
                    boxShadow: `0 0 0 8px ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'}`,
                  },
                },
                '& .MuiSlider-track': { border: 'none' },
                '& .MuiSlider-rail': {
                  opacity: 0.18,
                  backgroundColor: theme.palette.text.primary,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '2px' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                {formatDuration(isSeeking ? localSeekPos : clampedPos)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                {formatDuration(durationMs)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 'var(--space-4)' }}>
            <IconButton
              onClick={onPrevious}
              aria-label="Previous track"
              sx={{
                color: theme.palette.text.primary,
                width: 44,
                height: 44,
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              }}
            >
              <SkipPreviousRoundedIcon sx={{ fontSize: 28 }} />
            </IconButton>
            <IconButton
              onClick={onTogglePlayback}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              sx={{
                bgcolor: vinyl.adwBlue,
                color: '#FFFFFF',
                width: 52,
                height: 52,
                '&:hover': { bgcolor: vinyl.adwBlue, opacity: 0.92 },
                boxShadow: `0 0 0 8px ${isDark ? 'rgba(250,45,72,0.25)' : 'rgba(250,45,72,0.18)'}`,
                transition: 'transform 120ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                '&:active': { transform: 'scale(0.96)' },
              }}
            >
              {isPlaying ? <PauseRoundedIcon sx={{ fontSize: 30 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 30 }} />}
            </IconButton>
            <IconButton
              onClick={onNext}
              aria-label="Next track"
              sx={{
                color: theme.palette.text.primary,
                width: 44,
                height: 44,
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              }}
            >
              <SkipNextRoundedIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%', px: 'var(--space-4)' }}>
            <IconButton
              size="small"
              onClick={onToggleShuffle}
              aria-label={shuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}
              aria-pressed={shuffleEnabled}
              sx={{
                color: shuffleEnabled ? vinyl.adwBlue : 'text.secondary',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              }}
            >
              <ShuffleRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', width: 110, gap: 1 }}>
              <IconButton
                size="small"
                aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)}
                sx={{ p: 0, width: 28, height: 28 }}
              >
                <VolumeUpRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </IconButton>
              <Slider
                size="small"
                value={volume}
                min={0}
                max={1}
                step={0.01}
                aria-label="Volume"
                onChange={(_, val) => onVolumeChange(val as number)}
                sx={{
                  color: vinyl.adwBlue,
                  height: 4,
                  padding: 0,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  },
                  '& .MuiSlider-track': { border: 'none' },
                  '& .MuiSlider-rail': { opacity: 0.2, backgroundColor: theme.palette.text.primary },
                }}
              />
            </Box>

            <IconButton
              size="small"
              onClick={onCycleRepeatMode}
              aria-label={repeatMode === 'off' ? 'Enable repeat all' : repeatMode === 'all' ? 'Enable repeat one' : 'Disable repeat'}
              aria-pressed={repeatMode !== 'off'}
              sx={{
                color: repeatMode !== 'off' ? vinyl.adwBlue : 'text.secondary',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              }}
            >
              {repeatMode === 'one' ? <RepeatOneRoundedIcon sx={{ fontSize: 18 }} /> : <RepeatRoundedIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              px: 'var(--space-2)',
              py: 'var(--space-2)',
              mb: 'var(--space-3)',
            }}
          >
            <CoverArtImage src={currentTrack?.cover_art_data_url} size={40} borderRadius="8px" padding={0.5} />
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }} noWrap>
                {currentTrack?.title}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                {currentTrack?.artist}
              </Typography>
            </Box>
            <IconButton size="small" onClick={onTogglePlayback} sx={{ width: 28, height: 28 }}>
              {isPlaying ? <PauseRoundedIcon sx={{ fontSize: 18 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />}
            </IconButton>
            <IconButton size="small" onClick={onNext} sx={{ width: 28, height: 28 }}>
              <SkipNextRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={async () => {
                if (currentTrack) {
                  try {
                    await downloadAndEmbedLyrics(
                      currentTrack.id,
                      currentTrack.artist,
                      currentTrack.title,
                      currentTrack.file_path,
                      currentTrack.album,
                      currentTrack.duration
                    );
                    if (onRefreshLyrics) await onRefreshLyrics();
                  } catch (err) {
                    console.error('Failed to download lyrics:', err);
                  }
                }
              }}
              sx={{ color: vinyl.adwBlue, width: 28, height: 28 }}
            >
              <CloudDownloadRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              px: 'var(--space-3)',
              pb: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {lyrics && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, i) => (
                <Typography
                  key={line.timestamp_ms}
                  ref={(el) => {
                    lyricRefs.current.set(line.timestamp_ms, el);
                  }}
                  onClick={() => onSeek(line.timestamp_ms)}
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.9,
                    textAlign: 'center',
                    cursor: 'pointer',
                    py: '6px',
                    width: '100%',
                    borderRadius: 'var(--radius-md)',
                    color: activeLyricIndex === i ? 'var(--accent-default, #FA2D48)' : 'text.primary',
                    opacity: activeLyricIndex === i ? 1 : 0.55,
                    transition: 'all 280ms ease',
                    '&:hover': {
                      opacity: 1,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    },
                  }}
                >
                  {line.text || '...'}
                </Typography>
              ))
            ) : (
              <Typography
                sx={{
                  mt: 10,
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  fontSize: 13,
                }}
              >
                No lyrics found.
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
