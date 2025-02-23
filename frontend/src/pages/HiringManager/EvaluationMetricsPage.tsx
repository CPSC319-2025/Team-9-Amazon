import { useState } from "react";
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
} from "@mui/material";
import {
  colors,
  filledButtonStyle,
  paperStyle,
} from "../../styles/commonStyles";
import { CriteriaGroup as CriteriaGroupComponent } from "../../components/HiringManager/Evaluation/CriteriaGroup";
import { EditKeywordDialog } from "../../components/HiringManager/Evaluation/EditKeywordDialog";
import { CriteriaGroup, Keyword } from "../../types/criteria";
import { mockCriteriaGroups } from "../../utils/mockData";

const EvaluationMetricsPage = () => {
  const [activeCriteria, setActiveCriteria] = useState<CriteriaGroup[]>([]);
  const [availableCriteria, setAvailableCriteria] =
    useState<CriteriaGroup[]>(mockCriteriaGroups);
  const [editingKeyword, setEditingKeyword] = useState<{
    groupId: string;
    keyword: Keyword | null;
  } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);

  const handleDeleteGroup = (groupId: string) => {
    const criteriaToMove = activeCriteria.find((c) => c.id === groupId);
    if (criteriaToMove) {
      setActiveCriteria((prev) => prev.filter((c) => c.id !== groupId));
      setAvailableCriteria((prev) => [...prev, criteriaToMove]);
      setSnackbarMessage("Criteria removed");
      setSnackbarOpen(true);
    }
  };

  const handleEditKeyword = (groupId: string, keyword: Keyword) => {
    setEditingKeyword({ groupId, keyword });
  };

  const handleAddKeyword = (groupId: string) => {
    setEditingKeyword({ groupId, keyword: null });
  };

  const handleSaveKeyword = (updatedKeyword: Keyword, isNew: boolean) => {
    if (editingKeyword) {
      setActiveCriteria((prev) =>
        prev.map((group) =>
          group.id === editingKeyword.groupId
            ? {
                ...group,
                keywords: isNew
                  ? [...group.keywords, updatedKeyword]
                  : group.keywords.map((k) =>
                      k.name === editingKeyword.keyword?.name
                        ? updatedKeyword
                        : k
                    ),
              }
            : group
        )
      );
      setEditingKeyword(null);
      setSnackbarMessage(
        isNew
          ? "New keyword added successfully"
          : "Keyword updated successfully"
      );
      setSnackbarOpen(true);
    }
  };

  const handleDeleteKeyword = (groupId: string, keyword: Keyword) => {
    setActiveCriteria((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              keywords: group.keywords.filter((k) => k.name !== keyword.name),
            }
          : group
      )
    );
    setSnackbarMessage("Keyword deleted successfully");
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
    const criteriaToAdd = availableCriteria.filter((c) =>
      selectedCriteria.includes(c.id)
    );
    if (criteriaToAdd.length > 0) {
      setActiveCriteria((prev) => [...prev, ...criteriaToAdd]);
      setAvailableCriteria((prev) =>
        prev.filter((c) => !selectedCriteria.includes(c.id))
      );
      setSelectedCriteria([]);
      setSnackbarMessage("Selected criteria added successfully");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ mb: 3, color: colors.black1 }}
            >
              Active Evaluation Criteria
            </Typography>
            {activeCriteria.map((group) => (
              <CriteriaGroupComponent
                key={group.id}
                group={group}
                onDeleteGroup={handleDeleteGroup}
                onEditKeyword={handleEditKeyword}
                onDeleteKeyword={handleDeleteKeyword}
                onAddKeyword={handleAddKeyword}
              />
            ))}
            {activeCriteria.length === 0 && (
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
                      primary={`${criteria.name} #${criteria.id}`}
                      secondary={`${criteria.keywords.length} keywords`}
                    />
                  </ListItem>
                ))}
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

      <EditKeywordDialog
        open={!!editingKeyword}
        keyword={editingKeyword?.keyword || null}
        groupId={editingKeyword?.groupId || ""}
        onClose={() => setEditingKeyword(null)}
        onSave={handleSaveKeyword}
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
          severity="success"
          sx={{
            width: "100%",
            bgcolor: colors.blue1,
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
