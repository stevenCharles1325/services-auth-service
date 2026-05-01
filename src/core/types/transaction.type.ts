import { Prisma } from "#Prisma";

export interface ITransactionManager {
  run<T>(
    callback: (tx: Prisma.TransactionClient) => T | Promise<T>,
  ): Promise<T>;
}
