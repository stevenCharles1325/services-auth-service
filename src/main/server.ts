import Container from "./container";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import createAuthRoutes from "#App/routes/auth.route";
import { errorMiddleware } from "#Middleware/error.middleware";

export default async function createServer(container: Container) {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use(
    "/api/auth",
    createAuthRoutes(
      container.authController,
      container.turnstileMiddleware,
      container.createRateLimit
    ),
  );

  app.use(errorMiddleware);

  return app;
}
