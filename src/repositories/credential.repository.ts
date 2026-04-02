import { Prisma, PrismaClient, Credential } from "#Prisma";
import { CredentialRepository } from "#Types/credential-repository.type";

export default class AuthRepository implements CredentialRepository {
  constructor(
    private prisma: PrismaClient,
  ) {}

  public async findCredentialById(id: string): Promise<Credential | null> {
    return this.prisma.credential.findFirst({
      where: { id },
    });
  }

  public async findCredentialByEmail(email: string): Promise<Credential | null> {
    return this.prisma.credential.findFirst({
      where: { email },
    });
  }

  public async create(data: Prisma.CredentialCreateInput): Promise<Credential> {
    return this.prisma.credential.create({ data });
  }

  public async update(id: string, data: Prisma.CredentialUpdateInput): Promise<Credential> {
    return this.prisma.credential.update({
      where: { id },
      data
    });
  }

  public async deleteMany(ids: string[]): Promise<number> {
    const { count } = await this.prisma.credential.deleteMany({
      where: { id: { in: ids }}
    });

    return count;
  }
}