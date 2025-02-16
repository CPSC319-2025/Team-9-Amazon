import { Applicant } from '../types/applicant';

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