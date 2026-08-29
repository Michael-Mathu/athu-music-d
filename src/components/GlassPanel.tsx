import { Box } from '@mui/material';

interface GlassPanelProps {
  children: React.ReactNode;
  sx?: Record<string, unknown>;
  onClick?: () => void;
}

export const GlassPanel = ({ children, sx, onClick }: GlassPanelProps) => (
  <Box
    onClick={onClick}
    sx={{
      bgcolor: 'var(--bg-glass, rgba(28, 28, 32, 0.72))',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      border: '0.5px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg, 12px)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      ...sx,
    }}
  >
    {children}
  </Box>
);
