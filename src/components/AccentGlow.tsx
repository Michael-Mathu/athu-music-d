import { Box } from '@mui/material';

interface AccentGlowProps {
  size?: number;
  blur?: number;
  sx?: Record<string, unknown>;
}

export const AccentGlow = ({ size = 200, blur = 40, sx }: AccentGlowProps) => (
  <Box
    aria-hidden
    sx={{
      position: 'absolute',
      width: size,
      height: size,
      background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
      filter: `blur(${blur}px)`,
      pointerEvents: 'none',
      zIndex: 0,
      ...sx,
    }}
  />
);
