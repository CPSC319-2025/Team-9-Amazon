import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useState, useEffect } from "react";
import { colors, filledButtonStyle } from "../../../styles/commonStyles";

interface EditCriteriaNameDialogProps {
  open: boolean;
  name: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export const EditCriteriaNameDialog = ({
  open,
  name,
  onClose,
  onSave,
}: EditCriteriaNameDialogProps) => {
  const [criteriaName, setCriteriaName] = useState(name);

  useEffect(() => {
    setCriteriaName(name);
  }, [name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(criteriaName);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Criteria Name</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Criteria Name"
              value={criteriaName}
              onChange={(e) => setCriteriaName(e.target.value)}
              required
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={onClose}
            sx={{
              color: colors.gray2,
              "&:hover": {
                backgroundColor: colors.gray1,
              },
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" sx={filledButtonStyle}>
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
