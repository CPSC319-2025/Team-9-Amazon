import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { colors, filledButtonStyle, textButtonStyle } from "../../styles/commonStyles";
import { Rule } from "../../types/criteria";
import { CriteriaRepresentation } from "../../representations/criteria";
import { useUpdateCriteria } from "../../queries/criteria";
import { useGetSkills } from "../../queries/skill";
import CustomSnackbar from "../Common/SnackBar";

interface CriteriaEditModalProps {
  isOpen: boolean;
  handleClose: () => void;
  criteria: CriteriaRepresentation | null;
}

const CriteriaEditModal: React.FC<CriteriaEditModalProps> = ({
  isOpen,
  handleClose,
  criteria,
}) => {
  const [name, setName] = useState<string>(criteria?.name || "");
  const [rules, setRules] = useState<Rule[]>(
    criteria?.criteriaJson.rules.map((rule) => ({
      skill: rule.skill,
      pointsPerYearOfExperience: rule.pointsPerYearOfExperience,
      maxPoints: rule.maxPoints,
    })) || []
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "info" | "error" | "warning" | undefined
  >("success");

  // Fetch all skills
  const { data: skills, isLoading: isLoadingSkills } = useGetSkills();

  // Update state when criteria changes
  React.useEffect(() => {
    if (criteria) {
      setName(criteria.name);
      setRules(
        criteria.criteriaJson.rules.map((rule) => ({
          skill: rule.skill,
          pointsPerYearOfExperience: rule.pointsPerYearOfExperience,
          maxPoints: rule.maxPoints,
        }))
      );
    }
  }, [criteria]);

  const { mutate: updateCriteria, isPending } = useUpdateCriteria(
    criteria?.id.toString() || ""
  );

  const handleAddRule = () => {
    setRules([
      ...rules,
      {
        skill: "",
        pointsPerYearOfExperience: 10,
        maxPoints: 100,
      },
    ]);
  };

  const handleDeleteRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const handleRuleChange = (
    index: number,
    field: keyof Rule,
    value: string | number
  ) => {
    const newRules = [...rules];
    if (field === "skill") {
      newRules[index][field] = value as string;
    } else {
      // Ensure numeric values are valid numbers
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        newRules[index][field] = numValue;
      }
    }
    setRules(newRules);
  };

  const handleSave = () => {
    if (!criteria) return;

    // Validate rules
    const hasEmptySkills = rules.some((rule) => !rule.skill.trim());
    if (hasEmptySkills) {
      setSnackbarMessage("All skills must have a name");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Validate name
    if (!name.trim()) {
      setSnackbarMessage("Criteria name cannot be empty");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    updateCriteria(
      {
        name,
        criteriaJson: {
          rules,
        },
      },
      {
        onSuccess: () => {
          setSnackbarMessage("Criteria updated successfully");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          handleClose();
        },
        onError: (error: any) => {
          setSnackbarMessage(error.message || "Failed to update criteria");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        },
      }
    );
  };

  if (!criteria) return null;

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Criteria</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Criteria Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              variant="outlined"
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Rules
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={"400px"} >Skill</TableCell>
                    <TableCell >Points Per Year</TableCell>
                    <TableCell >Max Points</TableCell>
                    <TableCell >Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rules.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Autocomplete
                          options={skills || []}
                          getOptionLabel={(option) =>
                            typeof option == 'string' ? option : option.name
                          }
                          value={skills?.find(s => s.name === rule.skill) || null}
                          onChange={(_, newValue) => {
                            handleRuleChange(index, "skill", newValue ? (typeof newValue == 'string' ? newValue : newValue.name) : "");
                          }}
                          loading={isLoadingSkills}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="standard"
                              placeholder="Select a skill"
                              fullWidth
                            />
                          )}
                          freeSolo
                          filterOptions={(options, state) => {
                            const inputValue = state.inputValue.toLowerCase().trim();
                            return options.filter(option => 
                              option.name.toLowerCase().includes(inputValue)
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={rule.pointsPerYearOfExperience}
                          onChange={(e) =>
                            handleRuleChange(
                              index,
                              "pointsPerYearOfExperience",
                              e.target.value
                            )
                          }
                          variant="standard"
                          inputProps={{ min: 0 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={rule.maxPoints}
                          onChange={(e) =>
                            handleRuleChange(index, "maxPoints", e.target.value)
                          }
                          variant="standard"
                          inputProps={{ min: 0 }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleDeleteRule(index)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              startIcon={<AddIcon />}
              onClick={handleAddRule}
              sx={{ mt: 2 }}
              variant="outlined"
            >
              Add Rule
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isPending}
            sx={{
              ...textButtonStyle,
              ...filledButtonStyle,
              backgroundColor: colors.blue1,
            }}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
      <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
};

export default CriteriaEditModal;
