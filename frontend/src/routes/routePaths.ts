export const ROUTES = {
    hiringManagerDashboard: "/hiring-manager",
    jobPosting: (jobPostingId: string) => `/hiring-manager/job-posting/${jobPostingId}`,
    jobDetails: (jobPostingId: string) => `/hiring-manager/job-posting/${jobPostingId}/job-details`,
    evaluationMetrics: (jobPostingId: string) => `/hiring-manager/job-posting/${jobPostingId}/evaluation-metrics`,
    applications: (jobPostingId: string) => `/hiring-manager/job-posting/${jobPostingId}/applications`,
    reports: (jobPostingId: string) => `/hiring-manager/job-posting/${jobPostingId}/reports`,
  };