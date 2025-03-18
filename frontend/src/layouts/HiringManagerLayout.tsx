import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import HiringManagerNav from "../components/HiringManager/HiringManagerNav";
import { useEffect } from "react";
import { ROUTES } from "../routes/routePaths";
import { useGetJobPosting } from "../queries/jobPosting";
import { Box, Typography } from "@mui/material";

const HiringManagerLayout = () => {
  const { jobPostingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    data: jobPosting,
    isLoading: isLoadingJobPosting,
    error: jobPostingDataError,
  } = useGetJobPosting(jobPostingId || "");

  useEffect(() => {
    if (jobPostingId && location.pathname === ROUTES.hiringManager.jobPosting(jobPostingId)) {
      navigate(ROUTES.hiringManager.jobDetails(jobPostingId), { replace: true });
    }
  }, [location.pathname, jobPostingId, navigate]);

  if (jobPostingDataError) {
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

  if (!jobPosting || isLoadingJobPosting) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5">Loading job posting...</Typography>
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