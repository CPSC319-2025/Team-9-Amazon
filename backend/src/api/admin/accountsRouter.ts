// routes/staffRoutes.js
import { authenticateJWT, requireAdmin } from "@/common/middleware/auth";
import { handleZodError } from "@/common/middleware/errorHandler";
import Staff from "@/database/models/staff";
import { Router } from "express";
import { z } from "zod";

const accountsRouter = Router();

// Get all accounts
accountsRouter.get("/", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const staff = await Staff.findAll({
      attributes: { exclude: ["password"] },
      raw: true,
    });
    res.status(200).json({ staff });
  } catch (error) {
    handleZodError(error, res, "Failed to get staff members");
  }
});

// Get all hiring manager accounts
accountsRouter.get("/hiringManagers", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const staff = await Staff.findAll({
      where: { isHiringManager: true },
      attributes: { exclude: ["password"] },
      raw: true,
    });
    res.status(200).json({ staff });
  } catch (error) {
    handleZodError(error, res, "Failed to get staff members");
  }
});

// Get specific account
accountsRouter.get("/:account_id", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.account_id);
    const staff = await Staff.findByPk(id, {
      attributes: { exclude: ["password"] },
      raw: true,
    });
    res.status(200).json({ ...staff });
  } catch (error) {
    handleZodError(error, res, "Failed to get staff members");
  }
});

// Create new account
const createAccountReq = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  isHiringManager: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});
accountsRouter.post("/", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      isHiringManager = false,
      isAdmin = false,
    } = createAccountReq.parse(req.body);

    const existingStaff = await Staff.findOne({
      where: { email },
      raw: false,
    });
    if (existingStaff) {
      return res.status(400).json({
        error: "Staff member with this email already exists",
      });
    }

    // Create new staff member
    const staff = await Staff.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      isHiringManager,
      isAdmin,
    });

    res.status(201).json({
      staff: {
        id: staff.id,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone,
        isHiringManager: staff.isHiringManager,
        isAdmin: staff.isAdmin,
      },
    });
  } catch (error) {
    handleZodError(error, res, "Failed to register staff member");
  }
});

// Edit account
const editAccountReq = z.object({
  password: z.string().min(8).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  isHiringManager: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});
accountsRouter.put("/:account_id", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.account_id);
    const { password, firstName, lastName, phone, isHiringManager, isAdmin } = editAccountReq.parse(req.body);
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    await staff.update({ password, firstName, lastName, phone, isHiringManager, isAdmin });
    const updatedStaff = await Staff.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    res.status(200).json(updatedStaff);
  } catch (error) {
    handleZodError(error, res, "Failed to edit staff member");
  }
});

// Delete account
accountsRouter.delete("/:account_id", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.account_id);
    if ((await Staff.findByPk(id)) === null) {
      return res.status(404).json({ error: `Staff member with id ${id} not found` });
    }
    await Staff.destroy({
      where: { id },
    });
    res.status(200).json({ message: `Successfully deleted staff member with id ${id}` });
  } catch (error) {
    handleZodError(error, res, "Failed to edit staff member");
  }
});

export default accountsRouter;
