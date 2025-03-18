import { Button, Stack } from "@mui/material";
import { Database } from "lucide-react";
import { outlinedButtonStyle } from "../../../styles/commonStyles";

interface ActionButtonsProps {
  onScanDatabase: () => void;
}

export const ActionButtons = ({ onScanDatabase }: ActionButtonsProps) => (
  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
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
