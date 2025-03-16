import Skill from "@/database/models/skill";
import { Router } from "express";

const router = Router();

// Get all skills from the database
router.get("/", async (req, res) => {
  try {
    const skills = await Skill.findAll({
      attributes: ["skillId", "name"],
    });

    res.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({
      error: "Failed to fetch skills",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
