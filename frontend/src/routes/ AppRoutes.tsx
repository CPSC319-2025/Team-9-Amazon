import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "../pages/HomePage";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import HiringManagerDashboardPage from "../pages/HiringManager/HiringManagerDashboardPage";
import JobPostingsPage from "../pages/JobPostingsPage";
import JobPostings from "../pages/JobPostingsPage/JobPostings";
import JobApplication from "../pages/JobPostingsPage/JobApplication";

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
              <HiringManagerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="/job-postings" element={<JobPostingsPage />}>
            <Route index element={<JobPostings />} />
            <Route path="apply/:id" element={<JobApplication />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
