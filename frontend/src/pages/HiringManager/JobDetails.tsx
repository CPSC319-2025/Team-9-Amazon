import { Box, Typography } from "@mui/material";
import { JobPosting } from "../../types/JobPosting/jobPosting";
import { useOutletContext } from "react-router";
import JobDetailsView from "../../components/HiringManager/JobPostings/JobDetailsView";
import { JobDetailsMode } from "../../types/JobPosting/JobDetailsMode";
import { JobPostingEditRequest } from "../../types/JobPosting/api/jobPosting";
import { useEditJobPosting } from "../../queries/jobPosting";

const convertToEditPayload = (job: JobPosting): JobPostingEditRequest => {
  const {
    title,
    subtitle,
    description,
    responsibilities,
    qualifications,
    location,
    status,
    tags,
  } = job;
  return {
    title,
    subtitle,
    description,
    responsibilities,
    qualifications,
    location,
    status,
    tags,
  };
};

const JobInfo = () => {
  const { jobPosting } = useOutletContext<{ jobPosting: JobPosting | null }>();

  const { mutateAsync: editJobPosting, error, isPending } = useEditJobPosting(
    jobPosting?.id || ""
  );

  const handleSaveJob = async (newJob: JobPosting) => {
    try {
      console.log("Editing job:", newJob);
      const payload = convertToEditPayload(newJob);
      const updatedJob = await editJobPosting(payload);
      console.log("Updated job posting:", updatedJob);

    } catch (error) {
      console.error("Failed to create job:", error);
    }
  };

  if (!jobPosting) {
    return (
      <Box sx={{ padding: "40px", textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Job posting not found or loading...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: "40px", textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Failed to save changes. Please try again.
        </Typography>
      </Box>
    );
  }

  if (isPending) {
    return <p>Saving changes...</p>;
  }

  return <JobDetailsView mode={JobDetailsMode.EDIT} jobPosting={jobPosting} editable={true} onSave={handleSaveJob} />;
};

export default JobInfo;