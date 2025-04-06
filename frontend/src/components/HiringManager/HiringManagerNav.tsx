import { Box, Typography, Tabs, Tab, Tooltip } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";

import { ROUTES } from "../../routes/routePaths";
import { JobPosting, JobPostingStatus } from "../../types/JobPosting/jobPosting";
import JobStatusChip from "./JobStatusChip";
import ChangeStatusButton from "./ChangeStatusButton";
import { JobPostingEditRequest } from "../../types/JobPosting/api/jobPosting";
import { JOB_STATUS_TRANSITION } from "../../utils/jobPostingStatusTransition";
import { useEditJobPosting } from "../../queries/jobPosting";
import CircularProgressLoader from "../Common/Loaders/CircularProgressLoader";

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
    } else if (location.pathname.includes('/candidate-report/')) {
      // If on a candidate profile page, keep the Applications tab highlighted
      setTabValue(ROUTES.hiringManager.applications(jobPostingId!));
    } else {
      setTabValue(location.pathname);
    }
  }, [location.pathname, jobPostingId]);

  useEffect(() => {
    // This is redundant with the above effect and can cause issues
    // setTabValue(location.pathname);
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
      enqueueSnackbar(`Failed to change job status: ${error}`, { variant: "error" });
      // console.error("Failed to edit job status:", error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  if (isPending) {
    return (
      <CircularProgressLoader
        variant="indeterminate"
        text="Loading ..."
      />
    );
  }

  if (error) {
    // enqueueSnackbar(`Error ${error.code}: ${error.message}`, { variant: "error" });
  }

  const isDraft = jobPosting.status === JobPostingStatus.DRAFT;

  const applicationsDisabledMessage =
    "Applications are unavailable while the job posting is in draft status.";
  const reportsDisabledMessage =
    "Reports are unavailable while the job posting is in draft status.";


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
        {isDraft ? (
          <Tooltip title={applicationsDisabledMessage} arrow>
            <span>
              <Tab
                label="Applications"
                value={ROUTES.hiringManager.applications(jobPostingId!)}
                disabled
              />
            </span>
          </Tooltip>
        ) : (
          <Tab
            label="Applications"
            value={ROUTES.hiringManager.applications(jobPostingId!)}
          />
        )}
        {isDraft ? (
          <Tooltip title={reportsDisabledMessage} arrow>
            <span>
              <Tab
                label="Reports"
                value={ROUTES.hiringManager.reports(jobPostingId!)}
                disabled
              />
            </span>
          </Tooltip>
        ) : (
          <Tab
            label="Reports"
            value={ROUTES.hiringManager.reports(jobPostingId!)}
          />
        )}
      </Tabs>
    </Box>
  );
};

export default HiringManagerNav;
