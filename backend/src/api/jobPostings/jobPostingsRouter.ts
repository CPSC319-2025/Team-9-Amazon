import {
  authenticateJWT,
  requireAdmin,
  requireHiringManager,
} from "@/common/middleware/auth";
import { handleZodError } from "@/common/middleware/errorHandler";
import { generateTemporaryUrl } from "@/common/utils/awsTools";
import Database, { JobPosting, JobTag, Staff } from "@/database/database";
import Applicant from "@/database/models/applicant";
import Application from "@/database/models/application";
import Criteria, { CriteriaType } from "@/database/models/criteria";
import { JobPostingCreationAttributes, JobPostingStatus } from "@/database/models/jobPosting";
import { ApplicationScoring } from "@/services/applicationScoring";
import { Router } from "express";
import path from 'path';
import { Op, Transaction } from "sequelize";

const router = Router();


// get all job postings for a hiring manager
router.get("/", authenticateJWT, requireHiringManager, async (req, res) => {
  try {
    const staffId = req.auth?.id;
    if (!staffId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // TDOD: pagination

    // Query job postings for the given staffId
    const jobPostings = await JobPosting.findAll({
      where: { staffId },
      include: [
        {
          model: JobTag,
          as: "jobTags",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(jobPostings.map((jp) => jp.toJSON()));
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return res.status(500).json({
      error: "Failed to fetch job postings",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// get all unassigned job postings
router.get("/unassigned", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const jobPostings = await JobPosting.findAll({
      where: { staffId: { [Op.is]: null } },
    }) ?? [];
    return res.json(jobPostings.map((jp) => jp.toJSON()));
  } catch (error) {
    handleZodError(error, res, "Error fetching unassigned job postings");
  }
});

// get all job postings assigned to accounts that are not hiring managers
router.get("/invisible", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const jobPostings = await JobPosting.findAll({
      include: [
        {
          model: Staff,
          as: "staff",
          where: { isHiringManager: false }, // Filter staff who are not hiring managers
          attributes: {exclude: ['password']}, 
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json(jobPostings.map((jp) => jp.toJSON()));
  } catch (error) {
    handleZodError(error, res, "Error fetching invisible job postings");
  }
});


// Get job posting of id
router.get(
  "/:jobPostingId",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { jobPostingId } = req.params;

      const jobPosting = await JobPosting.findOne({
        where: { id: jobPostingId },
        include: [
          {
            model: JobTag,
            as: "jobTags",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
      });

      if (!jobPosting) {
        return res.status(404).json({ error: "Job posting not found" });
      }

      // validate staffID as valid hiring manager
      const staffId = req.auth?.id;
      if (!staffId || jobPosting.get("staffId") !== staffId) {
        return res.status(403).json({ error: "You are not authorized to view this job posting" });
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

type JobPostingRequest = JobPostingCreationAttributes & { tags?: string[] };

// create POST /job-postings
router.post("/", authenticateJWT, requireHiringManager, async (req, res) => {
  const {
    title,
    subtitle,
    description,
    responsibilities,
    qualifications,
    location,
    tags, // optional tags array
  } = req.body as JobPostingRequest;

  if (!title || !description || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const staffId = req.auth?.id;

  // validate staffId as valid hiring manager
  if (!staffId) {
    return res.status(403).json({ error: "Invalid staffId" });
  }

  const staff = await Staff.findByPk(staffId);
  if (!staff || !staff.isHiringManager) {
    return res.status(403).json({ error: "You are not authorized to create job postings" });
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

    const freshJobPosting = await JobPosting.findByPk(newJobPosting.id, { transaction: t });

    // console.log("Created job posting:", freshJobPosting);

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

      await Object.getPrototypeOf(freshJobPosting).setJobTags.call(
        freshJobPosting,
        tagInstances,
        { transaction: t }
      );
    }

    // Commit the transaction
    await t.commit();

    const ret = {
      ...newJobPosting.toJSON(),
      id: newJobPosting.id,
    }
    res.status(201).json(ret);
  } catch (error) {
    await t.rollback();
    handleZodError(error, res, "Error creating job posting");
  }
});

// DELETE a job posting. Only the owning hiring manager can delete job posting
router.delete("/:jobPostingId", authenticateJWT, requireHiringManager, async (req, res) => {
  const t = await Database.GetSequelize().transaction();
  try {
    const { jobPostingId } = req.params;
    const staffId = req.auth?.id;
    const jobPosting = await JobPosting.findOne({
      where: { id: jobPostingId },
      include: [
        {
          model: Staff,
          as: "staff",
          attributes: ["id"],
        },
      ],
      transaction: t,
    });
    // Try to delete
    if (!jobPosting) {
      await t.rollback()
      return res.status(404).json({ error: "Job posting not found" });
    }
    if (!staffId || jobPosting.dataValues.staffId !== staffId) {
      await t.rollback()
      return res.status(403).json({ error: "Not authorized" });
    }

    await Criteria.destroy({
      where: { jobPostingId },
      transaction: t,
    });
    await jobPosting.destroy({transaction: t});
    await t.commit();

    
    res.json({
      "message": "Job posting deleted successfully",
      jobPosting
    });
  } catch (error) {
    await t.rollback();
    handleZodError(error, res, "Error deleting job posting");
  }
});


export interface JobPostingEditRequest {
  title?: string;
  subtitle?: string;
  description?: string;
  responsibilities?: string;
  qualifications?: string;
  location?: string;
  status?: JobPostingStatus;
  tags?: string[]; // array of tag names
}

export interface JobPostingAssignRequest {
  staffId: number;
}

// PUT /job-postings/:jobPostingId – Edit an existing job posting
router.put(
  "/:jobPostingId",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
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

      // check the user is authorized to update this job posting
      const userId = req.auth?.id;
      if (!userId || jobPosting.get("staffId") !== userId) {
        return res.status(403).json({ error: "You are not authorized to update this job posting" });
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
      if (location !== undefined) {
        const trimmedLocation = typeof location === "string" ? location.trim() : location;
        if (trimmedLocation) {
          updates.location = trimmedLocation;
        }
      }

      
      // status validation
      if (status !== undefined) {
        updates.status = status;

        const previousStatus: JobPostingStatus = jobPosting.get("status");

        // check transitions
        if (previousStatus === JobPostingStatus.DRAFT && status !== JobPostingStatus.OPEN) {
          return res.status(400).json({ error: "Invalid status transition" });
        }

        if (previousStatus === JobPostingStatus.DRAFT && status == JobPostingStatus.OPEN) {
          // check if there are criteria for this job posting
          const criteria = await Criteria.findAll({
            where: { jobPostingId },
          });

          if (!criteria.length) {
            return res.status(400).json({
              error: "Cannot open job posting without criteria",
            });
          }
        }

        // only allows OPEN to CLOSED transition
        if (previousStatus === JobPostingStatus.OPEN && status !== JobPostingStatus.CLOSED) {
          return res.status(400).json({ error: "Invalid status transition" });
        }

        // only allows CLOSED to OPEN transition
        if (previousStatus === JobPostingStatus.CLOSED && status !== JobPostingStatus.OPEN) {
          return res.status(400).json({ error: "Invalid status transition" });
        }
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
        await Object.getPrototypeOf(jobPosting).setJobTags.call(
          jobPosting,
          tagInstances,
          { transaction: t }
        );
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
  }
);

// PUT /job-postings/assign/:jobPostingId – Assign a job posting to a hiring manager
router.put("/assign/:jobPostingId", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { jobPostingId } = req.params;

    // Find the existing job posting
    const jobPosting = await JobPosting.findOne({
      where: { id: jobPostingId },
    });

    if (!jobPosting) {
      return res.status(404).json({ error: "Job posting not found" });
    }
    const { staffId } = req.body as JobPostingAssignRequest;
    await jobPosting.update({ staffId })

    res.json(jobPosting.toJSON());
  } catch (error) {
    handleZodError(error, res, "Error assigning job posting");
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

// Get applications summary for a job posting
router.get(
  "/:jobPostingId/applications/summary",
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

// Get job metrics for reports page
router.get(
  "/:jobPostingId/reports",
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
            "Job posting not found or you don't have permission to view its reports",
        });
      }

      // Get applications for this job posting with creation dates
      const applications = await Application.findAll({
        where: { jobPostingId },
        include: [
          {
            model: Applicant,
            as: "applicant",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        attributes: ["jobPostingId", "applicantId", "score", "createdAt"],
      });

      // Calculate applications over time (by month)
      const applicationsByMonth = new Map();
      const now = new Date();
      const fourMonthsAgo = new Date();
      fourMonthsAgo.setMonth(now.getMonth() - 3); // Get data for last 4 months

      // Initialize with last 4 months
      for (let i = 0; i < 4; i++) {
        const monthDate = new Date();
        monthDate.setMonth(now.getMonth() - i);
        const monthName = monthDate.toLocaleString("default", {
          month: "short",
        });
        applicationsByMonth.set(monthName, 0);
      }

      // Count applications by month
      applications.forEach((application) => {
        const appDate = new Date(application.createdAt);
        if (appDate >= fourMonthsAgo) {
          const monthName = appDate.toLocaleString("default", {
            month: "short",
          });
          if (applicationsByMonth.has(monthName)) {
            applicationsByMonth.set(
              monthName,
              applicationsByMonth.get(monthName) + 1
            );
          }
        }
      });

      // Convert to array and calculate percentages
      const maxApplications = Math.max(...applicationsByMonth.values(), 1);
      const applicationData = Array.from(applicationsByMonth.entries())
        .map(([month, count]) => ({
          month,
          applications: count,
          percentage: Math.round((count / maxApplications) * 100),
        }))
        .reverse(); // Show oldest month first

      // // Calculate application sources
      // const sourceCount = new Map();
      // let totalSourcedApplications = 0;

      // applications.forEach(application => {
      //   const source = application.applicant?.source || "Other";
      //   sourceCount.set(source, (sourceCount.get(source) || 0) + 1);
      //   totalSourcedApplications++;
      // });

      // Define colors for common sources
      const sourceColors = {
        LinkedIn: "#0077B5",
        Indeed: "#2164f3",
        "Company Site": "#6B7280",
        Referral: "#FF9B50",
        "Job Board": "#00A86B",
        Other: "#9CA3AF",
      };

      //////////////////////////////////////////////////////////////////////////////

      // Get all criteria for this job posting
      const criteria = await Criteria.findAll({
        where: { jobPostingId },
      });

      if (!criteria.length) {
        return { error: "No criteria found for this job posting" };
      }

      const all_applications = await Application.findAll({
        where: { jobPostingId },
        include: [
          {
            model: Applicant,
            as: "applicant",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        attributes: ["jobPostingId", "applicantId", "score", "createdAt"],
      });

      if (!all_applications.length) {
        return { error: "No applications found for this job posting" };
      }

      const totalApplicants = all_applications.length;
      const criteriaMatchStats = [];

      for (const criterion of criteria) {
        const rules = criterion.criteriaJson.rules;
        let applicantsMeetingCriterion = 0;

        for (const application of all_applications) {
          let meetsAnyCriterionRule = false;

          // Extract applicant skills from their experiences
          const applicantSkills = new Set();
          if (
            application.experienceJson &&
            application.experienceJson.experiences
          ) {
            application.experienceJson.experiences.forEach((exp) => {
              if (exp.skills) {
                exp.skills.forEach((skill) =>
                  applicantSkills.add(skill.toLowerCase())
                );
              }
            });
          }

          // Check if the applicant meets any rule in this criterion
          for (const rule of rules) {
            if (applicantSkills.has(rule.skill.toLowerCase())) {
              meetsAnyCriterionRule = true;
              break;
            }
          }

          if (meetsAnyCriterionRule) {
            applicantsMeetingCriterion++;
          }
        }

        // Calculate percentage
        const percentage =
          totalApplicants > 0
            ? Math.round((applicantsMeetingCriterion / totalApplicants) * 100)
            : 0;

        criteriaMatchStats.push({
          criteriaId: criterion.id,
          name: criterion.name,
          meetCount: applicantsMeetingCriterion,
          totalApplicants,
          percentage,
        });
      }

      // Sort by highest match percentage first
      criteriaMatchStats.sort((a, b) => b.percentage - a.percentage);

      res.json({
        totalApplications: applications.length,
        applicationData,
        criteriaMatchStats,
      });
    } catch (error) {
      console.error("Error fetching job reports:", error);
      res.status(500).json({
        error: "Failed to fetch job reports",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get a specific candidate report for a job posting
router.get(
  "/:jobPostingId/candidate-report/:candidateEmail",
  authenticateJWT,
  requireHiringManager,
  async (req, res) => {
    try {
      const { jobPostingId, candidateEmail } = req.params;

      // Verify the job posting exists and belongs to this hiring manager
      const jobPosting = await JobPosting.findOne({
        where: {
          id: jobPostingId,
          staffId: req.auth?.id,
        },
      });

      if (!jobPosting) {
        return res.status(404).json({
          error: "Job posting not found or you don't have permission to view this candidate"
        });
      }

      // Find the applicant by email
      const applicant = await Applicant.findOne({
        where: { email: candidateEmail }
      });

      if (!applicant) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      // Find the application for this applicant and job posting with applicant included
      const application = await Application.findOne({
        where: {
          jobPostingId,
          applicantId: applicant.dataValues.id
        },
        include: [
          {
            model: Applicant,
            as: "applicant",
            attributes: ["id", "firstName", "lastName", "email", "phone", "linkedIn"]
          }
        ]
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found for this candidate" });
      }

      const applicantData = await Applicant.findByPk(applicant.dataValues.id, {
        attributes: ["id", "firstName", "lastName", "email", "phone", "linkedIn"]
      });

      // Get criteria for this job posting
      const criteria = await Criteria.findAll({
        where: { jobPostingId }
      });

      if (!criteria.length) {
        return res.status(400).json({ error: "No criteria found for this job posting" });
      }

      // Calculate scores for each criterion
      const criteriaScores = [];
      let totalScore = 0;
      let maxPossibleScore = 0;

      // Process each criterion
      for (const criterion of criteria) {
        let criterionScore = 0;
        const applicantSkills = new Set();

        // Extract applicant skills from experiences
        if (application.experienceJson && application.experienceJson.experiences) {
          application.experienceJson.experiences.forEach(exp => {
            if (exp.skills && Array.isArray(exp.skills)) {
              exp.skills.forEach(skill => applicantSkills.add(skill.toLowerCase()));
            }
          });
        }

        // Calculate criterion score based on matched skills
        if (criterion.criteriaJson && criterion.criteriaJson.rules) {
          let rulePoints = 0;

          for (const rule of criterion.criteriaJson.rules) {
            if (applicantSkills.has(rule.skill.toLowerCase())) {
              // Award points based on the rule's configuration
              rulePoints += rule.maxPoints;
            }
          }

          // Calculate score as a percentage of maximum possible points
          criterionScore = criterion.criteriaMaxScore > 0
            ? (rulePoints / criterion.criteriaMaxScore) * 100
            : 0;
        }

        // Add to total scores
        totalScore += criterionScore;
        maxPossibleScore += 100; // Each criterion has a max score of 100%

        // Add to criteria array
        criteriaScores.push({
          name: criterion.name,
          score: Math.round(criterionScore)
        });
      }


      // Process rules for matching and missing
      const matchedRules: string[] = [];
      const missingRules: string[] = [];

      // Extract applicant skills once
      const applicantSkills = new Set();
      if (application.experienceJson && application.experienceJson.experiences) {
        application.experienceJson.experiences.forEach(exp => {
          if (exp.skills && Array.isArray(exp.skills)) {
            exp.skills.forEach(skill => applicantSkills.add(skill.toLowerCase()));
          }
        });
      }

      // Determine matched and missing rules
      for (const criterion of criteria) {
        if (criterion.criteriaJson && criterion.criteriaJson.rules) {
          for (const rule of criterion.criteriaJson.rules) {
            const ruleText = rule.skill;

            if (applicantSkills.has(ruleText.toLowerCase())) {
              if (!matchedRules.includes(ruleText)) {
                matchedRules.push(ruleText);
              }
            } else {
              if (!missingRules.includes(ruleText)) {
                missingRules.push(ruleText);
              }
            }
          }
        }
      }

      // Determine current role from latest experience
      let currentRole = "Applicant";
      if (application.experienceJson &&
        application.experienceJson.experiences &&
        application.experienceJson.experiences.length > 0) {
        // Sort experiences by start date (newest first)
        const sortedExperiences = [
          ...application.experienceJson.experiences,
        ].sort((a, b) => {
          // Convert MM/YYYY to Date objects for comparison
          const [aMonth, aYear] = a.startDate.split("/");
          const [bMonth, bYear] = b.startDate.split("/");
          return (
            new Date(parseInt(bYear), parseInt(bMonth) - 1).getTime() -
            new Date(parseInt(aYear), parseInt(aMonth) - 1).getTime()
          );
        });

        // Use the most recent experience title as current role if available
        if (sortedExperiences[0] && sortedExperiences[0].title) {
          currentRole = sortedExperiences[0].title;
        }
      }

      const personalLinks = [];

      if (applicantData?.linkedIn) {
        personalLinks.push(applicantData.linkedIn);
      }

      const score = Math.floor(application?.score || 0)

      const applicationForResume = await Application.findOne({
        where: {
          jobPostingId: jobPostingId,
          applicantId: applicant.dataValues.id
        },
      });

      let resume = null

      try {
          // Extract just the filename from the full path
        const resumeFileName = path.basename(applicationForResume?.dataValues.resumePath || '');

        resume = await generateTemporaryUrl(resumeFileName)

      } catch (s3Error) {
        console.error("Error retrieving resume from S3:", s3Error);
        // Continue without resume content
      }
    
      const candidateReport = {
        name: `${applicantData?.dataValues.firstName || ''} ${applicantData?.dataValues.lastName || ''}`,
        role: currentRole,
        matchScore: score,
        details: {
          email: applicantData?.dataValues.email || '',
          phone: applicantData?.dataValues.phone || 'N/A',
          personalLinks: personalLinks,
        },
        criteria: criteriaScores,
        rules: {
          matched: matchedRules,
          missing: missingRules
        },
        resume: resume
      };

      res.json(candidateReport);
    } catch (error) {
      console.error("Error fetching candidate report:", error);
      res.status(500).json({
        error: "Failed to fetch candidate report",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

export default router;
