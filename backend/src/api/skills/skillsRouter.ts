import { handleZodError } from "@/common/middleware/errorHandler";
import Skill from "@/database/models/skill";
import { Router } from "express";
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
    handleZodError(error, res, `Failed to get skill with id ${req.params.skill_id}`);
  }
});

// Create new skill
const createSkillsReq = z.object({
  name: z.string().min(1),
});
skillsRouter.post("/", async (req, res) => {
  try {
    const { name } = createSkillsReq.parse(req.body);
    const newSkill = await Skill.create({ name });
    res.status(201).json({...newSkill.dataValues, skillId: newSkill.skillId});
  } catch (error) {
    handleZodError(error, res, "Failed to create new skill");
  }
});

// Edit skill
const editSkillsReq = z.object({
  name: z.string().min(1),
});
skillsRouter.put("/:skill_id", async (req, res) => {
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
})

skillsRouter.delete("/:skill_id", async (req, res) => {
  try {
    const skill_id = parseInt(req.params.skill_id);
    const skill = await Skill.findByPk(skill_id);
    if (!skill) {
      res.status(404).json({ error: `Skill with id ${skill_id} not found` });
      return;
    }
    await skill.destroy();
    res.status(200).json({message: "Successfully deleted skill", ...skill.dataValues});
  } catch (error) {
    handleZodError(error, res, `Failed to delete skill with id ${req.params.skill_id}`);
  }
});

export default skillsRouter;
