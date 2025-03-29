import AssignmentIcon from "@mui/icons-material/Assignment";
import HelpIcon from "@mui/icons-material/Help";
import { Box, Stack, Tooltip } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { UseQueryResult } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FormModal } from "../../components/Common/Modals/FormModal";
import CustomSnackbar from "../../components/Common/SnackBar";
import { useGetHiringManagers } from "../../queries/accounts";
import {
  assignJobPosting,
  useGetInvisibleJobPostings,
  useGetUnassignedJobPostings
} from "../../queries/jobPosting";
import { ApiError } from "../../representations/error";
import { colors, titleStyle } from "../../styles/commonStyles";
import { JobPostingAssignRequest } from "../../types/JobPosting/api/jobPosting";
import { JobPosting } from "../../types/JobPosting/jobPosting";

const initialAssignFormData: JobPostingAssignRequest = {
  staffId: 1,
};

const JobPostingsTable = ({
  useGetJobPostings,
  title,
  tooltip,
}: {
  useGetJobPostings: () => UseQueryResult<JobPosting[], ApiError>;
  title: string;
  tooltip: string;
}) => {
  const {
    data: accounts,
    isLoading: accountsLoading,
    isError: accountsIsError,
    error: accountFetchError,
  } = useGetHiringManagers();
  const {
    data: jobPostings,
    isLoading: jobsIsLoading,
    isError: jobsIsError,
    error: jobsFetchError,
  } = useGetJobPostings();

  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting>();
  const [assignFormData, setAssignFormData] = useState<JobPostingAssignRequest>(initialAssignFormData);
  const formSelectOptions = {
    staffId:
      accounts?.staff?.map((staff) => ({
        name: `${staff.firstName} ${staff.lastName} (${staff.email})`,
        value: staff.id,
      })) ?? [],
  };

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "info" | "error" | "warning" | undefined>(
    "success"
  );

  const handleCloseModal = () => {
    setOpenAssignModal(false);
  };

  const handleAssignClick = (jobPosting: JobPosting) => {
    setSelectedJobPosting(jobPosting);
    setOpenAssignModal(true);
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
        const id = temp.id;
        return [
          <GridActionsCellItem
            icon={<AssignmentIcon />}
            label="Edit"
            className="textPrimary"
            onClick={() => handleAssignClick(temp.row)}
            color="inherit"
          />,
        ];
      },
    },
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
    <Box sx={{ bgcolor: colors.white }}>
      <Stack direction="row" justifyContent="space-between">
        <Box padding="10px" sx={{ ...titleStyle, fontVariant: "h4" }}>
          {title}
          <Tooltip title={tooltip}>
            <HelpIcon fontSize="small" sx={{ marginLeft: "5px" }} />
          </Tooltip>
        </Box>
      </Stack>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={jobPostings || []}
          columns={columns}
          // initialState={{ pagination: paginationModel }}
          // pageSizeOptions={[5, 10]}
          // checkboxSelection
          loading={jobsIsLoading || accountsLoading}
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
      <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </Box>
  );
};

const AssignJobPostingsPage = () => {
  return (
    <>
      <JobPostingsTable
        useGetJobPostings={useGetUnassignedJobPostings}
        title="Unassigned job postings"
        tooltip="Unassigned job postings are those that have not been assigned to any hiring manager."
      />
      <JobPostingsTable
        useGetJobPostings={useGetInvisibleJobPostings}
        title="Invisible job postings"
        tooltip="Invisible job postings are those that have been assigned to accounts that are not hiring managers."
      />
    </>
  );
};

export default AssignJobPostingsPage;
