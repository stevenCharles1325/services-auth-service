import { Prisma, PrismaClient } from "#Prisma";

export default class AuthRepository {
  constructor(
    private prisma: PrismaClient,
  ) {}

  public async findCredentialByEmail(email: string): Promise<Prisma.CredentialModel | null> {
    return this.prisma.credential.findFirst({
      where: { email },
    });
  }
}