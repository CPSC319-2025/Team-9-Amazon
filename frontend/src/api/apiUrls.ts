const apiUrl = import.meta.env.VITE_BACKEND_URL;
const jobPostingsUrl = `${apiUrl}/job-postings`;
const criteriaUrl = `${apiUrl}/criteria`;
const skillsUrl = `${apiUrl}/skills`;
const applicationUrl = `${apiUrl}/applications`;
const accountsUrl = `${apiUrl}/accounts`;

export const apiUrls = {
  applicantJobPostingsUrl: `${apiUrl}/applicant/job-postings`,
  getJobTagsUrl: `${apiUrl}/applicant/job-postings/tags`,
  createApplicationUrl: applicationUrl + "/",
  getJobPostingCriteriaUrl: jobPostingsUrl + "/:jobPostingId/criteria",
  editJobPostingCriteriaUrl:
    jobPostingsUrl + "/:jobPostingId/criteria/:criteriaId",
  deleteJobPostingCriteriaUrl:
    jobPostingsUrl + "/:jobPostingId/criteria/:criteriaId",
  createJobPostingCriteriaUrl: jobPostingsUrl + "/:jobPostingId/criteria",
  getJobPostingUrl: jobPostingsUrl + "/:jobPostingId",
  getJobPostingApplicationsSummaryUrl:
    jobPostingsUrl + "/:jobPostingId/applications/summary",
  getJobPostingPotentialCandidatesUrl:
    jobPostingsUrl + "/:jobPostingId/potential-candidates",
  getSkillsUrl: skillsUrl + "/",
  checkSkillReferencesUrl: skillsUrl + "/:skillId/check-references",
  loginUrl: `${apiUrl}/login/`,
  getGlobalCriteriaUrl: criteriaUrl + "/",
  jobPostings: {
    jobPostingById: (jobPostingId: string) =>
      `${jobPostingsUrl}/${jobPostingId}`,
    createJobPosting: jobPostingsUrl,
    all: jobPostingsUrl,
    unassigned: `${jobPostingsUrl}/unassigned`,
    invisible: `${jobPostingsUrl}/invisible`,
    assign: (jobPostingId: string) =>
      `${jobPostingsUrl}/assign/${jobPostingId}`,
  },
  accounts: {
    base: `${accountsUrl}`,
    hiringManagers: `${accountsUrl}/hiring-managers`,
    edit: `$${accountsUrl}/:accountId`,
    delete: `${accountsUrl}/:accountId`,
  },
  criteria: {
    base: criteriaUrl,
    delete: `${criteriaUrl}/:criteria_id`,
    update: `${criteriaUrl}/:criteria_id`,
  },
  getJobReportsUrl: jobPostingsUrl + "/:jobPostingId/reports",
  getCandidateReportUrl:
    jobPostingsUrl + "/:jobPostingId/candidate-report/:candidateEmail",
};
