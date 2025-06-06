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
import jobPostingsRouter from "./api/jobPostings/jobPostingsRouter";
import criteriaRouter from "./api/criteria/criteriaRouter";
import skillsRouter from "./api/skills/skillsRouter";
import applicantJobPostingRouter from "./api/applicant/applicantJobPostingRouter";
import applicationsRouter from "./api/application/applicationsRouter";
import accountsRouter from "./api/admin/accountsRouter";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
const corsOrigins = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
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
      const regex = new RegExp(
        "^" + allowedOrigin.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
      );
      return regex.test(origin);
    }
    return false;
  });

  if (isAllowed) {
    return callback(null, true);
  }

  return callback(new Error("Not allowed by CORS"));
};

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

// Body Parsing Middleware (Should be after security and logging)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/login", loginRouter);
app.use("/accounts", accountsRouter);
app.use("/job-postings", jobPostingsRouter);
app.use("/criteria", criteriaRouter);
app.use("/skills", skillsRouter);
app.use("/applicant/job-postings", applicantJobPostingRouter);
app.use("/applications", applicationsRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
