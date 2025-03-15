import { authenticateJWT } from "@/common/middleware/auth";
import { handleZodError } from "@/common/middleware/errorHandler";
import Criteria, { CriteriaType } from "@/database/models/criteria";
import { Router } from "express";
import { z } from "zod";

const criteriaRouter = Router();

// Fetch global criteria
criteriaRouter.get("/", authenticateJWT, async (req, res) => {
  try {
    const globalCriteria = await Criteria.findAll({
      where: {
        criteriaType: "global",
      },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(globalCriteria);
  } catch (error) {
    handleZodError(error, res, "Failed to get global criteria");
  }
});

// Fetch specific criteria
criteriaRouter.get("/:criteria_id", authenticateJWT, async (req, res) => {
  try {
    const criteria_id = parseInt(req.params.criteria_id);
    const criteria = await Criteria.findByPk(criteria_id, {
      raw: true,
    });
    res.status(200).json({ ...criteria });
  } catch (error) {
    handleZodError(error, res, "Failed to get global criteria");
  }
});

// Create new criteria
const createCriteriaReq = z.object({
  name: z.string().min(1),
  criteriaJson: z.any(),
  criteriaType: z.enum(Object.values(CriteriaType) as [CriteriaType, ...CriteriaType[]]),
  jobPostingId: z.number().optional(),
});
criteriaRouter.post("/", authenticateJWT, async (req, res) => {
  try {
    const { name, criteriaJson, criteriaType, jobPostingId } = createCriteriaReq.parse(req.body);
    const newCriteria = await Criteria.create({
      name,
      criteriaJson,
      criteriaType,
      jobPostingId,
    });
    res.status(201).json(newCriteria);
  } catch (error) {
    handleZodError(error, res, "Failed to create new criteria");
  }
});

// Edit Criteria
const editCriteriaReq = z.object({
  name: z.string().min(1).optional(),
  criteriaJson: z.any().optional(),
  criteriaType: z.enum(Object.values(CriteriaType) as [CriteriaType, ...CriteriaType[]]).optional(),
  jobPostingId: z.number().optional(),
});
criteriaRouter.put("/:criteria_id", authenticateJWT, async (req, res) => {
  try {
    const criteria_id = parseInt(req.params.criteria_id);
    const { name, criteriaJson, criteriaType, jobPostingId } = editCriteriaReq.parse(req.body);
    const criteria = await Criteria.findByPk(criteria_id);
    if (criteria === null) {
      return res.status(404).json({ error: `Criteria with id ${criteria_id} not found` });
    }
    const newCriteria = await criteria.update({
      name,
      criteriaJson,
      criteriaType,
      jobPostingId,
    });
    res.status(201).json({message: `Successfully updated criteria with id ${criteria_id}`, newCriteria});
  } catch (error) {
    handleZodError(error, res, "Failed to create new criteria");
  }
});

// Delete Criteria
criteriaRouter.delete("/:criteria_id", authenticateJWT, async (req, res) => {
  try {
    const criteria_id = parseInt(req.params.criteria_id);
    if (await Criteria.findByPk(criteria_id) === null) {
      return res.status(404).json({ error: `Criteria with id ${criteria_id} not found` });
    }
    const criteria = await Criteria.destroy({
      where: {
        id: criteria_id,
      },
    });
    res.status(200).json({ message: `Successfully deleted criteria with id ${criteria_id}` });
  } catch (error) {
    handleZodError(error, res, "Failed to delete criteria");
  }
});

export default criteriaRouter;
