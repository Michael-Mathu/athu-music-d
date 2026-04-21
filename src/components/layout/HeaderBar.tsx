import { Box, IconButton } from '@mui/material';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Window } from '@tauri-apps/api/window';

const appWindow = new Window('main');

export const HeaderBar = () => {
  const handleClose = async () => {
    try {
      await appWindow.close();
    } catch (e) {
      console.error('Error closing window', e);
    }
  };

  return (
    <Box
      data-tauri-drag-region
      sx={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1, // Slight padding for icons
        borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        backgroundColor: 'transparent',
      }}
    >
      <Box sx={{ display: 'flex', gap: 0.5, pointerEvents: 'none' }}>
        <Box sx={{ pointerEvents: 'auto' }}>
          <IconButton size="small" sx={{ '& svg': { fontSize: 20 } }}>
            <ViewSidebarRoundedIcon />
          </IconButton>
        </Box>
        <Box sx={{ pointerEvents: 'auto' }}>
          <IconButton size="small" sx={{ '& svg': { fontSize: 20 } }}>
            <MenuRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', pointerEvents: 'none' }}>
        <img 
          src="/src/assets/logo.png" 
          alt="Athu Music Logo" 
          style={{ height: '24px', objectFit: 'contain' }} 
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, pointerEvents: 'none' }}>
        <Box sx={{ pointerEvents: 'auto' }}>
          <IconButton size="small" sx={{ '& svg': { fontSize: 20 } }}>
            <SearchRoundedIcon />
          </IconButton>
        </Box>
        <Box sx={{ pointerEvents: 'auto' }}>
          <IconButton size="small" onClick={handleClose} sx={{ '& svg': { fontSize: 20 } }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};


