import * as React from 'react';
import { 
  Box, 
  InputLabel, 
  MenuItem, 
  FormControl, 
  Select, 
  Chip, 
  SelectChangeEvent 
} from '@mui/material';
import { colors } from '../../../styles/commonStyles';

const AVAILABLE_ROLES = ['Admin', 'Hiring Manager'];

interface MultiSelectChipFieldProps {
  selectedRoles?: string[];
  onChange?: (selectedRoles: string[]) => void;
}

export default function MultiSelectChipField({ 
  selectedRoles = [], 
  onChange 
}: MultiSelectChipFieldProps) {
  const handleChange = (event: SelectChangeEvent<typeof selectedRoles>) => {
    const value = event.target.value as string[];
    onChange?.(value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <FormControl variant="standard" fullWidth>
        <InputLabel id="role-select-label">Role</InputLabel>
        <Select
          labelId="role-select-label"
          id="role-select"
          multiple
          fullWidth
          value={selectedRoles}
          onChange={handleChange}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pt: 1 }}>
              {selected.map((value) => (
                <Chip 
                  key={value} 
                  label={value} 
                  size="small"
                //   onDelete={() => onChange?.(selected.filter((role) => role !== value))}
                />
              ))}
            </Box>
          )}
        >
          {AVAILABLE_ROLES.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}