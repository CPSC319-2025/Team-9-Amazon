import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
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
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  colors,
  filledButtonStyle,
  paperStyle,
} from "../../styles/commonStyles";
import { CriteriaGroup as CriteriaGroupComponent } from "../../components/HiringManager/Evaluation/CriteriaGroup";
import { Rule } from "../../types/criteria";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";
import {
  CriteriaGroupRepresentation,
  transformToRequestData,
} from "../../representations/criteria";
import {
  transformCriteriaData,
  useCreateJobPostingCriteria,
  useDeleteJobPostingCriteria,
  useDeleteAllManualScores,
  useEditJobPostingCriteria,
  useGetJobPostingCriteria,
} from "../../queries/jobPosting";
import { useGetGlobalCriteria } from "../../queries/criteria";
import { useParams } from "react-router";
import { EditRuleDialog } from "../../components/HiringManager/Evaluation/EditRuleDialog";
import {
  useBlocker,
  useBrowserBlocker,
} from "../../components/HiringManager/UnsavedChangesBlocker";

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
  // Add state for confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

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
  const deleteManualScoresMutation = useDeleteAllManualScores();

  useBlocker(
    () =>
      hasUnsavedChanges
        ? window.confirm(
            "You have unsaved changes. Are you sure you want to leave this page?"
          )
        : true,
    hasUnsavedChanges
  );
  useBrowserBlocker(() => hasUnsavedChanges, hasUnsavedChanges);

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

  const handleCreateNewCriteria = () => {
    const newCriteria: CriteriaGroupRepresentation = {
      id: `new-${uuidv4()}`,
      name: "New Criteria",
      rules: [],
    };

    setLocalActiveCriteria((prev) => [...prev, newCriteria]);
    setHasUnsavedChanges(true);
    setSnackbarMessage(
      "New criteria created. Don't forget to save your changes!"
    );
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    console.log("groupId", groupId);
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
        id: `${criteria.id.replace("existing-", "")}-${uuidv4()}`,
      }));

    setLocalActiveCriteria((prev) => [...prev, ...criteriaToAdd]);
    setSelectedCriteria([]);
    setHasUnsavedChanges(true);
    setSnackbarMessage("Criteria added. Don't forget to save your changes!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  // Modified to open confirmation dialog instead of saving directly
  const handleSaveChangesClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setConfirmDialogOpen(false);

      // Delete all manual scores for this job posting first
      try {
        await deleteManualScoresMutation.mutateAsync(jobPostingId || "");
      } catch (deleteError) {
        console.error("Error deleting manual scores:", deleteError);
        // Continue with the rest of the operation even if this fails
        setSnackbarMessage("Warning: Failed to delete manual scores, but continuing with criteria updates.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }

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
      setSnackbarMessage("All changes saved successfully. Manual scores have been deleted.");
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Error saving criteria:", error);
      
      // More specific error handling for JSON parsing errors
      if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
        setSnackbarMessage("Server error: The server returned an unexpected response. Please check the network tab for details.");
      } else if (error instanceof Error) {
        setSnackbarMessage(`Failed to save changes: ${error.message}`);
      } else {
        setSnackbarMessage("Failed to save changes. Please try again.");
      }
      
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
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNewCriteria}
            sx={{
              ...filledButtonStyle,
              bgcolor: colors.blue1,
            }}
          >
            Create New Criteria
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveChangesClick}
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
              sx={{ color: colors.black1 }}
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
              <Tooltip
                title={
                  selectedCriteria.length === 0
                    ? "Select criteria before adding"
                    : ""
                }
              >
                <span>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={selectedCriteria.length === 0}
                    onClick={handleAddSelectedCriteria}
                    sx={{ ...filledButtonStyle }}
                  >
                    Add Selected Criteria
                  </Button>
                </span>
              </Tooltip>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Rule Dialog */}
      <EditRuleDialog
        open={!!editingRule}
        rule={editingRule?.rule || null}
        onClose={() => setEditingRule(null)}
        onSave={handleSaveRule}
      />

      {/* Confirmation Dialog for Manual Score Warning */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: colors.orange1,
          fontWeight: 'bold'
        }}>
          <WarningIcon sx={{ mr: 1, color: colors.orange1 }} />
          Warning: Manual Scores Will Be Deleted
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography paragraph>
              <strong>Important:</strong> Updating job criteria will delete all manual scores for this job posting.
            </Typography>
            <Typography>
              This action cannot be undone. All manually entered scores for candidates will be reset.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ color: colors.black1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveChanges}
            variant="contained"
            color="error"
            sx={{ fontWeight: 'bold' }}
          >
            Save and Delete Manual Scores
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
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