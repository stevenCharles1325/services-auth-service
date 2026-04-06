import { logger } from "#Managers/log.manager";
import { PrismaClient } from "#Prisma";

export default class DatabaseProvider {
  private client!: PrismaClient;
  private readonly logger = logger.child({ context: "DatabaseProvider" });

  constructor(private readonly databaseUrl: string) {}

  public async connect() {
    const prisma = new PrismaClient({
      datasources: { db: { url: this.databaseUrl } },
    });
    this.client = prisma;
    this.client
      .$connect()
      .then(() => {
        this.logger.info("Database connection established");
      })
      .catch((err) => {
        this.logger.error({ err }, "Failed to connect to database");
      });
  }

  public async disconnect() {
    if (this.client) {
      await this.client.$disconnect();
    }
  }

  public getClient(): PrismaClient {
    if (!this.client) {
      throw new Error("Database client not initialized. Call connect() first.");
    }
    return this.client;
  }
}
