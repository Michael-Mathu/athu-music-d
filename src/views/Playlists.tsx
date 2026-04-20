import { Box, Button, Card, CardContent, Divider, IconButton, Paper, Stack, TextField, Typography, alpha } from '@mui/material';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Playlist, PlaylistTrack, Track } from '../types/library';
import { useAppTheme } from '../lib/ThemeContext';

interface PlaylistsProps {
  playlists: Playlist[];
  playlistTracks: Record<number, PlaylistTrack[]>;
  currentTrack: Track | null;
  newPlaylistName: string;
  onNewPlaylistNameChange: (value: string) => void;
  onCreatePlaylist: () => void;
  onAddCurrentTrack: (playlistId: number) => void;
  onRemoveTrack: (playlistId: number, trackId: number) => void;
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const Playlists = ({
  playlists,
  playlistTracks,
  currentTrack,
  newPlaylistName,
  onNewPlaylistNameChange,
  onCreatePlaylist,
  onAddCurrentTrack,
  onRemoveTrack,
}: PlaylistsProps) => {
  const { primaryColor } = useAppTheme();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, letterSpacing: -1.5 }}>
        Playlists
      </Typography>

      <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 6, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AddIcon color="primary" /> Create New Playlist
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Playlist name (e.g. Summer Vibes)"
            value={newPlaylistName}
            onChange={(event) => onNewPlaylistNameChange(event.target.value)}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'action.hover' }
            }}
          />
          <Button 
            variant="contained" 
            onClick={onCreatePlaylist}
            disabled={!newPlaylistName}
            sx={{ px: 4, height: 56, boxShadow: `0 8px 20px ${alpha(primaryColor, 0.3)}` }}
          >
            Create
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {playlists.map((playlist) => (
          <Box key={playlist.id}>
            <Card variant="outlined" sx={{ 
              bgcolor: 'background.paper', 
              borderRadius: 6, 
              p: 3,
              transition: '0.3s',
              '&:hover': {
                borderColor: alpha(primaryColor, 0.4),
                boxShadow: `0 12px 32px ${alpha(primaryColor, 0.1)}`
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: alpha(primaryColor, 0.1), 
                  color: 'primary.main',
                  borderRadius: 4, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mr: 2.5 
                }}>
                  <QueueMusicIcon />
                </Box>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{playlist.name}</Typography>
                  <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 600, opacity: 0.7 }}>
                    {playlist.track_count} Tracks
                  </Typography>
                </CardContent>
              </Box>
              
              <Button
                variant={currentTrack ? "contained" : "outlined"}
                fullWidth
                size="small"
                disabled={!currentTrack}
                onClick={() => onAddCurrentTrack(playlist.id)}
                sx={{ borderRadius: 28, mb: 1, textTransform: 'none', fontWeight: 700 }}
              >
                Add Current Track
              </Button>

              <Divider sx={{ my: 2.5, opacity: 0.1 }} />
              
              <Box sx={{ maxHeight: 240, overflowY: 'auto', pr: 1 }}>
                {(playlistTracks[playlist.id] ?? []).length === 0 ? (
                  <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', py: 2, opacity: 0.5 }}>
                    Empty playlist.
                  </Typography>
                ) : (playlistTracks[playlist.id] ?? []).map((track) => (
                  <Box key={`${playlist.id}-${track.track_id}`} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    py: 1, 
                    px: 1.5,
                    mb: 0.5,
                    borderRadius: 3,
                    transition: '0.2s',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{track.title}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', opacity: 0.7 }}>{track.artist}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ mx: 1, fontVariantNumeric: 'tabular-nums', fontWeight: 600, opacity: 0.5 }}>
                      {formatDuration(track.duration)}
                    </Typography>
                    <IconButton size="small" onClick={() => onRemoveTrack(playlist.id, track.track_id)} sx={{ color: 'error.light', opacity: 0.3, '&:hover': { opacity: 1 } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
