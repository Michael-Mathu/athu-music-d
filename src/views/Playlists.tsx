import { Box, Typography, Button, IconButton, InputBase } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Playlist, PlaylistTrack, Track } from '../types/library';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { EmptyState } from '../components/EmptyState';
import { PlaylistCover } from '../components/PlaylistCover';
import { SmartPlaylistDialog } from './SmartPlaylistDialog';
import { useState } from 'react';

interface PlaylistsProps {
  playlists: Playlist[];
  playlistTracks: Record<number, PlaylistTrack[]>;
  tracks: Track[];
  currentTrack: Track | null;
  onAddCurrentTrack: (playlistId: number) => void;
  onAddToPlaylist: (playlistId: number, trackId: number) => void;
  onRemoveTrack: (playlistId: number, trackId: number) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (playlistId: number) => void;
}

export const Playlists = ({
  playlists,
  playlistTracks,
  tracks,
  currentTrack,
  onAddCurrentTrack,
  onAddToPlaylist,
  onRemoveTrack,
  onCreatePlaylist,
  onDeletePlaylist,
}: PlaylistsProps) => {
  const theme = useTheme();
  const vinyl = theme.vinyl;
  const isDark = theme.palette.mode === 'dark';
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showSmartDialog, setShowSmartDialog] = useState(false);
  const [dragOverPlaylistId, setDragOverPlaylistId] = useState<number | null>(null);

  const getPlaylistCovers = (playlistId: number) => {
    const plTracks = playlistTracks[playlistId] || [];
    return plTracks.map((pt) => {
      const track = tracks.find((t) => t.id === pt.track_id);
      return track?.cover_art_data_url;
    });
  };

  return (
    <Box sx={{ width: '100%', pb: 10 }}>
      {/* Create Playlist Card */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box 
          sx={{ 
            bgcolor: isDark ? '#2A2A2A' : '#FFFFFF', 
            borderRadius: '10px', 
            p: '16px',
            border: isDark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.1)',
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPlaylistName.trim()) {
                  onCreatePlaylist(newPlaylistName.trim());
                  setNewPlaylistName('');
                }
              }}
              sx={{
                flexGrow: 1,
                bgcolor: isDark ? '#1E1E1E' : '#F5F5F5',
                color: 'text.primary',
                borderRadius: '8px',
                px: 2,
                py: 1,
                fontSize: 14,
                border: '0.5px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
              }}
            />
            <Button
              variant="contained"
              disabled={!newPlaylistName.trim()}
              onClick={() => {
                onCreatePlaylist(newPlaylistName.trim());
                setNewPlaylistName('');
              }}
              sx={{
                bgcolor: `var(--adw-accent, ${theme.palette.primary.main})`,
                color: '#FFFFFF',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: 13,
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  bgcolor: `var(--adw-accent, ${theme.palette.primary.main})`,
                  opacity: 0.9
                }
              }}
            >
              CREATE
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              onClick={() => setShowSmartDialog(true)}
              startIcon={<AutoAwesomeRoundedIcon />}
              sx={{
                flex: 1,
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                color: 'text.secondary',
                borderRadius: '8px',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'none',
                border: '0.5px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              }}
            >
              Smart Playlist
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Empty state */}
      {playlists.length === 0 && (
        <EmptyState
          icon={<QueueMusicRoundedIcon sx={{ fontSize: 36 }} />}
          title="No playlists yet"
          description="Create your first playlist above to organize your music."
        />
      )}

      {/* Playlists List */}
      <Box sx={{ px: 2, display: 'flex', flexDirection: 'column' }}>
        {playlists.map((playlist) => (
          <Box key={playlist.id} sx={{ mb: 3 }}>
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                setDragOverPlaylistId(playlist.id);
              }}
              onDragLeave={() => {
                setDragOverPlaylistId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverPlaylistId(null);
                try {
                  const data = JSON.parse(e.dataTransfer.getData('application/json'));
                  if (data.type === 'track' && onAddToPlaylist) {
                    onAddToPlaylist(playlist.id, data.id);
                  }
                } catch {
                  // ignore invalid drop data
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                borderRadius: `${vinyl.radius.row}px`,
                bgcolor: dragOverPlaylistId === playlist.id
                  ? `color-mix(in srgb, var(--adw-accent, ${theme.palette.primary.main}) 12%, transparent)`
                  : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                height: 64,
                gap: 2,
                px: 2,
                mb: 1,
                transition: 'background-color 200ms',
                border: dragOverPlaylistId === playlist.id
                  ? `1px solid var(--adw-accent, ${theme.palette.primary.main})`
                  : '1px solid transparent',
              }}
            >
              <PlaylistCover images={getPlaylistCovers(playlist.id)} size={48} borderRadius={8} />
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{playlist.name}</Typography>
                <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary }}>
                  {playlist.track_count} {playlist.track_count === 1 ? 'Track' : 'Tracks'}
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
                  borderColor: `var(--adw-accent, ${theme.palette.primary.main})`,
                  color: `var(--adw-accent, ${theme.palette.primary.main})`,
                  '&:hover': {
                    borderColor: `var(--adw-accent, ${theme.palette.primary.main})`,
                    bgcolor: `color-mix(in srgb, var(--adw-accent, ${theme.palette.primary.main}) 10%, transparent)`,
                  }
                }}
              >
                Add Current
              </Button>

              <IconButton
                size="small"
                aria-label={`Delete playlist ${playlist.name}`}
                onClick={() => onDeletePlaylist(playlist.id)}
                sx={{
                  color: 'text.secondary',
                  opacity: 0.5,
                  '&:hover': { opacity: 1, color: '#E05C5C' },
                  transition: 'opacity 200ms, color 200ms',
                }}
              >
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
                    borderBottom: `0.5px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`,
                    '&:hover .del-track': { opacity: 1 },
                  }}
                >
                  <Typography sx={{ fontSize: 13, flexGrow: 1, color: 'text.primary' }} noWrap>
                    {track.title}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', mr: 1 }} noWrap>
                    {track.artist}
                  </Typography>
                  <IconButton 
                    className="del-track"
                    size="small" 
                    aria-label={`Remove ${track.title} from playlist`}
                    onClick={() => onRemoveTrack(playlist.id, track.track_id)}
                    sx={{ opacity: 0, color: 'text.secondary', transition: 'opacity 200ms' }}
                  >
                    <DeleteRoundedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <SmartPlaylistDialog
        open={showSmartDialog}
        onClose={() => setShowSmartDialog(false)}
        onCreate={(name) => {
          onCreatePlaylist(name);
        }}
      />
    </Box>
  );
};
