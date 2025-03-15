export interface ApplicationSummary {
  applicantId: number;
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

export interface PotentialCandidatesResponse {
  totalApplications: number;
  applications: ApplicationSummary[];
}
