import { Box, Typography, Button } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../lib/ThemeContext';
import { openDirectory, scanLocalFiles } from '../lib/tauri';
import { useState } from 'react';

const APP_VERSION = '0.4.3';

const ACCENT_COLORS = [
  '#3584E4', // Blue (default)
  '#E9A44A', // Amber
  '#E05C5C', // Red
  '#57A55A', // Green
  '#A855F7', // Purple
  '#EC4899', // Pink
];

export const Settings = () => {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const [musicFolder, setMusicFolder] = useState<string>('No folder selected');
  const [scanning, setScanning] = useState(false);

  const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{
      fontSize: 13,
      fontWeight: 700,
      mt: 3,
      mb: 2,
      color: 'text.secondary',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {children}
    </Typography>
  );

  const SettingRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{label}</Typography>
      {children}
    </Box>
  );

  const handleChangeFolder = async () => {
    const path = await openDirectory();
    if (path) setMusicFolder(path);
  };

  const handleRescan = async () => {
    if (musicFolder === 'No folder selected') {
      const path = await openDirectory();
      if (!path) return;
      setMusicFolder(path);
      setScanning(true);
      try { await scanLocalFiles(path); } finally { setScanning(false); }
    } else {
      setScanning(true);
      try { await scanLocalFiles(musicFolder); } finally { setScanning(false); }
    }
  };

  const toggleBgBase = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const toggleBgHover = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  return (
    <Box sx={{ width: '100%', px: 4, pb: 10 }}>
      <SectionHeader>Appearance</SectionHeader>
      
      <SettingRow label="Theme">
        <Box sx={{
          display: 'flex',
          bgcolor: toggleBgBase,
          borderRadius: '8px',
          p: 0.5,
        }}>
          {(['light', 'dark', 'system'] as const).map((m) => (
            <Box
              key={m}
              onClick={() => setTheme(m)}
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                bgcolor: theme === m ? `var(--adw-accent, ${muiTheme.palette.primary.main})` : 'transparent',
                color: theme === m ? '#FFFFFF' : 'text.secondary',
                textTransform: 'capitalize',
                transition: 'all 200ms',
                '&:hover': {
                  bgcolor: theme === m
                    ? `var(--adw-accent, ${muiTheme.palette.primary.main})`
                    : toggleBgHover,
                  color: theme === m ? '#FFFFFF' : 'text.primary',
                }
              }}
            >
              {m}
            </Box>
          ))}
        </Box>
      </SettingRow>

      <SettingRow label="Accent color">
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {ACCENT_COLORS.map((color) => (
            <Box
              key={color}
              role="radio"
              aria-label={`Accent color ${color}`}
              aria-checked={accentColor === color}
              onClick={() => setAccentColor(color)}
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: color,
                cursor: 'pointer',
                border: accentColor === color ? '2px solid #FFFFFF' : '2px solid transparent',
                boxShadow: accentColor === color
                  ? `0 0 0 2px ${color}`
                  : isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'transform 200ms, box-shadow 200ms',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            />
          ))}
        </Box>
      </SettingRow>

      <SectionHeader>Library</SectionHeader>
      
      <SettingRow label="Music folder">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{
            fontSize: 12,
            color: 'text.secondary',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {musicFolder}
          </Typography>
          <Button 
            size="small" 
            variant="outlined"
            onClick={handleChangeFolder}
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none', 
              fontSize: 12,
              borderColor: muiTheme.palette.divider,
              color: 'text.primary',
              '&:hover': {
                borderColor: muiTheme.palette.primary.main,
              }
            }}
          >
            Change
          </Button>
        </Box>
      </SettingRow>

      <Box sx={{ mt: 2 }}>
        <Button
          fullWidth
          variant="contained"
          disabled={scanning}
          onClick={handleRescan}
          sx={{
            bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
            color: 'text.primary',
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: 13,
            fontWeight: 600,
            py: 1,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              color: 'text.disabled',
            }
          }}
        >
          {scanning ? 'Scanning...' : 'Rescan library'}
        </Button>
      </Box>

      <SectionHeader>About</SectionHeader>
      
      <Box sx={{ py: 1 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 0.5 }}>Athu Music D</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>
          v{APP_VERSION}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          Built with Tauri v2 + React 19 + Rust
        </Typography>
      </Box>
    </Box>
  );
};
