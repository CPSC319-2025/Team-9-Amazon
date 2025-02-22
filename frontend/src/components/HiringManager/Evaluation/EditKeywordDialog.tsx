import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { Keyword } from "../../../types/criteria.ts";
import { colors } from "../../../styles/commonStyles";

interface EditKeywordDialogProps {
  open: boolean;
  keyword: Keyword | null;
  onClose: () => void;
  onSave: (keyword: Keyword) => void;
}

export const EditKeywordDialog = ({
  open,
  keyword,
  onClose,
  onSave,
}: EditKeywordDialogProps) => {
  const [pointsPerMatch, setPointsPerMatch] = useState(
    keyword?.pointsPerMatch.toString() || ""
  );
  const [maxPoints, setMaxPoints] = useState(
    keyword?.maxPoints.toString() || ""
  );
  const [errors, setErrors] = useState({ pointsPerMatch: "", maxPoints: "" });

  const validateFields = () => {
    const newErrors = { pointsPerMatch: "", maxPoints: "" };
    let isValid = true;

    const ppm = parseInt(pointsPerMatch);
    const mp = parseInt(maxPoints);

    if (isNaN(ppm) || ppm < 0) {
      newErrors.pointsPerMatch = "Must be a positive number";
      isValid = false;
    }

    if (isNaN(mp) || mp < 0) {
      newErrors.maxPoints = "Must be a positive number";
      isValid = false;
    }

    if (ppm > mp) {
      newErrors.pointsPerMatch = "Cannot exceed max points";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (keyword && validateFields()) {
      onSave({
        ...keyword,
        pointsPerMatch: parseInt(pointsPerMatch),
        maxPoints: parseInt(maxPoints),
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: colors.black1 }}>
        Edit Keyword: {keyword?.name}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Points per Match"
          type="number"
          value={pointsPerMatch}
          onChange={(e) => setPointsPerMatch(e.target.value)}
          error={!!errors.pointsPerMatch}
          helperText={errors.pointsPerMatch}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Max Points"
          type="number"
          value={maxPoints}
          onChange={(e) => setMaxPoints(e.target.value)}
          error={!!errors.maxPoints}
          helperText={errors.maxPoints}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: colors.black1 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            bgcolor: colors.blue1,
            "&:hover": { bgcolor: `${colors.blue1}dd` },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
