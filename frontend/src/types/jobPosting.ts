export enum JobPostingStatus {
    "Draft" = "Draft",
    "Published" = "Published",
    "Closed" = "Closed"
  }
  
  export interface JobPosting {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    location: string;
    status: string;
    created_at: string;
    qualifications?: string;
    responsibilities?: string;
    tags: string[];
    num_applicants?: number;
  }