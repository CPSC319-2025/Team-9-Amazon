import { useMutation } from "@tanstack/react-query";
import { apiUrls } from "../api/apiUrls";

interface WorkExperience {
  job_title: string;
  company: string;
  from: string;
  to?: string | null;
  role_description?: string;
  skills: string;
}

interface ApplicationData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  personal_links?: string;
  resume: string;
  jobPostingId: string;
  work_experience?: WorkExperience[];
}

interface ApplicationResponse {
  applicantId: number;
  jobPostingId: number;
}

export const useCreateApplication = () => {
  return useMutation<ApplicationResponse, Error, ApplicationData>({
    mutationFn: async (data) => {
      // Validate jobPostingId
      if (!data.jobPostingId) {
        throw new Error("Job posting ID is required");
      }

      // Process work experience to convert empty 'to' fields to null
      const processedData = {
        ...data,
        jobPostingId: data.jobPostingId.toString(), // Ensure jobPostingId is a string
        work_experience: data.work_experience?.map((exp) => ({
          ...exp,
          to: exp.to?.trim() === "" ? null : exp.to,
        })),
      };

      const response = await fetch(apiUrls.createApplicationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      return response.json();
    },
  });
};
