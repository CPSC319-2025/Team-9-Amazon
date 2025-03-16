import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import Applicant from "@/database/models/applicant";
import Application from "@/database/models/application";
import { ZodError } from "zod";

const router = Router();

// POST /applicant/application
router.post("/", async (req, res) => {
  try {
    console.log("Received application submission:", req.body);
    const { first_name, last_name, email, phone, address, jobPostingId, experienceJson } = req.body;

    const formattedData = {
      firstName: first_name,
      lastName: last_name,
      email,
      phone,
      address,
      jobPostingId,
      experienceJson,
    };

    if (!email || !jobPostingId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Missing required fields: email, jobPostingId",
      });
    }

    console.log("Checking if applicant already exists...");
    let applicant = await Applicant.findOne({ where: { email } });
    console.log("Applicant found:", applicant);

    if (!applicant) {
      console.log("Creating new applicant...");
      applicant = await Applicant.create({
        firstName: formattedData.firstName,
        lastName: formattedData.lastName,
        email: formattedData.email,
        phone: formattedData.phone,
        //address: formattedData.address,
      });
      console.log("New applicant created:", applicant);
    }

    const existingApplication = await Application.findOne({
      where: { applicantId: applicant.id, jobPostingId },
    });

    if (existingApplication) {
      return res.status(StatusCodes.CONFLICT).json({ error: "You have already applied for this job." });
    }

    console.log("Creating new application entry...");
    const application = await Application.create({
      applicantId: applicant.id,
      jobPostingId,
      resumePath: "resumeURL",
      experienceJson: experienceJson,
    });
    console.log("New application created:", application);

    res.status(StatusCodes.CREATED).json({ applicationId: application.applicantId });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Validation failed", details: error.errors });
    }
    
    console.error("Error submitting application:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
});

export default router;
