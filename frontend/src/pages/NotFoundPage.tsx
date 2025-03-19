import { useNavigate } from "react-router";
import CustomButton from "../components/Common/Buttons/CustomButton";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-sm shadow-md max-w-2xl">
        <h1 className="text-6xl font-bold text-[#232F3E] mb-4">404</h1>
        <h2 className="text-2xl font-medium text-[#232F3E] mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
