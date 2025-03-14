import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";

// Routers
import loginRouter from "./api/login/loginRouter";
import adminRouter from "./api/admin/adminRouter";
import jobPostingsRouter from "./api/jobPostings/jobPostingsRouter";
import criteriaRouter from "./api/criteria/criteriaRouter";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
const corsOrigins = (origin: string | undefined, callback : (err: Error | null, allow?: boolean) => void) => {
  if (!origin) {
    return callback(null, true); // Allow non-browser requests
  }

  const allowedOrigins = env.CORS_ORIGIN;
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  // Check wildcard subdomains
  const isAllowed = allowedOrigins.split(" ").some((allowedOrigin) => {
    if (allowedOrigin.includes("*")) {
      const regex = new RegExp("^" + allowedOrigin.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$");
      return regex.test(origin);
    }
    return false;
  });

  if (isAllowed) {
    return callback(null, true);
  }

  return callback(new Error("Not allowed by CORS"));
};


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600,
  })
);
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/login", loginRouter);
app.use("/admin", adminRouter);
app.use("/job-postings", jobPostingsRouter);
app.use("/criteria", criteriaRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
