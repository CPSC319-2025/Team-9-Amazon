import {
  UseQueryResult,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CriteriaRepresentation,
  transformToGroupRepresentation,
  transformToApiRepresentation,
  CriteriaGroupRepresentation,
} from "../representations/criteria";
import { ApiError } from "../representations/error";
import { apiUrls } from "../api/apiUrls";
import { fetchWithAuth } from "../api/apiUtils";
import { criteriaKeys } from "./criteria";
import { JobPosting } from "../types/JobPosting/jobPosting";
import { JobPostingAssignRequest, JobPostingAttributes, JobPostingCreationRequest, JobPostingEditRequest, JobTagAttributes } from "../types/JobPosting/api/jobPosting";
import {
  ApplicationsSummaryResponse,
  PotentialCandidatesResponse,
} from "../types/application";
import { transformJobPosting, transformJobPostings } from "../utils/transformJobPosting";
import { ManualCriteriaScore } from '../components/HiringManager/ManualScoring/ManualScoringForm';

// Query keys
export const jobPostingKeys = {
  all: ["jobPosting"] as const,
  unassigned: ["jobPosting", "unassigned"] as const,
  invisible: ["jobPosting", "invisible"] as const,
  detail: (jobPostingId: string) =>
    [...jobPostingKeys.all, jobPostingId] as const, // Extends from "all"
};

export const useGetAllJobPostings = (): UseQueryResult<JobPosting[], ApiError> => {
  return useQuery({
    queryKey: jobPostingKeys.all,
    queryFn: async () => {
      const url = apiUrls.jobPostings.all;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData, response);
      }

      // The API should return an array of job postings with associated tags
      const data: (JobPostingAttributes & { jobTags: JobTagAttributes[] })[] = await response.json();

      const jobPostings: JobPosting[] = transformJobPostings(data);

      return jobPostings;
    },
    retry: 1,
    
  });
};

export const useGetUnassignedJobPostings = (): UseQueryResult<JobPosting[], ApiError> => {
  return useQuery({
    queryKey: jobPostingKeys.unassigned,
    queryFn: async () => {
      const url = apiUrls.jobPostings.unassigned;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData);
      }
      const jobPostings = await response.json()
      return jobPostings;
    },
    retry: 1,
  });
};

export const useGetInvisibleJobPostings = (): UseQueryResult<JobPosting[], ApiError> => {
  return useQuery({
    queryKey: jobPostingKeys.invisible,
    queryFn: async () => {
      const url = apiUrls.jobPostings.invisible;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData);
      }
      const jobPostings = await response.json()
      return jobPostings;
    },
    retry: 1,
  });
};

export const useGetJobPosting = (
  jobPostingId: string
): UseQueryResult<JobPosting, ApiError> => {
  return useQuery({
    queryKey: jobPostingKeys.detail(jobPostingId),
    queryFn: async () => {
      if (!jobPostingId) {
        console.error("Job posting ID is required");
        throw new Error("Job posting ID is required");
      }

      const url = apiUrls.jobPostings.jobPostingById(jobPostingId);

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        // console.log("Error fetching job posting:", response);
        
        const errorData = await response.json();
        // console.log("Error fetching job posting:", errorData);
        throw ApiError.fromResponse(errorData, response);
      }

      const data: JobPostingAttributes & { jobTags: JobTagAttributes[] } = await response.json();

      // convert the job posting data to the JobPosting type
      const jobPosting: JobPosting = transformJobPosting(data);
      return jobPosting;
    },
    retry: 1,
  });
};

export const useCreateJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation<JobPosting, ApiError, JobPostingCreationRequest>({
    mutationFn: async (newJobPosting: JobPostingCreationRequest) => {
      const url = apiUrls.jobPostings.createJobPosting;
      const response = await fetchWithAuth(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newJobPosting),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData, response);
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate or refetch job postings list queries to reflect the new posting.
      queryClient.invalidateQueries({ queryKey: jobPostingKeys.all });
    },
  });
};

