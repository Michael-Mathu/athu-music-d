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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 3 }}>
      {/* Tab Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            bgcolor: 'transparent',
            borderRadius: 16,
          }}
        >
          <Box
            onClick={() => setActiveTab('player')}
            sx={{
              px: 2, py: 0.5,
              borderRadius: 16,
              cursor: 'pointer',
              bgcolor: activeTab === 'player' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent',
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>🎵 Player</Typography>
          </Box>
          <Box
            onClick={() => setActiveTab('lyrics')}
            sx={{
              px: 2, py: 0.5,
              borderRadius: 16,
              cursor: 'pointer',
              bgcolor: activeTab === 'lyrics' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent',
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>≡ Lyrics</Typography>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      {activeTab === 'player' ? (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
          {/* Album Art */}
          <CoverArtImage
            src={currentTrack?.cover_art_data_url}
            size={220}
            borderRadius={`${vinyl?.radius?.art ?? 12}px`}
          />

          {/* Metadata */}
          <Box sx={{ textAlign: 'center', mb: 4, width: '100%' }}>
            <Typography variant="body1" noWrap sx={{ mb: 1, fontWeight: 600 }}>{currentTrack?.title || 'No track'}</Typography>
            <Typography variant="subtitle1" noWrap sx={{ mb: 1, color: 'text.secondary' }}>{currentTrack?.artist || 'Unknown Artist'}</Typography>
            <Typography variant="subtitle2" noWrap sx={{ color: 'text.secondary', opacity: 0.8 }}>{currentTrack?.album || 'Unknown Album'}</Typography>
          </Box>

          {/* Progress */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Slider
              size="small"
              value={isSeeking ? localSeekPos : (durationMs ? clampedPos : 0)}
              min={0}
              max={durationMs || 0}
              onChange={handleSliderChange}
              onChangeCommitted={handleSliderChangeCommitted}
              valueLabelDisplay="auto"
              valueLabelFormat={(val) => formatDuration(val)}
              sx={{
                color: vinyl.adwBlue,
                height: 4,
                padding: '0',
                '& .MuiSlider-thumb': {
                  width: 14, height: 14,
                  backgroundColor: '#FFFFFF',
                  border: `1px solid rgba(0,0,0,0.1)`,
                },
                '& .MuiSlider-track': { border: 'none' },
                '& .MuiSlider-rail': { opacity: 0.2, backgroundColor: theme.palette.text.primary },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDuration(isSeeking ? localSeekPos : clampedPos)}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDuration(durationMs)}</Typography>
            </Box>
          </Box>

          {/* Transport Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <IconButton onClick={onPrevious} sx={{ color: theme.palette.text.primary }}>
              <SkipPreviousRoundedIcon sx={{ fontSize: 28 }} />
            </IconButton>
            <IconButton 
              onClick={onTogglePlayback}
              sx={{ 
                bgcolor: vinyl.adwBlue, 
                color: '#FFFFFF',
                width: 44, height: 44,
                '&:hover': { bgcolor: vinyl.adwBlue, opacity: 0.9 },
              }}
            >
              {isPlaying ? <PauseRoundedIcon sx={{ fontSize: 28 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 28 }} />}
            </IconButton>
            <IconButton onClick={onNext} sx={{ color: theme.palette.text.primary }}>
              <SkipNextRoundedIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>

          {/* Secondary Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton size="small" onClick={onToggleShuffle} sx={{ color: shuffleEnabled ? vinyl.adwBlue : theme.palette.text.secondary }}>
              <ShuffleRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>

            {/* Volume Control */}
            <Box sx={{ display: 'flex', alignItems: 'center', width: 140, gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)}
                sx={{ p: 0 }}
              >
                <VolumeUpRoundedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              </IconButton>
              <Slider
                size="small"
                value={volume}
                min={0}
                max={1}
                step={0.01}
                onChange={(_, val) => onVolumeChange(val as number)}
                sx={{
                  color: vinyl.adwBlue,
                  height: 4,
                  padding: '0',
                  '& .MuiSlider-thumb': {
                    width: 12, height: 12,
                    backgroundColor: '#FFFFFF',
                    border: `1px solid rgba(0,0,0,0.1)`,
                  },
                  '& .MuiSlider-track': { border: 'none' },
                  '& .MuiSlider-rail': { opacity: 0.2, backgroundColor: theme.palette.text.primary },
                }}
              />
            </Box>

            <IconButton size="small" onClick={onCycleRepeatMode} sx={{ color: repeatMode !== 'off' ? vinyl.adwBlue : theme.palette.text.secondary }}>
              {repeatMode === 'one' ? <RepeatOneRoundedIcon sx={{ fontSize: 20 }} /> : <RepeatRoundedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Mini Player */}
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 2, gap: 1 }}>
            <CoverArtImage
              src={currentTrack?.cover_art_data_url}
              size={40}
              borderRadius="6px"
              padding={0.5}
            />
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{currentTrack?.title}</Typography>
              <Typography variant="subtitle1" sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>{currentTrack?.artist}</Typography>
            </Box>
            <IconButton size="small" onClick={onTogglePlayback}>
              {isPlaying ? <PauseRoundedIcon sx={{ fontSize: 20 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
            <IconButton size="small" onClick={onNext}>
              <SkipNextRoundedIcon sx={{ fontSize: 20 }} />
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
                    console.error("Failed to download lyrics:", err);
                  }
                }
              }}
              sx={{ color: vinyl.adwBlue }}
            >
              <CloudDownloadRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>


          {/* Lyrics Scroll */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, pb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {lyrics && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, i) => (
                <Typography 
                  key={line.timestamp_ms} 
                  ref={el => { lyricRefs.current.set(line.timestamp_ms, el); }}
                  onClick={() => onSeek(line.timestamp_ms)}
                  sx={{ 
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: 1.8,
                    textAlign: 'center',
                    cursor: 'pointer',
                    py: 1,
                    width: '100%',
                    borderRadius: 2,
                    color: activeLyricIndex === i ? vinyl.adwBlue : 'text.primary',
                    opacity: activeLyricIndex === i ? 1 : 0.6,
                    transition: 'all 300ms',
                    '&:hover': {
                      opacity: 1,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    }
                  }}
                >
                  {line.text || '...'}
                </Typography>
              ))
            ) : (
              <Typography sx={{ mt: 10, color: theme.palette.text.secondary, fontStyle: 'italic' }}>No lyrics found.</Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
