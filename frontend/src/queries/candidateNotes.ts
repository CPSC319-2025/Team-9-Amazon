import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CandidateNote, getCandidateNotes, saveCandidateNotes } from "../services/candidateNotes";

/**
 * Hook to fetch candidate notes
 * @param jobPostingId The job posting ID
 * @param candidateEmail The candidate's email
 * @returns Query result with candidate notes data
 */
export const useGetCandidateNotes = (
  jobPostingId: string,
  candidateEmail: string
) => {
  return useQuery<CandidateNote | null, Error>({
    queryKey: ["candidateNotes", jobPostingId, candidateEmail],
    queryFn: () => getCandidateNotes(jobPostingId, candidateEmail),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

interface SaveNotesParams {
  jobPostingId: string;
  candidateEmail: string;
  notes: string;
}

/**
 * Hook to save candidate notes
 * @returns Mutation function to save notes
 */
export const useSaveCandidateNotes = () => {
  const queryClient = useQueryClient();

  return useMutation<CandidateNote, Error, SaveNotesParams>({
    mutationFn: ({ jobPostingId, candidateEmail, notes }: SaveNotesParams) =>
      saveCandidateNotes(jobPostingId, candidateEmail, notes),
    onSuccess: (data, variables) => {
      // Update the cache with the new data
      queryClient.setQueryData(
        ["candidateNotes", variables.jobPostingId, variables.candidateEmail],
        data
      );
      
      // Also invalidate the query to ensure it's refreshed on the next fetch
      queryClient.invalidateQueries({
        queryKey: ["candidateNotes", variables.jobPostingId, variables.candidateEmail]
      });
    },
  });
};
