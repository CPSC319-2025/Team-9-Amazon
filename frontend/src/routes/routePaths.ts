export const ROUTES = {
  hiringManager: {
    hiringManagerDashboard: "/hiring-manager",
    hiringManagerCreateJob: "/hiring-manager/create-job",
    jobPosting: (jobPostingId: string) => `/hiring-manager/job-posting/${jobPostingId}`,
    jobDetails: (jobPostingId: string) => `/hiring-manager/job-posting/${jobPostingId}/job-details`,
    evaluationMetrics: (jobPostingId: string) => `/hiring-manager/job-posting/${jobPostingId}/evaluation-metrics`,
    applications: (jobPostingId: string) => `/hiring-manager/job-posting/${jobPostingId}/applications`,
    reports: (jobPostingId: string) => `/hiring-manager/job-posting/${jobPostingId}/reports`,
    candidateReport: (jobPostingId: string, candidateEmail: string) => 
      `/hiring-manager/job-posting/${jobPostingId}/candidate-report/${encodeURIComponent(candidateEmail)}`,
  },
};