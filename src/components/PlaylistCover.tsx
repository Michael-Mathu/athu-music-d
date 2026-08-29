import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';

interface PlaylistCoverProps {
  images: (string | null | undefined)[];
  size?: number;
  borderRadius?: number | string;
}

export const PlaylistCover = ({ images, size = 44, borderRadius = 8 }: PlaylistCoverProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = `var(--adw-accent, ${theme.palette.primary.main})`;

  const validImages = images.filter((img): img is string => !!img).slice(0, 4);

  if (validImages.length === 0) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          bgcolor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
          color: accentColor,
          borderRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <QueueMusicRoundedIcon sx={{ fontSize: size * 0.5 }} />
      </Box>
    );
  }

  if (validImages.length === 1) {
    return (
      <Box
        component="img"
        src={validImages[0]}
        sx={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius,
          flexShrink: 0,
        }}
      />
    );
  }

  if (validImages.length === 2) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1px',
          borderRadius,
          overflow: 'hidden',
          bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          flexShrink: 0,
        }}
      >
        {validImages.map((img, idx) => (
          <Box
            key={idx}
            component="img"
            src={img}
            sx={{
              width: size / 2,
              height: size,
              objectFit: 'cover',
            }}
          />
        ))}
      </Box>
    );
  }

  const gridSize = 2;
  const cellSize = size / gridSize;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        gap: '1px',
        borderRadius,
        overflow: 'hidden',
        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        flexShrink: 0,
      }}
    >
      {validImages.map((img, idx) => (
        <Box
          key={idx}
          component="img"
          src={img}
          sx={{
            width: cellSize,
            height: cellSize,
            objectFit: 'cover',
          }}
        />
      ))}
    </Box>
  );
};
