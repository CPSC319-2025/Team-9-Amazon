import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { CriteriaRepresentation } from "../representations/criteria";
import { ApiError } from "../representations/error";
import { fetchWithAuth } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";
import { AccountRepresentation, CreateAccountRequest, CreateAccountResponse } from "../representations/accounts";

// Query keys (used for caching)
export const accountKeys = {
  all: ["accounts"] as const,
};

export const getAccounts = (): UseQueryResult<AccountRepresentation, ApiError> => {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: async () => {
      const response = await fetchWithAuth(apiUrls.accounts);

      if (!response.ok) {
        const errorData = await response.json();
        throw ApiError.fromResponse(errorData);
      }

      return response.json();
    },
    retry: 1,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateAccountResponse, Error, CreateAccountRequest>({
    mutationFn: async (data) => {
      const response = await fetchWithAuth(apiUrls.accounts, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.details ?? errorData.error ?? "Failed to create account";
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: accountKeys.all});
    }
  });
};
