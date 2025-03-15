// routes/staffRoutes.js
import { authenticateJWT, requireAdmin } from "@/common/middleware/auth";
import { handleZodError } from "@/common/middleware/errorHandler";
import { s3DownloadPdfBase64, s3UploadPdfBase64 } from "@/common/utils/awsTools";
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

// Get specific account
accountsRouter.get("/:account_id", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.account_id)
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
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  isHiringManager: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});
accountsRouter.put("/:account_id", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.account_id)
    const {email, password, firstName, lastName, phone, isHiringManager, isAdmin, } = editAccountReq.parse(req.body);
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    if (email) staff.email = email;
    if (password) staff.password = password;
    if (firstName) staff.firstName = firstName;
    if (lastName) staff.lastName = lastName;
    if (phone) staff.phone = phone;
    if (isHiringManager !== undefined) staff.isHiringManager = isHiringManager;
    if (isAdmin !== undefined) staff.isAdmin = isAdmin;
    await staff.save();
    res.status(200).json({
      id: staff.id,
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      phone: staff.phone,
      isHiringManager: staff.isHiringManager,
      isAdmin: staff.isAdmin,
    });
  } catch (error) {
    handleZodError(error, res, "Failed to edit staff member");
  }
});

// Delete account
accountsRouter.delete("/:account_id", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.account_id)
    await Staff.destroy({
      where: { id },
    });
    res.status(200).json({ message: `Staff member with id ${id} deleted` });
  } catch (error) {
    handleZodError(error, res, "Failed to edit staff member");
  }
});


// I am testing
const testReq = z.object({
  name: z.string().min(1),
  pdf: z.string().min(1),
});
accountsRouter.post("/test", async (req, res) => {
  try {
    const { name, pdf } = testReq.parse(req.body);
    await s3UploadPdfBase64(name, pdf);
    const temp = await s3DownloadPdfBase64(name);
    res.status(200).json({ message: temp });
  } catch (error) {
    handleZodError(error, res, "Failed to test");
  }
});

export default accountsRouter