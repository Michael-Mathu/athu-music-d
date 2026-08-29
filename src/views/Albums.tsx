import { Box, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Album, Track } from '../types/library';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useMemo } from 'react';
import { useSort } from '../hooks/useSort';
import { sortItems } from '../lib/utils/sorting';
import { LibrarySort } from '../components/LibrarySort';
import { CoverArtImage } from '../components/CoverArtImage';

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
      <Box sx={{ display: 'flex', gap: 3, p: 4, alignItems: 'flex-start' }}>
        <IconButton
          onClick={onBack}
          sx={{
            color: 'text.primary',
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Box
          sx={{
            width: 200,
            height: 200,
            borderRadius: '14px',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          }}
        >
          <Box
            component="img"
            src={album.cover_art_data_url || '/src/assets/logo.png'}
            alt={album.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: album.cover_art_data_url ? 'cover' : 'contain',
              p: album.cover_art_data_url ? 0 : 8,
              display: 'block',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', pt: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.01em', mb: 1 }}>{album.title}</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: 14, color: 'text.secondary', mb: 0.5 }}>{album.artist}</Typography>
          <Typography sx={{ fontWeight: 400, fontSize: 12, color: 'text.secondary' }}>
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
              transition: 'background-color 150ms',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                '& .more-btn': { opacity: 1 },
              },
              height: 52,
              gap: 2,
            }}
          >
            <Typography
              sx={{
                width: 30,
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {index + 1}
            </Typography>
            <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>
                {track.title}
              </Typography>
              <Typography sx={{ fontWeight: 400, fontSize: 12, color: 'text.secondary' }} noWrap>
                {track.artist}
              </Typography>
            </Box>
            <IconButton
              className="more-btn"
              size="small"
              onClick={(e) => e.stopPropagation()}
              sx={{
                opacity: 0,
                transition: 'opacity 150ms',
                color: 'text.secondary',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
              }}
            >
              <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography sx={{ color: 'text.secondary', fontSize: 12, minWidth: 40, textAlign: 'right' }}>
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
  const [sortOption, setSortOption] = useSort('athu_sort_albums');

  const detailAlbum = useMemo(() => (detailId ? albums.find((a) => a.id === detailId) : null), [detailId, albums]);

  const sortedAlbums = useMemo(() => sortItems(albums, sortOption), [albums, sortOption]);

  if (detailAlbum) {
    return (
      <AlbumDetailsInternal album={detailAlbum} tracks={tracks} onBack={onBack} onPlayTrack={onPlayTrack} />
    );
  }

  return (
    <Box sx={{ width: '100%', pb: 10 }}>
      <Box
        sx={{
          px: 4,
          pt: 3,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            color: 'text.secondary',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: 11,
          }}
        >
          All Albums • {albums.length}
        </Typography>
        <LibrarySort value={sortOption} onChange={setSortOption} />
      </Box>

      <Box
        sx={{
          width: '100%',
          p: 3,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '20px',
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
              transition: 'transform 300ms var(--spring, cubic-bezier(0.34, 1.56, 0.64, 1))',
              '&:hover': { transform: 'scale(1.03)' },
            }}
          >
            <Box
              sx={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: '12px',
                overflow: 'hidden',
                mb: 1.5,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                position: 'relative',
              }}
            >
              <CoverArtImage
                src={album.cover_art_data_url}
                size="100%"
                borderRadius="12px"
                shadow
              />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25, mb: 0.5 }} noWrap>
              {album.title}
            </Typography>
            <Typography sx={{ fontWeight: 400, fontSize: 12, color: 'text.secondary', lineHeight: 1.3 }} noWrap>
              {album.artist}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
