import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Rule } from "../../../types/criteria";
import { colors } from "../../../styles/commonStyles";
import { useGetSkills } from "../../../queries/skill";
import Autocomplete from "@mui/material/Autocomplete";

interface EditRuleDialogProps {
  open: boolean;
  rule: Rule | null;
  onClose: () => void;
  onSave: (rule: Rule, isNew: boolean) => void;
}

export const EditRuleDialog = ({
  open,
  rule,
  onClose,
  onSave,
}: EditRuleDialogProps) => {
  const { data: skills, isLoading, error } = useGetSkills(); // Fetch skills
  const [skill, setSkill] = useState(rule?.skill || "");
  const [pointsPerYearOfExperience, setPointsPerYearOfExperience] = useState(
    rule?.pointsPerYearOfExperience.toString() || "1"
  );
  const [maxPoints, setMaxPoints] = useState(rule?.maxPoints.toString() || "5");
  const [errors, setErrors] = useState({
    skill: "",
    pointsPerYearOfExperience: "",
    maxPoints: "",
  });

  useEffect(() => {
    if (open) {
      setSkill(rule?.skill || "");
      setPointsPerYearOfExperience(
        rule?.pointsPerYearOfExperience.toString() || "1"
      );
      setMaxPoints(rule?.maxPoints.toString() || "5");
      setErrors({ skill: "", pointsPerYearOfExperience: "", maxPoints: "" });
    }
  }, [open, rule]);

  const validateFields = () => {
    const newErrors = {
      skill: "",
      pointsPerYearOfExperience: "",
      maxPoints: "",
    };
    let isValid = true;

    if (!skill.trim()) {
      newErrors.skill = "Skill is required";
      isValid = false;
    }

    const ppm = parseFloat(pointsPerYearOfExperience);
    const mp = parseFloat(maxPoints);

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
          skill,
          pointsPerYearOfExperience: parseFloat(pointsPerYearOfExperience),
          maxPoints: parseFloat(maxPoints),
        },
        !rule // isNew flag
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: colors.black1 }}>
        {rule ? `Edit Rule` : "Add New Rule"}
      </DialogTitle>
      <DialogContent>
        {/* Skill Searchable Dropdown */}
        {isLoading ? (
          <CircularProgress size={24} sx={{ mt: 2 }} />
        ) : error ? (
          <Typography color="error" sx={{ mt: 2 }}>
            Failed to load skills
          </Typography>
        ) : (
          <Autocomplete
            options={skills?.map((s) => s.name) || []}
            value={skill}
            onChange={(_, newValue) => setSkill(newValue || "")}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Skill"
                error={!!errors.skill}
                helperText={errors.skill}
                sx={{ mt: 2 }}
              />
            )}
            freeSolo={false} // Prevents users from entering custom values
          />
        )}

        {/* Points per Year */}
        <TextField
          fullWidth
          label="Points per Year of Experience"
          type="number"
          inputProps={{ step: "any" }}
          value={pointsPerYearOfExperience}
          onChange={(e) => setPointsPerYearOfExperience(e.target.value)}
          error={!!errors.pointsPerYearOfExperience}
          helperText={errors.pointsPerYearOfExperience}
          sx={{ mt: 2 }}
        />

        {/* Max Points */}
        <TextField
          fullWidth
          label="Max Points"
          type="number"
          inputProps={{ step: "any" }}
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
          {rule ? "Save Changes" : "Add Rule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
