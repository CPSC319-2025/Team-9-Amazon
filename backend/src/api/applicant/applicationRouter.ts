import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { applicationSchema } from "@/validation/applicationSchema"; // Import validation schema
import Applicant from "@/database/models/applicant";
import Application from "@/database/models/application";
import { ZodError } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedData = applicationSchema.parse(req.body);
    const { first_name, last_name, email, phone, address, resume, jobPostingId } = validatedData;

    let applicant = await Applicant.findOne({ where: { email } });

    if (!applicant) {
      applicant = await Applicant.create({
        first_name,
        last_name,
        email,
        phone,
        address,
      });
    }

    const existingApplication = await Application.findOne({
      where: { applicantId: applicant.id, jobPostingId },
    });

    if (existingApplication) {
      return res.status(StatusCodes.CONFLICT).json({ error: "You have already applied for this job." });
    }

    const application = await Application.create({
      applicantId: applicant.id,
      jobPostingId,
      resumePath: resume,
    });

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
