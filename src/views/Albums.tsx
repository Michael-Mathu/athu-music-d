import { Box, Typography, Avatar, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Album, Track } from '../types/library';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useMemo } from 'react';
import { useSort } from '../hooks/useSort';
import { sortItems } from '../lib/utils/sorting';
import { LibrarySort } from '../components/LibrarySort';

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

interface AlbumDetailsProps {
  album: Album;
  tracks: Track[];
  onBack: () => void;
  onPlayTrack: (id: number) => void;
}

const AlbumDetailsInternal = ({ album, tracks, onBack, onPlayTrack }: AlbumDetailsProps) => {
  const theme = useTheme();
  const vinyl = theme.vinyl;
  const isDark = theme.palette.mode === 'dark';
  const albumTracks = useMemo(() => tracks.filter((t) => t.album_id === album.id), [album.id, tracks]);

  return (
    <Box sx={{ width: '100%', pb: 10, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', gap: 4, p: 4, alignItems: 'flex-start' }}>
        <IconButton onClick={onBack} sx={{ color: theme.palette.text.primary }}>
          <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Avatar
          variant="square"
          src={album.cover_art_data_url || "/src/assets/logo.png"}
          sx={{
            width: 200,
            height: 200,
            borderRadius: '12px',
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            flexShrink: 0,
            '& img': { objectFit: album.cover_art_data_url ? 'cover' : 'contain', p: album.cover_art_data_url ? 0 : 4 }
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', pt: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 1 }}>{album.title}</Typography>
          <Typography sx={{ fontWeight: 400, fontSize: 14, color: theme.palette.text.secondary, mb: 0.5 }}>{album.artist}</Typography>
          <Typography sx={{ fontWeight: 400, fontSize: 12, color: theme.palette.text.secondary }}>
            {albumTracks.length} tracks • {album.year || 'Unknown year'}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ px: 2, display: 'flex', flexDirection: 'column' }}>
        {albumTracks.map((track, index) => (
          <Box
            key={track.id}
            onClick={() => onPlayTrack(track.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              pr: 2,
              borderRadius: `${vinyl.radius.row}px`,
              cursor: 'pointer',
              transition: 'background-color 200ms',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                '& .more-btn': { opacity: 1 }
              },
              height: 52,
              gap: 2,
            }}
          >
            <Typography sx={{ width: 30, textAlign: 'center', color: theme.palette.text.secondary, fontSize: 13, fontWeight: 500 }}>
              {index + 1}
            </Typography>
            <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>{track.title}</Typography>
              <Typography sx={{ fontWeight: 400, fontSize: 12, color: theme.palette.text.secondary }} noWrap>{track.artist}</Typography>
            </Box>
            <IconButton className="more-btn" size="small" onClick={(e) => e.stopPropagation()} sx={{ opacity: 0, transition: 'opacity 200ms', color: theme.palette.text.secondary }}>
              <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12, minWidth: 40, textAlign: 'right' }}>
              {formatDuration(track.duration)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface AlbumsProps {
  albums: Album[];
  detailId?: number | null;
  tracks: Track[];
  onSelectAlbum: (id: number) => void;
  onBack: () => void;
  onPlayTrack: (id: number) => void;
}

export const Albums = ({ albums, detailId, tracks, onSelectAlbum, onBack, onPlayTrack }: AlbumsProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [sortOption, setSortOption] = useSort('athu_sort_albums');

  const detailAlbum = useMemo(() => 
    detailId ? albums.find(a => a.id === detailId) : null
  , [detailId, albums]);

  const sortedAlbums = useMemo(() => sortItems(albums, sortOption), [albums, sortOption]);

  if (detailAlbum) {
    return (
      <AlbumDetailsInternal 
        album={detailAlbum} 
        tracks={tracks} 
        onBack={onBack} 
        onPlayTrack={onPlayTrack} 
      />
    );
  }

  return (
    <Box sx={{ width: '100%', pb: 10 }}>
      {/* Header & Sort */}
      <Box sx={{ px: 4, pt: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 11 }}>
          All Albums • {albums.length}
        </Typography>
        <LibrarySort value={sortOption} onChange={setSortOption} />
      </Box>

      <Box 
        sx={{ 
          width: '100%', 
          p: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '16px',
        }}
      >
        {sortedAlbums.map((album) => (
          <Box
            key={album.id}
            onClick={() => onSelectAlbum(album.id)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 200ms ease',
              '&:hover': {
                transform: 'scale(1.03)',
              }
            }}
          >
            <Avatar
              variant="square"
              src={album.cover_art_data_url || "/src/assets/logo.png"}
              sx={{
                width: '100%',
                height: 'auto',
                aspectRatio: '1 / 1',
                borderRadius: '10px',
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                mb: 1.5,
                '& img': { objectFit: album.cover_art_data_url ? 'cover' : 'contain', p: album.cover_art_data_url ? 0 : 2 }
              }}
            />
            <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2, mb: 0.5 }} noWrap>{album.title}</Typography>
            <Typography sx={{ fontWeight: 400, fontSize: 11, color: theme.palette.text.secondary }} noWrap>{album.artist}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
