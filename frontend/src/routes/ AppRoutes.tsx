import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "../pages/HomePage"
import ProtectedRoute from "./ProtectedRoute";
import HiringManagerDashBoardPage from "../pages/HiringManagerDashBoardPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";

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

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;