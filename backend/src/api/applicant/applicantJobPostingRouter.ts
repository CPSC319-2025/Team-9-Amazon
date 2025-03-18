import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import JobPosting from "@/database/models/jobPosting"; // Import Sequelize model

const router = Router();

// GET /api/job-postings - Fetch all job postings with specific fields
router.get("/", async (req, res) => {
  try {
    const jobPostings = await JobPosting.findAll({
      attributes: ["id", "title", "description", "responsibilities", "qualifications", "location"], 
    });

    // const formattedJobPostings = jobPostings.map((job) => ({
    //   id: job.id,
    //   title: job.title,
    //   description: job.description,
    //   location: job.location,
    //   qualifications: job.qualifications ? job.qualifications.split(",").map((q) => q.trim()) : [],
    //   responsibilities: job.responsibilities ? job.responsibilities.split(",").map((r) => r.trim()) : [],
    // }));
    const formattedJobPostings = jobPostings.map((job) => {
      const jobData = job.toJSON();
    
      return {
        id: jobData.id,
        code: jobData.id?.toString(),
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        qualifications: jobData.qualifications
          ? jobData.qualifications.split(",").map((q) => q.trim())
          : [],
        responsibilities: jobData.responsibilities
          ? jobData.responsibilities.split(",").map((r) => r.trim())
          : [],
      };
    });

    return res.status(StatusCodes.OK).json({ success: true, data: formattedJobPostings });
    //return res.status(200).json({ success: true, data: jobPostings });
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
});

export default router;
