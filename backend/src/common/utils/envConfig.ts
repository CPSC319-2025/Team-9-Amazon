import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly("test"),
    choices: ["development", "production", "test"],
  }),
  HOST: host({ devDefault: "localhost" }),
  PORT: port({ devDefault: 3001 }),
  CORS_ORIGIN: str({ devDefault: "http://localhost:3000" }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: 1000 }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: 1000 }),
  JWT_SECRET: str(),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
});
