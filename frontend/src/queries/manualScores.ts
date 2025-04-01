import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiUrls } from "../api/apiUrls";
import { fetchWithAuth } from "../api/apiUtils";
import { ApiError } from "../representations/error";

// Define the manual score data type
export interface ManualScoreData {
  criteriaScores: ManualCriteriaScore[];
  totalScore: number;
  lastUpdated: Date;
}

export interface ManualCriteriaScore {
  id: number;
  name: string;
  score: number;
  maxScore: number;
}

// Query keys for manual scores
export const manualScoreKeys = {
  all: ["manualScores"] as const,
  byJobPostingAndCandidate: (jobPostingId: string, candidateEmail: string) =>
    [...manualScoreKeys.all, jobPostingId, candidateEmail] as const,
};

// Hook to fetch manual scores for a candidate
export const useGetManualScores = (jobPostingId: string, candidateEmail: string) => {
  return useQuery<ManualScoreData, ApiError>({
    queryKey: manualScoreKeys.byJobPostingAndCandidate(jobPostingId, candidateEmail),
    queryFn: async () => {
      if (!jobPostingId || !candidateEmail) {
        throw new Error("Job posting ID and candidate email are required");
      }

      const url = apiUrls.jobPostings.manualScores
        .replace(":jobPostingId", jobPostingId)
        .replace(":candidateEmail", candidateEmail);

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData, response);
      }

      const data = await response.json();
      
      // Parse the criteriaScores if it's a string
      if (typeof data.criteriaScores === 'string') {
        data.criteriaScores = JSON.parse(data.criteriaScores);
      }
      
      // Convert lastUpdated to Date object if it's a string
      if (typeof data.lastUpdated === 'string') {
        data.lastUpdated = new Date(data.lastUpdated);
      }

      return data;
    },
  });
};

// Hook to save manual scores for a candidate
export const useSaveManualScores = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, ApiError, { 
    jobPostingId: string; 
    candidateEmail: string; 
    criteriaScores: ManualCriteriaScore[]; 
    totalScore: number; 
  }>({
    mutationFn: async ({ jobPostingId, candidateEmail, criteriaScores, totalScore }) => {
      if (!jobPostingId || !candidateEmail) {
        throw new Error("Job posting ID and candidate email are required");
      }

      const url = apiUrls.jobPostings.manualScores
        .replace(":jobPostingId", jobPostingId)
        .replace(":candidateEmail", candidateEmail);

      const response = await fetchWithAuth(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ criteriaScores, totalScore }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData, response);
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate the query to refetch the manual scores
      queryClient.invalidateQueries({
        queryKey: manualScoreKeys.byJobPostingAndCandidate(
          variables.jobPostingId,
          variables.candidateEmail
        ),
      });
    },
  });
};
