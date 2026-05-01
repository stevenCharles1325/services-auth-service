import type { Prisma, Credential } from "#Prisma";

export default interface ICredentialRepository {
  findCredentialById(id: string): Promise<Credential | null>;
  findCredentialByEmail(email: string): Promise<Credential | null>;
  markEmailAsVerified(id: string): Promise<Credential>;
  create(data: Prisma.CredentialCreateInput): Promise<Credential>;
  update(id: string, data: Prisma.CredentialUpdateInput): Promise<Credential>;
  deleteMany(ids: string[]): Promise<Number>;
}
