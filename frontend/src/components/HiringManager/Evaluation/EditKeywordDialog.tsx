import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Keyword } from "../../../types/criteria";
import { colors } from "../../../styles/commonStyles";

interface EditKeywordDialogProps {
  open: boolean;
  keyword: Keyword | null;
  groupId: string;
  onClose: () => void;
  onSave: (keyword: Keyword, isNew: boolean) => void;
}

export const EditKeywordDialog = ({
  open,
  keyword,
  onClose,
  onSave,
}: EditKeywordDialogProps) => {
  const [name, setName] = useState(keyword?.name || "");
  const [pointsPerMatch, setPointsPerMatch] = useState(
    keyword?.pointsPerMatch.toString() || "1"
  );
  const [maxPoints, setMaxPoints] = useState(
    keyword?.maxPoints.toString() || "5"
  );
  const [errors, setErrors] = useState({
    name: "",
    pointsPerMatch: "",
    maxPoints: "",
  });

  useEffect(() => {
    if (open) {
      setName(keyword?.name || "");
      setPointsPerMatch(keyword?.pointsPerMatch.toString() || "1");
      setMaxPoints(keyword?.maxPoints.toString() || "5");
      setErrors({ name: "", pointsPerMatch: "", maxPoints: "" });
    }
  }, [open, keyword]);

  const validateFields = () => {
    const newErrors = { name: "", pointsPerMatch: "", maxPoints: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Keyword name is required";
      isValid = false;
    }

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
    if (validateFields()) {
      onSave(
        {
          name,
          pointsPerMatch: parseInt(pointsPerMatch),
          maxPoints: parseInt(maxPoints),
        },
        !keyword // isNew flag
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: colors.black1 }}>
        {keyword ? `Edit Keyword: ${keyword.name}` : "Add New Keyword"}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Keyword Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mt: 2 }}
        />
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
          {keyword ? "Save Changes" : "Add Keyword"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
