import { Router } from "express";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { applicationSchema } from "./applicationValidation";
import { submitApplication } from "./applicationService";
import {
  ResumeUploadError,
  ApplicantCreationError,
  DuplicateApplicationError,
  ValidationError,
} from "@/common/utils/errors";
import { ValidationError as SequelizeValidationError } from "sequelize";
import Database, { Criteria } from "@/database/database";
import { ApplicationScoring } from "@/services/applicationScoring";

const router = Router();

router.post("/", async (req, res) => {
  const transaction = await Database.GetSequelize().transaction();
  try {
    // Parse & validate req body
    const data = applicationSchema.parse(req.body);

    // Get criteria for scoring before submitting application
    const criteria = await Criteria.findAll({
      where: { jobPostingId: parseInt(data.jobPostingId) },
      transaction: transaction,
    });

    // Submit application and get result
    const application = await submitApplication(data, transaction);

    // Calculate score if criteria exists
    if (criteria.length > 0 && application) {
      try {
        const score = await ApplicationScoring.evaluateApplication(
          application,
          criteria
        );
        await application.update({ score });
      } catch (error) {
        console.error("Error calculating application score:", error);
        // Don't throw - we want to create the application even if scoring fails
      }
    }

    transaction.commit();
    res.status(StatusCodes.CREATED).json({
      message: "Application submitted successfully",
      data: {
        applicantId: application.applicantId,
        jobPostingId: application.jobPostingId,
      },
    });
  } catch (error) {
    transaction.rollback();
    if (error instanceof ZodError) {
      const messages = error.errors.map((e) => e.message);
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        message: `Validation Error:\n${messages.join("\n")}`,
      });
    }

    if (error instanceof ApplicantCreationError) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }

    if (error instanceof ResumeUploadError) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }

    if (error instanceof ValidationError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    }

    if (error instanceof DuplicateApplicationError) {
      return res.status(StatusCodes.CONFLICT).json({
        message: error.message,
      });
    }

    if (error instanceof SequelizeValidationError) {
      const messages = error.errors.map((e) => e.message).join("; ");
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Database Validation Error: ${messages}`,
      });
    }

    console.error("Unhandled error in applications:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Unhandled error" });
  }
});

export default router;
