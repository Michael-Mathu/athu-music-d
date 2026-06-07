import { Box, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import { Window } from '@tauri-apps/api/window';
import { NavView } from '../../types/library';

const appWindow = new Window('main');

interface HeaderBarProps {
  onNavigate: (view: NavView) => void;
  onToggleSearch: () => void;
}

export const HeaderBar = ({ onNavigate, onToggleSearch }: HeaderBarProps) => {
  const theme = useTheme();

  const handleClose = async () => {
    try {
      await appWindow.close();
    } catch (e) {
      console.error('Error closing window', e);
    }
  };

  const handleMinimize = async () => {
    try {
      await appWindow.minimize();
    } catch (e) {
      console.error('Error minimizing window', e);
    }
  };

  const handleMaximize = async () => {
    try {
      const isMaximized = await appWindow.isMaximized();
      if (isMaximized) {
        await appWindow.unmaximize();
      } else {
        await appWindow.maximize();
      }
    } catch (e) {
      console.error('Error toggling maximize', e);
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
        px: 1,
        borderBottom: `0.5px solid ${theme.palette.divider}`,
        backgroundColor: 'transparent',
        flexShrink: 0,
      }}
    >
      {/* Left spacer */}
      <Box sx={{ display: 'flex', gap: 0.5, pointerEvents: 'none', width: 80 }} />

      {/* Center: Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', pointerEvents: 'none' }}>
        <img 
          src="/src/assets/logo.png" 
          alt="Athu Music Logo" 
          style={{ height: '24px', objectFit: 'contain' }} 
        />
      </Box>

      {/* Right: Actions + Window controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Lyrics Editor" placement="bottom">
          <IconButton 
            size="small" 
            aria-label="Open lyrics editor"
            onClick={() => onNavigate('lyrics-editor')}
            sx={{ color: theme.palette.text.secondary, '& svg': { fontSize: 20 } }}
          >
            <EditNoteRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Search" placement="bottom">
          <IconButton
            size="small"
            aria-label="Search library"
            onClick={onToggleSearch}
            sx={{ color: theme.palette.text.secondary, '& svg': { fontSize: 20 } }}
          >
            <SearchRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Minimize" placement="bottom">
          <IconButton
            size="small"
            aria-label="Minimize window"
            onClick={handleMinimize}
            sx={{ color: theme.palette.text.secondary, '& svg': { fontSize: 20 } }}
          >
            <MinimizeRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Maximize" placement="bottom">
          <IconButton
            size="small"
            aria-label="Maximize window"
            onClick={handleMaximize}
            sx={{ color: theme.palette.text.secondary, '& svg': { fontSize: 20 } }}
          >
            <CropSquareRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Close" placement="bottom">
          <IconButton
            size="small"
            aria-label="Close window"
            onClick={handleClose}
            sx={{
              color: theme.palette.text.secondary,
              '& svg': { fontSize: 20 },
              '&:hover': { color: '#E05C5C', bgcolor: 'rgba(224,92,92,0.1)' },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
