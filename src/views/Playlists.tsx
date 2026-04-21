import { Box, Typography, Button, IconButton, InputBase } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Playlist, PlaylistTrack, Track } from '../types/library';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useState } from 'react';

interface PlaylistsProps {
  playlists: Playlist[];
  playlistTracks: Record<number, PlaylistTrack[]>;
  currentTrack: Track | null;
  onAddCurrentTrack: (playlistId: number) => void;
  onRemoveTrack: (playlistId: number, trackId: number) => void;
  onCreatePlaylist: (name: string) => void;
}

export const Playlists = ({
  playlists,
  playlistTracks,
  currentTrack,
  onAddCurrentTrack,
  onRemoveTrack,
  onCreatePlaylist,
}: PlaylistsProps) => {
  const theme = useTheme();
  const vinyl = theme.vinyl;
  const [newPlaylistName, setNewPlaylistName] = useState('');

  return (
    <Box sx={{ width: '100%', pb: 10 }}>
      {/* Create Playlist Card */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box 
          sx={{ 
            bgcolor: '#2A2A2A', 
            borderRadius: '10px', 
            p: '16px',
            border: '0.5px solid rgba(255,255,255,0.08)'
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5 }}>
            Create New Playlist
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <InputBase
              placeholder="Playlist name (e.g. Summer Vibes)"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              sx={{
                flexGrow: 1,
                bgcolor: '#1E1E1E',
                color: '#FFFFFF',
                borderRadius: '8px',
                px: 2,
                py: 1,
                fontSize: 14,
                border: '0.5px solid rgba(255,255,255,0.08)',
              }}
            />
            <Button
              variant="contained"
              disabled={!newPlaylistName}
              onClick={() => {
                onCreatePlaylist(newPlaylistName);
                setNewPlaylistName('');
              }}
              sx={{
                bgcolor: 'var(--adw-accent, #3584E4)',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: 13,
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  bgcolor: 'var(--adw-accent, #3584E4)',
                  opacity: 0.9
                }
              }}
            >
              CREATE
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Playlists List */}
      <Box sx={{ px: 2, display: 'flex', flexDirection: 'column' }}>
        {playlists.map((playlist) => (
          <Box key={playlist.id} sx={{ mb: 3 }}>
             <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                borderRadius: `${vinyl.radius.row}px`,
                bgcolor: 'rgba(255,255,255,0.02)',
                height: 64,
                gap: 2,
                px: 2,
                mb: 1
              }}
            >
              <Box sx={{ 
                width: 44, 
                height: 44, 
                bgcolor: 'color-mix(in srgb, var(--adw-accent, #3584E4) 10%, transparent)',
                color: 'var(--adw-accent, #3584E4)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QueueMusicRoundedIcon />
              </Box>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{playlist.name}</Typography>
                <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary }}>
                  {playlist.track_count} Tracks
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                disabled={!currentTrack}
                onClick={() => onAddCurrentTrack(playlist.id)}
                sx={{
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontSize: 11,
                  fontWeight: 700,
                  borderColor: 'var(--adw-accent, #3584E4)',
                  color: 'var(--adw-accent, #3584E4)',
                  '&:hover': {
                    borderColor: 'var(--adw-accent, #3584E4)',
                    bgcolor: 'color-mix(in srgb, var(--adw-accent, #3584E4) 10%, transparent)'
                  }
                }}
              >
                Add Current Track
              </Button>

              <IconButton size="small" sx={{ color: 'text.secondary', opacity: 0.5, '&:hover': { opacity: 1, color: '#E05C5C' } }}>
                <DeleteRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Playlist Tracks Snippet */}
            <Box sx={{ pl: 8, pr: 2 }}>
              {(playlistTracks[playlist.id] || []).map(track => (
                <Box 
                  key={track.track_id}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    py: 0.5, 
                    borderBottom: '0.5px solid rgba(255,255,255,0.03)',
                    '&:hover .del-track': { opacity: 1 }
                  }}
                >
                  <Typography sx={{ fontSize: 13, flexGrow: 1 }} noWrap>{track.title}</Typography>
                  <IconButton 
                    className="del-track"
                    size="small" 
                    onClick={() => onRemoveTrack(playlist.id, track.track_id)}
                    sx={{ opacity: 0, color: 'text.secondary' }}
                  >
                    <DeleteRoundedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
