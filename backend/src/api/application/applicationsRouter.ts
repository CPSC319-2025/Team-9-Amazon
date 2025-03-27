import { Router } from "express";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

import { applicationSchema } from "./applicationValidation";
import { submitApplication } from "./applicationService";
import { ResumeUploadError, ApplicantCreationError, DuplicateApplicationError } from "@/common/utils/errors";


const router = Router();

router.post("/", async (req, res) => {
  try {
    console.log("Received application submission:", req.body);
    // Parse & validate req body
    const data = applicationSchema.parse(req.body);

    // Business logic
    await submitApplication(data);

    res.status(StatusCodes.CREATED).json({ 
      message: "Application submitted successfully" });

  } catch (error) {

    if (error instanceof ZodError) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        message: "Validation Error",
        issues: error.errors,
      });
    }

    if (error instanceof ResumeUploadError) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }

    if (error instanceof ApplicantCreationError) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }

    if (error instanceof DuplicateApplicationError) {
      return res.status(StatusCodes.CONFLICT).json({
        message: error.message,
      });
    }
    console.error("Unhandled error in applications:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Unhandled error"});
  }
});

export default router;
