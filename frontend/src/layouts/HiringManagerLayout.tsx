import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import HiringManagerNav from "../components/HiringManager/HiringManagerNav";
import { useEffect, useState } from "react";
import { ROUTES } from "../routes/routePaths";
// import { mockJobPostings } from "../utils/mockData";
import { JobPosting } from "../types/JobPosting/jobPosting";
import { useGetJobPosting } from "../queries/jobPosting";
import { Box, Typography } from "@mui/material";

const HiringManagerLayout = () => {
  const { jobPostingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null);

  const {
    data: jobPostingData,
    isLoading: isLoadingJobPosting,
    error: jobPostingDataError,
  } = useGetJobPosting(jobPostingId || "");

  // Fetch job posting data based on jobPostingId
  useEffect(() => {
    // const jobPostings = mockJobPostings; // TODO: Change to actual API call when available
    // const jobData = jobPostings.find((job) => job.id === jobPostingId);
    if (!jobPostingDataError && !isLoadingJobPosting && jobPostingData) {
      console.log(jobPostingData);
      setJobPosting(jobPostingData);
    } else {
      // Redirect if jobPostingData is invalid
      // navigate(ROUTES.hiringManager.hiringManagerDashboard, { replace: true });
    }
  }, [jobPostingData, isLoadingJobPosting, jobPostingDataError, navigate]);

  useEffect(() => {
    if (jobPostingId && location.pathname === ROUTES.hiringManager.jobPosting(jobPostingId)) {
      navigate(ROUTES.hiringManager.jobDetails(jobPostingId), { replace: true });
    }
  }, [location.pathname, jobPostingId, navigate]);

  if (!jobPosting || jobPostingDataError) {
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
          Error loading job posting. Please try again later.
        </Typography>
        {jobPostingDataError?.message}
        {jobPostingDataError?.details}
      </Box>
    );
  }

  return (
    <div>
      <HiringManagerNav jobPostingId={jobPostingId!} jobPosting={jobPosting} />
      <div className="hiring-manager-content">
        <Outlet context={{ jobPosting }} />
      </div>
    </div>
  );
};

export default HiringManagerLayout;