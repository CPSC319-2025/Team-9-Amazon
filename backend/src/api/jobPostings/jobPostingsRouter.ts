import Criteria from "@/database/models/criteria";
import JobPosting from "@/database/models/jobPosting";
import Application from "@/database/models/application";
import Applicant from "@/database/models/applicant";
import JobTagJobPostingRelation from "@/database/models/tagJobPostingRelation";
import JobTag from "@/database/models/jobTag";
import {
  authenticateJWT,
  requireHiringManager,
} from "@/common/middleware/auth";
import { Router } from "express";

const router = Router();

// Get all local criteria for a specific job posting
router.get(
  "/:jobPostingId/criteria",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { jobPostingId } = req.params;

      // First verify that the job posting exists and belongs to this hiring manager
      const jobPosting = await JobPosting.findOne({
        where: {
          id: jobPostingId,
          staffId: req.auth?.id,
        },
      });

      if (!jobPosting) {
        return res.status(404).json({
          error:
            "Job posting not found or you don't have permission to view its criteria",
        });
      }

      // Get all criteria for this job posting
      const criteria = await Criteria.findAll({
        where: {
          jobPostingId,
          criteriaType: "local",
        },
      });

      res.json(criteria);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch criteria",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Update specific criteria for a job posting
router.put(
  "/:jobId/criteria/:criteriaId",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { jobId, criteriaId } = req.params;
      const { name, criteriaJson } = req.body;

      // Find the criteria and verify it belongs to this job posting
      const criteria = await Criteria.findOne({
        where: {
          id: criteriaId,
          jobPostingId: jobId,
          criteriaType: "local",
        },
        include: [
          {
            model: JobPosting,
            as: "jobPosting",
            where: { staffId: req.auth?.id },
          },
        ],
      });

      if (!criteria) {
        return res.status(404).json({
          error: "Criteria not found or you don't have permission to modify it",
        });
      }

      // Update the criteria
      await criteria.update({
        name,
        criteriaJson,
      });

      // Fetch the updated criteria with its associations
      const updatedCriteria = await Criteria.findByPk(criteria.id, {
        include: [
          {
            model: JobPosting,
            as: "jobPosting",
          },
        ],
      });

      res.json(updatedCriteria);
    } catch (error) {
      res.status(400).json({
        error: "Failed to update criteria",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Create new criteria for a job posting
router.post(
  "/:jobPostingId/criteria",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { jobPostingId } = req.params;
      const { name, criteriaJson } = req.body;

      // Verify that the job posting exists and belongs to this hiring manager
      const jobPosting = await JobPosting.findOne({
        where: {
          id: jobPostingId,
          staffId: req.auth?.id,
        },
      });

      if (!jobPosting) {
        return res.status(404).json({
          error:
            "Job posting not found or you don't have permission to add criteria to it",
        });
      }

      // Create new criteria
      const criteria = await Criteria.create({
        name,
        criteriaJson,
        criteriaType: "local",
        jobPostingId: parseInt(jobPostingId),
      });

      // Fetch the created criteria with its associations
      const createdCriteria = await Criteria.findByPk(criteria.id, {
        include: [
          {
            model: JobPosting,
            as: "jobPosting",
          },
        ],
      });

      res.status(201).json(createdCriteria);
    } catch (error) {
      res.status(400).json({
        error: "Failed to create criteria",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Delete specific criteria for a job posting
router.delete(
  "/:jobPostingId/criteria/:criteriaId",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { jobPostingId, criteriaId } = req.params;

      // Find the criteria and verify it belongs to this job posting and the hiring manager
      const criteria = await Criteria.findOne({
        where: {
          id: criteriaId,
          jobPostingId: jobPostingId,
          criteriaType: "local",
        },
        include: [
          {
            model: JobPosting,
            as: "jobPosting",
            where: { staffId: req.auth?.id },
          },
        ],
      });

      if (!criteria) {
        return res.status(404).json({
          error: "Criteria not found or you don't have permission to delete it",
        });
      }

      // Delete the criteria
      await criteria.destroy();

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: "Failed to delete criteria",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

router.get(
  "/:jobPostingId/statistics",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { jobPostingId } = req.params;
      console.log('jobPostingId:', jobPostingId);

      const jobPosting = await JobPosting.findOne({
        where: {
          id: Number(jobPostingId),
          staffId: req.auth?.id,
        },
      });


      if (!jobPosting) {
        return res.status(404).json({
          error:
            "Job posting not found or you don't have permission to view its statistics",
        });
      }

      // const applications = await Application.findAll({
      //   where: { 
      //     jobPostingId: jobPostingId
      //   },
      //   include: [{ model: Applicant, as: "applicant" }],
      // });


      // if (!applications || applications.length === 0) {
      //   return res.json({
      //     applicantsPerMonth: [],
      //     totalApplicants: 0
      //   });
      // }

      // const applicantsByMonth: Record<string, number> = {};
      // applications.forEach(application => {
      //   const month = new Date(application.createdAt).toLocaleString('default', { month: 'short' });
      //   const year = new Date(application.createdAt).getFullYear();
      //   const key = `${month} ${year}`;
        
      //   if (!applicantsByMonth[key]) {
      //     applicantsByMonth[key] = 0;
      //   }
      //   applicantsByMonth[key]++;
      // });

      // const applicantsPerMonth = Object.entries(applicantsByMonth).map(([month, count]) => ({
      //   month,
      //   applications: count,
      //   percentage: Math.round((count as number) * 100 / applications.length)
      // }));

      // res.json({
      //   applicantsPerMonth,
      //   totalApplicants: applications.length
      // });

      const mockData = {
        applicantsPerMonth: [
          { month: "Jan 2023", applications: 12, percentage: 20 },
          { month: "Feb 2023", applications: 18, percentage: 30 },
          { month: "Mar 2023", applications: 30, percentage: 50 }
        ],
        totalApplicants: 60
      };

      res.json(mockData);

    } catch (error) {
      console.error("Error in job posting statistics:", error);
      res.status(500).json({
        error: "Failed to fetch job posting statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

router.get(
  "/",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const jobPostings = await JobPosting.findAll({
        where: {
          staffId: req.auth?.id,
        },
        order: [['createdAt', 'DESC']]
      });

      res.json(jobPostings);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch job postings",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

router.get(
  "/:jobPostingId",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { jobPostingId } = req.params;

      const jobPosting = await JobPosting.findOne({
        where: {
          id: jobPostingId,
          staffId: req.auth?.id,
        },
      });

      if (!jobPosting) {
        return res.status(404).json({
          error: "Job posting not found or you don't have permission to view it",
        });
      }

      res.json(jobPosting);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch job posting",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
