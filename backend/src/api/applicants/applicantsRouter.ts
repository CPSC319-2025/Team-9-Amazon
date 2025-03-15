import { Router } from "express";
import { authenticateJWT, requireHiringManager } from "@/common/middleware/auth";
import Applicant from "@/database/models/applicant";
import Application from "@/database/models/application";
import JobPosting from "@/database/models/jobPosting";
import Criteria from "@/database/models/criteria";
import { Op } from "sequelize";

const router = Router();

router.get(
  "/email/:applicantEmail/job-postings/:jobPostingId",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { applicantEmail, jobPostingId } = req.params;

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

    //   const applicant = await Applicant.findOne({
    //     where: { email: applicantEmail },
    //     attributes: ["id", "firstName", "lastName", "email", "phone", "linkedIn"],
    //   });

    //   if (!applicant) {
    //     return res.status(404).json({
    //       error: "Applicant not found",
    //     });
    //   }

    //   const application = await Application.findOne({
    //     where: {
    //       applicantId: applicant.id,
    //       jobPostingId: Number(jobPostingId),
    //     },
    //   });

    //   if (!application) {
    //     return res.status(404).json({
    //       error: "Application not found for this job posting",
    //     });
    //   }

      const criteria = await Criteria.findAll({
        where: { jobPostingId: Number(jobPostingId) },
      });

      
    //MOCK DATA TODO!!!
      const keywordAnalysis = {
        matched: ["NodeJS", "React", "TypeScript"],
        missing: ["MongoDB", "AWS"],
      };
    //   random score
      const criteriaScores = criteria.map(criterion => ({
        id: criterion.id,
        name: criterion.name,
        score: Math.floor(Math.random() * 30) + 70, 
      }));

      const matchScore = Math.round(criteriaScores.reduce((sum, item) => sum + item.score, 0) / criteriaScores.length)

      const applicant = {
        id: 123,
        firstName: "John",
        lastName: "Doe",
        email: applicantEmail,
        phone: "+1 (555) 123-4567",
        linkedIn: "https://linkedin.com/in/johndoe"
      };

      const application = {
        id: 456,
        applicantId: applicant.id,
        jobPostingId: Number(jobPostingId),
        resumePath: "https://example.com/resumes/johndoe.pdf",
        createdAt: new Date().toISOString(),
        score: null
      };

      res.json({
        applicant: {
          id: applicant.id,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          role: jobPosting.title,
          matchScore: application.score || matchScore,
          details: {
            email: applicant.email,
            phone: applicant.phone || "Not provided",
            personalLinks: ["https://github.com/johndoe", "https://portfolio.johndoe.com"],
          },
        },
        application: {
          id: application.id,
          resumePath: application.resumePath,
          createdAt: application.createdAt,
        },
        keywords: keywordAnalysis,
        criteria: criteriaScores,
      });
    } catch (error) {
      console.error("Error fetching applicant details:", error);
      res.status(500).json({
        error: "Failed to fetch applicant details",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router; 