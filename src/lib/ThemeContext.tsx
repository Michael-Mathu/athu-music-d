import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accentColor: string;
  setAccentColor: (c: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  accentColor: '#3584E4',
  setAccentColor: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('adw-theme') as Theme) ?? 'dark';
    } catch { return 'dark'; }
  });

  const [accentColor, setAccentColorState] = useState(() => {
    try {
      return localStorage.getItem('adw-accent') ?? '#3584E4';
    } catch { return '#3584E4'; }
  });

  // Apply accent color to CSS custom property
  useEffect(() => {
    document.documentElement.style.setProperty('--adw-accent', accentColor);
    try { localStorage.setItem('adw-accent', accentColor); } catch {}
  }, [accentColor]);

  // Apply theme class and listen for system changes
  useEffect(() => {
    const applyTheme = (t: Theme) => {
      const isDark =
        t === 'dark' ||
        (t === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.setAttribute(
        'data-theme', isDark ? 'dark' : 'light'
      );
    };

    applyTheme(theme);
    try { localStorage.setItem('adw-theme', theme); } catch {}

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const setAccentColor = (c: string) => setAccentColorState(c);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
