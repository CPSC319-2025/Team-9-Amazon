import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import HiringManagerNav from "../components/HiringManager/HiringManagerNav";
import { useEffect } from "react";
import { ROUTES } from "../routes/routePaths";

const HiringManagerLayout = () => {
  const { jobPostingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to "/job-details" if on base job posting route
    if (location.pathname === ROUTES.jobPosting(jobPostingId!)) {
      navigate(ROUTES.jobDetails(jobPostingId!), { replace: true });
    }
  }, [location.pathname, jobPostingId, navigate]);

  return (
    <div>
      <HiringManagerNav jobPostingId={jobPostingId!} />
      <div className="hiring-manager-content">
        <Outlet />
      </div>
    </div>
  );
};

export default HiringManagerLayout;