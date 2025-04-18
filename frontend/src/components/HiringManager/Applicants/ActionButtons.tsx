import { Button, CircularProgress, Stack } from "@mui/material";
import { Database } from "lucide-react";
import { outlinedButtonStyle } from "../../../styles/commonStyles";

interface ActionButtonsProps {
  onScanDatabase: () => void;
}

interface ActionButtonsProps {
  onScanDatabase: () => void;
  isScanning: boolean;
}

export const ActionButtons = ({
  onScanDatabase,
  isScanning,
}: ActionButtonsProps) => (
  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
    <Button
      variant="outlined"
      startIcon={
        isScanning ? <CircularProgress size={20} /> : <Database size={20} />
      }
      onClick={onScanDatabase}
      disabled={isScanning}
      sx={{
        ...outlinedButtonStyle,
        opacity: isScanning ? 0.7 : 1,
      }}
    >
      {isScanning ? "Scanning Database..." : "Scan Database for Candidates"}
    </Button>
  </Stack>
);
