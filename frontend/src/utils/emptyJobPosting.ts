import { JobPosting } from "../types/JobPosting/jobPosting";

export const emptyJobPosting: JobPosting = {
  id: "", // Will be assigned after creation
  title: "Your Title",
  subtitle: "Your Subtitle",
  description: "Your Description",
  location: "Your Location",
  status: "Open",
  createdAt: new Date(),
  qualifications: "Your Qualifications",
  responsibilities: "Your Responsibilities",
  tags: [],
  num_applicants: 0,
};
