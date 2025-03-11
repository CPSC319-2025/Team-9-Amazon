import { signToken } from "@/common/middleware/auth";
import { handleZodError } from "@/common/middleware/errorHandler";
import Staff from "@/database/models/staff";
import { Router } from "express";
import { z } from "zod";

const router = Router();


// Login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
router.post("/", async (req, res) => {
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
    const token = signToken({
      id: staff.id,
      email: staff.email,
      isHiringManager: staff.isHiringManager,
      isAdmin: staff.isAdmin,
    })

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
    handleZodError(error, res, "Failed to login")
  }
});

export default router;
