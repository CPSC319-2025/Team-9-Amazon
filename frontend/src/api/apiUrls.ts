const apiUrl = "http://localhost:3001";
const jobPostingsUrl = `${apiUrl}/jop-postings`;

export const apiUrls = {
  getJobPostingCriteriaUrl: jobPostingsUrl + "/:jobPostingId/criteria",
  editJobPostingCriteriaUrl: jobPostingsUrl + "/:jobPostingId/criteria/:criteriaId",
  deleteJobPostingCriteriaUrl: jobPostingsUrl + "/:jobPostingId/criteria/:cretariaId",
  createJobPostingCriteriaUrl: jobPostingsUrl + "/:jobPostingId/criteria",
  loginUrl: `${apiUrl}/login/`,
};
