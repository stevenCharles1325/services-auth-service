import { Prisma, PrismaClient, OtpType, OtpCode } from "#Prisma";

export default class OTPRepository {
  constructor(
    private prisma: PrismaClient,
  ) {}

  public async findOTP (credentialId: string, code: string, type: OtpType): Promise<OtpCode | null> {
    return this.prisma.otpCode.findFirst({ where: { credentialId, code, type }});
  }

  public async create (data: Prisma.OtpCodeCreateInput) {
    return this.prisma.otpCode.create({ data });
  }

  public async update (id: string, data: Prisma.OtpCodeUpdateInput) {
    return this.prisma.otpCode.update({ where: { id }, data });
  }

  public async delete (id: string): Promise<void> {
    await this.prisma.otpCode.delete({ where: { id }});
  }
}