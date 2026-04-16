import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AlbumIcon from '@mui/icons-material/Album';
import PersonIcon from '@mui/icons-material/Person';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import EqualizerIcon from '@mui/icons-material/Equalizer';

const drawerWidth = 240;

export const Sidebar = () => {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid rgba(255,255,255,0.05)' },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>Athu Music D</Typography>
      </Box>
      <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
      <List>
        {[
          { text: 'Tracks', path: '/tracks', icon: <LibraryMusicIcon /> },
          { text: 'Now Playing', path: '/now-playing', icon: <EqualizerIcon /> },
          { text: 'Albums', path: '/albums', icon: <AlbumIcon /> },
          { text: 'Artists', path: '/artists', icon: <PersonIcon /> },
          { text: 'Playlists', path: '/playlists', icon: <QueueMusicIcon /> },
        ].map((item) => {
          const selected = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={selected}
                sx={{ 
                  borderRadius: 2, 
                  mx: 1, 
                  mb: 0.5,
                  '&.Mui-selected': { bgcolor: 'rgba(255, 171, 64, 0.15)' },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(255, 171, 64, 0.25)' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: selected ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: selected ? 'primary.main' : 'text.primary' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};