export const useEditJobPosting = (jobPostingId: string) => {
  const queryClient = useQueryClient();

  return useMutation<JobPosting, ApiError, JobPostingEditRequest>({
    mutationFn: async (updatePayload: JobPostingEditRequest) => {
      const url = apiUrls.jobPostings.jobPostingById(jobPostingId); // e.g. "/api/job-postings/{jobPostingId}"
      const response = await fetchWithAuth(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData, response);
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the job posting detail query to refresh data after edit.
      queryClient.invalidateQueries({ queryKey: jobPostingKeys.detail(jobPostingId) });
    },
  });
};

export const assignJobPosting = (jobPostingId: string) => {
  const queryClient = useQueryClient();

  return useMutation<JobPosting, ApiError, JobPostingAssignRequest>({
    mutationFn: async (updatePayload: JobPostingEditRequest) => {
      const url = apiUrls.jobPostings.assign(jobPostingId);
      const response = await fetchWithAuth(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData);
      }
      const ret = await response.json()
      return ret;
    },
    onSuccess: () => {
      // Invalidate the job posting detail query to refresh data after edit.
      queryClient.invalidateQueries({ queryKey: jobPostingKeys.unassigned });
      queryClient.invalidateQueries({ queryKey: jobPostingKeys.invisible });
    },
  });
}



// ============ Criteria ============

// Get job posting criteria
export const useGetJobPostingCriteria = (
  jobPostingId: string
): UseQueryResult<CriteriaRepresentation[], ApiError> => {
  return useQuery({
    queryKey: criteriaKeys.jobPosting(jobPostingId),
    queryFn: async () => {
      if (!jobPostingId) {
        console.error("Job posting ID is required");
        throw new Error("Job posting ID is required");
      }

      const url = apiUrls.getJobPostingCriteriaUrl.replace(
        ":jobPostingId",
        jobPostingId
      );

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData, response);
      }

      const data = await response.json();
      return data;
    },
    enabled: Boolean(jobPostingId), // Only run query if jobPostingId exists
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};


// Create job posting criteria
export const useCreateJobPostingCriteria = (jobPostingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; criteriaJson: any }) => {
      if (!jobPostingId) throw new Error("Job posting ID is required");

      const url = apiUrls.createJobPostingCriteriaUrl.replace(
        ":jobPostingId",
        jobPostingId
      );
      const response = await fetchWithAuth(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData, response);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: criteriaKeys.jobPosting(jobPostingId),
      });
    },
  });
};

// Edit job posting criteria
export const useEditJobPostingCriteria = (jobPostingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      criteriaId,
      data,
    }: {
      criteriaId: string;
      data: Partial<CriteriaRepresentation>;
    }) => {
      if (!jobPostingId || !criteriaId)
        throw new Error("Job posting ID and criteria ID are required");

      const url = apiUrls.editJobPostingCriteriaUrl
        .replace(":jobPostingId", jobPostingId)
        .replace(":criteriaId", criteriaId);

      const response = await fetchWithAuth(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData, response);
      }

      return response.json();
    },
    onSuccess: (_, { criteriaId }) => {
      queryClient.invalidateQueries({
        queryKey: criteriaKeys.criteria(jobPostingId, criteriaId),
      });
      queryClient.invalidateQueries({
        queryKey: criteriaKeys.jobPosting(jobPostingId),
      });
    },
  });
};

// Delete job posting criteria
export const useDeleteJobPostingCriteria = (jobPostingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (criteriaId: string) => {
      if (!jobPostingId || !criteriaId) {
        console.error("Job posting ID and criteria ID are required");
        throw new Error("Job posting ID and criteria ID are required");
      }

      const url = apiUrls.deleteJobPostingCriteriaUrl
        .replace(":jobPostingId", jobPostingId)
        .replace(":criteriaId", criteriaId);

      const response = await fetchWithAuth(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Delete criteria error:", errorData);
        throw ApiError.fromResponse(errorData, response);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: criteriaKeys.jobPosting(jobPostingId),
      });
    },
  });
};

