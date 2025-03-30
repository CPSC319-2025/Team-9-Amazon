import { expressjwt } from "express-jwt";
import { Request, Response, NextFunction } from "express";
import { env } from "@/common/utils/envConfig";
import jwt from "jsonwebtoken";
import { Staff } from "@/database/database";

// Define the JWT payload interface
interface JWTPayload {
  id: number;
  isHiringManager: boolean;
  isAdmin: boolean;
  [key: string]: any;
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      auth?: JWTPayload;
    }
  }
}

export const authenticateJWT = expressjwt({
  secret: env.JWT_SECRET,
  algorithms: ["HS256"],
});

export const requireHiringManager = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth?.isHiringManager) {
      return res.status(403).json({
        error: "Access denied. Hiring manager role required.",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Authentication failed",
    });
  }
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth?.isAdmin) {
      return res.status(403).json({
        error:
          "Access denied. Only administrators can register new staff members.",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Authentication failed",
    });
  }
};

export const signToken = (payload: any) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "24h" });
}

export const signStaffToken = (staff: Staff) => {
  const payload = {
    id: staff.id,
    email: staff.email,
    isHiringManager: staff.isHiringManager,
    isAdmin: staff.isAdmin,
  }
  return signToken(payload)
}
