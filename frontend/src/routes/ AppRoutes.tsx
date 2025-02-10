import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "../pages/HomePage"
import ProtectedRoute from "./ProtectedRoute";
import HiringManagerDashBoardPage from "../pages/HiringManagerDashBoardPage";
import LoginPage from "../pages/LoginPage";
// import AboutPage from "../pages/AboutPage";
// import NotFoundPage from "../pages/NotFoundPage";
// import DashboardLayout from "../layouts/DashboardLayout";
// import DashboardHome from "../pages/DashboardHome";
// import ProfilePage from "../pages/ProfilePage";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />


                <Route
                    path="/hiring-manager"
                    element={
                        <ProtectedRoute>
                            <HiringManagerDashBoardPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;