export const useGetApplicationsSummary = (jobPostingId: string) => {
  return useQuery({
    queryKey: ["applications", "summary", jobPostingId],
    queryFn: async () => {
      const response = await fetchWithAuth(
        apiUrls.getJobPostingApplicationsSummaryUrl.replace(
          ":jobPostingId",
          jobPostingId
        )
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications summary");
      }

      return response.json() as Promise<ApplicationsSummaryResponse>;
    },
    enabled: !!jobPostingId,
  });
};

export const useGetPotentialApplicationsSummary = (jobPostingId: string, applicantEmail: string, originalJobPostingId: string) => {
  return useQuery({
    queryKey: ["potentialCandidatesReport", jobPostingId],
    queryFn: async () => {
      const response = await fetchWithAuth(
        apiUrls.getPotentialCandidateReportUrl.replace(
          ":jobPostingId",
          jobPostingId
        ).replace(":candidateEmail", applicantEmail).replace(':originalJobPostingId', originalJobPostingId)
      );
      if (!response.ok) {
        throw new Error("Failed to fetch applications summary");
      }

      return response.json() as Promise<CandidateReportResponse>;
    },
    enabled: !!jobPostingId,
  });
};

export const useGetPotentialCandidates = (jobPostingId: string) => {
  return useQuery({
    queryKey: ["potentialCandidates", jobPostingId],
    queryFn: async () => {
      if (!jobPostingId) {
        throw new Error("Job posting ID is required");
      }

      const url = apiUrls.getJobPostingPotentialCandidatesUrl.replace(
        ":jobPostingId",
        jobPostingId
      );

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error("Failed to fetch potential candidates");
      }

      return response.json() as Promise<PotentialCandidatesResponse>;
    },
    enabled: !!jobPostingId, // Only fetch when jobPostingId is available
  });
};

// Helper function to transform criteria data
export const transformCriteriaData = (
  criteria: CriteriaRepresentation[]
): CriteriaGroupRepresentation[] => {
  return criteria.map(transformToGroupRepresentation);
};

// Helper function to prepare criteria data for API
export const prepareCriteriaData = (
  data: CriteriaGroupRepresentation
): Partial<CriteriaRepresentation> => {
  return transformToApiRepresentation(data);
};

// Types for job reports
interface JobReportsResponse {
  totalApplications: number;
  applicationData: Array<{
    month: string;
    applications: number;
    percentage: number;
  }>;
  sourceData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  criteriaMatchStats: Array<{
    criteriaId: number,
    name: string,
    meetCount: number,
    totalApplicants: number,
    percentage: number
  }>;
}

// Types for candidate report
interface CandidateReportResponse {
  name: string;
  role: string;
  matchScore: number;
  details: {
    email: string;
    phone: string;
    personalLinks: string[];
  };
  criteria: Array<{
    name: string;
    score: number;
  }>;
  rules: {
    matched: string[];
    missing: string[];
  };
  resume: {
    url: string;
    fileType: string;
  }
  interviewQuestions?: Array<{
    question: string;
    category: string;
    rationale: string;
  }>;
}

// Get job reports
export const useGetJobReports = (jobPostingId: string) => {
  return useQuery<JobReportsResponse, ApiError>({
    queryKey: ["jobReports", jobPostingId],
    queryFn: async () => {
      if (!jobPostingId) {
        throw new Error("Job posting ID is required");
      }

      const url = apiUrls.getJobReportsUrl.replace(
        ":jobPostingId",
        jobPostingId
      );

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error("Failed to fetch job reports");
      }

      return response.json();
    },
    enabled: !!jobPostingId,
  });
};

