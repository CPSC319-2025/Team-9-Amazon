import { Router } from "express";
import Applicant from "@/database/models/applicant";
import Application from "@/database/models/application";
import { z } from "zod";
import Database from "@/database/database";
import { format } from "date-fns";

const router = Router();

// Validation schema for the request body
const applicationSchema = z.object({
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  personal_links: z.string().optional(),
  resume: z.string().min(1),
  jobPostingId: z.string(),
  work_experience: z
    .array(
      z.object({
        job_title: z.string().min(1),
        company: z.string().min(1),
        location: z.string().optional(),
        from: z.string().min(1),
        to: z.string().optional().nullable(),
        role_description: z.string().optional(),
        skills: z.string().min(1),
      })
    )
    .optional(),
});
router.post("/", async (req, res) => {
  try {
    // Validate request body
    const data = applicationSchema.parse(req.body);

    // Additional validation for jobPostingId
    if (!data.jobPostingId) {
      return res.status(400).json({
        error: "Validation error",
        details: "Job posting ID is required",
      });
    }

    // Get Sequelize instance
    const sequelize = Database.GetSequelize();

    // Start transaction
    const result = await sequelize.transaction(async (t) => {
      try {
        let applicant = await Applicant.findOne({
          where: { email: data.email },
          transaction: t,
          lock: true, // Prevent race conditions
        });

        if (applicant) {
          // Update existing applicant
          await applicant.update(
            {
              firstName: data.first_name,
              lastName: data.last_name,
              phone: data.phone,
              linkedIn: data.personal_links,
            },
            { transaction: t }
          );
        } else {
          // Create new applicant & commit before using it
          applicant = await Applicant.create(
            {
              email: data.email,
              firstName: data.first_name,
              lastName: data.last_name,
              phone: data.phone,
              linkedIn: data.personal_links,
            },
            { transaction: t }
          );
        }

        // Ensure applicant ID exists before proceeding
        await t.afterCommit(async () => {
          const freshApplicant = await Applicant.findOne({
            where: { email: data.email },
          });

          if (!freshApplicant || !freshApplicant.get("id")) {
            throw new Error("Failed to retrieve applicant after creation");
          }

          // Check for existing application
          const existingApplication = await Application.findOne({
            where: {
              applicantId: freshApplicant.get("id"),
              jobPostingId: parseInt(data.jobPostingId),
            },
          });

          if (existingApplication) {
            throw new Error("You have already applied for this position");
          }

          // Create the application
          await Application.create({
            jobPostingId: parseInt(data.jobPostingId),
            applicantId: freshApplicant.get("id"),
            resumePath: data.resume,
            experienceJson: {
              experiences:
                data.work_experience?.map((exp) => ({
                  title: exp.job_title,
                  company: exp.company,
                  startDate: exp.from,
                  endDate: exp.to || format(new Date(), "MM/yyyy"),
                  skills: exp.skills.split(",").map((s) => s.trim()),
                  description: exp.role_description || "",
                })) || [],
            },
          });
        });

        return { message: "Application submitted successfully" };
      } catch (error) {
        console.error("Transaction error:", error);
        throw error; // Ensures rollback
      }
    });

    // Send successful response
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    if (
      error instanceof Error &&
      error.message === "You have already applied for this position"
    ) {
      return res.status(409).json({
        error: error.message,
      });
    }

    console.error("Error creating application:", error);
    return res.status(500).json({
      error: "Failed to create application",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
