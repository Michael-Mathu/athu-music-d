import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '../lib/ThemeContext';

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

  const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{ fontSize: 13, fontWeight: 700, mt: 3, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </Typography>
  );

  const SettingRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{label}</Typography>
      {children}
    </Box>
  );

  return (
    <Box sx={{ width: '100%', px: 4, pb: 10 }}>
      <SectionHeader>Appearance</SectionHeader>
      
      <SettingRow label="Theme">
        <Box sx={{ display: 'flex', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px', p: 0.5 }}>
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
                bgcolor: theme === m ? 'var(--adw-accent, #3584E4)' : 'transparent',
                color: theme === m ? '#FFFFFF' : 'text.secondary',
                textTransform: 'capitalize',
                transition: 'all 200ms',
                '&:hover': {
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          {ACCENT_COLORS.map((color) => (
            <Box
              key={color}
              onClick={() => setAccentColor(color)}
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: color,
                cursor: 'pointer',
                border: accentColor === color ? '2px solid #FFFFFF' : 'none',
                boxShadow: accentColor === color ? '0 0 0 1px rgba(0,0,0,0.2)' : 'none',
                transition: 'transform 200ms',
                '&:hover': {
                  transform: 'scale(1.2)',
                }
              }}
            />
          ))}
        </Box>
      </SettingRow>

      <SectionHeader>Library</SectionHeader>
      
      <SettingRow label="Music folder">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            C:\Users\micha\Music
          </Typography>
          <Button 
            size="small" 
            variant="outlined"
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none', 
              fontSize: 12, 
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'text.primary'
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
          sx={{
            bgcolor: 'rgba(255,255,255,0.05)',
            color: 'text.primary',
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: 13,
            fontWeight: 600,
            py: 1,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
              boxShadow: 'none',
            }
          }}
        >
          Rescan library
        </Button>
      </Box>

      <SectionHeader>About</SectionHeader>
      
      <Box sx={{ py: 1 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 0.5 }}>Athu Music D</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>v0.2.0</Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Built with Tauri + React</Typography>
      </Box>
    </Box>
  );
};
