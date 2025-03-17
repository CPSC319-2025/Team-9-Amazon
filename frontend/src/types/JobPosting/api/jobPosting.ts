import { JobPostingStatus } from "../jobPosting";


export interface JobPostingAttributes {
  id: number | undefined;
  title: string;
  subtitle: string | undefined;
  description: string;
  responsibilities: string | undefined;
  qualifications: string | undefined;
  staffId: number;
  status: JobPostingStatus;
  location: string;
  num_applicants: number;
  num_machine_evaluated: number;
  num_processes: number;
  createdAt: Date;
}

export interface JobTagAttributes {
  id: number | undefined;
  name: string;
}