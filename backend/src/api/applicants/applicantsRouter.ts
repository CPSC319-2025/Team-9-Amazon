import { Router } from "express";
import { authenticateJWT, requireHiringManager } from "@/common/middleware/auth";
import Applicant from "@/database/models/applicant";
import Application from "@/database/models/application";
import JobPosting from "@/database/models/jobPosting";
import Criteria from "@/database/models/criteria";
import { Op } from "sequelize";

const router = Router();

// get applicant details for Candidate Report page

router.get(
  "/email/:applicantEmail/job-postings/:jobPostingId",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { applicantEmail, jobPostingId } = req.params;
      console.log('actually got here', applicantEmail, jobPostingId)

      // Verify job posting exists and belongs to this hiring manager
      const jobPosting = await JobPosting.findOne({
        where: {
          id: Number(jobPostingId),
          staffId: req.auth?.id,
        },
      });

      if (!jobPosting) {
        return res.status(404).json({
          error: "Job posting not found or you don't have permission to view it",
        });
      }

      // Get applicant details
      const applicant = await Applicant.findOne({
        where: { email: decodeURIComponent(applicantEmail) },
        attributes: ["id", "firstName", "lastName", "email", "phone"],
      });

      if (!applicant) {
        return res.status(404).json({
          error: "Applicant not found",
        });
      }

      // Get application details
      const application = await Application.findOne({
        where: {
          jobPostingId: Number(jobPostingId),
          applicantId: applicant.id,
        },
        attributes: ["id", "resumePath", "score", "createdAt", "experienceJson"],
      });

      if (!application) {
        return res.status(404).json({
          error: "Application not found",
        });
      }
      
      const keywords = new Set<string>();
      if (application.experienceJson?.experiences) {
        application.experienceJson.experiences.forEach((exp: any) => {
          if (Array.isArray(exp.skills)) {
            exp.skills.forEach((skill: string) => keywords.add(skill));
          }
        });
      }

      // Get evaluation criteria scores
      const criteria = await Criteria.findAll({
        where: { jobPostingId: Number(jobPostingId) },
        attributes: ["id", "name", "score"],
      });

      const response = {
        applicant: {
          id: applicant.id,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          role: application.experienceJson?.experiences?.[0]?.title || "Not specified",
          details: {
            email: applicant.email,
            phone: applicant.phone || "Not provided",
            // personalLinks: application.experienceJson?.personalLinks || [],
          }
        },
        application: {
          // id: application.id,
          resumePath: application.resumePath,
          matchScore: application.score || 0,
          createdAt: application.createdAt,
        },
        keywords: Array.from(keywords),
        criteria: criteria.map(c => ({
          id: c.id,
          name: c.name,
          // score: c.score || 0
        }))
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching candidate details:", error);
      res.status(500).json({
        error: "Failed to fetch candidate details",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

// Add this endpoint to serve resumes
router.get(
  "/resume/:resumePath",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { resumePath } = req.params;
      
      // Get the resume from S3
      const resumeBuffer = await s3GetObject(resumePath);
      
      if (!resumeBuffer) {
        return res.status(404).json({
          error: "Resume not found",
        });
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${resumePath}.pdf"`);
      
      // Send the file
      res.send(resumeBuffer);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({
        error: "Failed to fetch resume",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Add this utility function to get objects from S3
async function s3GetObject(key: string): Promise<Buffer | null> {
  try {
    // This is a placeholder - you'll need to implement the actual S3 retrieval
    // using AWS SDK or whatever storage solution you're using
    const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
    
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    
    const response = await s3Client.send(command);
    
    // Convert the readable stream to a buffer
    return await streamToBuffer(response.Body);
  } catch (error) {
    console.error("Error retrieving from S3:", error);
    return null;
  }
}

// Helper function to convert stream to buffer
async function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export default router; 