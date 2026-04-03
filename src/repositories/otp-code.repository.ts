import { Prisma, PrismaClient, OtpType, OtpCode } from "#Prisma";

export default class OTPCodeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findOTP(
    credentialId: string,
    code: string,
    type: OtpType,
  ): Promise<OtpCode | null> {
    return this.prisma.otpCode.findFirst({
      where: { credentialId, code, type },
    });
  }

  public async markOTPAsUsed(id: string): Promise<OtpCode> {
    return this.prisma.otpCode.update({
      where: { id },
      data: { isUsed: true },
    });
  }

  public async create(data: Prisma.OtpCodeCreateInput): Promise<OtpCode> {
    return this.prisma.otpCode.create({ data });
  }

  public async update(
    id: string,
    data: Prisma.OtpCodeUpdateInput,
  ): Promise<OtpCode> {
    return this.prisma.otpCode.update({ where: { id }, data });
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.otpCode.delete({ where: { id } });
  }
}
