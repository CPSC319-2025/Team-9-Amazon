import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../representations/error";
import { fetchWithAuth } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

// Query keys
export const skillKeys = {
  all: ["skills"] as const,
};

// Get skills list
export const useGetSkills = (): UseQueryResult<
  { skillId: number; name: string }[],
  ApiError
> => {
  return useQuery({
    queryKey: skillKeys.all,
    queryFn: async () => {
      const response = await fetchWithAuth(apiUrls.getSkillsUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData);
      }

      return response.json();
    },
    retry: 1,
  });
};
