import { Box, Card, CardContent, CardMedia, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Album } from '../types/library';

interface AlbumsProps {
  albums: Album[];
  loading: boolean;
}

export const Albums = ({ albums, loading }: AlbumsProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Albums
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!loading && albums.length === 0 ? (
        <Typography color="text.secondary">
          No albums yet. Scan your music folder from the Tracks page first.
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
        {albums.map((album) => (
          <Box key={album.id} onClick={() => navigate(`/albums/${album.id}`)}>
            <Card sx={{ 
              bgcolor: 'rgba(255,255,255,0.02)', 
              borderRadius: 3, 
              boxShadow: 'none',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.06)',
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }
            }}>
              <Box sx={{ position: 'relative', pt: '100%' }}>
                <CardMedia
                  component="img"
                  image={album.cover_art_data_url ?? undefined}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>{album.title}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>{album.artist}</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                  {album.track_count} tracks{album.year ? ` • ${album.year}` : ''}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </>
  );
};
