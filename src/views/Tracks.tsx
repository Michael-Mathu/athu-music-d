import { Box, Typography, IconButton, InputBase, Button, InputAdornment, Menu, MenuItem, Divider } from '@mui/material';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import CloudDownloadRoundedIcon from '@mui/icons-material/CloudDownloadRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import { downloadAndEmbedLyrics, openDirectory } from '../lib/tauri';
import { useTheme } from '@mui/material/styles';
import { Playlist, Track } from '../types/library';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useState, useMemo, memo } from 'react';
import { useSort } from '../hooks/useSort';
import { sortItems } from '../lib/utils/sorting';
import { LibrarySort } from '../components/LibrarySort';
import { Virtuoso } from 'react-virtuoso';
import { CoverArtImage } from '../components/CoverArtImage';

interface TracksProps {
  tracks: Track[];
  currentTrackId?: number;
  onPlayTrack: (id: number) => void;
  onScanLocalFiles: (path: string) => Promise<void>;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: number, trackId: number) => void;
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

interface TrackRowProps {
  track: Track;
  isActive: boolean;
  onPlayTrack: (id: number) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: number, trackId: number) => void;
}

const TrackRow = memo(({ track, isActive, onPlayTrack, playlists, onAddToPlaylist }: TrackRowProps) => {
  const theme = useTheme();
  const vinyl = theme.vinyl;
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadLyrics = async () => {
    handleMenuClose();
    try {
      await downloadAndEmbedLyrics(
        track.id,
        track.artist,
        track.title,
        track.file_path,
        track.album,
        track.duration
      );
    } catch (err) {
      console.error('Failed to download lyrics:', err);
    }
  };

  return (
    <Box
      onClick={() => onPlayTrack(track.id)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1,
        pr: 2,
        borderRadius: `${vinyl.radius.row}px`,
        cursor: 'pointer',
        transition: 'background-color 200ms',
        bgcolor: isActive ? vinyl.trackActive : 'transparent',
        '&:hover': {
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          '& .more-btn': { opacity: 1 },
        },
        height: 52,
        gap: 2,
      }}
    >
      <CoverArtImage src={track.cover_art_data_url} size={36} borderRadius="4px" />
      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography 
          sx={{ 
            fontWeight: 600, 
            fontSize: 14,
            color: isActive ? `var(--adw-accent, ${theme.palette.primary.main})` : 'text.primary',
          }} 
          noWrap
        >
          {track.title}
        </Typography>
        <Typography sx={{ fontWeight: 400, fontSize: 12, color: 'text.secondary' }} noWrap>
          {track.artist} • {track.album}
        </Typography>
      </Box>
      
      <IconButton 
        className="more-btn"
        size="small" 
        aria-label={`More options for ${track.title}`}
        onClick={handleMenuOpen}
        sx={{ opacity: 0, transition: 'opacity 200ms', color: 'text.secondary' }}
      >
        <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleDownloadLyrics}>
          <CloudDownloadRoundedIcon sx={{ mr: 1.5, fontSize: 18, color: 'primary.main' }} />
          Download Synced Lyrics
        </MenuItem>
        {playlists.length > 0 && [
          <Divider key="div" />,
          ...playlists.map((pl) => (
            <MenuItem
              key={pl.id}
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist(pl.id, track.id);
                handleMenuClose();
              }}
            >
              <PlaylistAddRoundedIcon sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} />
              Add to "{pl.name}"
            </MenuItem>
          )),
        ]}
      </Menu>

      <Typography sx={{ color: 'text.secondary', fontSize: 12, minWidth: 40, textAlign: 'right' }}>
        {formatDuration(track.duration)}
      </Typography>
    </Box>
  );
});

export const Tracks = ({ tracks, currentTrackId, onPlayTrack, onScanLocalFiles, playlists, onAddToPlaylist }: TracksProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [scanPath, setScanPath] = useState('');
  const [sortOption, setSortOption] = useSort('athu_sort_tracks');

  const handleBrowse = async () => {
    const path = await openDirectory();
    if (path) setScanPath(path);
  };

  const sortedTracks = useMemo(() => sortItems(tracks, sortOption), [tracks, sortOption]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section (Static) */}
      <Box sx={{ flexShrink: 0 }}>
        {/* Scan Card */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box 
            sx={{ 
              bgcolor: isDark ? '#2A2A2A' : '#FFFFFF', 
              borderRadius: '10px', 
              p: '16px',
              border: isDark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.1)',
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5 }}>
              Scan local music folder
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box sx={{ flexGrow: 1 }}>
                <InputBase
                  placeholder="Folder path"
                  value={scanPath}
                  onChange={(e) => setScanPath(e.target.value)}
                  sx={{
                    width: '100%',
                    bgcolor: isDark ? '#1E1E1E' : '#FAFAFA',
                    color: 'text.primary',
                    borderRadius: '8px',
                    px: 2,
                    py: 1,
                    fontSize: 14,
                    border: '0.5px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleBrowse} 
                        edge="end"
                        size="small"
                        aria-label="Browse for music folder"
                        sx={{ color: 'primary.main' }}
                      >
                        <FolderOpenRoundedIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 1 }}>
                  Enter the absolute path to your music directory
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => void onScanLocalFiles(scanPath)}
                disabled={!scanPath.trim()}
                disableElevation
                sx={{
                  bgcolor: 'primary.main',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: 13,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                SCAN
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Tracks Header & Sort */}
        <Box sx={{ px: 4, pb: 1, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 11 }}>
            All Tracks • {tracks.length}
          </Typography>
          <LibrarySort value={sortOption} onChange={setSortOption} />
        </Box>
      </Box>

      {/* Virtualized List */}
      <Box sx={{ flexGrow: 1, px: 2 }}>
        <Virtuoso
          style={{ height: '100%' }}
          data={sortedTracks}
          itemContent={(_index, track) => (
            <TrackRow 
              track={track} 
              isActive={track.id === currentTrackId} 
              onPlayTrack={onPlayTrack}
              playlists={playlists}
              onAddToPlaylist={onAddToPlaylist}
            />
          )}
        />
      </Box>
    </Box>
  );
};
