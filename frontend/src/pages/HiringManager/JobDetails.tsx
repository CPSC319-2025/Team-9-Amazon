import { Box, Typography } from "@mui/material";
import { JobPosting } from "../../types/JobPosting/jobPosting";
import { useOutletContext } from "react-router";
import JobDetailsView from "../../components/HiringManager/JobPostings/JobDetailsView";
import { JobDetailsMode } from "../../types/JobPosting/JobDetailsMode";
import { JobPostingEditRequest } from "../../types/JobPosting/api/jobPosting";
import { useEditJobPosting } from "../../queries/jobPosting";
import CircularProgressLoader from "../../components/Common/Loaders/CircularProgressLoader";
import HttpErrorDisplay from "../../components/Common/Errors/HttpErrorDisplay";
import { useSnackbar } from "notistack";

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

const JobDetails = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { jobPosting } = useOutletContext<{ jobPosting: JobPosting | null }>();

  const { mutateAsync: editJobPosting, error, isPending } = useEditJobPosting(
    jobPosting?.id || ""
  );

  const handleSaveJob = async (newJob: JobPosting) => {
    try {
      console.log("Editing job:", newJob);
      const payload = convertToEditPayload(newJob);
      const updatedJob = await editJobPosting(payload);

      enqueueSnackbar("Job Posting Saved!", {variant: "success"});
      console.log("Updated job posting:", updatedJob);

    } catch (error) {
      enqueueSnackbar("Failed to save job posting", {variant: "error"});
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
    if (error.code === 404) {
      return (<HttpErrorDisplay 
        statusCode={error.code}
        message="Job postings not found"
        details="Error loading job postings. Please try again later." />);
    }
    if (error.code === 403) {
      return (<HttpErrorDisplay 
        statusCode={error.code}
        message="Forbidden"
        details="You are not authorized to access this resource." />);
    }

    return (
      <HttpErrorDisplay 
        statusCode={error.code || -1}
        message="Error"
        details={error.message} />
    );
  }

  if (isPending) {
    return (<CircularProgressLoader
            variant="indeterminate"
            text="Saving changes ..." />);
  }

  return <JobDetailsView mode={JobDetailsMode.EDIT} jobPosting={jobPosting} editable={true} onSave={handleSaveJob} />;
};

export default JobDetails;