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
        default: isDark ? '#242424' : '#FAFAFA',
        paper: isDark ? '#2A2A2A' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#ffffff' : '#1A1A1A',
        secondary: isDark ? '#8E8E93' : '#5A5A5A',
        disabled: isDark ? '#8E8E93' : '#A0A0A0',
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
      panelRight: isDark ? '#2A2A2A' : '#FAFAFA',
      trackActive: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
      radius: {
        art: 12,
        row: 4,
        window: 12,
      }
    },
    typography: {
      fontFamily: "'SF Pro', 'Inter', 'Roboto Serif', serif",
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
            color: isDark ? '#8E8E93' : '#5A5A5A',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            color: isDark ? '#ffffff' : '#1A1A1A',
            backgroundColor: isDark ? '#242424' : '#FAFAFA',
            fontFamily: "'SF Pro', 'Inter', 'Roboto Serif', serif",
            margin: 0,
            overflow: 'hidden',
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 8px rgba(53, 132, 228, 0.16)' },
          },
          track: { borderRadius: 2 },
          rail: { backgroundColor: isDark ? '#444444' : '#CCCCCC', opacity: 1 },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { 
            borderRadius: 6,
            color: 'inherit',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: isDark ? '#2A2A2A' : '#FFFFFF',
            borderRadius: 8,
            border: isDark ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(0,0,0,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 13,
            color: isDark ? '#ffffff' : '#1A1A1A',
            '&:hover': { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
          },
        },
      },
    },
  });
};
