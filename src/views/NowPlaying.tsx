import { Avatar, Box, IconButton, Typography } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LyricsPayload, Track } from '../types/library';

interface NowPlayingProps {
  currentTrack: Track | null;
  lyrics: LyricsPayload | null;
  playbackPosMs: number;
}

export const NowPlaying = ({
  currentTrack,
  lyrics,
  playbackPosMs,
}: NowPlayingProps) => {
  const lyricRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const navigate = useNavigate();

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
    if (activeLyricIndex >= 0 && lyrics && lyrics.lines.length > 0) {
       const line = lyrics.lines[activeLyricIndex];
       const el = lyricRefs.current.get(line.timestamp_ms);
       el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeLyricIndex, lyrics]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 'calc(100vh - 90px)', display: 'flex', overflow: 'hidden', bgcolor: 'transparent' }}>
      
      {/* Back button */}
      <IconButton 
        onClick={() => navigate(-1)} 
        sx={{ 
          position: 'absolute', 
          top: 32, 
          left: 32, 
          zIndex: 10, 
          color: 'white', 
          bgcolor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      {/* Blurred background */}
      {currentTrack?.cover_art_data_url && (
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            left: -100,
            right: -100,
            bottom: -100,
            backgroundImage: `url(${currentTrack.cover_art_data_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px)',
            opacity: 0.4,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Content grid */}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flex: 1, width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 4, md: 8 }, gap: { xs: 4, md: 8 } }}>
        {/* Left column: Cover */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Avatar
            variant="rounded"
            src={currentTrack?.cover_art_data_url ?? undefined}
            sx={{ width: '100%', maxWidth: 500, height: 'auto', aspectRatio: '1 / 1', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)' }}
          >
            <MusicNoteIcon sx={{ fontSize: 160, opacity: 0.2 }} />
          </Avatar>
        </Box>

        {/* Right column: Lyrics */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: { xs: 0, md: 4 }, pb: { xs: 4, md: 4 }, overflowY: 'auto', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, mt: 4, textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>{currentTrack?.title ?? 'No track playing'}</Typography>
          <Typography variant="h5" sx={{ mb: 6, color: 'rgba(255,255,255,0.7)' }}>{currentTrack ? `${currentTrack.artist} • ${currentTrack.album}` : ''}</Typography>
          
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {lyrics && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, idx) => {
                const isActive = idx === activeLyricIndex;
                return (
                  <Typography
                    key={`${line.timestamp_ms}-${idx}`}
                    ref={(el: HTMLDivElement | null) => { lyricRefs.current.set(line.timestamp_ms, el); }}
                    variant={isActive ? "h4" : "h5"}
                    sx={{
                      mb: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? 'white' : 'rgba(255,255,255,0.2)',
                      textShadow: isActive ? '0 4px 16px rgba(0,0,0,0.6)' : 'none',
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                      transformOrigin: 'left',
                    }}
                  >
                    {line.text || '...'}
                  </Typography>
                );
              })
            ) : (
              <Typography sx={{ whiteSpace: 'pre-wrap', fontSize: '1.2rem', opacity: 0.5 }}>
                {lyrics?.plain_text ?? (currentTrack ? 'No synced lyrics available.' : '')}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
