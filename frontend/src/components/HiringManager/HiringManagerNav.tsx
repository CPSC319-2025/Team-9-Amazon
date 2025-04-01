import { Box, Typography, Tabs, Tab } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";

import { ROUTES } from "../../routes/routePaths";
import { JobPosting } from "../../types/JobPosting/jobPosting";
import JobStatusChip from "./JobStatusChip";
import ChangeStatusButton from "./ChangeStatusButton";
import { JobPostingEditRequest } from "../../types/JobPosting/api/jobPosting";
import { JOB_STATUS_TRANSITION } from "../../utils/jobPostingStatusTransition";
import { useEditJobPosting } from "../../queries/jobPosting";
import CircularProgressLoader from "../Common/Loaders/CircularProgressLoader";
import HttpErrorDisplay from "../Common/Errors/HttpErrorDisplay";

interface HiringManagerNavProps {
  jobPostingId: string;
  jobPosting: JobPosting;
}

const HiringManagerNav = ({
  jobPostingId,
  jobPosting,
}: HiringManagerNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [tabValue, setTabValue] = useState(location.pathname);
  const [jobStatus, setJobStatus] = useState(jobPosting.status);

  const {
    mutateAsync: editJobPosting,
    error,
    isPending,
  } = useEditJobPosting(jobPosting?.id || "");

  useEffect(() => {
    setJobStatus(jobPosting.status);
  }, [jobPosting.status]);

  useEffect(() => {
    // If on base job posting route, default to "Job Details"
    if (location.pathname === ROUTES.hiringManager.jobPosting(jobPostingId!)) {
      setTabValue(ROUTES.hiringManager.jobDetails(jobPostingId!));
    } else {
      setTabValue(location.pathname);
    }
  }, [location.pathname, jobPostingId]);

  useEffect(() => {
    setTabValue(location.pathname);
  }, [location]);

  const onStatusChange = async () => {
    try {
      const nextStatus = JOB_STATUS_TRANSITION[jobStatus].next;

      const payload: JobPostingEditRequest = {
        status: nextStatus,
      };
      const updatedJob = await editJobPosting(payload);

      console.log("Updated job posting:", updatedJob);
      enqueueSnackbar(`Job status changed to ${nextStatus}`, {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(`Failed to change job status`, { variant: "error" });
      console.error("Failed to edit job status:", error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    navigate(newValue);
  };

  if (isPending) {
    return (
      <CircularProgressLoader
        variant="indeterminate"
        text="Loading job posting ..."
      />
    );
  }

  if (error) {
    if (error.code === 404) {
      return (
        <HttpErrorDisplay
          statusCode={error.code}
          message="Job postings not found"
          details="Error loading job postings. Please try again later."
        />
      );
    }
    if (error.code === 403) {
      return (
        <HttpErrorDisplay
          statusCode={error.code}
          message="Forbidden"
          details="You are not authorized to access this resource."
        />
      );
    }

    return (
      <HttpErrorDisplay
        statusCode={error.code || -1}
        message="Error"
        details={error.message}
      />
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        padding: "20px",
        borderRadius: "8px",
      }}
    >
      {/* Job Title & Status */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Box>
          <Typography variant="h4">{jobPosting.title}</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "1rem", marginBottom: "8px" }}
          >
            {jobPosting.subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <JobStatusChip status={jobStatus} />
          <ChangeStatusButton status={jobStatus} onClick={onStatusChange} />
        </Box>
      </Box>

      {/* Tabs Navigation */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{ marginTop: 2 }}
      >
        <Tab
          label="Job Details"
          value={ROUTES.hiringManager.jobDetails(jobPostingId!)}
        />
        <Tab
          label="Evaluation Metrics"
          value={ROUTES.hiringManager.evaluationMetrics(jobPostingId!)}
        />
        <Tab
          label="Applications"
          value={ROUTES.hiringManager.applications(jobPostingId!)}
        />
        <Tab
          label="Reports"
          value={ROUTES.hiringManager.reports(jobPostingId!)}
        />
      </Tabs>
    </Box>
  );
};

export default HiringManagerNav;
