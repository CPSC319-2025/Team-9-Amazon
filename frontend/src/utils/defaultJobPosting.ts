import { JobPosting } from "../types/JobPosting/jobPosting";

export const defaultJobPosting: JobPosting = {
  id: "", // Will be assigned after creation
  title: "Software Engineer - Frontend",
  subtitle: "Join our amazing team!",
  description: "We are looking for a frontend engineer to build amazing user experiences.",
  location: "Vancouver, Canada",
  status: "Open",
  created_at: new Date().toDateString(),
  qualifications: "- Experience with React\n- Strong problem-solving skills",
  responsibilities: "- Build and maintain UI components\n- Work with backend engineers",
  tags: ["Frontend", "React", "JavaScript"],
  num_applicants: 0,
};