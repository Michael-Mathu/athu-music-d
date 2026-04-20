import { Box, CircularProgress, Typography, alpha } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import type { Artist } from '../types/library';
import { useArtistImage } from '../lib/metadata';

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard = ({ artist }: ArtistCardProps) => {
  const navigate = useNavigate();
  const { imageUrl, loading } = useArtistImage(artist.name);

  return (
    <Box
      onClick={() => navigate(`/artists/${artist.id}`)}
      sx={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        p: 2,
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: 'transparent',
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
          transform: 'translateY(-8px)',
          '& .artist-image-container': {
            boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.primary.main, 0.25)}`,
          }
        }
      }}
    >
      <Box
        className="artist-image-container"
        sx={{
          width: '100%',
          maxWidth: 160,
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={artist.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: 'fadeIn 0.5s ease'
            }}
          />
        ) : (
          <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.2 }} />
        )}
        
        {loading && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.2)' }}>
            <CircularProgress size={24} color="inherit" />
          </Box>
        )}
      </Box>

      <Typography variant="subtitle1" noWrap sx={{ width: '100%', fontWeight: 700, textAlign: 'center' }}>
        {artist.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5, fontWeight: 500, opacity: 0.7 }}>
        {artist.album_count} albums • {artist.track_count} tracks
      </Typography>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

interface ArtistsProps {
  artists: Artist[];
  loading: boolean;
}

export const Artists = ({ artists, loading }: ArtistsProps) => {
  return (
    <>
      <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, letterSpacing: -1 }}>
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
          gap: 2,
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
            lg: 'repeat(6, minmax(0, 1fr))',
          },
        }}
      >
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </Box>
    </>
  );
};
