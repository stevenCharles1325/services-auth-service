import { Prisma, RefreshToken } from "#Prisma";

export default interface IRefreshTokenRepository {
  findByAccessToken(accessToken: string): Promise<RefreshToken | null>;
  findByRefreshToken(token: string): Promise<RefreshToken | null>;
  revokeByToken(token: string): Promise<void>;
  revokeById(id: string): Promise<void>;
  revokeByCredentialId(credentialId: string): Promise<void>;
  create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken>;
  update(
    id: string,
    data: Prisma.RefreshTokenUpdateInput,
  ): Promise<RefreshToken>;
  deleteMany(ids: string[]): Promise<number>;
}
