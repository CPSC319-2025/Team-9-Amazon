export interface ApplicationSummary {
  applicationId: number;
  jobPostingId: number;
  score: number;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ApplicationsSummaryResponse {
  totalPossibleScore: number;
  totalApplications: number;
  applications: ApplicationSummary[];
}
