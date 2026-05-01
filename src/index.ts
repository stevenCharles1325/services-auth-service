import Container from "#Main/container";
import createServer from "#Main/server";
import { logger } from "#Core/config/managers/log.manager";

async function bootstrap() {
  const container = Container.getInstance();
  await container.init();

  const app = await createServer(container);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info({ port }, "Auth service is running");
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "[server]: Signal received, shutting down");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
