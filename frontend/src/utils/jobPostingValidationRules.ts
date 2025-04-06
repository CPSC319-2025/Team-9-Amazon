import { JobPosting } from "../types/JobPosting/jobPosting";

export const FIELD_MAX_LENGTHS: Partial<Record<keyof JobPosting, number>> = {
    title: 255,
    subtitle: 255,
    location: 255,

    description: 5000,
    qualifications: 5000,
    responsibilities: 5000,
};