import { AddCircleOutlineOutlined, ArrowForward, DeleteOutlined, Edit, CheckCircle } from "@mui/icons-material";
import { Box, IconButton, Stack, Button } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridToolbar, GridToolbarFilterButton, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { SetStateAction, useEffect, useState } from "react";
import CustomSnackbar from "../../components/Common/SnackBar";
import { useCreateCriteria, useDeleteCriteria, useGetGlobalCriteria } from "../../queries/criteria";
import { colors, textButtonStyle} from "../../styles/commonStyles";
import { Rule } from "../../types/criteria";
import { ConfirmationModal } from "../../components/Common/Modals/ConfirmationModal";
import { UseMutationResult } from "@tanstack/react-query";
import { set } from "zod";
import { FormModal } from "../../components/Common/Modals/FormModal";
import { CreateCriteriaRequest, CriteriaRepresentation } from "../../representations/criteria";
import CriteriaEditModal from "../../components/Admin/CriteriaEditModal";
import { Header } from "../../components/Common/Header";

const initialCreateCriteriaRequest: CreateCriteriaRequest = {
  name: "",
  criteriaType: "global",
  criteriaJson: {
    rules: [{
      skill: "Placeholder rule",
      pointsPerYearOfExperience: 10,
      maxPoints: 100
    }],
  },
};

const CriteriaManagerPage = () => {
  const { data: criteria, isLoading, isError, error: criteriaFetchError } = useGetGlobalCriteria();
  
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [createCriteriaData, setCreateCriteriaData] = useState<CreateCriteriaRequest>(initialCreateCriteriaRequest);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState<CriteriaRepresentation | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteCriteriaId, setDeleteCriteriaId] = useState<string>("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info" | "error" | "warning" | undefined>(
    "success"
  );

  useEffect(() => {
    if (isError) {
      setSnackbarOpen(true);
      setSnackbarMessage(criteriaFetchError?.message ?? "Failed to fetch Criteria");
      setSnackbarSeverity("error");
    }
  }, [isError]);

  const handleCloseModal = () => {
    setOpenCreateModal(false);
    setOpenEditModal(false);
    setOpenDeleteModal(false);
  };

  const handleCreateClick = () => {
    setOpenCreateModal(true);
  }

  const headerIcon = <CheckCircle sx={{fontSize: 32, color: colors.black1}}/>
  const headerActions = (
    <Button
      startIcon={<AddCircleOutlineOutlined sx={{fontSize: 32}} />}
      sx={{ ...textButtonStyle, color: colors.blue1 }}
      onClick={handleCreateClick}
    >
      Add a New Criteria
    </Button>
  );

  const handleDeleteClick = (id: GridRowId) => () => {
    setDeleteCriteriaId(id.toString());
    setOpenDeleteModal(true);
  };

  const handleCriteriaDetailsClick = (id: GridRowId) => () => {
    const criteriaToEdit = criteria?.find(c => c.id === id);
    if (criteriaToEdit) {
      setSelectedCriteria(criteriaToEdit);
      setOpenEditModal(true);
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "criteriaJson",
      headerName: "Skills",
      valueGetter: (json: any) => {
        const targetTexts = json.rules.map((element: Rule) => element.skill);
        return targetTexts.join(", ");
      },
      minWidth: 200,
      flex: 1,
    },
    {
      field: "actions",
      type: "actions",
      // headerName: 'Actions',
      minWidth: 100,
      align: "right",
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<Edit />}
            label="Criteria Details"
            //   className=""
            onClick={handleCriteriaDetailsClick(id)}
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
        title="Criteria Management" 
        actions={headerActions} />
        {/* <Stack direction="row" justifyContent="space-between">
          <Box padding="10px" sx={{ ...titleStyle, fontVariant: "h4" }}>
            Criteria
          </Box>
          <IconButton aria-label="Add a Criteria" onClick={handleCreateClick}>
            <AddCircleOutlined />
          </IconButton>
        </Stack> */}
        <Box sx={{ display: "flex", flexDirection: 'column', width: "100%", padding: "0 16px", maxHeight: 600 }}>
          <DataGrid
            rows={criteria}
            loading={isLoading}
            columns={columns}
            // initialState={{ pagination: paginationModel }}
            // pageSizeOptions={[5, 10]}
            // checkboxSelection
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            disableColumnResize
            sx={{ border: 0, justifyContent: "space-between" }}
            slots={{ toolbar: QuickSearchToolbar }}
          />
        </Box>
        <FormModal 
          isOpen={openCreateModal} 
          handleClose={handleCloseModal} 
          titleText={"Create New Criteria"} 
          mutationHook={useCreateCriteria} 
          dataState={createCriteriaData} 
          initialDataState={initialCreateCriteriaRequest}
          setDataState={setCreateCriteriaData} 
        />
        <CriteriaEditModal
          isOpen={openEditModal}
          handleClose={handleCloseModal}
          criteria={selectedCriteria}
        />
        <ConfirmationModal
          isOpen={openDeleteModal}
          handleClose={handleCloseModal}
          titleText="Are you sure your want to delete this criteria?"
          mutationHook={useDeleteCriteria(deleteCriteriaId)}
          />
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

export default CriteriaManagerPage;
