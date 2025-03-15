const apiUrl = "http://localhost:3001";
const jobPostingsUrl = `${apiUrl}/job-postings`;

export const apiUrls = {
  getAllJobPostings: `${jobPostingsUrl}`,
  getJobPosting: (id: string) => `${jobPostingsUrl}/${id}`,
  getJobPostingCriteriaUrl: (jobPostingId: string) => `${jobPostingsUrl}/${jobPostingId}/criteria`,
  editJobPostingCriteriaUrl: (jobPostingId: string, criteriaId: string) => 
    `${jobPostingsUrl}/${jobPostingId}/criteria/${criteriaId}`,
  deleteJobPostingCriteriaUrl: (jobPostingId: string, criteriaId: string) => 
    `${jobPostingsUrl}/${jobPostingId}/criteria/${criteriaId}`,
  createJobPostingCriteriaUrl: (jobPostingId: string) => `${jobPostingsUrl}/${jobPostingId}/criteria`,
  getJobPostStatistics: (jobPostingId: string) => `${jobPostingsUrl}/${jobPostingId}/statistics`,
  loginUrl: `${apiUrl}/login/`,
};