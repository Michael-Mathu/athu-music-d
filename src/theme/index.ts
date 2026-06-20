import { createTheme } from '@mui/material/styles';
import { darkColors, lightColors, type ThemeMode } from './tokens';

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

export const getAppTheme = (mode: ThemeMode, accent: string, dynamicColor?: string | null) => {
  const palette = mode === 'dark' ? darkColors : lightColors;
  const primaryMain = dynamicColor ?? accent;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        contrastText: '#ffffff',
      },
      background: {
        default: palette.bgBase,
        paper: palette.bgElevated,
      },
      text: {
        primary: palette.textPrimary,
        secondary: palette.textSecondary,
        disabled: palette.textTertiary,
      },
      divider: palette.borderSubtle,
    },
    shape: {
      borderRadius: 8,
    },
    vinyl: {
      adwBlue: accent,
      panelLeft: palette.bgElevated,
      panelRight: palette.bgSurface,
      trackActive: palette.borderMedium,
      radius: {
        art: 12,
        row: 4,
        window: 12,
      },
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
            color: palette.textSecondary,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            color: palette.textPrimary,
            backgroundColor: palette.bgBase,
            fontFamily: "'SF Pro', 'Inter', 'Roboto Serif', serif",
            margin: 0,
            overflow: 'hidden',
          },
          '::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '::-webkit-scrollbar-track': {
            background: palette.borderSubtle,
          },
          '::-webkit-scrollbar-thumb': {
            background: palette.borderMedium,
            borderRadius: '10px',
            '&:hover': {
              background: accent,
            },
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${palette.borderMedium} transparent`,
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
            '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${palette.accentGlow}` },
          },
          track: { borderRadius: 2 },
          rail: { backgroundColor: palette.borderMedium, opacity: 1 },
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
            background: palette.bgElevated,
            borderRadius: 10,
            border: `0.5px solid ${palette.borderSubtle}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 13,
            color: palette.textPrimary,
            '&:hover': { background: palette.borderMedium },
          },
        },
      },
    },
  });
};
