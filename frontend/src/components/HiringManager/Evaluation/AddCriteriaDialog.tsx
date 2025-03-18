import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useState } from "react";
import { colors } from "../../../styles/commonStyles";

interface AddCriteriaDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (
    name: string,
    rules: {
      name: string;
      pointsPerYearOfExperience: number;
      maxPoints: number;
    }[]
  ) => void;
}

export const AddCriteriaDialog = ({
  open,
  onClose,
  onAdd,
}: AddCriteriaDialogProps) => {
  const [name, setName] = useState("");
  const [rules, setRules] = useState([
    { name: "", pointsPerYearOfExperience: 1, maxPoints: 5 },
  ]);
  const [errors, setErrors] = useState({ name: "", rules: [] as string[] });

  const validateFields = () => {
    const newErrors = { name: "", rules: [] as string[] };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    rules.forEach((rule, index) => {
      if (!rule.name.trim()) {
        newErrors.rules[index] = "Rule name is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAddRule = () => {
    setRules([
      ...rules,
      { name: "", pointsPerYearOfExperience: 1, maxPoints: 5 },
    ]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const handleSave = () => {
    if (validateFields()) {
      onAdd(name, rules);
      setName("");
      setRules([{ name: "", pointsPerYearOfExperience: 1, maxPoints: 5 }]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: colors.black1 }}>Add New Criteria</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Criteria Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mt: 2, mb: 3 }}
        />

        {rules.map((rule, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Rule"
                value={rule.name}
                onChange={(e) =>
                  handleRuleChange(index, "name", e.target.value)
                }
                error={!!errors.rules[index]}
                helperText={errors.rules[index]}
              />
              <TextField
                type="number"
                label="Points/Match"
                value={rule.pointsPerYearOfExperience}
                onChange={(e) =>
                  handleRuleChange(
                    index,
                    "pointsPerYearOfExperience",
                    parseInt(e.target.value) || 0
                  )
                }
                sx={{ width: "150px" }}
              />
              <TextField
                type="number"
                label="Max Points"
                value={rule.maxPoints}
                onChange={(e) =>
                  handleRuleChange(
                    index,
                    "maxPoints",
                    parseInt(e.target.value) || 0
                  )
                }
                sx={{ width: "150px" }}
              />
            </Box>
            {rules.length > 1 && (
              <Button
                onClick={() => handleRemoveRule(index)}
                sx={{ color: colors.black1 }}
              >
                Remove Rule
              </Button>
            )}
          </Box>
        ))}

        <Button onClick={handleAddRule} sx={{ color: colors.blue1, mt: 2 }}>
          Add Rule
        </Button>
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
          Add Criteria
        </Button>
      </DialogActions>
    </Dialog>
  );
};
