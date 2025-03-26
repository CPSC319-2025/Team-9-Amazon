import { useNavigate } from "react-router";
import { emptyJobPosting } from "../../utils/emptyJobPosting";
import { ROUTES } from "../../routes/routePaths";
import JobDetailsView from "../../components/HiringManager/JobPostings/JobDetailsView";
import { JobDetailsMode } from "../../types/JobPosting/JobDetailsMode";
import { useCreateJobPosting } from "../../queries/jobPosting";
import { JobPostingCreationRequest } from "../../types/JobPosting/api/jobPosting";
import { JobPosting } from "../../types/JobPosting/jobPosting";

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

  const { mutateAsync: createJobPosting, error, isPending } = useCreateJobPosting();

  const handleCreateJob = async (newJob: JobPosting) => {
    try {
      console.log("Creating job posting:", newJob);
      const payload = convertToCreationRequest(newJob);
      const createdJob = await createJobPosting(payload);
      console.log("Created job posting:", createdJob);
      navigate(ROUTES.hiringManager.hiringManagerDashboard);
    } catch (err) {
      console.error("Failed to create job posting:", err);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.hiringManager.hiringManagerDashboard); // Redirect to dashboard
  };

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
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
