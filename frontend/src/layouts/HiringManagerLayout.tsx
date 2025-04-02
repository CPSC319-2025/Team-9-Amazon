import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import HiringManagerNav from "../components/HiringManager/HiringManagerNav";
import { useEffect } from "react";
import { ROUTES } from "../routes/routePaths";
import { useGetJobPosting } from "../queries/jobPosting";
import CircularProgressLoader from "../components/Common/Loaders/CircularProgressLoader";
import HttpErrorDisplay from "../components/Common/Errors/HttpErrorDisplay";

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
    if (jobPostingDataError.code === 404) {
      return (<HttpErrorDisplay 
        statusCode={jobPostingDataError.code}
        message="Job posting not found"
        details="Error loading job postings. Please try again later." />);
    }
    if (jobPostingDataError.code === 403) {
      return (<HttpErrorDisplay 
        statusCode={jobPostingDataError.code}
        message="Forbidden"
        details="You are not authorized to access this resource." />);
    }
    
    return (
      <HttpErrorDisplay 
        statusCode={jobPostingDataError.code || -1}
        message="Error"
        details={jobPostingDataError.message} />
    );
  }

  if (!jobPosting || isLoadingJobPosting) {
    return (
      <CircularProgressLoader
        variant="indeterminate"
        text="Loading job posting ..." />
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