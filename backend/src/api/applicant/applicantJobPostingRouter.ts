import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import JobPosting from "@/database/models/jobPosting"; // Import Sequelize model
import JobTag from "@/database/models/jobTag";
import { JobPostingAttributes } from "@/database/models/jobPosting";


const router = Router();

// GET /api/job-postings - Fetch all job postings with specific fields
router.get("/", async (req, res) => {
  try {
    const jobPostings = await JobPosting.findAll({
      where: {status: "OPEN"},
      attributes: [
        "id",
        "title", 
        "subtitle",
        "description", 
        "responsibilities", 
        "qualifications", 
        "location", 
        "createdAt"], 
      include: [
        {
          model: JobTag,
          as: "jobTags",
          attributes: ["name"], 
          through: { attributes: [] }, 
        },
      ],
    });

    const formattedJobPostings = jobPostings.map((job) => {
      const jobData = job.toJSON() as JobPostingAttributes & { jobTags?: { name: string }[] };
    
      return {
        id: jobData.id,
        code: jobData.id?.toString(),
        title: jobData.title,
        subtitle: jobData.subtitle,
        description: jobData.description,
        location: jobData.location,
        posted_at: new Date(jobData.createdAt).toISOString().split("T")[0],
        qualifications: jobData.qualifications
          ? jobData.qualifications.split(",").map((q) => q.trim())
          : [],
        responsibilities: jobData.responsibilities
          ? jobData.responsibilities.split(",").map((r) => r.trim())
          : [],
          tags: jobData.jobTags?.map((tag) => tag.name) || [],
      };
    });

    return res.status(StatusCodes.OK).json({ success: true, data: formattedJobPostings });
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching job postings" });
  }
});

router.get("/tags", async (req, res) => {
  try {
    const tags = await JobTag.findAll({
      attributes: ["name"],
      order: [["name", "ASC"]], // sort alphabetically
    });

    const tagNames = tags.map(tag => tag.dataValues.name);

    return res.status(StatusCodes.OK).json({ success: true, data: tagNames });
  } catch (error) {
    console.error("Error fetching job tags:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Error fetching job type filters" });
  }
});

export default router;
