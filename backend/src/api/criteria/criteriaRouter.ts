import { authenticateJWT } from "@/common/middleware/auth";
import Criteria from "@/database/models/criteria";
import { Router } from "express";

const router = Router();
// Get all global criteria
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const globalCriteria = await Criteria.findAll({
      where: {
        criteriaType: "global",
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(globalCriteria);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch global criteria",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
