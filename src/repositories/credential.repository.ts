import ICredentialRepository from "#Interfaces/credential-repository.interface";
import { Prisma, PrismaClient, Credential } from "#Prisma";

export default class CredentialRepository implements ICredentialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findCredentialById(id: string): Promise<Credential | null> {
    return this.prisma.credential.findFirst({
      where: { id },
    });
  }

  public async findCredentialByEmail(
    email: string,
  ): Promise<Credential | null> {
    return this.prisma.credential.findFirst({
      where: { email },
    });
  }

  public async markEmailAsVerified(id: string): Promise<Credential> {
    return this.prisma.credential.update({
      where: { id },
      data: { isVerified: true },
    });
  }

  public async create(data: Prisma.CredentialCreateInput): Promise<Credential> {
    return this.prisma.credential.create({ data });
  }

  public async update(
    id: string,
    data: Prisma.CredentialUpdateInput,
  ): Promise<Credential> {
    return this.prisma.credential.update({
      where: { id },
      data,
    });
  }

  public async deleteMany(ids: string[]): Promise<number> {
    const { count } = await this.prisma.credential.deleteMany({
      where: { id: { in: ids } },
    });

    return count;
  }
}
