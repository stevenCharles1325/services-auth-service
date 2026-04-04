import Container from "#Container";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import createAuthRoutes from "#Routes/auth.route";
import { errorMiddleware } from "#Middlewares/error.middleware";

export default async function createServer(container: Container) {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", createAuthRoutes(container.authController));

  app.use(errorMiddleware);

  return app;
}
