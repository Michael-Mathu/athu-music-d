import { useState, useEffect } from 'react';
import { 
  Box, IconButton, Typography, Button, TextField, 
  Tooltip, Snackbar, List, ListItem, ListItemButton,
  CircularProgress, Alert, Skeleton
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchIcon from '@mui/icons-material/Search';
import LyricsIcon from '@mui/icons-material/Lyrics';
import DownloadIcon from '@mui/icons-material/Download';
import { useTheme } from '../lib/ThemeContext';

interface LyricsLine {
  time: number | null;
  text: string;
}

interface SearchResult {
  id: string;
  artist: string;
  title: string;
  syncedLyrics: string;
  plainLyrics: string;
  matchConfidence: number;
  source: string;
}

interface LyricsEditorProps {
  currentTrack: { id: number, title: string, artist: string, file_path: string } | null;
  playbackPosMs: number;
  onBack: () => void;
  onSeek: (posMs: number) => void;
}

const parseLRC = (lrc: string): LyricsLine[] => {
  const lines: LyricsLine[] = [];
  const rawLines = lrc.split('\n');
  
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Match [mm:ss.xx]
    const match = trimmed.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const mins = parseInt(match[1]);
      const secs = parseInt(match[2]);
      const msPart = match[3];
      const ms = parseInt(msPart.padEnd(3, '0').slice(0, 3));
      const time = (mins * 60 + secs) * 1000 + ms;
      lines.push({ time, text: match[4].trim() });
    } else if (!trimmed.startsWith('[')) {
      lines.push({ time: null, text: trimmed });
    }
  }
  return lines;
};

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const mm = Math.floor((ms % 1000) / 10);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${mm.toString().padStart(2, '0')}`;
};

const LyricsSearchSection = ({ currentTrack, onApplyLyrics }: { currentTrack: any, onApplyLyrics: (lyrics: string) => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentTrack) {
      setQuery(`${currentTrack.title} ${currentTrack.artist}`);
    }
  }, [currentTrack]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      const mappedResults = data.map((item: any) => ({
        id: item.id.toString(),
        artist: item.artistName,
        title: item.trackName,
        syncedLyrics: item.syncedLyrics || '',
        plainLyrics: item.plainLyrics || '',
        matchConfidence: Math.round((item.score || 0) * 100),
        source: 'LRCLIB',
      }));
      setResults(mappedResults);
      if (mappedResults.length === 0) {
        setError('No lyrics found for this search.');
      }
    } catch (err) {
      setError('Could not connect to lyrics service. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Download Lyrics
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Artist – Title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '& fieldset': { border: 'none' },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
        </Button>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: '10px', bgcolor: 'action.hover', border: 'none', '& .MuiAlert-icon': { color: 'primary.main' } }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2].map((i) => (
            <Skeleton key={i} variant="rectangular" height={64} sx={{ borderRadius: '10px', opacity: 0.1 }} />
          ))}
        </Box>
      ) : (
        <List disablePadding>
          {results.slice(0, 5).map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => onApplyLyrics(item.syncedLyrics || item.plainLyrics)}
              sx={{
                borderRadius: '10px',
                mb: 1,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1,
                px: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'background.paper',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                },
              }}
            >
              <Box sx={{ textAlign: 'center', minWidth: 32 }}>
                <LyricsIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, fontSize: 10, mt: 0.2 }}>
                  {item.matchConfidence}%
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {item.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                  {item.artist} · {item.syncedLyrics ? 'Synced' : 'Plain'}
                </Typography>
              </Box>

              <DownloadIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
};

export const LyricsEditor = ({ currentTrack, playbackPosMs, onBack, onSeek }: LyricsEditorProps) => {
  const [lyricsLines, setLyricsLines] = useState<LyricsLine[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false, message: ''
  });

  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleStamp = (index: number) => {
    setLyricsLines(prev => prev.map((line, i) => 
      i === index ? { ...line, time: playbackPosMs } : line
    ));
  };

  const handleSave = () => {
    const lrcContent = lyricsLines.map(line => {
      if (line.time === null) return line.text;
      return `[${formatTime(line.time)}] ${line.text}`;
    }).join('\n');
    console.log("Saving lyrics:", lrcContent);
    setSnackbar({ open: true, message: 'Saved to console' });
  };

  const applyLyrics = (lrc: string) => {
    setLyricsLines(parseLRC(lrc));
    setShowSearch(false);
    setSnackbar({ open: true, message: 'Lyrics applied to editor' });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%', 
      bgcolor: 'background.default',
      color: 'text.primary'
    }}>
      {/* Header */}
      <Box sx={{ 
        height: 56, 
        display: 'flex', 
        alignItems: 'center', 
        px: 2, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 10
      }}>
        <IconButton size="small" onClick={onBack} sx={{ mr: 1 }}><ChevronLeftRoundedIcon /></IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Lyrics Editor</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<SaveRoundedIcon />} 
          onClick={handleSave} 
          disableElevation 
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          Save
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
        
        {/* Search Toggle / Section */}
        {!showSearch ? (
          <Box sx={{ mb: 4, p: 2, borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>Missing lyrics?</Typography>
              <Typography variant="caption" color="text.secondary">Search and download from online services</Typography>
            </Box>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<ManageSearchRoundedIcon />} 
              onClick={() => setShowSearch(true)}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              Search Online
            </Button>
          </Box>
        ) : (
          <Box sx={{ mb: 4, position: 'relative' }}>
            <Button 
              size="small" 
              onClick={() => setShowSearch(false)}
              sx={{ position: 'absolute', top: -30, right: 0, textTransform: 'none', fontSize: 12 }}
            >
              Close Search
            </Button>
            <LyricsSearchSection currentTrack={currentTrack} onApplyLyrics={applyLyrics} />
          </Box>
        )}

        {/* Editor Area */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Editor Area
          </Typography>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, fontFamily: 'monospace' }}>
            {formatTime(playbackPosMs)}
          </Typography>
        </Box>

        <List sx={{ width: '100%', p: 0 }}>
          {lyricsLines.map((line, idx) => (
            <ListItem 
              key={idx} 
              disablePadding
              sx={{ 
                borderRadius: '10px', 
                mb: 0.5,
                bgcolor: playbackPosMs >= (line.time || 0) && playbackPosMs < (lyricsLines[idx+1]?.time || Infinity) 
                  ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') : 'transparent',
                transition: 'background-color 0.2s'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, py: 0.5, px: 1 }}>
                <Typography 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: 12, 
                    minWidth: 85, 
                    color: line.time !== null ? 'primary.main' : 'text.disabled',
                    cursor: line.time !== null ? 'pointer' : 'default',
                    fontWeight: line.time !== null ? 700 : 400
                  }}
                  onClick={() => line.time !== null && onSeek(line.time)}
                >
                  {line.time !== null ? `[${formatTime(line.time)}]` : '[--:--.--]'}
                </Typography>
                
                <TextField 
                  fullWidth 
                  variant="standard" 
                  placeholder="Lyric line..."
                  value={line.text} 
                  InputProps={{ disableUnderline: true }}
                  onChange={(e) => {
                    const newLines = [...lyricsLines];
                    newLines[idx].text = e.target.value;
                    setLyricsLines(newLines);
                  }}
                  sx={{ 
                    '& input': { 
                      fontSize: 14, 
                      py: 1,
                      fontWeight: playbackPosMs >= (line.time || 0) && playbackPosMs < (lyricsLines[idx+1]?.time || Infinity) ? 600 : 400
                    } 
                  }}
                />

                <Tooltip title="Stamp current time">
                  <IconButton size="small" onClick={() => handleStamp(idx)} sx={{ color: 'text.secondary' }}>
                    <TimerRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItem>
          ))}
          
          <Button 
            fullWidth 
            startIcon={<AddRoundedIcon />} 
            onClick={() => setLyricsLines([...lyricsLines, { time: null, text: '' }])}
            sx={{ 
              mt: 2, 
              py: 1.5,
              borderRadius: '10px',
              border: '1px dashed', 
              borderColor: 'divider',
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'transparent' }
            }}
          >
            Add New Line
          </Button>
        </List>
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        message={snackbar.message} 
      />
    </Box>
  );
};
