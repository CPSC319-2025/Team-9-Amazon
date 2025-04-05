import axios from "axios";
import readline from "readline";
import { faker } from "@faker-js/faker";
import path from "path";
import fs from "fs";

// config stuff
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const n_staff = 2;
const n_job_postings = 5;
const n_applications = 50;
const staffEmails: string[] = Array.from(
  { length: n_staff },
  (_, i) => `staff${i + 1}@load-test.com`
);
const applicantEmails: string[] = Array.from(
  { length: n_applications },
  (_, i) => `applicant${i + 1}@load-test.com`
);
const BASE_URL = "http://localhost:3001";
const adminEmail = "violet@CHPostal.com";
const adminPassword = "password";

// API stuff
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const apiUrls = {
  login: `${BASE_URL}/login`,
  staff: `${BASE_URL}/accounts`,
  deleteStaff: `${BASE_URL}/accounts/:account_id`,
  jobPostings: `${BASE_URL}/job-postings`,
  criteria: (jobId: number) => `${BASE_URL}/job-postings/${jobId}/criteria`,
  deleteJobPosting: (jobId: number) => `${BASE_URL}/job-postings/${jobId}`,
  applications: `${BASE_URL}/applications`,
};
let _authToken = "";
const myPassword = "password1234";
const _authTokens: { [key: string]: string } = {};
const jobIds: number[] = [];
const myCriteria = {
  name: "Load Testing Criteria",
  criteriaJson: {
    rules: [
      {
        pointsPerYearOfExperience: 2,
        maxPoints: 10,
        skill: "React",
      },
    ],
  },
};
const resumeBase64 = fs
  .readFileSync(path.join(__dirname, "Load_Test_Resume.pdf"))
  .toString("base64");

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
  const promises = [];
  for (const email of staffEmails) {
    const payload = {
      email,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: myPassword,
      phone: "403-123-4567",
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
          console.error(
            `Error creating staff with email ${email}: ${error.response?.status}`
          );
        })
    );
  }
  await Promise.all(promises);
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
    promises.push(
      axios
        .delete(url, options)
        .then((response) => {
          console.log(
            `Deleting staff with email ${email} and account ID ${account_id}: ${response.status}`
          );
        })
        .catch((error: any) => {
          console.error(
            `Error deleting staff with account ID ${account_id}: ${error.response?.status}`
          );
        })
    );
  }
  await Promise.all(promises);
};

// Handling job postings and criteria
const createJobPostings = async (): Promise<void> => {
  const createCriteria = async (
    staffEmail: string,
    jobId: number
  ): Promise<void> => {
    const options = {
      headers: {
        Authorization: `Bearer ${await getStaffToken(staffEmail)}`,
      },
    };
    const payload = myCriteria;
    try {
      const response = await axios.post(
        apiUrls.criteria(jobId),
        payload,
        options
      );
      console.log(
        `Creating criteria for job posting ${jobId}: ${response.status}`
      );
    } catch (error: any) {
      console.error(
        `Error creating criteria for job posting ${jobId}: ${error.response?.status}`
      );
    }
  };

  const createJobPosting = async (
    staffEmail: string,
    index: number
  ): Promise<void> => {
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
      const jobId = response.data.id;
      await createCriteria(staffEmail, jobId);
      jobIds.push(jobId);
    } catch (error: any) {
      console.error(
        `Error creating job posting ${index + 1}: ${error.response?.status} - ${
          error.response?.data
        }`
      );
    }
  };

  const promises = Array.from({ length: n_job_postings }, (_, i) => {
    const staffEmail =
      staffEmails[Math.floor(Math.random() * staffEmails.length)];
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
            console.log(
              `Deleting job posting with ID ${jobId}: ${response.status}`
            );
          })
          .catch((error: any) => {
            console.error(
              `Error deleting job posting with ID ${jobId}: ${error.response?.status}`
            );
          })
      );
    }
    await Promise.all(promises);
  };

  const promises = [];
  for (const staffEmail of staffEmails) {
    promises.push(deleteStaffJobPostings(staffEmail));
  }
  await Promise.all(promises);
};

// Handling applications
const makeApplications = async (): Promise<void> => {
  const promises = [];
  for (let i = 0; i < applicantEmails.length; i++) {
    const email = applicantEmails[i];
    const jobId = jobIds[i % jobIds.length];
    const payload = {
      email,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      phone: "403-123-4567",
      personal_links: faker.internet.url(),
      jobPostingId: jobId.toString(),
      resume: resumeBase64,
    };
    promises.push(
      axios
        .post(apiUrls.applications, payload)
        .then((response) => {
          console.log(
            `Making application for jobId ${jobId}, using email ${email}: ${response.status}`
          );
        })
        .catch((error: any) => {
          console.error(
            `Error making application for job ${jobId}, using using email ${email}: ${error.response?.status} - ${error.response?.message}`
          );
        })
    );
  }
  await Promise.all(promises);
};

// Create staff, job postings, and applications
const migrateUp = async (): Promise<void> => {
  console.log("Creating Sample Data...");
  console.log("Step 1: Creating staff...");
  await createStaff();
  console.log("Step 2: Creating job postings...");
  await createJobPostings();
  console.log("Step 3: Making applications...");
  await makeApplications();
  console.log("Sample data created successfully.");
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

Sample Data Configuration:
number of staff accounts  : ${n_staff}
number of job postings    : ${n_job_postings}
number applicants         : ${n_applications}

Actions:
1: Insert sample data
2: Delete sample data
0: Exit

Please select an action: `;

  const handleAnswer = async (answer: string): Promise<void> => {
    if (answer === "1") {
      await migrateUp();
    } else if (answer === "2") {
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
