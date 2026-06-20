import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Window } from '@tauri-apps/api/window';
import { NavView } from '../../types/library';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';

const appWindow = new Window('main');

interface HeaderBarProps {
  onNavigate: (view: NavView) => void;
  onToggleSearch: () => void;
}

export const HeaderBar = ({ onNavigate, onToggleSearch }: HeaderBarProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
        position: 'relative',
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1,
        flexShrink: 0,
        bgcolor: isDark ? 'rgba(26, 26, 29, 0.72)' : 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      }}
    >
      <Box sx={{ display: 'flex', gap: 0.5, pointerEvents: 'none', width: 80 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', pointerEvents: 'none', gap: 1 }}>
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: '6px',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          A
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: 'text.primary' }}>
          Athu Music
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Lyrics Editor" placement="bottom">
          <IconButton
            size="small"
            aria-label="Open lyrics editor"
            onClick={() => onNavigate('lyrics-editor')}
            sx={{
              color: 'text.secondary',
              borderRadius: '6px',
              '& svg': { fontSize: 18 },
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
            }}
          >
            <EditNoteRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Search" placement="bottom">
          <IconButton
            size="small"
            aria-label="Search library"
            onClick={onToggleSearch}
            sx={{
              color: 'text.secondary',
              borderRadius: '6px',
              '& svg': { fontSize: 18 },
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
            }}
          >
            <SearchRoundedIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ width: 1, height: 14, bgcolor: 'divider', mx: 0.5 }} />
        <Tooltip title="Minimize" placement="bottom">
          <IconButton
            size="small"
            aria-label="Minimize window"
            onClick={handleMinimize}
            sx={{
              color: 'text.secondary',
              borderRadius: '6px',
              width: 28,
              height: 28,
              '& svg': { fontSize: 16 },
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
            }}
          >
            <MinimizeRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Maximize" placement="bottom">
          <IconButton
            size="small"
            aria-label="Maximize window"
            onClick={handleMaximize}
            sx={{
              color: 'text.secondary',
              borderRadius: '6px',
              width: 28,
              height: 28,
              '& svg': { fontSize: 16 },
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
            }}
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
              color: 'text.secondary',
              borderRadius: '6px',
              width: 28,
              height: 28,
              '& svg': { fontSize: 16 },
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
