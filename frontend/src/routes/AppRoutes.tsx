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
import JobPostingApplicationsPage from "../pages/HiringManager/JobPostingApplicationsPage";
import JobPostingsPage from "../pages/JobPostingsPage";
import JobPostings from "../pages/JobPostingsPage/JobPostings";
import JobApplication from "../pages/JobPostingsPage/JobApplication";
import EvaluationMetricsPage from "../pages/HiringManager/EvaluationMetricsPage";
import CreateJobPostingPage from "../pages/HiringManager/CreateJobPostingPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <TopNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path={ROUTES.hiringManager.hiringManagerDashboard}
          element={
            <ProtectedRoute>
              <HiringManagerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.hiringManager.hiringManagerCreateJob}
          element={
            <ProtectedRoute>
              <CreateJobPostingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.hiringManager.jobPosting(":jobPostingId")}
          element={<HiringManagerLayout />}
        >
          <Route index element={<JobDetails />} />
          <Route
            path={ROUTES.hiringManager.jobDetails(":jobPostingId")}
            element={<JobDetails />}
          />
          <Route
            path={ROUTES.hiringManager.evaluationMetrics(":jobPostingId")}
            element={<EvaluationMetricsPage />}
          />
          <Route
            path={ROUTES.hiringManager.applications(":jobPostingId")}
            element={<JobPostingApplicationsPage />}
          />
          <Route
            path={ROUTES.hiringManager.reports(":jobPostingId")}
            element={<JobDetails />}
          />
        </Route>

        {/* Applicant Module */}
        <Route path="/applicant/job-postings" element={<JobPostingsPage />}>
          <Route index element={<JobPostings />} />
          <Route path="apply/:id" element={<JobApplication />} />{" "}
          {/* Move inside */}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
