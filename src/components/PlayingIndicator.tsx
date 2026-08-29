import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface PlayingIndicatorProps {
  isPlaying?: boolean;
  size?: number;
  color?: string;
}

export const PlayingIndicator = ({ isPlaying = true, size = 14, color }: PlayingIndicatorProps) => {
  const theme = useTheme();
  const barColor = color || `var(--adw-accent, ${theme.palette.primary.main})`;
  const barWidth = Math.max(2, size / 5);
  const barHeight = size;
  const gap = Math.max(1, size / 7);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        gap: `${gap}px`,
        height: barHeight,
        width: barWidth * 3 + gap * 2,
      }}
    >
      <Box
        sx={{
          width: barWidth,
          bgcolor: barColor,
          borderRadius: '1px',
          animation: 'playing-bar 0.6s ease-in-out infinite',
          height: isPlaying ? '30%' : '20%',
          animationDelay: '0s',
          animationPlayState: isPlaying ? 'running' : 'paused',
          transition: 'height 300ms ease',
        }}
      />
      <Box
        sx={{
          width: barWidth,
          bgcolor: barColor,
          borderRadius: '1px',
          animation: 'playing-bar 0.6s ease-in-out infinite',
          height: isPlaying ? '30%' : '20%',
          animationDelay: '0.2s',
          animationPlayState: isPlaying ? 'running' : 'paused',
          transition: 'height 300ms ease',
        }}
      />
      <Box
        sx={{
          width: barWidth,
          bgcolor: barColor,
          borderRadius: '1px',
          animation: 'playing-bar 0.6s ease-in-out infinite',
          height: isPlaying ? '30%' : '20%',
          animationDelay: '0.4s',
          animationPlayState: isPlaying ? 'running' : 'paused',
          transition: 'height 300ms ease',
        }}
      />
    </Box>
  );
};
