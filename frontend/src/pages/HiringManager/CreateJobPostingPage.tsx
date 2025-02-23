import { useNavigate } from "react-router";
import { defaultJobPosting } from "../../utils/defaultJobPosting";
import { ROUTES } from "../../routes/routePaths";
import JobDetailsView from "../../components/HiringManager/JobPostings/JobDetailsView";
import { JobDetailsMode } from "../../types/JobPosting/JobDetailsMode";

const CreateJobPostingPage = () => {
    const navigate = useNavigate();

    const handleCreateJob = async (newJob: typeof defaultJobPosting) => {
        try {
            console.log("Creating job:", newJob);

            // TODO: Replace with actual API request
            console.log("Created job:", newJob);

            navigate(ROUTES.hiringManager.hiringManagerDashboard); // Redirect to dashboard
        } catch (error) {
            console.error("Failed to create job:", error);
        }
    };

    const handleCancel = () => {
        navigate(ROUTES.hiringManager.hiringManagerDashboard); // Redirect to dashboard
    };

    return <JobDetailsView
        jobPosting={defaultJobPosting}
        mode={JobDetailsMode.CREATE}
        onSave={handleCreateJob}
        onCancel={handleCancel} />;
};

export default CreateJobPostingPage;