import { Button, Stack } from '@mui/material';
import { Database } from 'lucide-react';
import { filledButtonStyle, outlinedButtonStyle } from '../../../styles/commonStyles';

interface ActionButtonsProps {
  onEvaluateAll: () => void;
  onScanDatabase: () => void;
}

export const ActionButtons = ({ onEvaluateAll, onScanDatabase }: ActionButtonsProps) => (
  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
    <Button variant="contained" onClick={onEvaluateAll} sx={filledButtonStyle}>
      Evaluate All Applicants
    </Button>
    <Button
      variant="outlined"
      startIcon={<Database size={20} />}
      onClick={onScanDatabase}
      sx={outlinedButtonStyle}
    >
      Scan Database for Candidates
    </Button>
  </Stack>
);