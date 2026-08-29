import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import { SortOption } from '../hooks/useSort';

interface LibrarySortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  label?: string;
}

export const LibrarySort = ({ value, onChange, label }: LibrarySortProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {label && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </Typography>
      )}
      <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          disableUnderline
          IconComponent={() => <SortRoundedIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />}
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: 'text.secondary',
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              py: 0.5,
              pr: '24px !important',
              '&:focus': { backgroundColor: 'transparent' }
            }
          }}
          MenuProps={{
            slotProps: {
              paper: {
                sx: {
                  mt: 0.5,
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                }
              }
            }
          }}
        >
          <MenuItem value="name_asc" sx={{ fontSize: 13, fontWeight: 500 }}>Name A–Z</MenuItem>
          <MenuItem value="name_desc" sx={{ fontSize: 13, fontWeight: 500 }}>Name Z–A</MenuItem>
          <MenuItem value="date_desc" sx={{ fontSize: 13, fontWeight: 500 }}>Newest First</MenuItem>
          <MenuItem value="date_asc" sx={{ fontSize: 13, fontWeight: 500 }}>Oldest First</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
