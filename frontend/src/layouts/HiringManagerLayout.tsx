import { Outlet, useParams } from "react-router";
import HiringManagerNav from "../components/HiringManager/HiringManagerNav";

const HiringManagerLayout = () => {
//   const { jobPostingId } = useParams();

  return (
    <div>
      {/* Pass jobPostingId to HiringManagerNav */}
      <HiringManagerNav />
      <div className="hiring-manager-content">
        <Outlet />
      </div>
    </div>
  );
};

export default HiringManagerLayout;