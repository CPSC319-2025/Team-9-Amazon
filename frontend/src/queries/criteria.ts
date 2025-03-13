import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CriteriaRepresentation } from "../representations/criteria";
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
        throw ApiError.fromResponse(errorData);
      }

      return response.json();
    },
    retry: 1,
  });
};
