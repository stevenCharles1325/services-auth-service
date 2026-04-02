import IRefreshTokenRepository from "#Interfaces/refresh-token-repository.interface";
import { PrismaClient, RefreshToken } from "#Prisma";
import { RefreshTokenCreateInput, RefreshTokenUpdateInput } from "src/generated/prisma/models";

export default class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    private readonly prisma: PrismaClient,
  ) {}

  public async findByAccessToken(accessToken: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({ where: { accessToken }});
  }

  public async findByRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({ where: { token }});
  }

  public async create(data: RefreshTokenCreateInput): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  public async update(id: string, data: RefreshTokenUpdateInput): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({ where: { id }, data });
  }

  public async deleteMany(ids: string[]): Promise<number> {
    const { count } = await this.prisma.refreshToken.deleteMany({ where: { id: { in: ids }}});
    
    return count;
  }
}