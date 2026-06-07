import { Box, Typography, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Track } from '../types/library';

interface QueueProps {
  tracks: Track[];
  currentTrackId?: number;
  onPlayTrack: (id: number) => void;
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const Queue = ({ tracks, currentTrackId, onPlayTrack }: QueueProps) => {
  const theme = useTheme();
  const vinyl = theme.vinyl;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 4, pt: 3, pb: 1, flexShrink: 0 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 11 }}>
          Up Next • {tracks.length}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {tracks.length === 0 ? (
          <Box sx={{ px: 4, py: 6, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              Queue is empty. Play a track to start.
            </Typography>
          </Box>
        ) : (
          tracks.map((track) => {
            const isActive = track.id === currentTrackId;

            return (
              <Box
                key={track.id}
                onClick={() => onPlayTrack(track.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 52,
                  px: 2,
                  backgroundColor: isActive ? vinyl.trackActive : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 150ms',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? vinyl.trackActive 
                      : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <Avatar
                  variant="rounded"
                  src={track.cover_art_data_url || undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: `${vinyl.radius.row}px`,
                    mr: 1,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      color: isActive ? `var(--adw-accent, ${theme.palette.primary.main})` : theme.palette.text.primary,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {track.title}
                  </Typography>
                  <Typography variant="subtitle1" noWrap sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {track.artist}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ ml: 2, minWidth: 35, textAlign: 'right', color: 'text.secondary' }}>
                  {formatDuration(track.duration)}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

