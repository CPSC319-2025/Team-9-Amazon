import { Box, Typography } from "@mui/material";
import { JobPosting } from "../../types/JobPosting/jobPosting";
import { useOutletContext } from "react-router";
import JobDetailsView from "../../components/HiringManager/JobPostings/JobDetailsView";
import { JobDetailsMode } from "../../types/JobPosting/JobDetailsMode";

const JobDetails = () => {
  const { jobPosting } = useOutletContext<{ jobPosting: JobPosting | null }>();

  const handleSaveJob = async (newJob: JobPosting) => {
    try {
      console.log("Creating job:", newJob);

      // TODO: Replace with actual API request
      console.log("Created job:", newJob);

    } catch (error) {
      console.error("Failed to create job:", error);
    }
  };

  if (!jobPosting) {
    return (
      <Box sx={{ padding: "40px", textAlign: "center" }}>
        <Typography variant="h6" color="error">Job posting not found or loading...</Typography>
      </Box>
    );
  }

  return <JobDetailsView mode={JobDetailsMode.EDIT} jobPosting={jobPosting} editable={true} onSave={handleSaveJob} />;
};

export default JobDetails;