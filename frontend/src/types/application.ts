export interface ApplicationSummary {
  applicantId: number;
  jobPostingId: number;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
  };
  score: number;
  manualScore?: number;
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
