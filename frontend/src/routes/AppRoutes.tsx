import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "../pages/HomePageApplicant";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import HiringManagerDashboardPage from "../pages/HiringManager/HiringManagerDashboardPage";
import TopNavbar from "../components/NavBar";
import HiringManagerLayout from "../layouts/HiringManagerLayout";
import JobInfo from "../pages/HiringManager/JobDetails";
import CandidateReportPage from "../pages/HiringManager/CandidateReportPage";
import JobReportsPage from "../pages/HiringManager/JobReportsPage";

import { ROUTES } from "./routePaths";
import JobPostingApplicationsPage from "../pages/HiringManager/JobPostingApplicationsPage";
import JobPostingsPage from "../pages/JobPostingsPage";
import JobPostings from "../pages/JobPostingsPage/JobPostings";
import JobApplication from "../pages/JobPostingsPage/JobApplication";
import EvaluationMetricsPage from "../pages/HiringManager/EvaluationMetricsPage";
import CreateJobPostingPage from "../pages/HiringManager/CreateJobPostingPage";
import AccountManagerPage from "../pages/Admin/AccountManagerPage";
import CriteriaManagerPage from "../pages/Admin/CriteriaManagerPage";
import CriteriaDetailsPage from "../pages/Admin/CriteriaDetailsPage";
import RoleProtectedRoute from "./RoleProtectedRoute";
import JobDetails from "../pages/JobPostingsPage/jobDetailsApplication";

const AppWithConditionalNavbar = () => {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" || location.pathname.startsWith("/applicant");

  return (
    <>
      {!hideNavbar && <TopNavbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Hiring Manager Routes */}
        <Route
          path={ROUTES.hiringManager.hiringManagerDashboard}
          element={
            <RoleProtectedRoute requiredRole="hiringManager">
              <HiringManagerDashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path={ROUTES.hiringManager.hiringManagerCreateJob}
          element={
            <RoleProtectedRoute requiredRole="hiringManager">
              <CreateJobPostingPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path={ROUTES.hiringManager.jobPosting(":jobPostingId")}
          element={
            <RoleProtectedRoute requiredRole="hiringManager">
              <HiringManagerLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<JobInfo />} />
          <Route
            path={ROUTES.hiringManager.jobDetails(":jobPostingId")}
            element={<JobInfo />}
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
            element={<JobReportsPage />}
          />
          <Route
            path="candidate-report/:candidateEmail"
            element={<CandidateReportPage />}
          />
        </Route>

        {/* Applicant Module */}
        <Route path="applicant/job-postings" element={<JobPostingsPage />}>
          <Route index element={<JobPostings />} />
          <Route path="apply/:jobPostingId" element={<JobApplication />} />
          <Route path="details/:jobPostingId" element={<JobDetails />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/user-management"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AccountManagerPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/criteria-management"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <CriteriaManagerPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/criteria-details"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <CriteriaDetailsPage />
            </RoleProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AppWithConditionalNavbar />
    </BrowserRouter>
  );
};

export default AppRoutes;
