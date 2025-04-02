import { authenticateJWT, requireAdmin } from "@/common/middleware/auth";
import { handleZodError } from "@/common/middleware/errorHandler";
import { Criteria } from "@/database/database";
import Skill from "@/database/models/skill";
import { Router } from "express";
import { Sequelize } from "sequelize";
import { z } from "zod";

const skillsRouter = Router();

// Get all skills from the database
skillsRouter.get("/", async (req, res) => {
  try {
    const skills = await Skill.findAll({
      attributes: ["skillId", "name"],
    });

    res.json(skills);
  } catch (error) {
    handleZodError(error, res, "Failed to get skills");
  }
});

// Get specific skill
skillsRouter.get("/:skill_id", async (req, res) => {
  try {
    const skill_id = parseInt(req.params.skill_id);
    const skill = await Skill.findByPk(skill_id);
    if (!skill) {
      res.status(404).json({ error: `Skill with id ${skill_id} not found` });
      return;
    }
    res.json(skill);
  } catch (error) {
    handleZodError(
      error,
      res,
      `Failed to get skill with id ${req.params.skill_id}`
    );
  }
});

// Create new skill
const createSkillsReq = z.object({
  name: z.string().min(1),
});
skillsRouter.post("/", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { name } = createSkillsReq.parse(req.body);
    const newSkill = await Skill.create({ name });
    res.status(201).json({ ...newSkill.dataValues, skillId: newSkill.skillId });
  } catch (error) {
    handleZodError(error, res, "Failed to create new skill");
  }
});

// Edit skill
const editSkillsReq = z.object({
  name: z.string().min(1),
});
skillsRouter.put(
  "/:skill_id",
  authenticateJWT,
  requireAdmin,
  async (req, res) => {
    try {
      const skill_id = parseInt(req.params.skill_id);
      const { name } = editSkillsReq.parse(req.body);
      const skill = await Skill.findByPk(skill_id);
      if (!skill) {
        res.status(404).json({ error: "Skill not found" });
        return;
      }

      if (name) {
        await skill.update({ name });
      }

      res.json(skill);
    } catch (error) {
      handleZodError(error, res, "Failed to edit skill");
    }
  }
);

skillsRouter.delete(
  "/:skill_id",
  authenticateJWT,
  requireAdmin,
  async (req, res) => {
    try {
      const skill_id = parseInt(req.params.skill_id);
      const skill = await Skill.findByPk(skill_id);
      if (!skill) {
        res.status(404).json({ error: `Skill with id ${skill_id} not found` });
        return;
      }
      await skill.destroy();
      res
        .status(200)
        .json({ message: "Successfully deleted skill", ...skill.dataValues });
    } catch (error) {
      handleZodError(
        error,
        res,
        `Failed to delete skill with id ${req.params.skill_id}`
      );
    }
  }
);

// Check if skill is referenced in criteria
skillsRouter.get(
  "/:skillId/check-references",
  authenticateJWT,
  requireAdmin,
  async (req, res) => {
    try {
      const skillId = parseInt(req.params.skillId);
      const skill = await Skill.findByPk(skillId);

      if (!skill) {
        return res.status(404).json({
          error: "Skill not found",
        });
      }

      // Find criteria that reference this skill
      const affectedCriteria = await Criteria.findAll({
        where: Sequelize.literal(
          `JSON_CONTAINS(criteriaJson->'$.rules', '{"skill": "${skill.dataValues.name}"}')`
        ),
      });

      res.json({
        isReferenced: affectedCriteria.length > 0,
        criteriaCount: affectedCriteria.length,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to check skill references",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default skillsRouter;
