
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const lightColors = {
  bgBase: '#FBFBFD',
  bgElevated: '#FFFFFF',
  bgSurface: '#F5F5F7',
  bgGlass: 'rgba(255, 255, 255, 0.78)',
  borderSubtle: 'rgba(0, 0, 0, 0.04)',
  borderMedium: 'rgba(0, 0, 0, 0.08)',
  textPrimary: '#1D1D1F',
  textSecondary: '#6E6E73',
  textTertiary: '#AEAEB2',
  accentDefault: '#FA2D48',
  accentGlow: 'rgba(250, 45, 72, 0.18)',
  accentSubtle: 'rgba(250, 45, 72, 0.08)',
} as const;

export const darkColors = {
  bgBase: '#0D0D0F',
  bgElevated: '#1A1A1D',
  bgSurface: '#232327',
  bgGlass: 'rgba(28, 28, 32, 0.72)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderMedium: 'rgba(255, 255, 255, 0.10)',
  textPrimary: '#F5F5F7',
  textSecondary: '#86868B',
  textTertiary: '#5A5A60',
  accentDefault: '#FA2D48',
  accentGlow: 'rgba(250, 45, 72, 0.25)',
  accentSubtle: 'rgba(250, 45, 72, 0.12)',
} as const;

export type ThemeMode = 'light' | 'dark';
export type AccentPreset = {
  id: string;
  label: string;
  hex: string;
};

export const accentPresets: AccentPreset[] = [
  { id: 'songbird-red', label: 'Songbird Red', hex: '#FA2D48' },
  { id: 'electric-indigo', label: 'Electric Indigo', hex: '#5E5CE6' },
  { id: 'sky-blue', label: 'Sky Blue', hex: '#007AFF' },
  { id: 'mint-green', label: 'Mint Green', hex: '#30D158' },
  { id: 'tangerine', label: 'Tangerine', hex: '#FF9F0A' },
  { id: 'lavender', label: 'Lavender', hex: '#BF5AF2' },
  { id: 'teal', label: 'Teal', hex: '#64D2FF' },
  { id: 'coral-pink', label: 'Coral Pink', hex: '#FF375F' },
];

export const getColors = (mode: ThemeMode) => (mode === 'dark' ? darkColors : lightColors);
