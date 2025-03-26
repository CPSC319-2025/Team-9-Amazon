import { AddCircleOutlined, DeleteOutlined, Edit } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import CustomSnackbar from "../../components/Common/SnackBar";
import { colors, titleStyle } from "../../styles/commonStyles";
import { Skill, useCreateSkill, useDeleteSkill, useGetSkills, useUpdateSkill } from "../../queries/skill";

const SkillsManagerPage = () => {
  const { data: skills, isLoading, isError, error: skillsFetchError } = useGetSkills();
  
  // Modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  
  // Form data
  const [skillName, setSkillName] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [deleteSkillId, setDeleteSkillId] = useState<number | null>(null);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info" | "error" | "warning" | undefined>("success");

  // Mutations
  const createSkillMutation = useCreateSkill();
  const updateSkillMutation = useUpdateSkill(selectedSkill?.skillId || 0);
  const deleteSkillMutation = useDeleteSkill();

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
      setSnackbarMessage(createSkillMutation.error?.message ?? "Failed to create skill");
      setSnackbarSeverity("error");
    }
  }, [createSkillMutation.isSuccess, createSkillMutation.isError, createSkillMutation.error]);

  useEffect(() => {
    if (updateSkillMutation.isSuccess) {
      setSnackbarOpen(true);
      setSnackbarMessage("Skill updated successfully");
      setSnackbarSeverity("success");
      handleCloseModal();
    } else if (updateSkillMutation.isError) {
      setSnackbarOpen(true);
      setSnackbarMessage(updateSkillMutation.error?.message ?? "Failed to update skill");
      setSnackbarSeverity("error");
    }
  }, [updateSkillMutation.isSuccess, updateSkillMutation.isError, updateSkillMutation.error]);

  useEffect(() => {
    if (deleteSkillMutation.isSuccess) {
      setSnackbarOpen(true);
      setSnackbarMessage("Skill deleted successfully");
      setSnackbarSeverity("success");
      handleCloseModal();
    } else if (deleteSkillMutation.isError) {
      setSnackbarOpen(true);
      setSnackbarMessage(deleteSkillMutation.error?.message ?? "Failed to delete skill");
      setSnackbarSeverity("error");
    }
  }, [deleteSkillMutation.isSuccess, deleteSkillMutation.isError, deleteSkillMutation.error]);

  const handleCloseModal = () => {
    setOpenCreateModal(false);
    setOpenEditModal(false);
    setOpenDeleteModal(false);
    setSkillName("");
    setSelectedSkill(null);
    setDeleteSkillId(null);
  };

  const handleCreateClick = () => {
    setOpenCreateModal(true);
  };

  const handleEditClick = (id: GridRowId) => () => {
    const skill = skills?.find(s => s.skillId === id);
    if (skill) {
      setSelectedSkill(skill);
      setSkillName(skill.name);
      setOpenEditModal(true);
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setDeleteSkillId(Number(id));
    setOpenDeleteModal(true);
  };

  const handleCreateSkill = () => {
    if (skillName.trim()) {
      createSkillMutation.mutate({ name: skillName.trim() });
    }
  };

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
      headerName: 'Actions',
      width: 100,
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

  return (
    <>
      <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" padding="10px">
          <Box sx={{ ...titleStyle, fontVariant: "h4" }}>
            Skills Management
          </Box>
          <IconButton 
            aria-label="Add a Skill" 
            onClick={handleCreateClick}
            sx={{ color: colors.blue1 }}
          >
            <AddCircleOutlined />
          </IconButton>
        </Stack>
        <Box sx={{ height: 400, width: "100%", padding: "0 16px" }}>
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
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
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
              variant="outlined"
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
              variant="outlined"
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

        {/* Delete Confirmation Modal */}
        <Dialog open={openDeleteModal} onClose={handleCloseModal}>
          <DialogTitle>Delete Skill</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this skill? This action cannot be undone.
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
