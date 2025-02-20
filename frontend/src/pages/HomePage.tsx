import { Link } from "react-router";
import HiringManagerNav from "../components/HiringManager/HiringManagerNav";

const HomePage = () => {
    return (
        <div>
          <HiringManagerNav/>
            <h1>Welcome to Our Application</h1>
            <p>This is the home page of our recruiting web application.</p>

            <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/hiring-manager">Hiring Manager Dashboard</Link></li>
            </ul>

            {/* Navigation Links */}
            {/* <nav>
        <ul>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/dashboard/home">Go to Dashboard</Link></li>
          <li><Link to="/dashboard/profile">Your Profile</Link></li>
        </ul>
      </nav> */}
        </div>
    );
};

export default HomePage;