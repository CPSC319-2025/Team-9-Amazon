import { Applicant } from "../types/applicant";
import { JobPosting } from "../types/JobPosting/jobPosting";
import { CriteriaGroup } from "../types/criteria";

export const mockApplicants: Applicant[] = [
  {
    email: "alice@example.com",
    first_name: "Alice",
    last_name: "Johnson",
  },
  {
    email: "bob@example.com",
    first_name: "Bob",
    last_name: "Smith",
  },
  {
    email: "carol@example.com",
    first_name: "Carol",
    last_name: "White",
  },
  {
    email: "david@example.com",
    first_name: "David",
    last_name: "Brown",
  },
  {
    email: "eva@example.com",
    first_name: "Eva",
    last_name: "Martinez",
  },
];

export const mockDatabaseCandidates: Applicant[] = [
  {
    email: "jane@example.com",
    first_name: "Jane",
    last_name: "Wilson",
    score: 175,
    total_score: 180,
  },
  {
    email: "michael@example.com",
    first_name: "Michael",
    last_name: "Chen",
    score: 168,
    total_score: 180,
  },
  {
    email: "sarah@example.com",
    first_name: "Sarah",
    last_name: "Davis",
    score: 172,
    total_score: 180,
  },
];

export const mockJobPostings: JobPosting[] = [
  {
    id: "12",
    title: "Software Engineer",
    subtitle: "ML Compiler",
    description:
      "We are looking for a software engineer to work on our ML compiler team.",
    location: "San Francisco, CA",
    status: "Published",
    createdAt: new Date("2021-09-01"),
    qualifications: "BS in Computer Science or equivalent experience",
    responsibilities: "Design and implement ML compiler optimizations",
    tags: ["Software Engineering", "ML Compiler"],
    num_applicants: 7,
  },
  {
    id: "2",
    title: "Data Scientist",
    subtitle: "Machine Learning",
    description:
      "We are looking for a data scientist to work on our machine learning team.",
    location: "New York, NY",
    status: "Published",
    createdAt: new Date("2021-09-15"),

    responsibilities: "Analyze and model data for business insights",
    tags: ["Data Science", "Machine Learning"],
    num_applicants: 10,
  },
  {
    id: "14",
    title: "Product Manager",
    subtitle: "Product Management",
    description:
      "We are looking for a product manager to work on our product management team.",
    location: "Seattle, WA",
    status: "Published",
    createdAt: new Date("2021-10-01"),
    qualifications: "BS in Business or equivalent experience",
    responsibilities: "Define product strategy and roadmap",
    tags: ["Product Management"],
    num_applicants: 52,
  },
  {
    id: "15",
    title: "UX Designer",
    subtitle: "User Experience",
    description:
      "We are looking for a UX designer to work on our user experience team.",
    location: "Los Angeles, CA",
    status: "Published",
    createdAt: new Date("2021-10-15"),
    qualifications: "BS in Design or equivalent experience",
    responsibilities: "Create user-centric designs and prototypes",
    tags: ["UX Design", "User Experience"],
    num_applicants: 3,
    num_machine_evaluated: 2,
    num_processes: 1,
  },
  {
    id: "16",
    title: "Software Engineer",
    subtitle: "Full Stack",
    description:
      "We are currently in search of a software engineer who will join our full stack development team. The ideal candidate will be tasked with designing and implementing robust solutions across the entire software development stack. This position requires a professional who is adept at developing both client and server software, and who can effectively integrate various technologies to create seamless, efficient, and scalable applications. The role offers the opportunity to work alongside a dedicated team of developers and engineers who are committed to innovating and pushing the boundaries of technology in order to deliver cutting-edge software products",
    location: "Austin, TX",
    status: "Published",
    createdAt: new Date("2021-11-01"),
    qualifications: "BS in Computer Science or equivalent experience",
    responsibilities: "Develop and maintain full stack applications",
    tags: ["Software Engineering", "Full Stack"],
    num_applicants: 5,
  },
];

export const mockCriteriaGroups: CriteriaGroup[] = [
  {
    id: "1234",
    name: "Developer Criteria",
    keywords: [
      { name: "Java", pointsPerYearOfExperience: 1, maxPoints: 4 },
      { name: "C#", pointsPerYearOfExperience: 3, maxPoints: 5 },
      { name: "API", pointsPerYearOfExperience: 2, maxPoints: 4 },
    ],
  },
  {
    id: "5678",
    name: "Frontend Criteria",
    keywords: [
      { name: "Node.js", pointsPerYearOfExperience: 2, maxPoints: 3 },
      { name: "React", pointsPerYearOfExperience: 3, maxPoints: 10 },
      { name: "TypeScript", pointsPerYearOfExperience: 2, maxPoints: 6 },
    ],
  },
  {
    id: "9012",
    name: "DevOps Criteria",
    keywords: [
      { name: "Docker", pointsPerYearOfExperience: 3, maxPoints: 9 },
      { name: "Kubernetes", pointsPerYearOfExperience: 4, maxPoints: 8 },
      { name: "CI/CD", pointsPerYearOfExperience: 2, maxPoints: 6 },
      { name: "AWS", pointsPerYearOfExperience: 3, maxPoints: 9 },
    ],
  },
  {
    id: "3456",
    name: "Communication Skills",
    keywords: [
      { name: "Presentation", pointsPerYearOfExperience: 2, maxPoints: 6 },
      { name: "Documentation", pointsPerYearOfExperience: 2, maxPoints: 4 },
      {
        name: "Team Leadership",
        pointsPerYearOfExperience: 3,
        maxPoints: 6,
      },
      { name: "Collaboration", pointsPerYearOfExperience: 2, maxPoints: 4 },
    ],
  },
  {
    id: "7890",
    name: "Soft Skills",
    keywords: [
      {
        name: "Problem Solving",
        pointsPerYearOfExperience: 3,
        maxPoints: 9,
      },
      {
        name: "Time Management",
        pointsPerYearOfExperience: 2,
        maxPoints: 6,
      },
      { name: "Adaptability", pointsPerYearOfExperience: 2, maxPoints: 6 },
      { name: "Initiative", pointsPerYearOfExperience: 2, maxPoints: 4 },
    ],
  },
  {
    id: "2345",
    name: "Backend Criteria",
    keywords: [
      { name: "Python", pointsPerYearOfExperience: 3, maxPoints: 6 },
      { name: "SQL", pointsPerYearOfExperience: 3, maxPoints: 9 },
      { name: "MongoDB", pointsPerYearOfExperience: 2, maxPoints: 6 },
      { name: "REST", pointsPerYearOfExperience: 2, maxPoints: 4 },
    ],
  },
];
