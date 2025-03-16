const apiUrl = import.meta.env.VITE_BACKEND_URL;
const jobPostingsUrl = `${apiUrl}/job-postings`;
const criteriaUrl = `${apiUrl}/criteria`;
const skillsUrl = `${apiUrl}/skills`;

export const apiUrls = {
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
  loginUrl: `${apiUrl}/login/`,
  getGlobalCriteriaUrl: criteriaUrl + "/",
};
