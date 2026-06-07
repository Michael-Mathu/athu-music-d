import { useState, useMemo, useEffect, useRef } from 'react';
import { Box, Typography, InputBase, IconButton, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import AlbumRoundedIcon from '@mui/icons-material/AlbumRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { CoverArtImage } from './CoverArtImage';
import type { Track, Album, Artist } from '../types/library';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  onPlayTrack: (id: number) => void;
  onSelectAlbum: (id: number) => void;
  onSelectArtist: (id: number) => void;
}

export const SearchOverlay = ({
  open,
  onClose,
  tracks,
  albums,
  artists,
  onPlayTrack,
  onSelectAlbum,
  onSelectArtist,
}: SearchOverlayProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const q = query.toLowerCase().trim();

  const matchedTracks = useMemo(() =>
    q.length < 2 ? [] : tracks.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q)
    ).slice(0, 8),
    [q, tracks]
  );

  const matchedAlbums = useMemo(() =>
    q.length < 2 ? [] : albums.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      a.artist.toLowerCase().includes(q)
    ).slice(0, 5),
    [q, albums]
  );

  const matchedArtists = useMemo(() =>
    q.length < 2 ? [] : artists.filter((a) =>
      a.name.toLowerCase().includes(q)
    ).slice(0, 5),
    [q, artists]
  );

  const hasResults = matchedTracks.length > 0 || matchedAlbums.length > 0 || matchedArtists.length > 0;
  const showEmpty = q.length >= 2 && !hasResults;

  if (!open) return null;

  return (
    <Fade in={open}>
      <Box
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1200,
          bgcolor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 6,
          backdropFilter: 'blur(4px)',
        }}
      >
        <Box sx={{
          width: '90%',
          maxWidth: 560,
          bgcolor: isDark ? '#2A2A2A' : '#FFFFFF',
          borderRadius: '14px',
          border: isDark ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(0,0,0,0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          {/* Search Input */}
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, borderBottom: `0.5px solid ${theme.palette.divider}` }}>
            <SearchRoundedIcon sx={{ color: 'text.secondary', mr: 1.5, fontSize: 20 }} />
            <InputBase
              inputRef={inputRef}
              fullWidth
              placeholder="Search tracks, albums, artists…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ fontSize: 15, fontWeight: 500 }}
            />
            {query && (
              <IconButton size="small" onClick={() => setQuery('')} aria-label="Clear search">
                <CloseRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            <IconButton size="small" onClick={onClose} aria-label="Close search" sx={{ ml: 0.5 }}>
              <CloseRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </IconButton>
          </Box>

          {/* Results */}
          <Box sx={{ maxHeight: 480, overflowY: 'auto', py: 1 }}>
            {q.length < 2 && (
              <Typography sx={{ px: 3, py: 3, color: 'text.secondary', fontSize: 13, textAlign: 'center' }}>
                Type at least 2 characters to search
              </Typography>
            )}

            {showEmpty && (
              <Typography sx={{ px: 3, py: 3, color: 'text.secondary', fontSize: 13, textAlign: 'center' }}>
                No results for "{query}"
              </Typography>
            )}

            {/* Tracks */}
            {matchedTracks.length > 0 && (
              <>
                <SectionLabel icon={<MusicNoteRoundedIcon sx={{ fontSize: 12 }} />} label="Tracks" />
                {matchedTracks.map((track) => (
                  <Box
                    key={track.id}
                    onClick={() => { onPlayTrack(track.id); onClose(); }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 0.75,
                      cursor: 'pointer', transition: 'background-color 150ms',
                      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    <CoverArtImage src={track.cover_art_data_url} size={36} borderRadius="4px" />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }} noWrap>{track.title}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }} noWrap>{track.artist} · {track.album}</Typography>
                    </Box>
                  </Box>
                ))}
              </>
            )}

            {/* Albums */}
            {matchedAlbums.length > 0 && (
              <>
                <SectionLabel icon={<AlbumRoundedIcon sx={{ fontSize: 12 }} />} label="Albums" />
                {matchedAlbums.map((album) => (
                  <Box
                    key={album.id}
                    onClick={() => { onSelectAlbum(album.id); onClose(); }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 0.75,
                      cursor: 'pointer', transition: 'background-color 150ms',
                      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    <CoverArtImage src={album.cover_art_data_url} size={36} borderRadius="6px" />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }} noWrap>{album.title}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }} noWrap>{album.artist}</Typography>
                    </Box>
                  </Box>
                ))}
              </>
            )}

            {/* Artists */}
            {matchedArtists.length > 0 && (
              <>
                <SectionLabel icon={<PersonRoundedIcon sx={{ fontSize: 12 }} />} label="Artists" />
                {matchedArtists.map((artist) => (
                  <Box
                    key={artist.id}
                    onClick={() => { onSelectArtist(artist.id); onClose(); }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 0.75,
                      cursor: 'pointer', transition: 'background-color 150ms',
                      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <PersonRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }} noWrap>{artist.name}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }} noWrap>
                        {artist.album_count} albums · {artist.track_count} tracks
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

const SectionLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 2, py: 0.5, mt: 1 }}>
    <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
    <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </Typography>
  </Box>
);
