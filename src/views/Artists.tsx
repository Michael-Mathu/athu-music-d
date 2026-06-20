import { Box, Typography, Avatar, IconButton, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Artist, Album, Track } from '../types/library';
import { useArtistMetadata } from '../lib/metadataWaterfall';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useMemo } from 'react';
import { useSort } from '../hooks/useSort';
import { sortItems } from '../lib/utils/sorting';
import { LibrarySort } from '../components/LibrarySort';
import { Virtuoso } from 'react-virtuoso';

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

interface ArtistDetailsProps {
  artist: Artist;
  albums: Album[];
  tracks: Track[];
  onBack: () => void;
  onPlayTrack: (id: number) => void;
}

const ArtistDetailsInternal = ({ artist, albums, tracks, onBack, onPlayTrack }: ArtistDetailsProps) => {
  const theme = useTheme();
  const vinyl = theme.vinyl;
  const isDark = theme.palette.mode === 'dark';
  const { data, loading } = useArtistMetadata(artist.name);

  const artistAlbums = useMemo(() => albums.filter((a) => a.artist_id === artist.id), [artist.id, albums]);
  const artistTracks = useMemo(() => tracks.filter((t) => t.artist_id === artist.id), [artist.id, tracks]);

  return (
    <Box sx={{ width: '100%', pb: 10, px: 3, pt: 2 }}>
      <Box sx={{ mb: 2 }}>
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
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 6 }}>
        <Avatar
          src={data?.image_url || undefined}
          sx={{
            width: 180,
            height: 180,
            mb: 3,
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            fontSize: 64,
            borderRadius: '50%',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }}
        />
        <Typography sx={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', mb: 1 }}>{artist.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
            {artist.album_count || 0} Albums • {artist.track_count || 0} Tracks
          </Typography>
          {data?.source && (
            <Chip
              label={`via ${data.source}`}
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                bgcolor: 'action.selected',
                borderRadius: '10px',
              }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>About</Typography>
        <Box
          sx={{
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderRadius: '12px',
            p: 3,
            border: isDark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.08)',
            boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.04)',
          }}
        >
          {loading ? (
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Loading biography...</Typography>
          ) : data?.bio ? (
            <>
              <Typography sx={{ fontSize: 14, lineHeight: 1.7, color: 'text.primary' }}>
                {data.bio.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()}
              </Typography>
              {data.details?.formed && (
                <Typography sx={{ mt: 2, display: 'block', color: 'text.secondary', fontSize: 12 }}>
                  Formed: {data.details.formed}
                </Typography>
              )}
            </>
          ) : (
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>No biography available.</Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Discography</Typography>
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.secondary', mb: 1 }}>Albums</Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, px: 1, flexWrap: 'nowrap' }}>
            {artistAlbums.map((album) => (
              <Box key={album.id} sx={{ width: 120, flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    mb: 1,
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  <Box
                    component="img"
                    src={album.cover_art_data_url || undefined}
                    alt={album.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }} noWrap>
                  {album.title}
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.3 }}>{album.year}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.secondary', mb: 1 }}>All Tracks</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {artistTracks.map((track) => (
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
              <Avatar
                variant="square"
                src={track.cover_art_data_url || undefined}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: `${vinyl.radius.row}px`,
                  bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>
                  {track.title}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                  {track.album}
                </Typography>
              </Box>
              <IconButton
                className="more-btn"
                size="small"
                sx={{
                  opacity: 0,
                  transition: 'opacity 150ms',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
                }}
              >
                <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>{formatDuration(track.duration)}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

interface ArtistRowProps {
  artist: Artist;
  onClick: () => void;
}

const ArtistRow = ({ artist, onClick }: ArtistRowProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { data } = useArtistMetadata(artist.name);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 60,
        px: '16px',
        cursor: 'pointer',
        transition: 'background-color 150ms',
        '&:hover': {
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        },
        borderRadius: '8px',
        mx: '8px',
        gap: '14px',
      }}
    >
      <Avatar
        src={data?.image_url || undefined}
        sx={{
          width: 44,
          height: 44,
          bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          color: 'text.secondary',
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{artist.name}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 12, lineHeight: 1.3 }}>
          {artist.album_count || 0} Albums • {artist.track_count || 0} Tracks
        </Typography>
      </Box>
    </Box>
  );
};

interface ArtistsProps {
  artists: Artist[];
  detailId?: number | null;
  albums: Album[];
  tracks: Track[];
  onSelectArtist: (id: number) => void;
  onBack: () => void;
  onPlayTrack: (id: number) => void;
}

export const Artists = ({ artists, detailId, albums, tracks, onSelectArtist, onBack, onPlayTrack }: ArtistsProps) => {
  const [sortOption, setSortOption] = useSort('athu_sort_artists');

  const detailArtist = useMemo(() => (detailId ? artists.find((a) => a.id === detailId) : null), [detailId, artists]);

  const sortedArtists = useMemo(() => sortItems(artists, sortOption), [artists, sortOption]);

  if (detailArtist) {
    return (
      <ArtistDetailsInternal
        artist={detailArtist}
        albums={albums}
        tracks={tracks}
        onBack={onBack}
        onPlayTrack={onPlayTrack}
      />
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          px: 4,
          pt: 3,
          pb: 1,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          All Artists • {artists.length}
        </Typography>
        <LibrarySort value={sortOption} onChange={setSortOption} />
      </Box>

      <Box sx={{ flexGrow: 1, py: '8px', px: '4px' }}>
        <Virtuoso
          style={{ height: '100%' }}
          data={sortedArtists}
          itemContent={(_index, artist) => (
            <ArtistRow key={artist.id} artist={artist} onClick={() => onSelectArtist(artist.id)} />
          )}
        />
      </Box>
    </Box>
  );
};
