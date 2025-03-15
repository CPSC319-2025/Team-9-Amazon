import Criteria, { CriteriaType } from "@/database/models/criteria";
import Database, { JobPosting, JobTag } from "@/database/database";
import { JobPostingAttributes, JobPostingCreationAttributes, JobPostingStatus } from "@/database/models/jobPosting";
import Application from "@/database/models/application";
import Applicant from "@/database/models/applicant";
import JobTagJobPostingRelation from "@/database/models/tagJobPostingRelation";
import {
  authenticateJWT,
  requireHiringManager,
} from "@/common/middleware/auth";
import { Router } from "express";
import { Op } from "sequelize";
import { ApplicationScoring } from "@/services/applicationScoring";
import { JobTagAttributes } from "@/database/models/jobTag";
import { Transaction } from "sequelize";

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

      await Object.getPrototypeOf(newJobPosting).setJobTags.call(newJobPosting, tagInstances, { transaction: t });
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

export interface JobPostingEditRequest {
  title?: string;
  subtitle?: string;
  description?: string;
  responsibilities?: string;
  qualifications?: string;
  staffId?: number;
  location?: string;
  status?: JobPostingStatus;
  tags?: string[]; // array of tag names
}

// PUT /job-postings/:jobPostingId – Edit an existing job posting
router.put("/:jobPostingId", authenticateJWT, requireHiringManager, async (req, res) => {
  let t: Transaction | null = null; // Transaction reference
  try {
    const { jobPostingId } = req.params;

    // Find the existing job posting
    const jobPosting = await JobPosting.findOne({
      where: { id: jobPostingId },
    });
    
    if (!jobPosting) {
      return res.status(404).json({ error: "Job posting not found" });
    }
    // Start a transaction for atomic updates.
    t = await Database.GetSequelize().transaction();

    // Extract allowed fields from request body using JobPostingEditRequest
    const {
      title,
      subtitle,
      description,
      responsibilities,
      qualifications,
      staffId,
      location,
      status,
      tags, // array of tag names
    } = req.body as JobPostingEditRequest;

    const updates: JobPostingEditRequest = {};

    // validations
    if (title !== undefined) {
      const trimmedTitle = typeof title === "string" ? title.trim() : title;
      if (trimmedTitle) {
        updates.title = trimmedTitle;
      }
    }
    if (subtitle !== undefined) {
      const trimmedSubtitle = typeof subtitle === "string" ? subtitle.trim() : subtitle;
      if (trimmedSubtitle) {
        updates.subtitle = trimmedSubtitle;
      }
    }
    if (description !== undefined) {
      const trimmedDescription = typeof description === "string" ? description.trim() : description;
      if (trimmedDescription) {
        updates.description = trimmedDescription;
      }
    }
    if (responsibilities !== undefined) {
      const trimmedResp = typeof responsibilities === "string" ? responsibilities.trim() : responsibilities;
      if (trimmedResp) {
        updates.responsibilities = trimmedResp;
      }
    }
    if (qualifications !== undefined) {
      const trimmedQual = typeof qualifications === "string" ? qualifications.trim() : qualifications;
      if (trimmedQual) {
        updates.qualifications = trimmedQual;
      }
    }
    if (staffId !== undefined && typeof staffId === "number" && staffId > 0) {
      updates.staffId = staffId;
    }
    if (location !== undefined) {
      const trimmedLocation = typeof location === "string" ? location.trim() : location;
      if (trimmedLocation) {
        updates.location = trimmedLocation;
      }
    }
    if (status !== undefined) {
      updates.status = status;
    }

    jobPosting.set(updates);
    await jobPosting.save({ transaction: t });

    // Process tags if provided.
    if (tags && Array.isArray(tags)) {
      const tagInstances = await Promise.all(
        tags.map(async (tagName) => {
          // Find or create a tag by name.
          const [tag] = await JobTag.findOrCreate({
            where: { name: tagName },
            defaults: { name: tagName },
            transaction: t,
          });
          return tag;
        })
      );
      // Associate the found/created tags with the job posting.
      await Object.getPrototypeOf(jobPosting).setJobTags.call(jobPosting, tagInstances, { transaction: t });
    }

    // Commit transaction.
    await t.commit();

    res.json(jobPosting.toJSON());
  } catch (error) {
    if (t) await t.rollback();
    console.error("Error updating job posting:", error);
    res.status(500).json({
      error: "Failed to edit job posting",
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
  "/:jobPostingId/criteria/:criteriaId",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { jobPostingId, criteriaId } = req.params;
      const { name, criteriaJson } = req.body;

      // Find the criteria and verify it belongs to this job posting
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
        criteriaType: CriteriaType.local,
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

// // Get applications summary for a job posting
// router.get(
//   "/:jobPostingId/applications/summary",


  
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

      // Verify the job posting exists and belongs to this hiring manager
      const jobPosting = await JobPosting.findOne({
        where: {
          id: jobPostingId,
          staffId: req.auth?.id,
        },
      });

      if (!jobPosting) {
        return res.status(404).json({
          error:
            "Job posting not found or you don't have permission to view its applications",
        });
      }

      // Get all criteria for this job posting to calculate total possible score
      const criteria = await Criteria.findAll({
        where: { jobPostingId: jobPostingId },
      });

      // Calculate total possible score from criteria
      const totalPossibleScore = criteria.reduce((total, criterion) => {
        return total + criterion.criteriaMaxScore;
      }, 0);

      // Get all applications with applicant information
      const applications = await Application.findAll({
        where: { jobPostingId: jobPostingId },
        include: [
          {
            model: Applicant,
            as: "applicant",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        order: [["score", "DESC"]],
      });

      // Transform the data for response
      const applicationsSummary = applications.map((application) => {
        const applicantData = application.get({ plain: true }).applicant;
        return {
          score: application.score || 0,
          applicant: {
            firstName: applicantData?.firstName,
            lastName: applicantData?.lastName,
            email: applicantData?.email,
          },
          applicantId: application.applicantId,
          jobPostingId: application.jobPostingId,
        };
      });

      res.json({
        totalPossibleScore,
        totalApplications: applications.length,
        applications: applicationsSummary,
      });
    } catch (error) {
      console.error("Error fetching applications summary:", error);
      res.status(500).json({
        error: "Failed to fetch applications summary",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
// Scan database for potential top 10 candidates
router.get(
  "/:jobPostingId/potential-candidates",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { jobPostingId } = req.params;

      // Verify the job posting exists and belongs to this hiring manager
      const jobPosting = await JobPosting.findOne({
        where: {
          id: jobPostingId,
          staffId: req.auth?.id,
        },
      });

      if (!jobPosting) {
        return res.status(404).json({
          error:
            "Job posting not found or you don't have permission to scan for it",
        });
      }

      // Get criteria for this job posting
      const criteria = await Criteria.findAll({
        where: { jobPostingId },
      });

      if (!criteria.length) {
        return res.status(400).json({
          error: "No criteria found for this job posting",
        });
      }

      // **Get current applicants who already applied for this job**
      const currentApplicants = await Application.findAll({
        where: { jobPostingId },
        attributes: ["applicantId"],
      });
      const currentApplicantIds = currentApplicants.map(
        (app) => app.applicantId
      );

      // Get all applications from other job postings (excluding current applicants)
      const otherApplications = await Application.findAll({
        where: {
          jobPostingId: {
            [Op.ne]: jobPostingId, // Not equal to current job posting
          },
          applicantId: {
            [Op.notIn]: currentApplicantIds, // Exclude current applicants
          },
        },
        include: [
          {
            model: Applicant,
            as: "applicant",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      });

      // Score each application against current job posting criteria
      const scoredApplications = await Promise.all(
        otherApplications.map(async (application) => {
          const score = await ApplicationScoring.evaluateApplication(
            application,
            criteria
          );

          const applicantData = application.get({ plain: true }).applicant;

          return {
            applicantId: application.applicantId,
            jobPostingId: application.jobPostingId,
            score,
            applicant: {
              firstName: applicantData?.firstName || "",
              lastName: applicantData?.lastName || "",
              email: applicantData?.email || "",
            },
          };
        })
      );

      // **Filter to keep only the best application per applicant**
      const bestApplicationsPerApplicant = new Map();

      scoredApplications.forEach((app) => {
        if (
          !bestApplicationsPerApplicant.has(app.applicantId) ||
          bestApplicationsPerApplicant.get(app.applicantId).score < app.score
        ) {
          bestApplicationsPerApplicant.set(app.applicantId, app);
        }
      });

      // Sort by score descending and return top 10 matches
      const sortedApplications = [...bestApplicationsPerApplicant.values()]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      res.json({
        totalApplications: sortedApplications.length,
        applications: sortedApplications,
      });
    } catch (error) {
      console.error("Error scanning database:", error);
      res.status(500).json({
        error: "Failed to scan database",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
