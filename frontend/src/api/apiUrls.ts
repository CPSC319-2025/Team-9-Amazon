const apiUrl = import.meta.env.VITE_BACKEND_URL;
const jobPostingsUrl = `${apiUrl}/job-postings`;
const criteriaUrl = `${apiUrl}/criteria`;
const skillsUrl = `${apiUrl}/skills`;
const applicationUrl = `${apiUrl}/applications`;

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
  loginUrl: `${apiUrl}/login/`,
  getGlobalCriteriaUrl: criteriaUrl + "/",
  jobPostings: {
    jobPostingById: (jobPostingId: string) =>
      `${jobPostingsUrl}/${jobPostingId}`,
    createJobPosting: jobPostingsUrl,
  },
};
