export enum JobPostingStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export interface JobPosting {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  location: string;
  status: JobPostingStatus;
  createdAt: Date;
  qualifications?: string;
  responsibilities?: string;
  tags: string[];
  num_applicants?: number;
  num_machine_evaluated?: number;
  num_processes?: number;
}