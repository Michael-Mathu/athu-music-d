import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';

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
  { id: 'albums',    icon: AlbumRoundedIcon,       label: 'Albums'    },
  { id: 'artists',   icon: PersonRoundedIcon,      label: 'Artists'   },
  { id: 'playlists', icon: PlaylistPlayRoundedIcon, label: 'Playlists' },
  { id: 'settings',  icon: SettingsRoundedIcon,    label: 'Settings'  },
];

export const NavRail = ({ activeView, onChange }: NavRailProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [hoveredId, setHoveredId] = useState<NavView | null>(null);

  return (
    <Box
      role="tablist"
      aria-label="Library navigation"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        height: 44,
        pl: '16px',
        borderBottom: '0.5px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        bgcolor: isDark ? 'rgba(20, 20, 22, 0.65)' : 'rgba(245, 245, 247, 0.65)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        flexShrink: 0,
      }}
    >
      {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
        const active = activeView === id;
        const hovered = hoveredId === id;
        return (
          <Box
            key={id}
            role="tab"
            aria-selected={active}
            tabIndex={0}
            onClick={() => onChange(id)}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 76,
              height: 34,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 150ms ease, color 150ms ease',
              gap: 0.75,
              bgcolor: active
                ? isDark
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.06)'
                : 'transparent',
              color: active
                ? `var(--adw-accent, ${theme.palette.primary.main})`
                : theme.palette.text.secondary,
              '&:hover': {
                bgcolor: active
                  ? isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.08)'
                  : isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                opacity: hovered || active ? 1 : 0,
                transform: hovered || active ? 'translateX(0)' : 'translateX(-4px)',
                transition: 'opacity 150ms ease, transform 150ms ease',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
