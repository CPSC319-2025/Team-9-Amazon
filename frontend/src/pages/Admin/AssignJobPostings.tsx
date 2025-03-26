// import { PlusCircle, Trash2,  } from "lucide-react";
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Box, Stack } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
// import { Header } from "../../components/Common/Header";
import { FormModal } from "../../components/Common/Modals/FormModal";
import CustomSnackbar from "../../components/Common/SnackBar";
import { useGetAccounts, useGetHiringManagers } from "../../queries/accounts";
import { assignJobPosting, useGetAllJobPostings, useGetUnassignedJobPostings } from "../../queries/jobPosting";
import { colors, titleStyle } from "../../styles/commonStyles";
import { JobPostingAssignRequest } from "../../types/JobPosting/api/jobPosting";
import { JobPosting } from "../../types/JobPosting/jobPosting";

const initialAssignFormData: JobPostingAssignRequest = {
  staffId: 1,
};

const AssignJobPostingsPage = () => {
  const { data: accounts, isLoading: accountsLoading, isError: accountsIsError, error: accountFetchError } = useGetHiringManagers();
  const { data: jobPostings, isLoading: jobsLoading, isError: jobsIsError, error: jobsFetchError } = useGetUnassignedJobPostings();

  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting>();
  const [assignFormData, setAssignFormData] = useState<JobPostingAssignRequest>(initialAssignFormData);
  const formSelectOptions = {
    staffId: accounts?.staff?.map((staff) => ({
      name: `${staff.firstName} ${staff.lastName} (${staff.email})`,
      value: staff.id,
    })) ?? []
  }

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "info" | "error" | "warning" | undefined>("success");
  
  

  const handleCloseModal = () => {
    setOpenAssignModal(false);
  };

  const handleAssignClick = (jobPosting: JobPosting) => {
    setSelectedJobPosting(jobPosting);
    setOpenAssignModal(true);
    // console.log("Hello World")
  };

  const columns: GridColDef[] = [
    { field: "title", headerName: "Title", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "location", headerName: "Location", flex: 1 },
    {
          field: "actions",
          type: "actions",
          flex: 0.3,
          align: "right",
          cellClassName: "actions",
          getActions: (temp) => {
            const id = temp.id
            return [
              <GridActionsCellItem
                icon={<AssignmentIcon />}
                label="Edit"
                className="textPrimary"
                onClick={() => handleAssignClick(temp.row)}
                color="inherit"
              />
            ];
          }}
  ];

  useEffect(() => {
    if (accountsIsError) {
      setSnackbarOpen(true);
      setSnackbarMessage(accountFetchError?.message ?? "Failed to fetch accounts");
      setSnackbarSeverity("error");
    }
    if (jobsIsError) {
      setSnackbarOpen(true);
      setSnackbarMessage(jobsFetchError?.message ?? "Failed to fetch accounts");
      setSnackbarSeverity("error");
    }
  }, [accountsIsError, jobsIsError]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      <Stack direction="row" justifyContent="space-between">
        <Box padding="10px" sx={{ ...titleStyle, fontVariant: "h4" }}>
          Unassigned Job Postings
        </Box>
      </Stack>
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={jobPostings || []}
          columns={columns}
          // initialState={{ pagination: paginationModel }}
          // pageSizeOptions={[5, 10]}
          // checkboxSelection
          loading={jobsLoading}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableColumnResize
          sx={{ border: 0 }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </Box>
      <FormModal
        dataState={assignFormData}
        initialDataState={initialAssignFormData}
        formSelectOptions={formSelectOptions}
        setDataState={setAssignFormData}
        isOpen={openAssignModal}
        handleClose={handleCloseModal}
        titleText={`Assign '${selectedJobPosting?.title}' To:`}
        mutationHook={() => assignJobPosting(selectedJobPosting?.id ?? "")}
      />
      <CustomSnackbar open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} />
    </Box>
  );
};

export default AssignJobPostingsPage;
