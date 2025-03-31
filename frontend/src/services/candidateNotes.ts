import { fetchWithAuth } from "../api/apiUtils";
import { apiUrls } from "../api/apiUrls";

export interface CandidateNote {
  jobPostingId: string;
  candidateEmail: string;
  notes: string;
  lastUpdated: string;
}

/**
 * Save notes for a specific candidate
 * @param jobPostingId The job posting ID
 * @param candidateEmail The candidate's email
 * @param notes The notes content
 * @returns A promise that resolves to the saved note
 */
export async function saveCandidateNotes(
  jobPostingId: string,
  candidateEmail: string,
  notes: string
): Promise<CandidateNote> {
  try {
    const url = apiUrls.candidateNotes
      .replace(":jobPostingId", jobPostingId)
      .replace(":candidateEmail", encodeURIComponent(candidateEmail));

    console.log("Saving notes to URL:", url);
    console.log("Notes content:", notes);

    const response = await fetchWithAuth(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response error:", response.status, errorText);
      throw new Error(`Failed to save candidate notes: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Save notes response:", data);
    return data;
  } catch (error) {
    console.error("Error saving candidate notes:", error);
    throw error; // Rethrow the original error with more details
  }
}

/**
 * Get notes for a specific candidate
 * @param jobPostingId The job posting ID
 * @param candidateEmail The candidate's email
 * @returns A promise that resolves to the candidate's notes
 */
export async function getCandidateNotes(
  jobPostingId: string,
  candidateEmail: string
): Promise<CandidateNote | null> {
  try {
    const url = apiUrls.candidateNotes
      .replace(":jobPostingId", jobPostingId)
      .replace(":candidateEmail", encodeURIComponent(candidateEmail));

    console.log("Fetching notes from URL:", url);

    const response = await fetchWithAuth(url);

    if (response.status === 404) {
      console.log("No notes found for this candidate");
      // No notes found for this candidate
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response error:", response.status, errorText);
      throw new Error(`Failed to fetch candidate notes: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Fetched notes:", data);
    return data;
  } catch (error) {
    console.error("Error fetching candidate notes:", error);
    // Return null instead of throwing to handle the case where notes don't exist yet
    return null;
  }
}
