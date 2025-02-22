import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import HiringManagerNav from "../components/HiringManager/HiringManagerNav";
import { useEffect, useState } from "react";
import { ROUTES } from "../routes/routePaths";
import { mockJobPostings } from "../utils/mockData";
import { JobPosting } from "../types/JobPosting/jobPosting";

const HiringManagerLayout = () => {
  const { jobPostingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null);

  // Fetch job posting data based on jobPostingId
  useEffect(() => {
    const jobPostings = mockJobPostings; // TODO: Change to actual API call when available
    const jobData = jobPostings.find((job) => job.id === jobPostingId);
    if (jobData) {
      console.log(jobData);
      setJobPosting(jobData);
    } else {
      // Redirect if jobPostingId is invalid
      navigate(ROUTES.hiringManagerDashboard, { replace: true });
    }
  }, [jobPostingId, navigate]);

  useEffect(() => {
    if (jobPostingId && location.pathname === ROUTES.jobPosting(jobPostingId)) {
      navigate(ROUTES.jobDetails(jobPostingId), { replace: true });
    }
  }, [location.pathname, jobPostingId, navigate]);

  if (!jobPosting) {
    return null;
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