// routes/staffRoutes.js
import { authenticateJWT, requireAdmin, signToken } from "@/common/middleware/auth";
import Staff from "@/database/models/staff";
import { Router } from "express";
import { z } from "zod";
import { handleZodError } from "@/common/middleware/errorHandler";

const router = Router();

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
router.post("/accounts", authenticateJWT, requireAdmin, async (req, res) => {
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

    // Generate JWT token
    const token = signToken({
      id: staff.id,
      email: staff.email,
      isHiringManager: staff.isHiringManager,
      isAdmin: staff.isAdmin,
    });

    res.status(201).json({
      token,
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

export default router