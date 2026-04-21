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
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const Queue = ({ tracks, currentTrackId, onPlayTrack }: QueueProps) => {
  const theme = useTheme();
  const vinyl = theme.vinyl;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {tracks.map((track) => {
          const isActive = track.id === currentTrackId;

          return (
            <Box
              key={track.id}
              onClick={() => onPlayTrack(track.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: 52,
                px: 2, // 16px padding
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
                  mr: 1, // 8px gap
                  backgroundColor: 'transparent',
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                <Typography variant="body2" noWrap sx={{ color: theme.palette.text.primary }}>
                  {track.title}
                </Typography>
                <Typography variant="subtitle1" noWrap sx={{ fontSize: 12 }}>
                  {track.artist}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ ml: 2, minWidth: 35, textAlign: 'right' }}>
                {formatDuration(track.duration)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
