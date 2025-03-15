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
import { ApplicationsSummaryResponse } from "../types/application";

// Query keys
export const jobPostingKeys = {
  all: ["jobPosting"] as const,
  detail: (jobPostingId: string) =>
    [...jobPostingKeys.all, jobPostingId] as const,
};

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
        throw ApiError.fromResponse(errorData);
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
        throw ApiError.fromResponse(errorData);
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
        throw ApiError.fromResponse(errorData);
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
        throw ApiError.fromResponse(errorData);
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
