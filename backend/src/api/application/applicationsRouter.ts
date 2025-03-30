import { Router } from "express";
import Applicant from "@/database/models/applicant";
import Application from "@/database/models/application";
import { z } from "zod";
import Database from "@/database/database";
import { format } from "date-fns";
import { s3UploadBase64 } from "@/common/utils/awsTools";
import { handleZodError } from "@/common/middleware/errorHandler";

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
  const t = await Database.GetSequelize().transaction();
  try {
    console.log("Received application submission:", req.body);
    const data = applicationSchema.parse(req.body);
    let applicant = await Applicant.findOne({
      where: { email: data.email },
      transaction: t,
    });
    // Check for existing applicant
    if (applicant) {
      await applicant.update({
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone,
          linkedIn: data.personal_links,
        },
        { transaction: t }
      );
    } else {
      applicant = await Applicant.create({
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone,
          linkedIn: data.personal_links,
        },
        { transaction: t }
      );
    }
    // Check for existing application
    const applicantId = applicant.get("id");
    const existingApplication = await Application.findOne({
      where: {
        applicantId: applicantId,
        jobPostingId: parseInt(data.jobPostingId),
      },
      transaction: t,
    });
    if (existingApplication) {
      throw new Error("You have already applied for this position");
    }
    // Create application
    const resumeFileName = `${data.jobPostingId}_${applicantId}`;
    await s3UploadBase64(resumeFileName, data.resume);
    await Application.create({
      jobPostingId: parseInt(data.jobPostingId),
      applicantId: applicantId,
      resumePath: resumeFileName,
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
    },
    { transaction: t });

    // Commit transaction
    await t.commit();
    res.status(201).json("Successfully created application");
  } catch (error) {
    await t.rollback();
    handleZodError(error, res, "Failed to create application");
  }
});

export default router;
