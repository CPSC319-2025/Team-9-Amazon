import { AddCircleOutlined, ArrowForward, DeleteOutlined } from "@mui/icons-material";
import { Box, IconButton, Stack } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridToolbar } from "@mui/x-data-grid";
import { SetStateAction, useEffect, useState } from "react";
import CustomSnackbar from "../../components/Common/SnackBar";
import { useCreateCriteria, useGetGlobalCriteria } from "../../queries/criteria";
import { colors, titleStyle } from "../../styles/commonStyles";
import { Rule } from "../../types/criteria";
import { ConfirmationModal } from "../../components/Common/Modals/ConfirmationModal";
import { UseMutationResult } from "@tanstack/react-query";
import { set } from "zod";
import { FormModal } from "../../components/Common/Modals/FormModal";
import { CreateCriteriaRequest } from "../../representations/criteria";

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
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  // const [openFormModal, setOpenFormModal] = React.useState(false);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [createCriteriaData, setCreateCriteriaData] = useState<CreateCriteriaRequest>(initialCreateCriteriaRequest);

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
    setOpenDeleteModal(false);
  };

  const handleCreateClick = () => {
    setOpenCreateModal(true);
  }

  const handleDeleteClick = (id: GridRowId) => () => {
    // setRows(rows.filter((row) => row.id !== id));
    setOpenDeleteModal(true);
  };

  const handleCriteriaDetailsClick = (id: GridRowId) => () => {
    // setOpenFormModal(true);
    return id;
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "criteriaJson",
      headerName: "Rules",
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
      flex: 1,
      align: "right",
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<DeleteOutlined />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<ArrowForward />}
            label="Criteria Details"
            //   className=""
            onClick={handleCriteriaDetailsClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <>
      <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
        {/* <Header title="" actions={headerActions} /> */}
        <Stack direction="row" justifyContent="space-between">
          <Box padding="10px" sx={{ ...titleStyle, fontVariant: "h4" }}>
            Criteria
          </Box>
          <IconButton aria-label="Add a Criteria" onClick={handleCreateClick}>
            <AddCircleOutlined />
          </IconButton>
        </Stack>
        <Box sx={{ height: 400, width: "100%" }}>
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
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
          />
        </Box>
        <FormModal isOpen={openCreateModal} handleClose={handleCloseModal} titleText={"Create New Criteria"} mutationHook={useCreateCriteria} dataState={createCriteriaData} setDataState={setCreateCriteriaData} />
        {/* <ConfirmationModal
        isOpen={openDeleteModal}
        handleClose={handleCloseModal}
        titleText="Are you sure your want to delete this criteria?"
      /> */}
        {/* <DynamicFormModal isOpen={openFormModal}/> */}
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
