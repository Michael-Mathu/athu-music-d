import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    vinyl: {
      adwBlue: string;
      panelLeft: string;
      panelRight: string;
      trackActive: string;
      radius: {
        art: number;
        row: number;
        window: number;
      };
    };
  }
  interface ThemeOptions {
    vinyl?: {
      adwBlue: string;
      panelLeft: string;
      panelRight: string;
      trackActive: string;
      radius: {
        art: number;
        row: number;
        window: number;
      };
    };
  }
}

export const getAppTheme = (mode: 'light' | 'dark', accent: string) => {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: accent ?? '#3584E4',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#242424' : '#ffffff',
        paper: isDark ? '#2A2A2A' : '#f5f5f5',
      },
      text: {
        primary: isDark ? '#ffffff' : '#1c1c1e',
        secondary: '#8E8E93',
        disabled: '#8E8E93',
      },
      divider: isDark
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(0,0,0,0.08)',
    },
    shape: {
      borderRadius: 8,
    },
    vinyl: {
      adwBlue: accent,
      panelLeft: isDark ? '#242424' : '#FFFFFF',
      panelRight: isDark ? '#2A2A2A' : '#F5F5F5',
      trackActive: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
      radius: {
        art: 12,
        row: 4,
        window: 12,
      }
    },
    typography: {
      fontFamily: "'Roboto Serif', Georgia, serif",
      allVariants: {
        color: 'inherit',
      },
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          root: {
            color: 'inherit',
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            color: 'inherit',
          },
          secondary: {
            color: '#8E8E93',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            color: isDark ? '#ffffff' : '#1c1c1e',
            backgroundColor: isDark ? '#242424' : '#ffffff',
            fontFamily: "'Roboto Serif', Georgia, serif",
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            color: accent,
            height: 4,
            padding: '10px 0',
          },
          thumb: {
            width: 12,
            height: 12,
            backgroundColor: '#ffffff',
            boxShadow: 'none',
            '&:hover, &.Mui-focusVisible': { boxShadow: 'none' },
          },
          track: { borderRadius: 2 },
          rail: { backgroundColor: isDark ? '#444444' : '#CCCCCC', opacity: 1 },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 6 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: isDark ? '#2A2A2A' : '#FFFFFF',
            borderRadius: 8,
            border: isDark ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(0,0,0,0.1)',
            boxShadow: 'none',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 13,
            color: isDark ? '#ffffff' : '#1c1c1e',
            '&:hover': { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
          },
        },
      },
    },
  });
};
