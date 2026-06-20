import { useState, useEffect, useRef } from 'react';
import { Box, Avatar, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import logoSrc from '../assets/logo.png';

interface CoverArtImageProps {
  src?: string | null;
  size?: number | string;
  borderRadius?: string | number;
  alt?: string;
  padding?: number;
  shadow?: boolean;
}

export const CoverArtImage = ({
  src,
  size = 40,
  borderRadius = '4px',
  alt = 'Cover Art',
  padding,
  shadow = false,
}: CoverArtImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [previousSrc, setPreviousSrc] = useState<string | null>(null);
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const loaderRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const next = src || logoSrc;
    if (next === displaySrc) {
      if (!loaderRef.current) return;
      if (loaderRef.current.src !== next) {
        loaderRef.current.src = next;
      }
      return;
    }

    setLoaded(false);
    setPreviousSrc(displaySrc);
    setDisplaySrc(next);

    const img = new Image();
    img.src = next;
    loaderRef.current = img;
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(true);
  }, [src, displaySrc, logoSrc]);

  const actualPadding = padding !== undefined ? padding : (src ? 0 : 4);
  const finalSrc = displaySrc || logoSrc;

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        transform: loaded ? 'translateY(0)' : 'translateY(2px)',
        transition: 'transform 220ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        ...(shadow && loaded
          ? {
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
            }
          : {}),
      }}
    >
      {previousSrc && previousSrc !== finalSrc && (
        <Avatar
          variant="square"
          src={previousSrc}
          alt=""
          sx={{
            width: size,
            height: size,
            borderRadius,
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: loaded ? 0 : 1,
            transition: 'opacity 220ms ease-in-out',
            '& img': { objectFit: 'cover', p: 0 },
          }}
        />
      )}
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
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
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
          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 220ms ease-in-out',
          '& img': {
            objectFit: src ? 'cover' : 'contain',
            p: actualPadding,
          },
        }}
      />
    </Box>
  );
};
