import { Link } from "react-router";

const HomePage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-[#f9f9f9]">
          <div className="flex flex-col items-center relative">
            <img 
                src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" 
                alt="AWS RECRUIT" 
                className="w-[300px] mb-4"
            />
          </div>
          <h2 className="text-2xl font-bold mb-10 tracking-widest">
            R.E.C.R.U.I.T
          </h2>

            <div className="flex gap-8">
                <Link to="/job-postings">
                    <button className="px-12 py-2.5 text-base bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                        Apply
                    </button>
                </Link>
                <Link to="/login">
                    <button className="px-12 py-2.5 text-base bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                        Login
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;