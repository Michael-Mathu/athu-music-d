import { Box, CircularProgress, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import type { Artist } from '../types/library';

interface ArtistsProps {
  artists: Artist[];
  loading: boolean;
}

export const Artists = ({ artists, loading }: ArtistsProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Artists
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!loading && artists.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          No artists yet. Scan your music folder from the Tracks page first.
        </Typography>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
            lg: 'repeat(6, minmax(0, 1fr))',
          },
        }}
      >
        {artists.map((artist) => (
          <Box
            key={artist.id}
            onClick={() => navigate(`/artists/${artist.id}`)}
            sx={{
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              p: 3,
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.03)',
                transform: 'translateY(-4px)'
              }
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 160,
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                transition: 'box-shadow 0.2s ease',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                }
              }}
            >
              <PersonIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.2)' }} />
            </Box>
            <Typography variant="h6" noWrap sx={{ width: '100%', fontWeight: 700, textAlign: 'center' }}>
              {artist.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
              {artist.album_count} albums • {artist.track_count} tracks
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};
