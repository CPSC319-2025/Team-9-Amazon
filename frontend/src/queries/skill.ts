import { useQuery, UseQueryResult, useMutation, UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "../representations/error";
//import { fetchWithAuth } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";
import { queryClient } from "../main";
import { fetchWithAuth } from "../api/apiUtils";

// Query keys
export const skillKeys = {
  all: ["skills"] as const,
  detail: (id: number) => [...skillKeys.all, id] as const,
};

// Types
export interface Skill {
  skillId: number;
  name: string;
}

export interface CreateSkillRequest {
  name: string;
}

export interface UpdateSkillRequest {
  name: string;
}

// Get skills list
export const useGetSkills = (): UseQueryResult<
  Skill[],
  ApiError
> => {
  return useQuery({
    queryKey: skillKeys.all,
    queryFn: async () => {
      const response = await fetch(apiUrls.getSkillsUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData);
      }

      return response.json();
    },
    retry: 1,
  });
};

// Get a specific skill
export const useGetSkill = (skillId: number): UseQueryResult<
  Skill,
  ApiError
> => {
  return useQuery({
    queryKey: skillKeys.detail(skillId),
    queryFn: async () => {
      const response = await fetchWithAuth(`${apiUrls.getSkillsUrl}${skillId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData);
      }

      return response.json();
    },
    retry: 1,
    enabled: !!skillId,
  });
};

// Create a new skill
export const useCreateSkill = (): UseMutationResult<
  Skill,
  ApiError,
  CreateSkillRequest
> => {
  return useMutation({
    mutationFn: async (newSkill: CreateSkillRequest) => {
      const response = await fetchWithAuth(apiUrls.getSkillsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSkill),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
};

// Update an existing skill
export const useUpdateSkill = (skillId: number): UseMutationResult<
  Skill,
  ApiError,
  UpdateSkillRequest
> => {
  return useMutation({
    mutationFn: async (updatedSkill: UpdateSkillRequest) => {
      const response = await fetchWithAuth(`${apiUrls.getSkillsUrl}${skillId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSkill),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
      queryClient.invalidateQueries({ queryKey: skillKeys.detail(skillId) });
    },
  });
};

// Delete a skill
export const useDeleteSkill = (): UseMutationResult<
  void,
  ApiError,
  number
> => {
  return useMutation({
    mutationFn: async (skillId: number) => {
      const response = await fetchWithAuth(`${apiUrls.getSkillsUrl}${skillId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
};
