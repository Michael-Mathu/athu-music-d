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

  const artistAlbums = useMemo(() => albums.filter(a => a.artist_id === artist.id), [artist.id, albums]);
  const artistTracks = useMemo(() => tracks.filter(t => t.artist_id === artist.id), [artist.id, tracks]);

  return (
    <Box sx={{ width: '100%', pb: 10, px: 3, pt: 2 }}>
      <Box sx={{ mb: 2 }}>
        <IconButton onClick={onBack} sx={{ color: theme.palette.text.primary }}>
          <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 6 }}>
        <Avatar 
          src={data?.image_url || undefined} 
          sx={{ width: 180, height: 180, mb: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', fontSize: 64 }} 
        />
        <Typography sx={{ fontWeight: 700, fontSize: 28, mb: 1 }}>{artist.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: 14 }}>
            {artist.album_count || 0} Albums • {artist.track_count || 0} Tracks
          </Typography>
          {data?.source && (
            <Chip 
              label={`via ${data.source}`} 
              size="small" 
              sx={{ height: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', bgcolor: 'action.selected' }} 
            />
          )}
        </Box>
      </Box>
      
      <Box sx={{ mb: 6 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>About</Typography>
        <Box sx={{ 
          bgcolor: isDark ? '#2A2A2A' : '#FFFFFF', 
          borderRadius: '10px', 
          p: '16px', 
          border: isDark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.08)', 
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)' 
        }}>
          {loading ? (
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Loading biography...</Typography>
          ) : data?.bio ? (
            <>
              <Typography 
                sx={{ fontSize: 14, lineHeight: 1.7, color: 'text.primary' }} 
                dangerouslySetInnerHTML={{ __html: data.bio }} 
              />
              {data.details?.formed && (
                <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
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
        {artistAlbums.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.secondary', mb: 1 }}>Albums</Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, px: 1 }}>
              {artistAlbums.map(album => (
                <Box key={album.id} sx={{ width: 120, flexShrink: 0 }}>
                  <Avatar variant="square" src={album.cover_art_data_url || undefined} sx={{ width: 120, height: 120, borderRadius: '8px', mb: 1 }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>{album.title}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{album.year}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.secondary', mb: 1 }}>All Tracks</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {artistTracks.map((track) => (
              <Box key={track.id} onClick={() => onPlayTrack(track.id)} sx={{ display: 'flex', alignItems: 'center', p: 1, pr: 2, borderRadius: `${vinyl.radius.row}px`, cursor: 'pointer', transition: 'background-color 200ms', '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', '& .more-btn': { opacity: 1 } }, height: 52, gap: 2 }}>
                <Avatar variant="square" src={track.cover_art_data_url || undefined} sx={{ width: 36, height: 36, borderRadius: '4px' }} />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>{track.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>{track.album}</Typography>
                </Box>
                <IconButton className="more-btn" size="small" sx={{ opacity: 0, transition: 'opacity 200ms', color: 'text.secondary' }}>
                  <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>{formatDuration(track.duration)}</Typography>
              </Box>
            ))}
          </Box>
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
        transition: 'background-color 200ms',
        '&:hover': {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        },
        borderRadius: '4px',
        gap: '16px',
      }}
    >
      <Avatar
        src={data?.image_url || undefined}
        sx={{
          width: 44,
          height: 44,
          bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          color: 'text.secondary',
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
          {artist.name}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
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
  
  const detailArtist = useMemo(() => detailId ? artists.find(a => a.id === detailId) : null, [detailId, artists]);

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
    <Box sx={{ width: '100%', pb: 10 }}>
      {/* Header & Sort */}
      <Box sx={{ px: 4, pt: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 11 }}>
          All Artists • {artists.length}
        </Typography>
        <LibrarySort value={sortOption} onChange={setSortOption} />
      </Box>

      <Box sx={{ py: '8px' }}>
        {sortedArtists.map((artist) => (
          <ArtistRow 
            key={artist.id} 
            artist={artist} 
            onClick={() => onSelectArtist(artist.id)} 
          />
        ))}
      </Box>
    </Box>
  );
};
