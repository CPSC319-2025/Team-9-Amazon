// Mock data for manual scoring
import { ApplicationSummary } from "../types/application";

// Mock criteria with skills for manual scoring
export const mockCriteriaWithSkills = [
  {
    id: 1,
    name: "Technical Skills",
    score: 85,
    skills: [
      {
        id: 1,
        name: "JavaScript",
        score: 0, // Initial score for manual scoring
        maxPoints: 75,
      },
      {
        id: 2,
        name: "React",
        score: 0,
        maxPoints: 100,
      },
      {
        id: 3,
        name: "TypeScript",
        score: 0,
        maxPoints: 60,
      },
    ],
  },
  {
    id: 2,
    name: "Soft Skills",
    score: 90,
    skills: [
      {
        id: 4,
        name: "Communication",
        score: 0,
        maxPoints: 50,
      },
      {
        id: 5,
        name: "Teamwork",
        score: 0,
        maxPoints: 50,
      },
    ],
  },
  {
    id: 3,
    name: "Education",
    score: 75,
    skills: [
      {
        id: 6,
        name: "Computer Science Degree",
        score: 0,
        maxPoints: 100,
      },
    ],
  },
];

// Mock application summaries with manual scores
export const mockApplicationsWithManualScores: ApplicationSummary[] = [
  {
    applicantId: 1,
    jobPostingId: 1,
    applicant: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    },
    score: 85,
    manualScore: 78,
  },
  {
    applicantId: 2,
    jobPostingId: 1,
    applicant: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
    },
    score: 92,
    manualScore: 95,
  },
  {
    applicantId: 3,
    jobPostingId: 1,
    applicant: {
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.johnson@example.com",
    },
    score: 78,
    manualScore: 65,
  },
  {
    applicantId: 4,
    jobPostingId: 1,
    applicant: {
      firstName: "Emily",
      lastName: "Williams",
      email: "emily.williams@example.com",
    },
    score: 88,
    // No manual score yet
  },
  {
    applicantId: 5,
    jobPostingId: 1,
    applicant: {
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@example.com",
    },
    score: 72,
    manualScore: 80,
  },
];

// Function to get mock manual score for a candidate by email
export const getMockManualScoreByEmail = (email: string): number | undefined => {
  const application = mockApplicationsWithManualScores.find(
    app => app.applicant.email === email
  );
  return application?.manualScore;
};
