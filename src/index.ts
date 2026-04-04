import Container from "#Container";
import createServer from "#Server";

async function bootstrap() {
  const container = Container.getInstance();
  await container.init();

  const app = await createServer(container);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Auth service is running on port ${port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[server]: ${signal} received, shutting down`);
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
