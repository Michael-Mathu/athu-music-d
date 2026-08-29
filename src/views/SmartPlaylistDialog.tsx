import { Box, Typography, Button, InputBase, Select, MenuItem, IconButton, FormControl } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import type { SmartPlaylistRule } from '../types/library';

interface SmartPlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, rules: SmartPlaylistRule[]) => void;
}

export const SmartPlaylistDialog = ({ open, onClose, onCreate }: SmartPlaylistDialogProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [name, setName] = useState('');
  const [rules, setRules] = useState<SmartPlaylistRule[]>([
    { field: 'artist', operator: 'contains', value: '' },
  ]);

  if (!open) return null;

  const addRule = () => {
    setRules([...rules, { field: 'title', operator: 'contains', value: '' }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, updates: Partial<SmartPlaylistRule>) => {
    setRules(rules.map((rule, i) => (i === index ? { ...rule, ...updates } : rule)));
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const validRules = rules.filter((r) => r.value !== '' && r.value !== undefined);
    onCreate(name.trim(), validRules);
    setName('');
    setRules([{ field: 'artist', operator: 'contains', value: '' }]);
    onClose();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        bgcolor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Box
        sx={{
          width: '90%',
          maxWidth: 480,
          maxHeight: '80vh',
          bgcolor: isDark ? 'rgba(28,28,32,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(30px)',
          borderRadius: '16px',
          border: isDark ? '0.5px solid rgba(255,255,255,0.12)' : '0.5px solid rgba(0,0,0,0.08)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: `0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Create Smart Playlist</Typography>
          </Box>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1 }}>
            Auto-updates based on rules you define
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', mb: 1 }}>
            Playlist Name
          </Typography>
          <InputBase
            placeholder="e.g. Recent Favorites"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              width: '100%',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '8px',
              px: 2,
              py: 1.5,
              fontSize: 14,
              border: '0.5px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
              mb: 3,
            }}
          />

          <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', mb: 1 }}>
            Rules (match all)
          </Typography>

          {rules.map((rule, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <Select
                  value={rule.field}
                  onChange={(e) => updateRule(index, { field: e.target.value as SmartPlaylistRule['field'] })}
                  sx={{ fontSize: 13, borderRadius: '8px' }}
                >
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="artist">Artist</MenuItem>
                  <MenuItem value="album">Album</MenuItem>
                  <MenuItem value="duration">Duration (seconds)</MenuItem>
                  <MenuItem value="date_modified">Date Modified</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }}>
                <Select
                  value={rule.operator}
                  onChange={(e) => updateRule(index, { operator: e.target.value as SmartPlaylistRule['operator'] })}
                  sx={{ fontSize: 13, borderRadius: '8px' }}
                >
                  <MenuItem value="contains">contains</MenuItem>
                  <MenuItem value="equals">equals</MenuItem>
                  <MenuItem value="starts_with">starts with</MenuItem>
                  <MenuItem value="greater">greater than</MenuItem>
                  <MenuItem value="less">less than</MenuItem>
                </Select>
              </FormControl>
              <InputBase
                placeholder="Value"
                value={rule.value}
                type={rule.field === 'duration' ? 'number' : 'text'}
                onChange={(e) => updateRule(index, { value: rule.field === 'duration' ? Number(e.target.value) || 0 : e.target.value })}
                sx={{
                  flex: 1,
                  bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderRadius: '8px',
                  px: 1.5,
                  py: 1,
                  fontSize: 13,
                  border: '0.5px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
                }}
              />
              {rules.length > 1 && (
                <IconButton size="small" onClick={() => removeRule(index)} sx={{ color: 'text.secondary' }}>
                  <DeleteRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            onClick={addRule}
            startIcon={<AddRoundedIcon />}
            sx={{
              mt: 1,
              color: 'text.secondary',
              fontSize: 13,
              textTransform: 'none',
            }}
          >
            Add Rule
          </Button>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 3, borderTop: `0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onClose} sx={{ color: 'text.secondary', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!name.trim()}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Create Smart Playlist
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
