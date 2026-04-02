import type { Prisma, Credential } from "#Prisma";

export interface CredentialRepository {
  findCredentialById(id: string): Promise<Credential | null>;
  findCredentialByEmail(email: string): Promise<Credential | null>;
  create(data: Prisma.CredentialCreateInput): Promise<Credential>;
  update(id: string, data: Prisma.CredentialUpdateInput): Promise<Credential>;
  deleteMany(ids: string[]): Promise<Number>;
}