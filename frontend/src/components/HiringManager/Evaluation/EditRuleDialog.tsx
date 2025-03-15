import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Rule } from "../../../types/criteria";
import { colors } from "../../../styles/commonStyles";

interface EditRuleDialogProps {
  open: boolean;
  rule: Rule | null;
  groupId: string;
  onClose: () => void;
  onSave: (rule: Rule, isNew: boolean) => void;
}

export const EditRuleDialog = ({
  open,
  rule,
  onClose,
  onSave,
}: EditRuleDialogProps) => {
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
      newErrors.skill = "Rule skill is required";
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
          skill,
          pointsPerYearOfExperience: parseInt(pointsPerYearOfExperience),
          maxPoints: parseInt(maxPoints),
        },
        !rule // isNew flag
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: colors.black1 }}>
        {rule ? `Edit Rule: ${rule.skill}` : "Add New Rule"}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Rule Skill"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          error={!!errors.skill}
          helperText={errors.skill}
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
          {rule ? "Save Changes" : "Add Rule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
