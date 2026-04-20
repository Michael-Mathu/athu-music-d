import { createTheme, alpha } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark', primaryColor: string) => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: isDark ? '#D0BCFF' : '#6750A4', // MD3 standard secondary
      },
      background: {
        default: isDark ? '#0F0F0F' : '#FDFBFF',
        paper: isDark ? '#1A1A1A' : '#F3F4F9',
      },
      text: {
        primary: isDark ? '#E6E1E5' : '#1C1B1F',
        secondary: isDark ? '#CAC4D0' : '#49454F',
      },
    },
    shape: {
      borderRadius: 16, // MD3 Medium
    },
    typography: {
      fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 28, // MD3 Extra Large
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 16,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: 'none',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 28, // Pill shape for MD3 active indicators
            margin: '4px 12px',
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            height: 6,
          },
          thumb: {
            width: 20,
            height: 20,
            transition: '0.2s',
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0px 0px 0px 8px ${alpha(primaryColor, 0.16)}`,
            },
          },
          track: {
            border: 'none',
          },
          rail: {
            opacity: 0.2,
          },
        },
      },
    },
  });
};

// Legacy export for compatibility during transition
export const darkTheme = createAppTheme('dark', '#ffab40');
