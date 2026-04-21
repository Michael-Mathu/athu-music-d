import { Box, Typography, Avatar, IconButton, InputBase, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Track } from '../types/library';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useState } from 'react';

interface TracksProps {
  tracks: Track[];
  currentTrackId?: number;
  onPlayTrack: (id: number) => void;
  onScanLocalFiles: (path: string) => Promise<void>;
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const Tracks = ({ tracks, currentTrackId, onPlayTrack, onScanLocalFiles }: TracksProps) => {
  const theme = useTheme();
  const vinyl = theme.vinyl;
  const isDark = theme.palette.mode === 'dark';
  const [scanPath, setScanPath] = useState('');

  return (
    <Box sx={{ width: '100%', pb: 10 }}>
      {/* Scan Card */}
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
            Scan local music folder
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ flexGrow: 1 }}>
              <InputBase
                placeholder="Folder path"
                value={scanPath}
                onChange={(e) => setScanPath(e.target.value)}
                sx={{
                  width: '100%',
                  bgcolor: '#1E1E1E',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  fontSize: 14,
                  border: '0.5px solid rgba(255,255,255,0.08)',
                }}
              />
              <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12, mt: 1 }}>
                Enter the absolute path to your music directory (e.g., C:\Users\Name\Music)
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => void onScanLocalFiles(scanPath)}
              disableElevation
              sx={{
                bgcolor: '#E9A44A',
                color: '#1C1C1E',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: 13,
                textTransform: 'none',
                px: 3,
                py: 1,
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: 'rgba(233,164,74,0.85)',
                }
              }}
            >
              SCAN LIBRARY
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tracks Header */}
      <Box sx={{ px: 4, pb: 1, pt: 2 }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 12 }}>
          All Tracks • {tracks.length}
        </Typography>
      </Box>

      {/* Track List */}
      <Box sx={{ px: 2, display: 'flex', flexDirection: 'column' }}>
        {tracks.map((track) => {
          const isActive = track.id === currentTrackId;
          
          return (
            <Box
              key={track.id}
              onClick={() => onPlayTrack(track.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                pr: 2,
                borderRadius: `${vinyl.radius.row}px`,
                cursor: 'pointer',
                transition: 'background-color 200ms',
                bgcolor: isActive ? vinyl.trackActive : 'transparent',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  '& .more-btn': { opacity: 1 }
                },
                height: 52,
                gap: 2,
              }}
            >
              <Avatar
                variant="square"
                src={track.cover_art_data_url || "/src/assets/logo.png"}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '4px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  '& img': { objectFit: track.cover_art_data_url ? 'cover' : 'contain', p: track.cover_art_data_url ? 0 : 0.5 }
                }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: 14,
                    color: isActive ? 'var(--adw-accent, #3584E4)' : theme.palette.text.primary,
                  }} 
                  noWrap
                >
                  {track.title}
                </Typography>
                <Typography 
                  sx={{ 
                    fontWeight: 400, 
                    fontSize: 12,
                    color: theme.palette.text.secondary,
                  }} 
                  noWrap
                >
                  {track.artist} • {track.album}
                </Typography>
              </Box>
              
              <IconButton 
                className="more-btn"
                size="small" 
                onClick={(e) => e.stopPropagation()}
                sx={{ opacity: 0, transition: 'opacity 200ms', color: theme.palette.text.secondary }}
              >
                <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
              
              <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12, minWidth: 40, textAlign: 'right' }}>
                {formatDuration(track.duration)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