// Get candidate report
export const useGetCandidateReport = (
  jobPostingId: string,
  candidateEmail: string
) => {
  return useQuery<CandidateReportResponse, ApiError>({
    queryKey: ["candidateReport", jobPostingId, candidateEmail],
    queryFn: async () => {
      if (!jobPostingId || !candidateEmail) {
        throw new Error("Job posting ID and candidate email are required");
      }

      const url = apiUrls.getCandidateReportUrl
        .replace(":jobPostingId", jobPostingId)
        .replace(":candidateEmail", encodeURIComponent(candidateEmail));

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error("Failed to fetch candidate report");
      }

      return response.json();
    },
    enabled: !!jobPostingId && !!candidateEmail,
  });
};

// Types for manual scoring
interface SaveManualScoreRequest {
  criteriaScores: ManualCriteriaScore[];
  totalScore: number;
}

interface ManualScoreResponse {
  manualScore: number;
  criteriaScores: ManualCriteriaScore[];
  lastUpdated: string;
}

// Get manual score for a candidate
export const useGetManualScore = (jobPostingId: string, candidateEmail: string) => {
  return useQuery<ManualScoreResponse>({
    queryKey: ['manualScore', jobPostingId, candidateEmail],
    queryFn: async () => {
      // const response = await fetch(`/api/applications/${jobPostingId}/${candidateEmail}/manual-score`);
      const url = apiUrls.manualScore
        .replace(":jobPostingId", jobPostingId)
        .replace(":candidateEmail", encodeURIComponent(candidateEmail));

      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error('Failed to fetch manual scores');
      }
      return response.json();
    },
    // Only fetch when we have both jobPostingId and candidateEmail
    enabled: !!jobPostingId && !!candidateEmail,
  });
};

// Save manual score for a candidate
export const useSaveManualScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      jobPostingId,
      candidateEmail,
      data,
    }: {
      jobPostingId: string;
      candidateEmail: string;
      data: SaveManualScoreRequest;
    }) => {

      const url = apiUrls.manualScore
        .replace(":jobPostingId", jobPostingId)
        .replace(":candidateEmail", encodeURIComponent(candidateEmail));

      const response = await fetchWithAuth(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save manual scores');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ['manualScore', variables.jobPostingId, variables.candidateEmail],
      });
      
      // Also invalidate application summary to reflect the updated manual score
      queryClient.invalidateQueries({
        queryKey: ['applicationsSummary', variables.jobPostingId],
      });

      // Invalidate the applications summary query used in JobPostingApplicationsPage
      queryClient.invalidateQueries({
        queryKey: ['applications', 'summary', variables.jobPostingId],
      });

    },
  });
};

// Type for the response from the delete manual scores endpoint
interface DeleteManualScoresResponse {
  message: string;
  count: number;
}

// Hook to delete all manual scores for a job posting

export const useDeleteAllManualScores = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteManualScoresResponse, ApiError, string>({
    mutationFn: async (jobPostingId: string) => {
      if (!jobPostingId) {
        throw new Error("Job posting ID is required");
      }

      const url = apiUrls.resetManualScore.replace(":jobPostingId", jobPostingId)
      const response = await fetchWithAuth(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        // First try to get the response as text
        const responseText = await response.text();
        console.error("Error response from server:", responseText);
        
        // Try to parse it as JSON, but handle HTML responses gracefully
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          // Not valid JSON, likely HTML error page
          throw new Error(`Server returned status ${response.status}: Not a valid JSON response`);
        }
        
        throw ApiError.fromResponse(errorData, response);
      }

      // Try to parse as JSON, but handle empty responses too
      try {
        return await response.json();
      } catch (error) {
        // If the response is empty or not valid JSON, return a default response
        return {
          message: "Manual scores deleted successfully",
          count: 0
        };
      }
    },
    onSuccess: (_, jobPostingId) => {
      // Invalidate applications summary query to reflect the removed manual scores
      queryClient.invalidateQueries({
        queryKey: ['applications', 'summary', jobPostingId],
      });
      
      // Invalidate any existing manual score queries for this job posting
      queryClient.invalidateQueries({
        queryKey: ['manualScore', jobPostingId],
      });
    },
  });
};
