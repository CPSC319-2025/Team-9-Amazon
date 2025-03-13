import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import JobPosting from "@/database/models/jobPosting"; // Import Sequelize model

const router = Router();

router.get("/", async (req, res) => {
  try {
    const jobPostings = await JobPosting.findAll();
    res.status(StatusCodes.OK).json(jobPostings);
  } catch (error) {
    console.error("Error fetching job postings:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
});

export default router;
