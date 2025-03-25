import axios from "axios";
import readline from "readline";
import { faker } from "@faker-js/faker";

// Hardcoded list of 300 staff emails
const staffEmails: string[] = [
  "staff1@example.com",
  "staff2@example.com",
  "staff3@example.com", // Add the rest of your 300 emails here
  // ...
  "staff300@example.com",
];

// API stuff
const BASE_URL = "http://localhost:3001";
const apiUrls = {
  staff: `${BASE_URL}/admin/accounts`,
  deleteStaff: `${BASE_URL}/admin/accounts/:account_id`,
  jobPostings: `${BASE_URL}/job_postings`,
  applications: `${BASE_URL}/applications`,
};
const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ2aW9sZXRAQ0hQb3N0YWwuY29tIiwiaXNIaXJpbmdNYW5hZ2VyIjp0cnVlLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NDI5MzY0OTUsImV4cCI6MTc0MzAyMjg5NX0.NHRtmdc9nZ864-xqMec2p0PZRpDymgZz1W9SaQXVJ8c";

// Function to send POST requests to create staff
const createStaff = async (): Promise<void> => {
  const options = {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };
  for (const email of staffEmails) {
    const payload = {
      email,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: "password123",
      phone: faker.phone.number(),
      isAdmin: Math.random() < 0.5,
      isHiringManager: Math.random() < 0.5,
    };

    try {
      const response = await axios.post(apiUrls.staff, payload, options);
      console.log(`Creating staff with email ${email}: ${response.status}`);
    } catch (error: any) {
      console.error(`Error creating staff with email ${email}: ${error.response?.status}`);
    }
  }
};

const deleteStaff = async (): Promise<void> => {
  const options = {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };
  const allAccounts = await axios.get(apiUrls.staff, options);
  const accountIds = allAccounts.data.staff
    .filter((account: any) => staffEmails.includes(account.email))
    .map((account: any) => ({ account_id: account.id, email: account.email }));
  for (const { account_id, email } of accountIds) {
    const url = apiUrls.deleteStaff.replace(":account_id", account_id);
    try {
      const response = await axios.delete(url, options);
      console.log(`Deleting staff with email ${email} and account ID ${account_id}: ${response.status}`);
    } catch (error: any) {
      console.error(`Error deleting staff with account ID ${account_id}: ${error.response?.status}`);
    }
  }
};

// Function to send POST requests to create job postings
const createJobPostings = async (): Promise<void> => {
  for (let i = 0; i < 300; i++) {
    const payload = {
      title: `Job Posting ${i + 1}`,
      description: "Sample job description",
    };

    try {
      const response = await axios.post(apiUrls.jobPostings, payload);
      console.log(`Creating job posting ${i + 1}: ${response.status} - ${response.data}`);
    } catch (error: any) {
      console.error(`Error creating job posting ${i + 1}: ${error.response?.status} - ${error.response?.data}`);
    }
  }
};

// Function to send POST requests to make applications
const makeApplications = async (): Promise<void> => {
  for (let i = 0; i < 300; i++) {
    const payload = {
      applicantEmail: `applicant${i + 1}@example.com`,
      jobId: i + 1,
    };

    try {
      const response = await axios.post(apiUrls.applications, payload);
      console.log(`Making application for job ${i + 1}: ${response.status} - ${response.data}`);
    } catch (error: any) {
      console.error(`Error making application for job ${i + 1}: ${error.response?.status} - ${error.response?.data}`);
    }
  }
};

// Create staff, job postings, and applications
const migrateUp = async (): Promise<void> => {
  console.log("Creating Sample Data...");
  console.log("Step 1: Creating staff...");
  await createStaff();
  //   console.log("Step 2: Creating job postings...");
  //   await createJobPostings();
  //   console.log("Step 3: Making applications...");
  //   await makeApplications();
  //   console.log("Integration tests completed.");
};

// Delete the staff, job postings, and applications
const migrateDown = async (): Promise<void> => {
  console.log("Deleting Sample Data...");
  console.log("Step 1: Deleting staff...");
  await deleteStaff();
};

// Prompt user for input
const promptUser = (): void => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const promptText = `
RECRUIT integration load testing tool:
a1: Insert sample data
b1: Delete sample data
0 : Exit
    `;

  const handleAnswer = async (answer: string): Promise<void> => {
    if (answer === "a1") {
      await migrateUp();
    } else if (answer === "b1") {
      await migrateDown();
    } else if (answer === "0") {
      console.log("Exiting...");
    } else {
      console.log("Invalid input");
    }
    rl.close();
  };

  rl.question(promptText, handleAnswer);
};
promptUser();
