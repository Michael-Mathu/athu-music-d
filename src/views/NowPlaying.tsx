import { Box, IconButton, Typography, Slider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, useRef, useEffect } from 'react';
import type { LyricsPayload, Track } from '../types/library';

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import CloudDownloadRoundedIcon from '@mui/icons-material/CloudDownloadRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import { downloadAndEmbedLyrics } from '../lib/tauri';
import { CoverArtImage } from '../components/CoverArtImage';
import { EmptyState } from '../components/EmptyState';
import { useTheme as useAppTheme } from '../lib/ThemeContext';

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
  onShowQueue?: () => void;
  onShowFullscreen?: () => void;
  compact?: boolean;
  onToggleCompact?: () => void;
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
  onShowQueue,
  onShowFullscreen,
  compact = false,
  onToggleCompact,
}: NowPlayingProps) => {
  const theme = useTheme();
  const vinyl = theme.vinyl;
  const isDark = theme.palette.mode === 'dark';
  const { dynamicColor } = useAppTheme();
  const accent = dynamicColor || vinyl.adwBlue;

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

  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          py: 2,
          px: 1,
          position: 'relative',
        }}
      >
        <CoverArtImage
          src={currentTrack?.cover_art_data_url}
          size={56}
          borderRadius="8px"
          shadow
        />
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            mt: 2,
            textAlign: 'center',
            width: '100%',
          }}
          noWrap
        >
          {currentTrack?.title || 'No track'}
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
            color: 'text.secondary',
            textAlign: 'center',
            width: '100%',
          }}
          noWrap
        >
          {currentTrack?.artist || 'Unknown'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <IconButton size="small" onClick={onPrevious} sx={{ color: 'text.primary' }}>
            <SkipPreviousRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton
            onClick={onTogglePlayback}
            sx={{
              bgcolor: 'primary.main',
              color: '#FFF',
              width: 36,
              height: 36,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            {isPlaying ? <PauseRoundedIcon sx={{ fontSize: 20 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />}
          </IconButton>
          <IconButton size="small" onClick={onNext} sx={{ color: 'text.primary' }}>
            <SkipNextRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        {onToggleCompact && (
          <IconButton
            size="small"
            onClick={onToggleCompact}
            sx={{ color: 'text.secondary', mt: 'auto' }}
            aria-label="Expand player"
          >
            <CropSquareRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        pt: 3,
        px: 3,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 400,
          height: 400,
          background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)`,
          filter: 'blur(60px)',
          opacity: isPlaying ? 0.8 : 0.3,
          transition: 'opacity 1000ms ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          position: 'relative',
          zIndex: 1,
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.25,
            p: 0.5,
            borderRadius: 3,
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            minWidth: 0,
          }}
        >
          <Box
            onClick={() => setActiveTab('player')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 2.5,
              cursor: 'pointer',
              bgcolor: activeTab === 'player' ? accent : 'transparent',
              color: activeTab === 'player' ? '#FFF' : 'text.secondary',
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              '&:hover': { bgcolor: activeTab === 'player' ? accent : 'rgba(255,255,255,0.05)' },
            }}
          >
            <MusicNoteRoundedIcon sx={{ fontSize: 13 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1 }}>Player</Typography>
          </Box>
          <Box
            onClick={() => setActiveTab('lyrics')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 2.5,
              cursor: 'pointer',
              bgcolor: activeTab === 'lyrics' ? accent : 'transparent',
              color: activeTab === 'lyrics' ? '#FFF' : 'text.secondary',
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              '&:hover': { bgcolor: activeTab === 'lyrics' ? accent : 'rgba(255,255,255,0.05)' },
            }}
          >
            <TextFieldsRoundedIcon sx={{ fontSize: 13 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1 }}>Lyrics</Typography>
          </Box>
        </Box>
        {onShowFullscreen && (
          <IconButton
            size="small"
            onClick={onShowFullscreen}
            aria-label="Fullscreen"
            sx={{ color: 'text.secondary', ml: 0.5 }}
          >
            <CropSquareRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
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
            size={240}
            borderRadius="16px"
            shadow
          />

          <Box sx={{ textAlign: 'center', width: '100%', mt: 4, mb: 4 }}>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '-0.025em',
                mb: 0.5,
                lineHeight: 1.3,
              }}
              noWrap
            >
              {currentTrack?.title || 'No track'}
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 0.25, lineHeight: 1.4 }} noWrap>
              {currentTrack?.artist || 'Unknown Artist'}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', opacity: 0.7, lineHeight: 1.3 }} noWrap>
              {currentTrack?.album || 'Unknown Album'}
            </Typography>
          </Box>

          <Box sx={{ width: '100%', mb: 4 }}>
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
                color: accent,
                height: 4,
                padding: '8px 0',
                '& .MuiSlider-thumb': {
                  width: 14,
                  height: 14,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  transition: 'transform 150ms ease',
                  '&:hover, &.Mui-focusVisible': {
                    transform: 'scale(1.25)',
                  },
                },
                '& .MuiSlider-track': { border: 'none' },
                '& .MuiSlider-rail': {
                  opacity: 0.2,
                  backgroundColor: theme.palette.text.primary,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500 }}>
                {formatDuration(isSeeking ? localSeekPos : clampedPos)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 500 }}>
                {formatDuration(durationMs)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, mb: 4 }}>
            <IconButton
              onClick={onPrevious}
              aria-label="Previous track"
              sx={{
                color: 'text.primary',
                width: 48,
                height: 48,
                '&:hover': { opacity: 0.8 },
                transition: 'transform 0.1s',
                '&:active': { transform: 'scale(0.9)' },
              }}
            >
              <SkipPreviousRoundedIcon sx={{ fontSize: 40 }} />
            </IconButton>
            <IconButton
              onClick={onTogglePlayback}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              sx={{
                color: 'text.primary',
                width: 64,
                height: 64,
                '&:hover': { opacity: 0.8 },
                transition: 'transform 0.1s',
                '&:active': { transform: 'scale(0.9)' },
              }}
            >
              {isPlaying ? <PauseRoundedIcon sx={{ fontSize: 56 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 56 }} />}
            </IconButton>
            <IconButton
              onClick={onNext}
              aria-label="Next track"
              sx={{
                color: 'text.primary',
                width: 48,
                height: 48,
                '&:hover': { opacity: 0.8 },
                transition: 'transform 0.1s',
                '&:active': { transform: 'scale(0.9)' },
              }}
            >
              <SkipNextRoundedIcon sx={{ fontSize: 40 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 3, gap: 2, mb: 4 }}>
            <VolumeDownRoundedIcon sx={{ fontSize: 22, color: 'text.secondary' }} />
            <Slider
              size="small"
              value={volume}
              min={0}
              max={1}
              step={0.01}
              aria-label="Volume"
              onChange={(_, val) => onVolumeChange(val as number)}
              sx={{
                color: 'text.primary',
                height: 6,
                padding: '12px 0',
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '&:hover, &.Mui-focusVisible': {
                    opacity: 1,
                    boxShadow: '0 0 0 8px rgba(255,255,255,0.1)',
                  },
                },
                '&:hover .MuiSlider-thumb': { opacity: 1 },
                '& .MuiSlider-track': { border: 'none' },
                '& .MuiSlider-rail': { opacity: 0.2 },
              }}
            />
            <VolumeUpRoundedIcon sx={{ fontSize: 22, color: 'text.secondary' }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', px: 4 }}>
            <IconButton
              onClick={() => setActiveTab('lyrics')}
              sx={{ color: 'text.secondary' }}
            >
              <ChatBubbleRoundedIcon sx={{ fontSize: 22 }} />
            </IconButton>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                borderRadius: '24px',
                p: 0.5,
              }}
            >
              <IconButton
                size="small"
                onClick={onToggleShuffle}
                sx={{
                  color: shuffleEnabled ? accent : 'text.primary',
                  width: 36,
                  height: 36,
                  bgcolor: shuffleEnabled ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') : 'transparent',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
                }}
              >
                <ShuffleRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
              
              <Box sx={{ width: 1, height: 18, bgcolor: 'divider', mx: 0.5 }} />

              <IconButton
                size="small"
                onClick={onCycleRepeatMode}
                sx={{
                  color: repeatMode !== 'off' ? accent : 'text.primary',
                  width: 36,
                  height: 36,
                  bgcolor: repeatMode !== 'off' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') : 'transparent',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
                }}
              >
                {repeatMode === 'one' ? <RepeatOneRoundedIcon sx={{ fontSize: 20 }} /> : <RepeatRoundedIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Box>

            <IconButton onClick={onShowQueue} sx={{ color: 'text.secondary' }}>
              <FormatListBulletedRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 2,
              mb: 2,
            }}
          >
            <CoverArtImage src={currentTrack?.cover_art_data_url} size={44} borderRadius="10px" padding={0.5} />
            <Box sx={{ flexGrow: 1, overflow: 'hidden', minWidth: 0 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }} noWrap>
                {currentTrack?.title}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                {currentTrack?.artist}
              </Typography>
            </Box>
            <IconButton size="small" onClick={onTogglePlayback} sx={{ width: 32, height: 32 }}>
              {isPlaying ? <PauseRoundedIcon sx={{ fontSize: 18 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />}
            </IconButton>
            <IconButton size="small" onClick={onNext} sx={{ width: 32, height: 32 }}>
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
              sx={{ color: accent, width: 32, height: 32 }}
            >
              <CloudDownloadRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              px: 4,
              pb: 5,
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
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: 1.9,
                    textAlign: 'center',
                    cursor: 'pointer',
                    py: 0.75,
                    width: '100%',
                    borderRadius: 1,
                    color: activeLyricIndex === i ? accent : 'text.primary',
                    opacity: activeLyricIndex === i ? 1 : 0.45,
                    transition: 'all 280ms ease',
                    '&:hover': {
                      opacity: 1,
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    },
                  }}
                >
                  {line.text || '...'}
                </Typography>
              ))
            ) : (
              <EmptyState
                icon={<TextFieldsRoundedIcon sx={{ fontSize: 36 }} />}
                title="No lyrics found"
                description="Lyrics for this track are not available. Try downloading synced lyrics from the toolbar above."
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
