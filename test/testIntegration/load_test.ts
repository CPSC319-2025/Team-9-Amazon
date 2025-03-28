import axios from "axios";
import readline from "readline";
import { faker } from "@faker-js/faker";

// config stuff
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const staffEmails: string[] = [
  "staff1@example.com",
  "staff2@example.com",
  "staff3@example.com",
  "staff300@example.com",
];
const applicantEmails: string[] = ["applicant1@example.com"];
const BASE_URL = "http://localhost:3001";
const n_job_postings = 10;
const adminEmail = "violet@CHPostal.com";
const adminPassword = "password";

// API stuff
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const apiUrls = {
  login: `${BASE_URL}/login`,
  staff: `${BASE_URL}/admin/accounts`,
  deleteStaff: `${BASE_URL}/admin/accounts/:account_id`,
  jobPostings: `${BASE_URL}/job-postings`,
  deleteJobPosting: (jobId: number) => `${BASE_URL}/job-postings/${jobId}`,
  applications: `${BASE_URL}/applications`,
};
let _authToken = "";
const myPassword = "password1234";
const _authTokens: { [key: string]: string } = {};

// Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getAdminToken = async (): Promise<string> => {
  if (_authToken.length > 0) {
    return _authToken;
  }

  const payload = { email: adminEmail, password: adminPassword };
  const response = await axios.post(apiUrls.login, payload);
  _authToken = response.data.token;
  return _authToken;
};

const getStaffToken = async (email: string): Promise<string> => {
  if (_authTokens[email]) {
    return _authTokens[email];
  }
  const payload = { email, password: myPassword };
  const response = await axios.post(apiUrls.login, payload);
  _authTokens[email] = response.data.token;
  return _authTokens[email];
};

// Handling staff
const createStaff = async (): Promise<void> => {
  const options = {
    headers: {
      Authorization: `Bearer ${await getAdminToken()}`,
    },
  };
  const promises = []
  for (const email of staffEmails) {
    const payload = {
      email,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: myPassword,
      phone: faker.phone.number(),
      isAdmin: Math.random() < 0.5,
      isHiringManager: true,
    };
    promises.push(
      axios
        .post(apiUrls.staff, payload, options)
        .then((response) => {
          console.log(`Creating staff with email ${email}: ${response.status}`);
          _authTokens[email] = response.data.token;
        })
        .catch((error: any) => {
          console.error(`Error creating staff with email ${email}: ${error.response?.status}`);
        })
    );
  }
  await Promise.all(promises)
};

const deleteStaff = async (): Promise<void> => {
  const options = {
    headers: {
      Authorization: `Bearer ${await getAdminToken()}`,
    },
  };
  const allAccounts = await axios.get(apiUrls.staff, options);
  const accountIds = allAccounts.data.staff
    .filter((account: any) => staffEmails.includes(account.email))
    .map((account: any) => ({ account_id: account.id, email: account.email }));
  const promises = [];
  for (const { account_id, email } of accountIds) {
    const url = apiUrls.deleteStaff.replace(":account_id", account_id);
    promises.push(axios.delete(url, options).then((response => {
      console.log(`Deleting staff with email ${email} and account ID ${account_id}: ${response.status}`);
    })).catch((error: any) => {
      console.error(`Error deleting staff with account ID ${account_id}: ${error.response?.status}`);
    }))
  }
  await Promise.all(promises)
};

// Handling job postings
const createJobPostings = async (): Promise<void> => {
  const createJobPosting = async (staffEmail: string, index: number): Promise<void> => {
    const options = {
      headers: {
        Authorization: `Bearer ${await getStaffToken(staffEmail)}`,
      },
    };
    const payload = {
      title: `Load Test Job Posting ${index}`,
      description: "This is a test job posting for load testing purposes.",
      location: faker.location.city(),
    };

    try {
      const response = await axios.post(apiUrls.jobPostings, payload, options);
      console.log(`Creating job posting ${index + 1}: ${response.status}`);
    } catch (error: any) {
      console.error(`Error creating job posting ${index + 1}: ${error.response?.status} - ${error.response?.data}`);
    }
  };

  const promises = Array.from({ length: n_job_postings }, (_, i) => {
    const staffEmail = staffEmails[Math.floor(Math.random() * staffEmails.length)];
    return createJobPosting(staffEmail, i);
  });
  await Promise.all(promises);
};

const deleteJobPostings = async (): Promise<void> => {
  const deleteStaffJobPostings = async (staffEmail: string): Promise<void> => {
    const options = {
      headers: {
        Authorization: `Bearer ${await getStaffToken(staffEmail)}`,
      },
    };
    const jobPostings = await axios.get(apiUrls.jobPostings, options);
    const jobIds = jobPostings.data.map((job: any) => job.id);

    const promises = [];
    for (const jobId of jobIds) {
      const url = apiUrls.deleteJobPosting(jobId);
      promises.push(
        axios
          .delete(url, options)
          .then((response) => {
            console.log(`Deleting job posting with ID ${jobId}: ${response.status}`);
          })
          .catch((error: any) => {
            console.error(`Error deleting job posting with ID ${jobId}: ${error.response?.status}`);
          })
      );
    }
    await Promise.all(promises);
  };

  const promises = []
  for (const staffEmail of staffEmails) {
    promises.push(deleteStaffJobPostings(staffEmail));
  }
  await Promise.all(promises);
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
    console.log("Step 2: Creating job postings...");
    await createJobPostings();
  //   console.log("Step 3: Making applications...");
  //   await makeApplications();
  //   console.log("Integration tests completed.");
};

// Run test
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete the staff, job postings, and applications
const migrateDown = async (): Promise<void> => {
  console.log("Deleting Sample Data...");
  console.log("Step 1: Deleting Job Postings...");
  await deleteJobPostings();
  console.log("Step 2: Deleting staff...");
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
