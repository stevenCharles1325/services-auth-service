import CredentialRepository from "#Repositories/credential.repository";
import OTPCodeRepository from "#Repositories/otp-code.repository";
import RefreshTokenRepository from "#Repositories/refresh-token.repository";
import { ENV } from "src/config/env";

export default class AuthService {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly otpCodeRepository: OTPCodeRepository,
    private readonly env: ENV
  ) {}

  /**
   * @todo
   * - Continue authentication
   * - Global error handling
   * - Database connectionit
   */
}