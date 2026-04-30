import { useState, useEffect } from 'react';
import { Avatar, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface CoverArtImageProps {
  src?: string | null;
  size?: number | string;
  borderRadius?: string | number;
  alt?: string;
  padding?: number;
}

export const CoverArtImage = ({ 
  src, 
  size = 40, 
  borderRadius = '4px', 
  alt = 'Cover Art',
  padding
}: CoverArtImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!src) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(true); // Show fallback on error
  }, [src]);

  const finalSrc = src || "/src/assets/logo.png";
  const actualPadding = padding !== undefined ? padding : (src ? 0 : 4);

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      {!loaded && (
        <Skeleton 
          variant="rectangular" 
          width={size} 
          height={size} 
          sx={{ 
            borderRadius, 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            zIndex: 1,
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
          }} 
        />
      )}
      <Avatar
        variant="square"
        src={finalSrc}
        alt={alt}
        sx={{
          width: size,
          height: size,
          borderRadius,
          bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          '& img': { 
            objectFit: src ? 'cover' : 'contain', 
            p: actualPadding 
          }
        }}
      />
    </Box>
  );
};

import { Box } from '@mui/material';
