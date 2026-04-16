import { Box, IconButton, Typography, Button, List, ListItemButton, ListItemText } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AlbumIcon from '@mui/icons-material/Album';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Album, Track } from '../types/library';

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
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflowY: 'auto', p: 4 }}>
      {/* Blurred background map */}
      {album.cover_art_data_url && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '400px',
            backgroundImage: `url(${album.cover_art_data_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px)',
            opacity: 0.3,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 6, alignItems: 'flex-end' }}>
          <Box
            sx={{
              width: 260,
              height: 260,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}
          >
            {album.cover_art_data_url ? (
               <img src={album.cover_art_data_url} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
               <AlbumIcon sx={{ fontSize: 100, color: 'rgba(255,255,255,0.2)' }} />
            )}
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2 }}>ALBUM</Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {album.title}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {album.artist} {album.year ? `• ${album.year}` : ''} • {album.track_count} songs
            </Typography>
            <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                sx={{ mt: 3, borderRadius: 8, px: 4, py: 1 }}
                onClick={() => { if(albumTracks.length > 0) onPlayTrack(albumTracks[0]) }}
            >
                Play Album
            </Button>
          </Box>
        </Box>

        <List sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, p: 1 }}>
          {albumTracks.map((track, i) => (
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
              <Typography variant="body2" color="text.secondary" sx={{ width: 40, textAlign: 'center', fontWeight: 'bold' }}>
                {i + 1}
              </Typography>
              <ListItemText
                primary={<Typography variant="body1" sx={{ fontWeight: currentTrackId === track.id ? 700 : 500 }}>{track.title}</Typography>}
                secondary={track.artist}
                sx={{ ml: 2 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                {formatDuration(track.duration)}
              </Typography>
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );
};
