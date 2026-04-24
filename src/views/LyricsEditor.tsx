import { useState, useEffect } from 'react';
import { 
  Box, IconButton, Typography, Button, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Snackbar, List, ListItem
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { invoke } from '@tauri-apps/api/core';

interface LyricsLine {
  time: number | null;
  text: string;
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

export const LyricsEditor = ({ currentTrack, playbackPosMs, onBack, onSeek }: LyricsEditorProps) => {
  const [lyricsLines, setLyricsLines] = useState<LyricsLine[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTitle, setSearchTitle] = useState(currentTrack?.title || '');
  const [searchArtist, setSearchArtist] = useState(currentTrack?.artist || '');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false, message: ''
  });

  useEffect(() => {
    if (currentTrack) {
      setSearchTitle(currentTrack.title);
      setSearchArtist(currentTrack.artist);
    }
  }, [currentTrack]);

  const handleDownload = async (title: string, artist: string) => {
    try {
      const result: string = await invoke('fetch_lyrics', { title, artist });
      setLyricsLines(parseLRC(result));
      setSnackbar({ open: true, message: 'Lyrics fetched' });
    } catch (err) {
      setSnackbar({ open: true, message: err as string });
    } finally {
      setSearchOpen(false);
    }
  };

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
    setSnackbar({ open: true, message: 'Saved (Console log)' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', bgcolor: 'background.default' }}>
      <Box sx={{ height: 50, display: 'flex', alignItems: 'center', px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton size="small" onClick={onBack}><ChevronLeftRoundedIcon /></IconButton>
        <Typography sx={{ ml: 2, fontWeight: 700, fontSize: 14 }}>Lyrics Editor</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button size="small" startIcon={<SaveRoundedIcon />} onClick={handleSave} variant="contained" disableElevation sx={{ borderRadius: 2, textTransform: 'none' }}>
          Save
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            TIME: {formatTime(playbackPosMs)}
          </Typography>
          <Button size="small" startIcon={<ManageSearchRoundedIcon />} onClick={() => setSearchOpen(true)} sx={{ textTransform: 'none' }}>
            Search
          </Button>
        </Box>

        <List sx={{ width: '100%' }}>
          {lyricsLines.map((line, idx) => (
            <ListItem 
              key={idx} 
              sx={{ 
                borderRadius: 2, 
                mb: 0.5,
                bgcolor: playbackPosMs >= (line.time || 0) && playbackPosMs < (lyricsLines[idx+1]?.time || Infinity) 
                  ? 'action.selected' : 'transparent'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <Typography 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: 12, 
                    minWidth: 80, 
                    color: line.time !== null ? 'primary.main' : 'text.disabled',
                    cursor: line.time !== null ? 'pointer' : 'default'
                  }}
                  onClick={() => line.time !== null && onSeek(line.time)}
                >
                  {line.time !== null ? `[${formatTime(line.time)}]` : '[--:--.--]'}
                </Typography>
                
                <TextField 
                  fullWidth 
                  variant="standard" 
                  value={line.text} 
                  onChange={(e) => {
                    const newLines = [...lyricsLines];
                    newLines[idx].text = e.target.value;
                    setLyricsLines(newLines);
                  }}
                />

                <Tooltip title="Stamp">
                  <IconButton size="small" onClick={() => handleStamp(idx)}>
                    <TimerRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItem>
          ))}
          <Button 
            fullWidth 
            startIcon={<AddRoundedIcon />} 
            onClick={() => setLyricsLines([...lyricsLines, { time: null, text: '' }])}
            sx={{ mt: 2, border: '1px dashed', borderColor: 'divider' }}
          >
            Add Line
          </Button>
        </List>
      </Box>

      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)}>
        <DialogTitle>Search</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} margin="normal" />
          <TextField fullWidth label="Artist" value={searchArtist} onChange={(e) => setSearchArtist(e.target.value)} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchOpen(false)}>Cancel</Button>
          <Button onClick={() => handleDownload(searchTitle, searchArtist)} variant="contained">Search</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
};
