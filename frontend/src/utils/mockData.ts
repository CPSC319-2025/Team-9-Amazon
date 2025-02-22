import { Applicant } from '../types/applicant';
import { JobPosting } from '../types/jobPosting';

export const mockApplicants: Applicant[] = [
  {
    email: 'alice@example.com',
    first_name: 'Alice',
    last_name: 'Johnson',
  },
  {
    email: 'bob@example.com',
    first_name: 'Bob',
    last_name: 'Smith',
  },
  {
    email: 'carol@example.com',
    first_name: 'Carol',
    last_name: 'White',
  },
  {
    email: 'david@example.com',
    first_name: 'David',
    last_name: 'Brown',
  },
  {
    email: 'eva@example.com',
    first_name: 'Eva',
    last_name: 'Martinez',
  },
];

export const mockDatabaseCandidates: Applicant[] = [
  {
    email: 'jane@example.com',
    first_name: 'Jane',
    last_name: 'Wilson',
    score: 175,
    total_score: 180,
  },
  {
    email: 'michael@example.com',
    first_name: 'Michael',
    last_name: 'Chen',
    score: 168,
    total_score: 180,
  },
  {
    email: 'sarah@example.com',
    first_name: 'Sarah',
    last_name: 'Davis',
    score: 172,
    total_score: 180,
  },
];

export const mockJobPostings: JobPosting[] = [
  {
    id: '12',
    title: 'Software Engineer',
    subtitle: 'ML Compiler',
    description: 'We are looking for a software engineer to work on our ML compiler team.',
    location: 'San Francisco, CA',
    status: 'Published',
    created_at: '2021-09-01',
    qualifications: 'BS in Computer Science or equivalent experience',
    responsibilities: 'Design and implement ML compiler optimizations',
    tags: ['Software Engineering', 'ML Compiler'],
    num_applicants: 7,
  },
  {
    id: '13',
    title: 'Data Scientist',
    subtitle: 'Machine Learning',
    description: 'We are looking for a data scientist to work on our machine learning team.',
    location: 'New York, NY',
    status: 'Published',
    created_at: '2021-09-15',
    qualifications: 'MS in Computer Science or equivalent experience',
    responsibilities: 'Analyze and model data for business insights',
    tags: ['Data Science', 'Machine Learning'],
    num_applicants: 10,
  },
  {
    id: '14',
    title: 'Product Manager',
    subtitle: 'Product Management',
    description: 'We are looking for a product manager to work on our product management team.',
    location: 'Seattle, WA',
    status: 'Published',
    created_at: '2021-10-01',
    qualifications: 'BS in Business or equivalent experience',
    responsibilities: 'Define product strategy and roadmap',
    tags: ['Product Management'],
    num_applicants: 52,
  },
  {
    id: '15',
    title: 'UX Designer',
    subtitle: 'User Experience',
    description: 'We are looking for a UX designer to work on our user experience team.',
    location: 'Los Angeles, CA',
    status: 'Published',
    created_at: '2021-10-15',
    qualifications: 'BS in Design or equivalent experience',
    responsibilities: 'Create user-centric designs and prototypes',
    tags: ['UX Design', 'User Experience'],
    num_applicants: 3,
  },
  {
    id: '16',
    title: 'Software Engineer',
    subtitle: 'Full Stack',
    description: 'We are looking for a software engineer to work on our full stack team.',
    location: 'Austin, TX',
    status: 'Published',
    created_at: '2021-11-01',
    qualifications: 'BS in Computer Science or equivalent experience',
    responsibilities: 'Develop and maintain full stack applications',
    tags: ['Software Engineering', 'Full Stack'],
    num_applicants: 5,
  }
];