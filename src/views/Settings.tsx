import { Box, Typography, Switch, FormControlLabel, Paper, Stack, IconButton } from '@mui/material';
import { useAppTheme } from '../lib/ThemeContext';
import CircleIcon from '@mui/icons-material/Circle';
import ContrastIcon from '@mui/icons-material/Contrast';

const PRESET_COLORS = [
  '#ffab40', // Athu Orange
  '#D0BCFF', // Lavender
  '#77D8D8', // Teal
  '#FF8A80', // Soft Red
  '#A5D6A7', // Light Green
  '#90CAF9', // Soft Blue
];

export const Settings = () => {
  const { mode, primaryColor, setPrimaryColor, toggleMode } = useAppTheme();

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>Settings</Typography>

      <Stack spacing={4}>
        {/* Themes and Colors Section */}
        <section>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ContrastIcon color="primary" /> Themes and Colors
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Appearance</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Switch between light and dark visual modes.
                </Typography>
                <FormControlLabel
                  control={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
                  label={mode === 'dark' ? "Dark Mode Active" : "Light Mode Active"}
                  sx={{ ml: 0 }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Accent Color</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Personalize the platform with your favorite color.
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                  {PRESET_COLORS.map(color => (
                    <IconButton 
                      key={color} 
                      onClick={() => setPrimaryColor(color)}
                      sx={{ 
                        p: 0.5, 
                        border: '2px solid', 
                        borderColor: primaryColor === color ? 'primary.main' : 'transparent',
                        transition: '0.2s'
                      }}
                    >
                      <CircleIcon sx={{ color }} />
                    </IconButton>
                  ))}
                </Stack>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">Custom Color:</Typography>
                  <Box
                    component="input"
                    type="color"
                    value={primaryColor}
                    onChange={(e: any) => setPrimaryColor(e.target.value)}
                    sx={{
                      width: 48,
                      height: 48,
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      bgcolor: 'transparent',
                      '&::-webkit-color-swatch-wrapper': { p: 0 },
                      '&::-webkit-color-swatch': { border: 'none', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }
                    }}
                  />
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.6 }}>{primaryColor.toUpperCase()}</Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </section>

        {/* Metadata section placeholder */}
        <section>
          <Typography variant="h6" sx={{ mb: 2 }}>Metadata & APIs</Typography>
          <Paper variant="outlined" sx={{ p: 3, opacity: 0.5 }}>
            <Typography variant="body2">
              Advanced metadata settings (Last.fm, Fanart.tv keys) will be implemented in Phase 3.
            </Typography>
          </Paper>
        </section>

        <Box sx={{ pt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Athu Music D • Material You Version 1.0
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};
