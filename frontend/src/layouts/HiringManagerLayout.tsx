import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import HiringManagerNav from "../components/HiringManager/HiringManagerNav";
import { useEffect, useState } from "react";
import { ROUTES } from "../routes/routePaths";
import { JobPosting } from "../types/JobPosting/jobPosting";
import { apiUrls } from "../api/apiUrls";

const HiringManagerLayout = () => {
  const { jobPostingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch job posting data based on jobPostingId
  useEffect(() => {
    const fetchJobPosting = async () => {
      if (!jobPostingId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await fetch(
          apiUrls.getJobPosting(jobPostingId),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setJobPosting(data);
      } catch (err) {
        console.error('Error fetching job posting:', err);
        setError('Failed to load job posting');
        // Redirect if jobPostingId is invalid or there's an error
        navigate(ROUTES.hiringManager.hiringManagerDashboard, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (jobPostingId) {
      fetchJobPosting();
    }
  }, [jobPostingId, navigate]);

  useEffect(() => {
    if (jobPostingId && location.pathname === ROUTES.hiringManager.jobPosting(jobPostingId)) {
      navigate(ROUTES.hiringManager.jobDetails(jobPostingId), { replace: true });
    }
  }, [location.pathname, jobPostingId, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !jobPosting) {
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