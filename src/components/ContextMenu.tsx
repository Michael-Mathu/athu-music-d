import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ContextMenuProps {
  open: boolean;
  children: React.ReactNode;
  sx?: Record<string, unknown>;
}

export const ContextMenu = ({ open, children, sx }: ContextMenuProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 1300,
        bgcolor: isDark ? 'rgba(28,28,32,0.92)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
        minWidth: 220,
        py: 0.5,
        transform: open ? 'scale(1)' : 'scale(0.95)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'transform 120ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 120ms ease',
        transformOrigin: 'top right',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
