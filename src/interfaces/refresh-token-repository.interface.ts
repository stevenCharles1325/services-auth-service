import { Prisma, RefreshToken } from "#Prisma";

export default interface IRefreshTokenRepository {
  findByAccessToken(accessToken: string): Promise<RefreshToken | null>;
  findByRefreshToken(token: string): Promise<RefreshToken | null>;
  create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken>;
  update(id: string, data: Prisma.RefreshTokenUpdateInput): Promise<RefreshToken>;
  deleteMany(ids: string[]): Promise<number>;
}