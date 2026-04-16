import { Avatar, Box, Button, CircularProgress, IconButton, List, ListItemAvatar, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchArtistBio } from '../lib/tauri';
import type { Artist, ArtistBioPayload, Track } from '../types/library';

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
  const artistId = id ? parseInt(id, 10) : null;
  
  const [bio, setBio] = useState<ArtistBioPayload | null>(null);
  const [loadingBio, setLoadingBio] = useState(false);

  const artist = useMemo(() => artists.find(a => a.id === artistId), [artists, artistId]);
  const artistTracks = useMemo(() => tracks.filter(t => t.artist_id === artistId), [tracks, artistId]);

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
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflowY: 'auto', p: 4 }}>
      {/* Back button */}
      <IconButton 
        onClick={() => navigate(-1)} 
        sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 240 }}>
          <Box
            sx={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            <PersonIcon sx={{ fontSize: 100, color: 'rgba(255,255,255,0.2)' }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
            {artist.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {artist.album_count} Albums • {artist.track_count} Tracks
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>About</Typography>
          {loadingBio ? (
            <CircularProgress />
          ) : bio ? (
            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, elevation: 0 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {bio.biography}
              </Typography>
              {bio.source_url && (
                <Button 
                  variant="text" 
                  href={bio.source_url} 
                  target="_blank" 
                  sx={{ mt: 2, textTransform: 'none' }}
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

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Discography</Typography>
      
      {artistTracks.length > 0 ? (
        <List sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, p: 1 }}>
          {artistTracks.map((track) => (
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
              <ListItemAvatar>
                <Avatar
                  variant="rounded"
                  src={track.cover_art_data_url ?? undefined}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                >
                  <MusicNoteIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant="body1" sx={{ fontWeight: 600 }}>{track.title}</Typography>}
                secondary={track.album}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
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
