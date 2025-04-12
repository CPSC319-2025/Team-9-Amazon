import { AddCircleOutlineOutlined, DeleteOutlined, Edit, WorkspacePremium } from "@mui/icons-material";
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
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import CustomSnackbar from "../../components/Common/SnackBar";
import { colors, textButtonStyle } from "../../styles/commonStyles";
import {
  Skill,
  useCheckSkillReferences,
  useCreateSkill,
  useDeleteSkill,
  useGetSkills,
  useUpdateSkill,
} from "../../queries/skill";
import { Header } from "../../components/Common/Header";

const SkillsManagerPage = () => {
  const {
    data: skills,
    isLoading,
    isError,
    error: skillsFetchError,
  } = useGetSkills();

  // Modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDeleteConfirmModal, setOpenDeleteConfirmModal] = useState(false);

  // Form data
  const [skillName, setSkillName] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [deleteSkillId, setDeleteSkillId] = useState<number | null>(null);
  const [criteriaCount, setCriteriaCount] = useState<number>(0);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "info" | "error" | "warning" | undefined
  >("success");

  // Mutations
  const createSkillMutation = useCreateSkill();
  const updateSkillMutation = useUpdateSkill(selectedSkill?.skillId || 0);
  const deleteSkillMutation = useDeleteSkill();
  const checkSkillReferences = useCheckSkillReferences();

  useEffect(() => {
    if (isError) {
      setSnackbarOpen(true);
      setSnackbarMessage(skillsFetchError?.message ?? "Failed to fetch Skills");
      setSnackbarSeverity("error");
    }
  }, [isError, skillsFetchError]);

  useEffect(() => {
    if (createSkillMutation.isSuccess) {
      setSnackbarOpen(true);
      setSnackbarMessage("Skill created successfully");
      setSnackbarSeverity("success");
      handleCloseModal();
    } else if (createSkillMutation.isError) {
      setSnackbarOpen(true);
      setSnackbarMessage(
        createSkillMutation.error?.message ?? "Failed to create skill"
      );
      setSnackbarSeverity("error");
    }
  }, [
    createSkillMutation.isSuccess,
    createSkillMutation.isError,
    createSkillMutation.error,
  ]);

  useEffect(() => {
    if (updateSkillMutation.isSuccess) {
      setSnackbarOpen(true);
      setSnackbarMessage("Skill updated successfully");
      setSnackbarSeverity("success");
      handleCloseModal();
    } else if (updateSkillMutation.isError) {
      setSnackbarOpen(true);
      setSnackbarMessage(
        updateSkillMutation.error?.message ?? "Failed to update skill"
      );
      setSnackbarSeverity("error");
    }
  }, [
    updateSkillMutation.isSuccess,
    updateSkillMutation.isError,
    updateSkillMutation.error,
  ]);

  useEffect(() => {
    if (deleteSkillMutation.isSuccess) {
      setSnackbarOpen(true);
      setSnackbarMessage("Skill deleted successfully");
      setSnackbarSeverity("success");
      handleCloseModal();
    } else if (deleteSkillMutation.isError) {
      setSnackbarOpen(true);
      setSnackbarMessage(
        deleteSkillMutation.error?.message ?? "Failed to delete skill"
      );
      setSnackbarSeverity("error");
    }
  }, [
    deleteSkillMutation.isSuccess,
    deleteSkillMutation.isError,
    deleteSkillMutation.error,
  ]);

  const handleCloseModal = () => {
    setOpenCreateModal(false);
    setOpenEditModal(false);
    setOpenDeleteModal(false);
    setOpenDeleteConfirmModal(false);
    setSkillName("");
    setSelectedSkill(null);
    setDeleteSkillId(null);
    setCriteriaCount(0);
  };

  const handleCreateClick = () => {
    setOpenCreateModal(true);
  };

  const handleEditClick = (id: GridRowId) => () => {
    const skill = skills?.find((s) => s.skillId === id);
    if (skill) {
      setSelectedSkill(skill);
      setSkillName(skill.name);
      setOpenEditModal(true);
    }
  };

  const handleDeleteClick = (id: GridRowId) => async () => {
    try {
      const result = await checkSkillReferences.mutateAsync(Number(id));
      setDeleteSkillId(Number(id));

      if (result.isReferenced) {
        setCriteriaCount(result.criteriaCount);
        setOpenDeleteConfirmModal(true);
      } else {
        setOpenDeleteModal(true);
      }
    } catch (error) {
      setSnackbarOpen(true);
      setSnackbarMessage("Failed to check skill references");
      setSnackbarSeverity("error");
    }
  };

  const handleCreateSkill = () => {
    if (skillName.trim()) {
      createSkillMutation.mutate({ name: skillName.trim() });
    }
  };

  const headerIcon = <WorkspacePremium sx={{fontSize: 32, color: colors.black1}}/>
    const headerActions = (
      <Button
        startIcon={<AddCircleOutlineOutlined sx={{fontSize: 32}} />}
        sx={{ ...textButtonStyle, color: colors.blue1 }}
        onClick={handleCreateClick}
      >
        Add a New Skill
      </Button>
    );
  
  const handleUpdateSkill = () => {
    if (selectedSkill && skillName.trim()) {
      updateSkillMutation.mutate({ name: skillName.trim() });
    }
  };

  const handleDeleteSkill = () => {
    if (deleteSkillId !== null) {
      deleteSkillMutation.mutate(deleteSkillId);
    }
  };

  const columns: GridColDef[] = [
    { field: "skillId", headerName: "ID", width: 90 },
    { field: "name", headerName: "Skill Name", flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<Edit />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteOutlined />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const QuickSearchToolbar = () => {
      return (
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <GridToolbarQuickFilter
            placeholder="Search entries..."
            variant="outlined"
            size="medium"
            sx={{
              width: "100%",
              maxWidth: "50",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          </Box>
      )
    }

  
  return (
    <>
      <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
        <Header icon={headerIcon}
                title="Skills Management" 
                actions={headerActions} />
        <Box sx={{ display: "flex", flexDirection: 'column', width: "100%", padding: "0 16px", maxHeight: 600}}>
          <DataGrid
            rows={skills || []}
            loading={isLoading}
            columns={columns}
            getRowId={(row) => row.skillId}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            disableColumnResize
            sx={{ border: 0, justifyContent: "space-between" }}
            slots={{ toolbar: QuickSearchToolbar }}
          />
        </Box>

        {/* Create Skill Modal */}
        <Dialog open={openCreateModal} onClose={handleCloseModal}>
          <DialogTitle>Create New Skill</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Skill Name"
              type="text"
              fullWidth
              variant="standard"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              onClick={handleCreateSkill}
              variant="contained"
              disabled={!skillName.trim() || createSkillMutation.isPending}
            >
              {createSkillMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Skill Modal */}
        <Dialog open={openEditModal} onClose={handleCloseModal}>
          <DialogTitle>Edit Skill</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Skill Name"
              type="text"
              fullWidth
              variant="standard"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              onClick={handleUpdateSkill}
              variant="contained"
              disabled={!skillName.trim() || updateSkillMutation.isPending}
            >
              {updateSkillMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal - For Referenced Skills */}
        <Dialog open={openDeleteConfirmModal} onClose={handleCloseModal}>
          <DialogTitle>Warning: Skill is Referenced</DialogTitle>
          <DialogContent>
            <Typography>
              This skill is currently referenced in {criteriaCount} criteria.
              Deleting it will remove all criteria rules related to this skill.
              Are you sure you want to proceed?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              onClick={() => {
                setOpenDeleteConfirmModal(false);
                setOpenDeleteModal(true);
              }}
              variant="contained"
              color="error"
            >
              Proceed to Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Final Delete Confirmation Modal */}
        <Dialog open={openDeleteModal} onClose={handleCloseModal}>
          <DialogTitle>Delete Skill</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this skill? This action cannot be
            undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              onClick={handleDeleteSkill}
              variant="contained"
              color="error"
              disabled={deleteSkillMutation.isPending}
            >
              {deleteSkillMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
};

export default SkillsManagerPage;
