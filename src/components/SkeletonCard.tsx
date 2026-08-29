import { Box, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface SkeletonCardProps {
  width?: string | number;
  height?: string | number;
}

export const SkeletonCard = ({ width = '100%', height = 180 }: SkeletonCardProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const shine = isDark
    ? 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)'
    : 'linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%)';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Avatar
        variant="square"
        sx={{
          width,
          height,
          borderRadius: '12px',
          background: shine,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite linear',
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box
          sx={{
            height: 14,
            borderRadius: '7px',
            width: '80%',
            background: shine,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite linear',
          }}
        />
        <Box
          sx={{
            height: 11,
            borderRadius: '6px',
            width: '55%',
            background: shine,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite linear',
          }}
        />
      </Box>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </Box>
  );
};
