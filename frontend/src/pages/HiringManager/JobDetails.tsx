import { Box, Typography } from "@mui/material";
import { JobPosting } from "../../types/JobPosting/jobPosting";
import { useOutletContext } from "react-router";
import JobDetailsView from "../../components/HiringManager/JobPostings/JobDetailsView";

const JobDetails = () => {
  const { jobPosting } = useOutletContext<{ jobPosting: JobPosting | null }>();

  if (!jobPosting) {
    return (
      <Box sx={{ padding: "40px", textAlign: "center" }}>
        <Typography variant="h6" color="error">Job posting not found or loading...</Typography>
      </Box>
    );
  }

  return <JobDetailsView jobPosting={jobPosting} editable={true} />;
};

export default JobDetails;