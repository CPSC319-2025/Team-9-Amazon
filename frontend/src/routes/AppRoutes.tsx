import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "../pages/HomePage";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import HiringManagerDashboardPage from "../pages/HiringManager/HiringManagerDashboardPage";
import TopNavbar from "../components/NavBar";
import HiringManagerLayout from "../layouts/HiringManagerLayout";
import JobDetails from "../pages/HiringManager/JobDetails";

import { ROUTES } from "./routePaths";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <TopNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path={ROUTES.hiringManagerDashboard}
          element={
            <ProtectedRoute>
              <HiringManagerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.jobPosting(":jobPostingId")} element={<HiringManagerLayout />}>
          <Route index element={<JobDetails />} />
          <Route path={ROUTES.jobDetails(":jobPostingId")} element={<JobDetails />} />
          <Route path={ROUTES.evaluationMetrics(":jobPostingId")} element={<JobDetails />} />
          <Route path={ROUTES.applications(":jobPostingId")} element={<JobDetails />} />
          <Route path={ROUTES.reports(":jobPostingId")} element={<JobDetails />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
