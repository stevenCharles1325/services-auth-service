import { OtpCode, OtpType, Prisma } from "#Prisma";

export default interface IOtpCodeRepository {
  findOTP(
    credentialId: string,
    code: string,
    type: OtpType,
  ): Promise<OtpCode | null>;
  markOTPAsUsed(id: string): Promise<OtpCode>;
  create(data: Prisma.OtpCodeCreateInput): Promise<OtpCode>;
  update(id: string, data: Prisma.OtpCodeUpdateInput): Promise<OtpCode>;
  delete(id: string): Promise<void>;
}
