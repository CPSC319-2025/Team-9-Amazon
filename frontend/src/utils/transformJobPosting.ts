import { JobPosting } from "../types/JobPosting/jobPosting";
import { JobPostingAttributes, JobTagAttributes } from "../types/JobPosting/api/jobPosting";

export const transformJobPosting = (
  data: JobPostingAttributes & { jobTags: JobTagAttributes[] }
): JobPosting => ({
  id: String(data.id),
  title: data.title,
  subtitle: data.subtitle,
  description: data.description,
  location: data.location,
  status: data.status,
  createdAt: data.createdAt,
  qualifications: data.qualifications,
  responsibilities: data.responsibilities,
  tags: data.jobTags.map((tag) => tag.name),
  num_applicants: data.num_applicants,
  num_machine_evaluated: data.num_machine_evaluated,
  num_processes: data.num_processes,
});

export const transformJobPostings = (
  data: (JobPostingAttributes & { jobTags: JobTagAttributes[] })[]
): JobPosting[] => data.map(transformJobPosting);