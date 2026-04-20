import { Box, IconButton, Typography, Button, List, ListItemButton, ListItemText, alpha } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AlbumIcon from '@mui/icons-material/Album';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Album, Track } from '../types/library';
import { useAppTheme } from '../lib/ThemeContext';

interface AlbumDetailsProps {
  albums: Album[];
  tracks: Track[];
  currentTrackId: number | null;
  onPlayTrack: (track: Track) => void;
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const AlbumDetails = ({
  albums,
  tracks,
  currentTrackId,
  onPlayTrack,
}: AlbumDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { primaryColor, mode } = useAppTheme();
  const albumId = id ? parseInt(id, 10) : null;
  
  const album = useMemo(() => albums.find(a => a.id === albumId), [albums, albumId]);
  const albumTracks = useMemo(() => tracks.filter(t => t.album_id === albumId), [tracks, albumId]);

  if (!album) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Album not found.</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go back</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflowY: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Immersive background decoration */}
      {album.cover_art_data_url && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '500px',
            backgroundImage: `url(${album.cover_art_data_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(80px)',
            opacity: mode === 'dark' ? 0.2 : 0.1,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 1200, mx: 'auto' }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ 
            mb: 4, 
            bgcolor: 'background.paper', 
            borderRadius: 3,
            '&:hover': { bgcolor: 'action.hover' } 
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, mb: 8, alignItems: { xs: 'center', md: 'flex-end' } }}>
          <Box
            sx={{
              width: { xs: 280, md: 320 },
              height: { xs: 280, md: 320 },
              borderRadius: 6,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 32px 64px ${alpha('#000', 0.4)}`,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {album.cover_art_data_url ? (
               <img src={album.cover_art_data_url} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
               <AlbumIcon sx={{ fontSize: 120, color: 'text.secondary', opacity: 0.1 }} />
            )}
          </Box>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 900, letterSpacing: 3, mb: 1, display: 'block' }}>ALBUM</Typography>
            <Typography variant="h1" sx={{ fontWeight: 900, mb: 1, letterSpacing: -2, fontSize: { xs: '2.5rem', md: '4rem' } }}>
              {album.title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, opacity: 0.8, color: 'text.primary', mb: 3 }}>
              {album.artist} {album.year ? `• ${album.year}` : ''} • {album.track_count} Songs
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Button 
                variant="contained" 
                startIcon={<PlayArrowIcon />}
                sx={{ 
                  borderRadius: 28, 
                  px: 5, 
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: `0 8px 24px ${alpha(primaryColor, 0.4)}`,
                }}
                onClick={() => { if(albumTracks.length > 0) onPlayTrack(albumTracks[0]) }}
              >
                  Play All
              </Button>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ bgcolor: 'background.paper', borderRadius: 8, p: 2, border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ p: 0 }}>
            {albumTracks.map((track, i) => (
              <ListItemButton
                key={track.id}
                onClick={() => void onPlayTrack(track)}
                sx={{
                  borderRadius: 6,
                  mb: 0.5,
                  py: 2,
                  px: 3,
                  transition: '0.2s',
                  bgcolor: currentTrackId === track.id ? alpha(primaryColor, 0.1) : 'transparent',
                  '&:hover': { bgcolor: alpha(primaryColor, 0.05) }
                }}
              >
                <Typography variant="body2" sx={{ width: 40, textAlign: 'left', fontWeight: 900, opacity: 0.3, fontVariantNumeric: 'tabular-nums' }}>
                  {(i + 1).toString().padStart(2, '0')}
                </Typography>
                <ListItemText
                  primary={<Typography variant="body1" sx={{ fontWeight: 800, color: currentTrackId === track.id ? 'primary.main' : 'text.primary' }}>{track.title}</Typography>}
                  secondary={<Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.6 }}>{track.artist}</Typography>}
                  sx={{ ml: 2 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2, fontWeight: 700, fontVariantNumeric: 'tabular-nums', opacity: 0.5 }}>
                  {formatDuration(track.duration)}
                </Typography>
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

import { Stack } from '@mui/material';
