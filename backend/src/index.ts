import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";
import Database from "./database/database";

const server = app.listen(env.PORT, () => {
  const { NODE_ENV, HOST, PORT } = env;
  logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
});

const startApp = async () => {
  try {
    await Database.InitDb();
    logger.info("Database and models initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize database:", error);
    process.exit(1);
  }
};


const onCloseSignal = () => {
  logger.info("sigint received, shutting down");
  server.close(() => {
    logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};
process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);

startApp();
