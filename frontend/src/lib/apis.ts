const internalApi = "http://localhost:3001";
const jobPostings = `${internalApi}/jop-postings`;
const login = `${internalApi}/login`;

export const apis = {
  getJobPostingCriteria: jobPostings + "/:jobPostingId/criteria",
  editJobPostingCriteria: jobPostings + "/:jobPostingId/criteria/:criteriaId",
  deleteJobPostingCriteria: jobPostings + "/:jobPostingId/criteria/:cretariaId",
  createJobPostingCriteria: jobPostings + "/:jobPostingId/criteria",
  login: login + "/",
};
