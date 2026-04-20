import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, alpha } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AlbumIcon from '@mui/icons-material/Album';
import PersonIcon from '@mui/icons-material/Person';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAppTheme } from '../../lib/ThemeContext';

const drawerWidth = 240;

export const Sidebar = () => {
  const location = useLocation();
  const { primaryColor } = useAppTheme();

  const menuItems = [
    { text: 'Tracks', path: '/tracks', icon: <LibraryMusicIcon /> },
    { text: 'Now Playing', path: '/now-playing', icon: <EqualizerIcon /> },
    { text: 'Albums', path: '/albums', icon: <AlbumIcon /> },
    { text: 'Artists', path: '/artists', icon: <PersonIcon /> },
    { text: 'Playlists', path: '/playlists', icon: <QueueMusicIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box', 
          borderRight: 'none',
          bgcolor: 'background.default',
        },
      }}
    >
      <Box sx={{ p: 4, pt: 5 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 900, 
            letterSpacing: -1,
            color: 'primary.main',
            mb: 1
          }}
        >
          ATHU
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 700, letterSpacing: 1 }}>MUSIC PLAYER</Typography>
      </Box>

      <Box sx={{ flexGrow: 1, mt: 2 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const selected = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  component={Link} 
                  to={item.path}
                  selected={selected}
                  sx={{ 
                    borderRadius: '28px',
                    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&.Mui-selected': { 
                      bgcolor: alpha(primaryColor, 0.15),
                      '&:hover': { bgcolor: alpha(primaryColor, 0.25) }
                    },
                    '& .MuiListItemIcon-root': {
                      minWidth: 48,
                      color: selected ? 'primary.main' : 'text.secondary',
                    },
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        sx={{ 
                          fontSize: '0.9rem', 
                          fontWeight: selected ? 700 : 500,
                          color: selected ? 'primary.main' : 'text.primary'
                        }}
                      >
                        {item.text}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ mx: 4, opacity: 0.05 }} />
      
      <Box sx={{ p: 2, mb: '90px' }}>
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/settings"
            selected={location.pathname === '/settings'}
            sx={{ 
              borderRadius: '28px',
              '&.Mui-selected': { 
                bgcolor: alpha(primaryColor, 0.15),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 48 }}>
              <SettingsIcon color={location.pathname === '/settings' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography 
                  sx={{ 
                    fontSize: '0.9rem', 
                    fontWeight: location.pathname === '/settings' ? 700 : 500 
                  }}
                >
                  Settings
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
};
