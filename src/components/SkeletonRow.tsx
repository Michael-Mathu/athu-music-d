import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const SkeletonRow = ({ count = 1 }: { count?: number }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const shine = isDark
    ? 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)'
    : 'linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%)';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {Array.from({ length: count }).map((_, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            height: 56,
            px: 2,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '4px',
              background: shine,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite linear',
            }}
          />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box
              sx={{
                height: 12,
                borderRadius: '6px',
                width: '70%',
                background: shine,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite linear',
              }}
            />
            <Box
              sx={{
                height: 10,
                borderRadius: '5px',
                width: '45%',
                background: shine,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite linear',
              }}
            />
          </Box>
        </Box>
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </Box>
  );
};
