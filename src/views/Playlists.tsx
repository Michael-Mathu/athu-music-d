import { Box, Button, Card, CardContent, Divider, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Playlist, PlaylistTrack, Track } from '../types/library';

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
  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Playlists
      </Typography>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(255,255,255,0.03)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="New playlist"
            placeholder="Roadtrip Mix"
            value={newPlaylistName}
            onChange={(event) => onNewPlaylistNameChange(event.target.value)}
          />
          <Button variant="contained" onClick={onCreatePlaylist}>Create</Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {playlists.map((playlist) => (
          <Box key={playlist.id}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <QueueMusicIcon />
                </Box>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, flex: 1 }}>
                  <Typography variant="h6">{playlist.name}</Typography>
                  <Typography color="text.secondary" variant="body2">{playlist.track_count} tracks</Typography>
                </CardContent>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!currentTrack}
                  onClick={() => onAddCurrentTrack(playlist.id)}
                >
                  Add Current
                </Button>
              </Box>

              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
              <Box sx={{ maxHeight: 180, overflowY: 'auto' }}>
                {(playlistTracks[playlist.id] ?? []).length === 0 ? (
                  <Typography color="text.secondary" variant="body2">No tracks yet.</Typography>
                ) : (playlistTracks[playlist.id] ?? []).map((track) => (
                  <Box key={`${playlist.id}-${track.track_id}`} sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{track.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{track.artist} • {track.album}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mx: 1 }}>
                      {formatDuration(track.duration)}
                    </Typography>
                    <IconButton size="small" onClick={() => onRemoveTrack(playlist.id, track.track_id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
        ))}
      </Box>
    </>
  );
};
