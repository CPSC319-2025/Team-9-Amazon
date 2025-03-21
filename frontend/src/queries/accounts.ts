import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { CriteriaRepresentation } from "../representations/criteria";
import { ApiError } from "../representations/error";
import { fetchWithAuth } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";
import { AccountRepresentation, AccountRequest, CreateAccountResponse, EditAccountResponse } from "../representations/accounts";

// Query keys (used for caching)
export const accountKeys = {
  all: ["accounts"] as const,
};

export const getAccounts = (): UseQueryResult<AccountRepresentation, ApiError> => {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: async () => {
      const response = await fetchWithAuth(apiUrls.accounts.base);

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
  return useMutation<CreateAccountResponse, Error, AccountRequest>({
    mutationFn: async (data) => {
      const response = await fetchWithAuth(apiUrls.accounts.base, {
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

export const useEditAccount = (accountId: string) => () => {
  const queryClient = useQueryClient();
  const url = apiUrls.accounts.edit.replace(":accountId", accountId);
  return useMutation<EditAccountResponse, Error, AccountRequest>({
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
        const message = errorData.details ?? errorData.error ?? "Failed to edit account";
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: accountKeys.all});
    }
  });
};
