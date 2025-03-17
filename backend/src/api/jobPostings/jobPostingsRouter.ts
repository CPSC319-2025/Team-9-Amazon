import Criteria from "@/database/models/criteria";
import JobPosting, { JobPostingAttributes, JobPostingCreationAttributes, JobPostingStatus } from "@/database/models/jobPosting";
import {
  authenticateJWT,
  requireHiringManager,
} from "@/common/middleware/auth";
import { Router } from "express";
import JobTag, { JobTagAttributes } from "@/database/models/jobTag";
import JobTagJobPostingRelation from "@/database/models/tagJobPostingRelation";
import Database from "@/database/database";

const router = Router();

type JobPostingWithTags = JobPostingAttributes & { jobTags: JobTagAttributes[] };

// Get job posting of id
router.get("/:jobPostingId", authenticateJWT, requireHiringManager, async (req, res) => {
  try {
    const { jobPostingId } = req.params;

    const jobPosting = await JobPosting.findOne({
      where: { id: jobPostingId },
      include: [{
        model: JobTag,
        as: "jobTags",
        attributes: ["id", "name"],
        through: { attributes: [] },
      }],
    });

    if (!jobPosting) {
      return res.status(404).json({ error: "Job posting not found" });
    }

    res.json(jobPosting);

  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch job posting",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

type JobPostingRequest = JobPostingCreationAttributes & { tags?: string[] };

// POST /job-postings
router.post("/", authenticateJWT, requireHiringManager, async (req, res) => {
  const {
    title,
    subtitle,
    description,
    responsibilities,
    qualifications,
    staffId,
    location,
    tags, // optional tags array
  } = req.body as JobPostingRequest;

  if (!title || !description || !staffId || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Wrap the creation process in a transaction for atomicity.
  const t = await Database.GetSequelize().transaction();
  try {
    const newJobPosting = await JobPosting.create(
      {
        title,
        subtitle,
        description,
        responsibilities,
        qualifications,
        staffId,
        status: JobPostingStatus.DRAFT, // default status
        location,
        num_applicants: 0,
        num_machine_evaluated: 0,
        num_processes: 0,
      },
      { transaction: t }
    );

    // If tags were provided, process them.
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagInstances = await Promise.all(
        tags.map(async (tagName) => {
          const [tag] = await JobTag.findOrCreate({
            where: { name: tagName },
            defaults: { name: tagName },
            transaction: t,
          });
          return tag;
        })
      );
      // Associate tags with the job posting using the defined belongsToMany relationship.
      await newJobPosting.setJobTags(tagInstances, { transaction: t });
    }

    // Commit the transaction
    await t.commit();

    res.status(201).json(newJobPosting.toJSON());
  } catch (error) {
    await t.rollback();
    console.error("Error creating job posting:", error);
    res.status(500).json({
      error: "Failed to create job posting",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});



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

export default router;
