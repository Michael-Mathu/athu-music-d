import { Box, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTheme } from '@mui/material/styles';

type ToastVariant = 'info' | 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: { label: string; onClick: () => void };
}

export const ToastContainer = ({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <Box
          key={toast.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            bgcolor: isDark ? 'rgba(28,28,32,0.94)' : 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            minWidth: 280,
            maxWidth: 420,
            pointerEvents: 'auto',
          }}
        >
          <Typography sx={{ flexGrow: 1, fontSize: 13, fontWeight: 500, color: 'text.primary' }}>
            {toast.message}
          </Typography>
          {toast.action && (
            <Typography
              onClick={(e) => {
                e.stopPropagation();
                toast.action?.onClick();
              }}
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: 'primary.main',
                cursor: 'pointer',
              }}
            >
              {toast.action.label}
            </Typography>
          )}
          <IconButton size="small" onClick={() => onDismiss(toast.id)} sx={{ color: 'text.secondary' }}>
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};
