import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  colors,
  filledButtonStyle,
  paperStyle,
} from "../../styles/commonStyles";
import { CriteriaGroup as CriteriaGroupComponent } from "../../components/HiringManager/Evaluation/CriteriaGroup";
import { EditRuleDialog } from "../../components/HiringManager/Evaluation/EditRuleDialog";
import { Rule } from "../../types/criteria";
import SaveIcon from "@mui/icons-material/Save";
import {
  CriteriaGroupRepresentation,
  transformToRequestData,
} from "../../representations/criteria";
import {
  transformCriteriaData,
  useCreateJobPostingCriteria,
  useDeleteJobPostingCriteria,
  useEditJobPostingCriteria,
  useGetJobPostingCriteria,
} from "../../queries/jobPosting";
import { useGetGlobalCriteria } from "../../queries/criteria";
import { useParams } from "react-router";

const EvaluationMetricsPage = () => {
  const { jobPostingId } = useParams();
  const [editingRule, setEditingRule] = useState<{
    groupId: string;
    rule: Rule | null;
  } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [localActiveCriteria, setLocalActiveCriteria] = useState<
    CriteriaGroupRepresentation[]
  >([]);
  const [initialCriteria, setInitialCriteria] = useState<
    CriteriaGroupRepresentation[]
  >([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    data: criteriaData,
    isLoading: isLoadingCriteria,
    error: criteriaError,
  } = useGetJobPostingCriteria(jobPostingId || "");

  const {
    data: globalCriteriaData,
    isLoading: isLoadingGlobal,
    error: globalError,
  } = useGetGlobalCriteria();

  const createCriteriaMutation = useCreateJobPostingCriteria(
    jobPostingId || ""
  );
  const editCriteriaMutation = useEditJobPostingCriteria(jobPostingId || "");
  const deleteCriteriaMutation = useDeleteJobPostingCriteria(
    jobPostingId || ""
  );

  useEffect(() => {
    if (criteriaData) {
      const transformedCriteria = transformCriteriaData(criteriaData);
      setLocalActiveCriteria(transformedCriteria);
      setInitialCriteria(transformedCriteria);
      setHasUnsavedChanges(false);
    }
  }, [criteriaData]);

  const availableCriteria = globalCriteriaData
    ? transformCriteriaData(globalCriteriaData).filter(
        (global) =>
          !localActiveCriteria.some(
            (local) =>
              local.id === `existing-${global.id}` || local.id === global.id
          )
      )
    : [];

  const handleDeleteGroup = (groupId: string) => {
    setLocalActiveCriteria((prev) =>
      prev.filter((criteria) => criteria.id !== groupId)
    );
    setHasUnsavedChanges(true);
    setSnackbarMessage("Criteria removed. Don't forget to save your changes!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleEditRule = (groupId: string, rule: Rule) => {
    setEditingRule({ groupId, rule });
  };

  const handleAddRule = (groupId: string) => {
    setEditingRule({ groupId, rule: null });
  };

  const handleEditName = (groupId: string, newName: string) => {
    setLocalActiveCriteria((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              name: newName,
            }
          : group
      )
    );
    setHasUnsavedChanges(true);
    setSnackbarMessage(
      "Criteria name updated. Don't forget to save your changes!"
    );
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleSaveRule = (updatedRule: Rule, isNew: boolean) => {
    if (editingRule) {
      const groupId = editingRule.groupId;
      setLocalActiveCriteria((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? {
                ...group,
                rules: isNew
                  ? [...group.rules, updatedRule]
                  : group.rules.map((k) =>
                      k.skill === editingRule.rule?.skill ? updatedRule : k
                    ),
              }
            : group
        )
      );

      setEditingRule(null);
      setHasUnsavedChanges(true);
      setSnackbarMessage(
        isNew
          ? "Rule added. Don't forget to save your changes!"
          : "Rule updated. Don't forget to save your changes!"
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteRule = (groupId: string, rule: Rule) => {
    setLocalActiveCriteria((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.filter((k) => k.skill !== rule.skill),
            }
          : group
      )
    );
    setHasUnsavedChanges(true);
    setSnackbarMessage("Rule deleted. Don't forget to save your changes!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleToggleCriteria = (criteriaId: string) => {
    setSelectedCriteria((prev) =>
      prev.includes(criteriaId)
        ? prev.filter((id) => id !== criteriaId)
        : [...prev, criteriaId]
    );
  };

  const handleAddSelectedCriteria = () => {
    const criteriaToAdd = availableCriteria
      .filter((c) => selectedCriteria.includes(c.id))
      .map((criteria) => ({
        ...criteria,
        id: criteria.id.replace("existing-", ""),
      }));

    setLocalActiveCriteria((prev) => [...prev, ...criteriaToAdd]);
    setSelectedCriteria([]);
    setHasUnsavedChanges(true);
    setSnackbarMessage("Criteria added. Don't forget to save your changes!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      // Find deleted criteria
      const deletedCriteria = initialCriteria.filter(
        (initialCriteria) =>
          !localActiveCriteria.some(
            (currentCriteria) => currentCriteria.id === initialCriteria.id
          )
      );

      // Find modified criteria
      const modifiedCriteria = localActiveCriteria.filter((currentCriteria) => {
        if (!currentCriteria.id.startsWith("existing-")) return false;

        const initialCriterion = initialCriteria.find(
          (ic) => ic.id === currentCriteria.id
        );
        if (!initialCriterion) return false;

        // Check for both rule and name changes
        return (
          JSON.stringify(currentCriteria.rules) !==
            JSON.stringify(initialCriterion.rules) ||
          currentCriteria.name !== initialCriterion.name
        );
      });

      // Find new criteria (including those added from available)
      const newCriteria = localActiveCriteria.filter(
        (criteria) => !criteria.id.startsWith("existing-")
      );

      // Delete removed criteria
      await Promise.all(
        deletedCriteria.map((criteria) => {
          const criteriaId = criteria.id.replace("existing-", "");
          return deleteCriteriaMutation.mutateAsync(criteriaId);
        })
      );

      // Update modified criteria
      await Promise.all(
        modifiedCriteria.map((criteria) => {
          const criteriaId = criteria.id.replace("existing-", "");
          return editCriteriaMutation.mutateAsync({
            criteriaId,
            data: transformToRequestData(criteria),
          });
        })
      );

      // Create new criteria
      await Promise.all(
        newCriteria.map((criteria) =>
          createCriteriaMutation.mutateAsync(transformToRequestData(criteria))
        )
      );

      setHasUnsavedChanges(false);
      setSnackbarMessage("All changes saved successfully");
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Error saving criteria:", error);
      setSnackbarMessage("Failed to save changes. Please try again.");
      setSnackbarSeverity("error");
    } finally {
      setIsSaving(false);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (!jobPostingId) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="error">No job posting ID provided.</Typography>
      </Box>
    );
  }

  if (isLoadingCriteria || isLoadingGlobal) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (criteriaError || globalError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="error">
          Error loading criteria. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveChanges}
            disabled={isSaving || !hasUnsavedChanges}
            sx={{
              ...filledButtonStyle,
              minWidth: 150,
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ mb: 3, color: colors.black1 }}
            >
              Active Evaluation Criteria
            </Typography>
            {localActiveCriteria.map((group) => (
              <CriteriaGroupComponent
                key={group.id}
                group={group}
                onDeleteGroup={handleDeleteGroup}
                onEditRule={handleEditRule}
                onDeleteRule={handleDeleteRule}
                onAddRule={handleAddRule}
                onEditName={handleEditName}
              />
            ))}
            {localActiveCriteria.length === 0 && (
              <Paper
                elevation={0}
                sx={{
                  ...paperStyle,
                  textAlign: "center",
                  py: 8,
                  bgcolor: colors.gray1,
                }}
              >
                <Typography variant="body1" sx={{ color: colors.black1 }}>
                  No active criteria.
                </Typography>
              </Paper>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 3, color: colors.black1 }}
            >
              Available Criteria
            </Typography>
            <Paper elevation={0} sx={{ ...paperStyle, bgcolor: colors.gray1 }}>
              <List>
                {availableCriteria.map((criteria) => (
                  <ListItem
                    key={criteria.id}
                    sx={{
                      border: `1px solid ${colors.gray1}`,
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: colors.white,
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={selectedCriteria.includes(criteria.id)}
                        onChange={() => handleToggleCriteria(criteria.id)}
                        sx={{
                          color: colors.blue1,
                          "&.Mui-checked": {
                            color: colors.blue1,
                          },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${criteria.name} #${criteria.id.replace(
                        "existing-",
                        ""
                      )}`}
                      secondary={`${criteria.rules.length} rules`}
                    />
                  </ListItem>
                ))}
                {availableCriteria.length === 0 && (
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", py: 2, color: colors.gray2 }}
                  >
                    No global criteria available.
                  </Typography>
                )}
              </List>
              <Button
                fullWidth
                variant="contained"
                disabled={selectedCriteria.length === 0}
                onClick={handleAddSelectedCriteria}
                sx={{ ...filledButtonStyle }}
              >
                Add Selected Criteria
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <EditRuleDialog
        open={!!editingRule}
        rule={editingRule?.rule || null}
        groupId={editingRule?.groupId || ""}
        onClose={() => setEditingRule(null)}
        onSave={handleSaveRule}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ top: "24px" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            bgcolor:
              snackbarSeverity === "success" ? colors.blue1 : colors.orange1,
            color: "white",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EvaluationMetricsPage;
