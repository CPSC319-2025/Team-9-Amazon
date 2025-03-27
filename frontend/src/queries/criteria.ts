import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { CreateCriteriaRequest, CreateCriteriaResponse, CriteriaRepresentation, DeleteCriteriaRequest, DeleteCriteriaResponse } from "../representations/criteria";
import { ApiError } from "../representations/error";
import { fetchWithAuth } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

// Query keys
export const criteriaKeys = {
  all: ["criteria"] as const,
  global: ["criteria", "global"] as const,
  jobPosting: (jobPostingId: string) =>
    [...criteriaKeys.all, "job", jobPostingId] as const,
  criteria: (jobPostingId: string, criteriaId: string) =>
    [...criteriaKeys.jobPosting(jobPostingId), criteriaId] as const,
};

// Get global criteria
export const useGetGlobalCriteria = (): UseQueryResult<
  CriteriaRepresentation[],
  ApiError
> => {
  return useQuery({
    queryKey: criteriaKeys.global,
    queryFn: async () => {
      const response = await fetchWithAuth(apiUrls.getGlobalCriteriaUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData, response);
      }

      return response.json();
    },
    retry: 1,
  });
};

export const useCreateCriteria = (): UseMutationResult<CreateCriteriaResponse, Error, CreateCriteriaRequest, unknown> => {
  const queryClient = useQueryClient();
  return useMutation<CreateCriteriaResponse, Error, CreateCriteriaRequest>({
    mutationFn: async (data) => {
      const response = await fetchWithAuth(apiUrls.criteria.base, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.details ?? errorData.error ?? "Failed to create criteria";
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: criteriaKeys.global});
    }
  });
};

export const useDeleteCriteria = (criteriaId: string) => (): UseMutationResult<DeleteCriteriaResponse, Error, DeleteCriteriaRequest, unknown> => {
  const queryClient = useQueryClient();
  const url = apiUrls.criteria.delete.replace(":criteria_id", criteriaId);
  return useMutation<DeleteCriteriaResponse, Error, DeleteCriteriaRequest>({
    mutationFn: async () => {
      const response = await fetchWithAuth(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.details ?? errorData.error ?? "Failed to delete criteria";
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: criteriaKeys.global});
    }
  });
};

export interface UpdateCriteriaRequest {
  name: string;
  criteriaJson?: {
    rules: Array<{
      skill: string;
      pointsPerYearOfExperience: number;
      maxPoints: number;
    }>;
  };
}

export interface UpdateCriteriaResponse {
  id: number;
  name: string;
  criteriaJson: {
    rules: Array<{
      skill: string;
      pointsPerYearOfExperience: number;
      maxPoints: number;
    }>;
  };
}

export const useUpdateCriteria = (criteriaId: string): UseMutationResult<UpdateCriteriaResponse, Error, UpdateCriteriaRequest, unknown> => {
  const queryClient = useQueryClient();
  const url = apiUrls.criteria.update.replace(":criteria_id", criteriaId);
  
  return useMutation<UpdateCriteriaResponse, Error, UpdateCriteriaRequest>({
    mutationFn: async (data) => {
      const response = await fetchWithAuth(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.details ?? errorData.error ?? "Failed to update criteria";
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: criteriaKeys.global});
    }
  });
};