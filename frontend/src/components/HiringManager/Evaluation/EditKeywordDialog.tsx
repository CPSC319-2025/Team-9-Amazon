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
  const [pointsPerYearOfExperience, setPointsPerYearOfExperience] = useState(
    keyword?.pointsPerYearOfExperience.toString() || "1"
  );
  const [maxPoints, setMaxPoints] = useState(
    keyword?.maxPoints.toString() || "5"
  );
  const [errors, setErrors] = useState({
    name: "",
    pointsPerYearOfExperience: "",
    maxPoints: "",
  });

  useEffect(() => {
    if (open) {
      setName(keyword?.name || "");
      setPointsPerYearOfExperience(
        keyword?.pointsPerYearOfExperience.toString() || "1"
      );
      setMaxPoints(keyword?.maxPoints.toString() || "5");
      setErrors({ name: "", pointsPerYearOfExperience: "", maxPoints: "" });
    }
  }, [open, keyword]);

  const validateFields = () => {
    const newErrors = {
      name: "",
      pointsPerYearOfExperience: "",
      maxPoints: "",
    };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Keyword name is required";
      isValid = false;
    }

    const ppm = parseInt(pointsPerYearOfExperience);
    const mp = parseInt(maxPoints);

    if (isNaN(ppm) || ppm < 0) {
      newErrors.pointsPerYearOfExperience = "Must be a positive number";
      isValid = false;
    }

    if (isNaN(mp) || mp < 0) {
      newErrors.maxPoints = "Must be a positive number";
      isValid = false;
    }

    if (ppm > mp) {
      newErrors.pointsPerYearOfExperience = "Cannot exceed max points";
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
          pointsPerYearOfExperience: parseInt(pointsPerYearOfExperience),
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
          label="Points per Year of Experience"
          type="number"
          value={pointsPerYearOfExperience}
          onChange={(e) => setPointsPerYearOfExperience(e.target.value)}
          error={!!errors.pointsPerYearOfExperience}
          helperText={errors.pointsPerYearOfExperience}
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
