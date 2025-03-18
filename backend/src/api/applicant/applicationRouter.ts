import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import Applicant from "@/database/models/applicant";
import Application from "@/database/models/application";
import { number, ZodError } from "zod";
import { s3UploadFile } from "@/common/utils/awsTools";
import { Buffer } from "buffer";
import { 
  ValidationError, 
  ApplicantNotFoundError, 
  DuplicateApplicationError, 
  ResumeUploadError, 
  ExperienceJsonError 
} from "@/common/utils//errors";

const router = Router();

const validateRequestBody = (body: any) => {
  const { first_name, last_name, email, phone, address, linkedIn, jobPostingId, workExperience, resume } = body;

  //console.log("Received workExperience from request body:", JSON.stringify(workExperience, null, 2));
  console.log("Received workExperience from request body:", workExperience);
  if (!email || !jobPostingId) {
    throw new ValidationError("Missing required fields: email, jobPostingId");
  }

  if (!resume || typeof resume !== "string") {
    throw new ValidationError("Invalid resume data");
  }

  console.log("Formatted experienceJson:", JSON.stringify(workExperience, null, 2));

  return { first_name, last_name, email, phone, address, linkedIn, jobPostingId, workExperience, resume };
};

// Find or create an applicant
const findOrCreateApplicant = async (email: string, first_name: string, last_name: string, phone: string, linkedIn?: string) => {
  console.log("Checking if applicant already exists...");
    let applicant = await Applicant.findOne({
      where: { email },
      attributes: ["id", "email", "firstName", "lastName", "phone", "linkedIn"], 
    });
    console.log("Applicant found:", applicant?.dataValues);
    console.log("Applicant found:", applicant);

  if (!applicant) {
    console.log("Creating new applicant...");
    applicant = await Applicant.create({
      firstName: first_name,
      lastName: last_name,
      email,
      phone,
      linkedIn,
    }, {returning: true, plain: true});
    console.log("New applicant created:", applicant);
  }

  const applicantData = applicant.toJSON();
  console.log("applicantData:", applicantData);
  console.log("applicantData.id:", applicantData.id);
  if (!applicantData.id) {
    console.log("Applicant ID missing after creation. Fetching from DB...");
    applicant = await Applicant.findOne({ where: { email } });

    console.log("applicant:", applicant);
    console.log("applicant.dataValues.id:", applicant?.dataValues.id);
    applicantData.id = applicant?.dataValues.id;

    if (!applicant || !applicant?.dataValues.id) {
      throw new ApplicantNotFoundError();
    }
  }
  console.log("check applicant.id:", applicant.id);
  console.log("check applicant?.dataValues.id:", applicant?.dataValues.id);
  
  return applicantData.id;
};

// Check if the applicant has already applied
const checkExistingApplication = async (applicantId: number, jobPostingId: number) => {
  console.log("check applicantId:", applicantId);
  const existingApplication = await Application.findOne({
    where: { applicantId, jobPostingId },
  });
  console.log("existingApplication:", existingApplication);

  if (existingApplication) {
    throw new DuplicateApplicationError();
  }
};

// Process and upload resume to S3
const processResumeUpload = async (resume: string, applicantId: number, jobPostingId: number) => {
  const matches = resume.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new ResumeUploadError("Invalid Base64 format");
  }

  const mimeType = matches[1];
  const fileBuffer = Buffer.from(matches[2], "base64");
  const fileExtension = mimeType.split("/")[1]

  if (!fileExtension || !["pdf", "doc", "docx"].includes(fileExtension)) {
    throw new ResumeUploadError("Invalid resume file type.");
  }

  // Generate filename using applicantId & jobPostingId
  const fileName = `resumes/${applicantId}-${jobPostingId}-resume.${fileExtension}`;
  return await s3UploadFile(fileName, fileBuffer, mimeType);
};

// Save application to the database
const saveApplication = async (applicantId: number, jobPostingId: number, resumeUrl: string, experienceJson: any) => {
  console.log("Saving application with experienceJson:", JSON.stringify(experienceJson, null, 2));

  // if (!experienceJson || typeof experienceJson !== "object" || !Array.isArray(experienceJson.experiences)) {
  //   throw new ExperienceJsonError();
  // }

  return await Application.create({
    applicantId,
    jobPostingId,
    resumePath: resumeUrl,
    experienceJson,
  });

};

// main api route: POST /applicant/application
router.post("/", async (req, res) => {
  try {
    console.log("Received application submission:", req.body);

    const { first_name, last_name, email, phone, linkedIn, jobPostingId, workExperience, resume } = validateRequestBody(req.body);

    const applicantId = await findOrCreateApplicant(email, first_name, last_name, phone, linkedIn);

    //const applicantId = applicant?.dataValues.id;

    await checkExistingApplication(applicantId!, jobPostingId);

    const resumeUrl = await processResumeUpload(resume, applicantId!, jobPostingId);

    const application = await saveApplication(applicantId!, jobPostingId, resumeUrl, workExperience);

    console.log("New application created:", application);
    res.status(StatusCodes.CREATED).json({ applicantId: application.applicantId });

  } catch (error) {
    console.error("Error submitting application:", error);
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMessage = "An unexpected error occurred";

    if (error instanceof ValidationError || 
        error instanceof ApplicantNotFoundError || 
        error instanceof DuplicateApplicationError || 
        error instanceof ResumeUploadError || 
        error instanceof ExperienceJsonError) {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMessage = error.message;
    } else if (error instanceof ZodError) {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMessage = "Validation failed";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({ error: errorMessage });
  }
});

export default router;