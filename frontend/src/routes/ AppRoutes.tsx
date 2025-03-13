import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "../pages/HomePageApplicant";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import HiringManagerDashboardPage from "../pages/HiringManager/HiringManagerDashboardPage";
import JobReportsPage from "../pages/HiringManager/JobReportsPage";
import CandidateReportPage from "../pages/HiringManager/CandidateReportPage";

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

        <Route
          path="/hiring-manager/job-reports/:jobId"
          element={
            <ProtectedRoute>
              <JobReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hiring-manager/job-reports/:jobId/candidate/:candidateId"
          element={
            <ProtectedRoute>
              <CandidateReportPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
