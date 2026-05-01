import { ITransactionManager } from "#Core/types/transaction.type";
import { Prisma, PrismaClient } from "#Prisma";

export default class TransactionManager implements ITransactionManager {
  constructor(private readonly db: PrismaClient) {}

  public async run<T>(
    callback: (tx: Prisma.TransactionClient) => T | Promise<T>,
  ): Promise<T> {
    return this.db.$transaction(async (tx) => callback(tx));
  }
}
