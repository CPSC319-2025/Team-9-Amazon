import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import JobPosting from "@/database/models/jobPosting"; // Import Sequelize model

const router = Router();

// GET /api/job-postings - Fetch all job postings
router.get("/", async (req, res) => {
  try {
    const jobPostings = await JobPosting.findAll();
    //res.status(StatusCodes.OK).json(jobPostings);
    return res.status(200).json({ success: true, data: jobPostings });
  } catch (error) {
    console.error("Error fetching job postings:", error);
    //res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
