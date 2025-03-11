import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import Staff from "@/database/models/staff";
import { env } from "@/common/utils/envConfig";
import { authenticateJWT, requireAdmin } from "@/common/middleware/auth";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  isHiringManager: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register endpoint - Protected, admin only
router.post("/register", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      isHiringManager = false,
      isAdmin = false,
    } = registerSchema.parse(req.body);

    // Check if staff already exists
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
    const token = jwt.sign(
      {
        id: staff.id,
        email: staff.email,
        isHiringManager: staff.isHiringManager,
        isAdmin: staff.isAdmin,
      },
      env.JWT_SECRET,
      { expiresIn: "24h" }
    );

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
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Failed to register staff member",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find staff member - CRITICAL: set raw: false to get a model instance
    const staff = await Staff.findOne({
      where: { email },
      raw: false,
    });

    if (!staff) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Validate password
    const isValidPassword = await staff.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: staff.id,
        email: staff.email,
        isHiringManager: staff.isHiringManager,
        isAdmin: staff.isAdmin,
      },
      env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
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
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Failed to login",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
