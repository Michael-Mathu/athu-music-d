import { Box, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import AlbumRoundedIcon from '@mui/icons-material/AlbumRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PlaylistPlayRoundedIcon from '@mui/icons-material/PlaylistPlayRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import type { NavView } from '../../types/library';

interface NavRailProps {
  activeView: NavView;
  onChange: (view: NavView) => void;
}

const NAV_ITEMS: { id: NavView; icon: React.ElementType; label: string }[] = [
  { id: 'queue',     icon: QueueMusicRoundedIcon,  label: 'Queue'     },
  { id: 'tracks',    icon: MusicNoteRoundedIcon,   label: 'Tracks'    },
  { id: 'albums',    icon: AlbumRoundedIcon,        label: 'Albums'    },
  { id: 'artists',   icon: PersonRoundedIcon,       label: 'Artists'   },
  { id: 'playlists', icon: PlaylistPlayRoundedIcon, label: 'Playlists' },
  { id: 'settings',  icon: SettingsRoundedIcon,     label: 'Settings'  },
];

export const NavRail = ({ activeView, onChange }: NavRailProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box 
      role="tablist"
      aria-label="Library navigation"
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        height: 40, 
        pl: '16px',
        borderBottom: `0.5px solid ${theme.palette.divider}`,
        bgcolor: isDark ? '#2A2A2A' : '#EFEFEF',
        flexShrink: 0,
        gap: '4px',
      }}
    >
      {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
        <Tooltip key={id} title={label} placement="bottom" arrow>
          <IconButton
            role="tab"
            aria-selected={activeView === id}
            aria-label={label}
            onClick={() => onChange(id)}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              color: activeView === id
                ? `var(--adw-accent, ${theme.palette.primary.main})`
                : theme.palette.text.secondary,
              backgroundColor: activeView === id
                ? `color-mix(in srgb, var(--adw-accent, ${theme.palette.primary.main}) 12%, transparent)`
                : 'transparent',
              '&:hover': {
                backgroundColor: activeView === id 
                  ? `color-mix(in srgb, var(--adw-accent, ${theme.palette.primary.main}) 20%, transparent)` 
                  : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              },
              transition: 'background-color 150ms, color 150ms',
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};
