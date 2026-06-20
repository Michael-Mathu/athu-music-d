import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { accentPresets, getColors, type AccentPreset, type ThemeMode } from '../theme/tokens';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accentColor: string;
  setAccentColor: (c: string) => void;
  accentPreset: AccentPreset;
  setAccentPreset: (preset: AccentPreset) => void;
  reducedMotion: boolean;
  colors: ReturnType<typeof getColors>;
  resolvedMode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  accentColor: '#FA2D48',
  setAccentColor: () => {},
  accentPreset: accentPresets[0],
  setAccentPreset: () => {},
  reducedMotion: false,
  colors: getColors('dark'),
  resolvedMode: 'dark',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('adw-theme') as Theme) ?? 'dark';
    } catch {
      return 'dark';
    }
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    try {
      return localStorage.getItem('adw-accent') ?? '#FA2D48';
    } catch {
      return '#FA2D48';
    }
  });

  const resolvedMode = useMemo<ThemeMode>(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme as ThemeMode;
  }, [theme]);

  const colors = useMemo(() => getColors(resolvedMode), [resolvedMode]);

  const accentPreset = useMemo<AccentPreset>(() => {
    const found = accentPresets.find((p) => p.hex.toLowerCase() === accentColor.toLowerCase());
    return found ?? accentPresets[0];
  }, [accentColor]);

  const reducedMotion = useMemo(() => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--adw-accent', accentColor);
    try {
      localStorage.setItem('adw-accent', accentColor);
    } catch {
      /* no-op */
    }
  }, [accentColor]);

  useEffect(() => {
    const applyTheme = (t: Theme) => {
      const isDark =
        t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    applyTheme(theme);
    try {
      localStorage.setItem('adw-theme', theme);
    } catch {
      /* no-op */
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  const value: ThemeContextValue = {
    theme,
    setTheme: setThemeState,
    accentColor,
    setAccentColor: setAccentColorState,
    accentPreset,
    setAccentPreset: (preset) => setAccentColorState(preset.hex),
    reducedMotion,
    colors,
    resolvedMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
