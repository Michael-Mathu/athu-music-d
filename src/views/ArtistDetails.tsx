import { Avatar, Box, Button, CircularProgress, IconButton, List, ListItemAvatar, ListItemButton, ListItemText, Paper, Typography, alpha } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchArtistBio } from '../lib/tauri';
import type { Artist, ArtistBioPayload, Track } from '../types/library';
import { useArtistImage } from '../lib/metadata';
import { useAppTheme } from '../lib/ThemeContext';

interface ArtistDetailsProps {
  artists: Artist[];
  tracks: Track[];
  currentTrackId: number | null;
  onPlayTrack: (track: Track) => void;
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const ArtistDetails = ({
  artists,
  tracks,
  currentTrackId,
  onPlayTrack,
}: ArtistDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { primaryColor } = useAppTheme();
  const artistId = id ? parseInt(id, 10) : null;
  
  const [bio, setBio] = useState<ArtistBioPayload | null>(null);
  const [loadingBio, setLoadingBio] = useState(false);

  const artist = useMemo(() => artists.find(a => a.id === artistId), [artists, artistId]);
  const artistTracks = useMemo(() => tracks.filter(t => t.artist_id === artistId), [tracks, artistId]);
  
  const { imageUrl, loading: loadingImage } = useArtistImage(artist?.name ?? '');

  useEffect(() => {
    let cancelled = false;
    const loadBio = async () => {
      if (!artistId) return;
      setLoadingBio(true);
      try {
        const result = await fetchArtistBio(artistId);
        if (!cancelled) setBio(result);
      } catch (err) {
        if (!cancelled) setBio(null);
      } finally {
        if (!cancelled) setLoadingBio(false);
      }
    };
    void loadBio();
    return () => {
      cancelled = true;
    };
  }, [artistId]);

  if (!artist) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Artist not found.</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go back</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflowY: 'auto', p: { xs: 2, md: 4 } }}>
      <IconButton 
        onClick={() => navigate(-1)} 
        sx={{ mb: 3, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, mb: 6, alignItems: { xs: 'center', md: 'flex-start' } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: { md: 300 } }}>
          <Box
            sx={{
              width: 260,
              height: 260,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              overflow: 'hidden',
              boxShadow: `0 20px 60px ${alpha(primaryColor, 0.2)}`,
              position: 'relative'
            }}
          >
            {imageUrl ? (
              <Box
                component="img"
                src={imageUrl}
                alt={artist.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <PersonIcon sx={{ fontSize: 140, color: 'text.secondary', opacity: 0.1 }} />
            )}
            {loadingImage && (
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.3)' }}>
                <CircularProgress color="inherit" />
              </Box>
            )}
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, textAlign: 'center', mb: 1, letterSpacing: -1.5 }}>
            {artist.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.7 }}>
            {artist.album_count} Albums • {artist.track_count} Tracks
          </Typography>
        </Box>

        <Box sx={{ flex: 1, width: '100%' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, letterSpacing: -0.5 }}>About</Typography>
          {loadingBio ? (
            <CircularProgress size={32} />
          ) : bio ? (
            <Paper variant="outlined" sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'text.primary', opacity: 0.9 }}>
                {bio.biography}
              </Typography>
              {bio.source_url && (
                <Button 
                  variant="outlined" 
                  href={bio.source_url} 
                  target="_blank" 
                  sx={{ mt: 3, borderRadius: 28, textTransform: 'none' }}
                >
                  Read more on Wikipedia
                </Button>
              )}
            </Paper>
          ) : (
            <Typography color="text.secondary">No biography available.</Typography>
          )}
        </Box>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: -0.5 }}>Discography</Typography>
      
      {artistTracks.length > 0 ? (
        <List sx={{ bgcolor: 'transparent', p: 0 }}>
          {artistTracks.map((track) => (
            <ListItemButton
              key={track.id}
              onClick={() => void onPlayTrack(track)}
              sx={{
                borderRadius: 4,
                mb: 1,
                transition: '0.2s',
                bgcolor: currentTrackId === track.id ? alpha(primaryColor, 0.15) : 'transparent',
                '&:hover': { bgcolor: alpha(primaryColor, 0.05) }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  variant="rounded"
                  src={track.cover_art_data_url ?? undefined}
                  sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'background.paper' }}
                >
                  <MusicNoteIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant="body1" sx={{ fontWeight: 700, color: currentTrackId === track.id ? 'primary.main' : 'text.primary' }}>{track.title}</Typography>}
                secondary={track.album}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {formatDuration(track.duration)}
              </Typography>
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary">No tracks found.</Typography>
      )}
    </Box>
  );
};
