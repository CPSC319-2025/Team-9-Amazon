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
    keywords: {
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
  const [keywords, setKeywords] = useState([
    { name: "", pointsPerYearOfExperience: 1, maxPoints: 5 },
  ]);
  const [errors, setErrors] = useState({ name: "", keywords: [] as string[] });

  const validateFields = () => {
    const newErrors = { name: "", keywords: [] as string[] };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    keywords.forEach((keyword, index) => {
      if (!keyword.name.trim()) {
        newErrors.keywords[index] = "Keyword name is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAddKeyword = () => {
    setKeywords([
      ...keywords,
      { name: "", pointsPerYearOfExperience: 1, maxPoints: 5 },
    ]);
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleKeywordChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newKeywords = [...keywords];
    newKeywords[index] = { ...newKeywords[index], [field]: value };
    setKeywords(newKeywords);
  };

  const handleSave = () => {
    if (validateFields()) {
      onAdd(name, keywords);
      setName("");
      setKeywords([{ name: "", pointsPerYearOfExperience: 1, maxPoints: 5 }]);
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

        {keywords.map((keyword, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Keyword"
                value={keyword.name}
                onChange={(e) =>
                  handleKeywordChange(index, "name", e.target.value)
                }
                error={!!errors.keywords[index]}
                helperText={errors.keywords[index]}
              />
              <TextField
                type="number"
                label="Points/Match"
                value={keyword.pointsPerYearOfExperience}
                onChange={(e) =>
                  handleKeywordChange(
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
                value={keyword.maxPoints}
                onChange={(e) =>
                  handleKeywordChange(
                    index,
                    "maxPoints",
                    parseInt(e.target.value) || 0
                  )
                }
                sx={{ width: "150px" }}
              />
            </Box>
            {keywords.length > 1 && (
              <Button
                onClick={() => handleRemoveKeyword(index)}
                sx={{ color: colors.black1 }}
              >
                Remove Keyword
              </Button>
            )}
          </Box>
        ))}

        <Button onClick={handleAddKeyword} sx={{ color: colors.blue1, mt: 2 }}>
          Add Keyword
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
