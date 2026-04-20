import { Box, Card, CardContent, CardMedia, CircularProgress, Typography, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Album } from '../types/library';
import { useAppTheme } from '../lib/ThemeContext';

interface AlbumsProps {
  albums: Album[];
  loading: boolean;
}

export const Albums = ({ albums, loading }: AlbumsProps) => {
  const navigate = useNavigate();
  const { primaryColor } = useAppTheme();

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, letterSpacing: -1.5 }}>
        Albums
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!loading && albums.length === 0 ? (
        <Typography color="text.secondary" variant="body1">
          No albums yet. Scan your music folder from the Tracks page first.
        </Typography>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
            lg: 'repeat(6, minmax(0, 1fr))',
          },
        }}
      >
        {albums.map((album) => (
          <Box key={album.id} onClick={() => navigate(`/albums/${album.id}`)}>
            <Card sx={{ 
              bgcolor: 'background.paper', 
              borderRadius: 6, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              '&:hover': {
                bgcolor: alpha(primaryColor, 0.05),
                transform: 'translateY(-12px)',
                boxShadow: `0 24px 48px ${alpha(primaryColor, 0.15)}`,
                borderColor: alpha(primaryColor, 0.3),
              }
            }}>
              <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  image={album.cover_art_data_url ?? undefined}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'action.hover',
                    objectFit: 'cover',
                    transition: 'transform 0.6s ease',
                    '.MuiCard-root:hover &': {
                      transform: 'scale(1.1)'
                    }
                  }}
                />
              </Box>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, mb: 0.2 }}>{album.title}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 600, opacity: 0.7 }}>{album.artist}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, px: 1, py: 0.3, borderRadius: 1, bgcolor: 'action.hover', color: 'text.secondary' }}>
                    {album.track_count} TRK
                  </Typography>
                  {album.year && (
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled' }}>
                      {album.year}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
