import { PrismaClient } from "#Prisma";

export default class DatabaseProvider {
  private client!: PrismaClient;

  constructor(private readonly databaseUrl: string) {}

  public async connect() {
    const prisma = new PrismaClient({
      datasources: { db: { url: this.databaseUrl } },
    });
    this.client = prisma;
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
