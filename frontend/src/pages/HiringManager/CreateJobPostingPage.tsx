import { useNavigate } from "react-router";
import { emptyJobPosting } from "../../utils/emptyJobPosting";
import { ROUTES } from "../../routes/routePaths";
import JobDetailsView from "../../components/HiringManager/JobPostings/JobDetailsView";
import { JobDetailsMode } from "../../types/JobPosting/JobDetailsMode";
import { useCreateJobPosting } from "../../queries/jobPosting";
import { JobPostingCreationRequest } from "../../types/JobPosting/api/jobPosting";
import { JobPosting } from "../../types/JobPosting/jobPosting";
import CircularProgressLoader from "../../components/Common/Loaders/CircularProgressLoader";
import HttpErrorDisplay from "../../components/Common/Errors/HttpErrorDisplay";
import { useSnackbar } from "notistack";

const convertToCreationRequest = (
  job: JobPosting
): JobPostingCreationRequest => ({
  title: job.title,
  subtitle: job.subtitle,
  description: job.description,
  responsibilities: job.responsibilities,
  qualifications: job.qualifications,
  location: job.location,
  tags: job.tags, // expecting an array of tag names
});

const CreateJobPostingPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const { mutateAsync: createJobPosting, error, isPending } = useCreateJobPosting();

  const handleCreateJob = async (newJob: JobPosting) => {
    try {
      console.log("Creating job posting:", newJob);
      const payload = convertToCreationRequest(newJob);
      const createdJob = await createJobPosting(payload);
      enqueueSnackbar("Job Posting Saved!", {variant: "success"});
      console.log("Created job posting:", createdJob);
      navigate(ROUTES.hiringManager.evaluationMetrics(createdJob.id)); // Redirect to evaluation metrics page
    } catch (err) {
      enqueueSnackbar("Failed to create job posting", {variant: "error"});
      console.error("Failed to create job posting:", err);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.hiringManager.hiringManagerDashboard); // Redirect to dashboard
  };

  if (isPending) {
    return (<CircularProgressLoader
      variant="indeterminate"
      text="Creating job posting ..." />);
  }

  if (error) {
    if (error.code === 404) {
      return (<HttpErrorDisplay 
        statusCode={error.code}
        message="Resource not found"
        details="Error loading resources. Please try again later." />);
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

  return (
    <JobDetailsView
      jobPosting={emptyJobPosting}
      mode={JobDetailsMode.CREATE}
      onSave={handleCreateJob}
      onCancel={handleCancel}
    />
  );
};

export default CreateJobPostingPage;
