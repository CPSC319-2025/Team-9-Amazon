import { Link } from "react-router";
import CustomButton from "../components/Common/Buttons/CustomButton";

const HomePage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-[#f9f9f9]">
            <div className="flex flex-row items-center justify-between max-w-6xl w-full">
                
                <div className="w-1/2 bg-white p-10 shadow-xl rounded-lg">
                    <h2 className="text-4xl font-bold mb-6 text-[#146eb4]">
                        Empowering Builders to Change the World
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        At AWS, we empower builders to turn bold ideas into reality—transforming industries, 
                        communities, and the world. Here, you'll collaborate with the brightest minds in cloud 
                        innovation, solve meaningful challenges, and push the boundaries of what’s possible. 
                        Your voice matters, your impact is real, and your potential is limitless. Join a culture 
                        where diverse perspectives fuel innovation, and where you have the freedom to build, lead, 
                        and make a difference.
                    </p>
                    <Link to="/applicant/job-postings">
                        <CustomButton 
                            variant="filled"
                            className="text-lg px-8 py-4"
                        >
                            Apply Now
                        </CustomButton>
                    </Link>
                </div>

                {/* Right Side: AWS Logo and R.E.C.R.U.I.T */}
                <div className="w-1/2 flex flex-col items-center">
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" 
                        alt="AWS RECRUIT" 
                        className="w-64 mb-6"
                    />
                    <h2 className="text-4xl font-bold tracking-widest text-gray-800">
                        R.E.C.R.U.I.T
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
