import { Box, IconButton } from '@mui/material';

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

export const NavRail = ({ activeView, onChange }: NavRailProps) => {
  const NAV_ITEMS: { id: NavView; icon: React.ElementType }[] = [
    { id: 'queue', icon: QueueMusicRoundedIcon },
    { id: 'tracks', icon: MusicNoteRoundedIcon },
    { id: 'albums', icon: AlbumRoundedIcon },
    { id: 'artists', icon: PersonRoundedIcon },
    { id: 'playlists', icon: PlaylistPlayRoundedIcon },
    { id: 'settings', icon: SettingsRoundedIcon },
  ];

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        height: 40, 
        pl: '16px',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        bgcolor: '#2A2A2A',
        flexShrink: 0,
        gap: '4px',
      }}
    >
      {NAV_ITEMS.map(({ id, icon: Icon }) => (
        <IconButton
          key={id}
          onClick={() => onChange(id)}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '6px',
            color: activeView === id ? 'var(--adw-accent, #3584E4)' : '#8E8E93',
            backgroundColor: activeView === id ? 'color-mix(in srgb, var(--adw-accent, #3584E4) 12%, transparent)' : 'transparent',
            '&:hover': {
              backgroundColor: activeView === id 
                ? 'color-mix(in srgb, var(--adw-accent, #3584E4) 20%, transparent)' 
                : 'rgba(255,255,255,0.05)',
            }
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </IconButton>
      ))}
    </Box>
  );
};
