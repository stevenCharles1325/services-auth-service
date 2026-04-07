import type CredentialRepository from "#Repositories/credential.repository";
import type OTPCodeRepository from "#Repositories/otp-code.repository";
import type RefreshTokenRepository from "#Repositories/refresh-token.repository";
import { ResetPasswordDTO, SignInDTO, SignUpDTO } from "#Schemas/auth.schema";
import type HashManager from "src/config/managers/hash.manager";
import TokenManager from "src/config/managers/token.manager";
import crypto from "crypto";
import { OTP_CODE_EXPIRATION_MINUTES } from "src/config/constants";
import { AppConfig } from "#Env";
import { BadRequestError, ConflictError, NotFoundError } from "#Errors/http.error";
import { logger } from "#Managers/log.manager";

export default class AuthService {
  private readonly logger = logger.child({ context: "AuthService" });

  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly otpCodeRepository: OTPCodeRepository,
    private readonly hashManager: HashManager,
    private readonly tokenManager: TokenManager,
    private readonly env: AppConfig,
  ) {}

  public async login(signIn: SignInDTO): Promise<{
    accessToken: string;
    accessTokenExpiry: number;
    refreshToken: string;
    refreshTokenExpiry: number;
  }> {
    const { email, password } = signIn;

    this.logger.info({ email }, "Login attempt");

    const credential =
      await this.credentialRepository.findCredentialByEmail(email);
    if (!credential) {
      this.logger.error({ email }, "Login failed: Credential not found");
      throw new NotFoundError({ message: "Credential not found" });
    }

    const isPasswordMatch = await this.hashManager.compare(
      password,
      credential.password,
    );
    if (!isPasswordMatch) {
      this.logger.error({ email }, "Login failed: Incorrect password");
      throw new BadRequestError({ message: "Incorrect password" });
    }

    const refreshTokenId = crypto.randomUUID();

    const accessTokenPayload = {
      sub: credential.userId,
      email: credential.email,
      isVerified: credential.isVerified,
      jti: refreshTokenId,
    };

    const refreshTokenPayload = {
      sub: credential.userId,
      jti: refreshTokenId,
    };

    const accessToken =
      await this.tokenManager.signAccessToken(accessTokenPayload);
    const refreshToken =
      await this.tokenManager.signRefreshToken(refreshTokenPayload);

    const hashedAccessToken = await this.hashManager.sha256(accessToken);
    const hashedRefreshToken = await this.hashManager.sha256(refreshToken);

    await this.refreshTokenRepository.create({
      id: refreshTokenId,
      credential: {
        connect: { id: credential.id },
      },
      token: hashedAccessToken,
      accessToken: hashedRefreshToken,
      expiresAt: this.tokenManager.getExpiry("refresh"),
    });

    this.logger.info({ email }, "Login successful");

    return {
      accessToken,
      accessTokenExpiry: this.tokenManager.getExpiry("access").getTime(),
      refreshToken,
      refreshTokenExpiry: this.tokenManager.getExpiry("refresh").getTime(),
    };
  }

  public async register(signUp: SignUpDTO): Promise<void> {
    const { email, password } = signUp;

    this.logger.info({ email }, "Registration attempt");

    const existing =
      await this.credentialRepository.findCredentialByEmail(email);
    if (existing) {
      this.logger.error({ email }, "Registration failed: Email already in use");
      throw new ConflictError({ message: "Email already in use" });
    }

    const userId = crypto.randomUUID();
    const refreshTokenId = crypto.randomUUID();

    const credential = await this.credentialRepository.create({
      userId,
      email,
      password: await this.hashManager.hash(password),
    });

    // TODO - invoke create user event to create user in user-service

    const accessTokenPayload = {
      sub: credential.userId,
      email: credential.email,
      isVerified: credential.isVerified,
      jti: refreshTokenId,
    };

    const refreshTokenPayload = {
      sub: credential.userId,
      jti: refreshTokenId,
    };

    const accessToken =
      await this.tokenManager.signAccessToken(accessTokenPayload);
    const refreshToken =
      await this.tokenManager.signRefreshToken(refreshTokenPayload);

    const hashedAccessToken = await this.hashManager.sha256(accessToken);
    const hashedRefreshToken = await this.hashManager.sha256(refreshToken);

    await this.refreshTokenRepository.create({
      id: refreshTokenId,
      credential: {
        connect: { id: credential.id },
      },
      token: hashedAccessToken,
      accessToken: hashedRefreshToken,
      expiresAt: this.tokenManager.getExpiry("refresh"),
    });

    const code = crypto.randomInt(100000, 1000000).toString();

    const otpExpireMinutes =
      this.env.OTP_CODE_EXPIRATION_MINUTES || OTP_CODE_EXPIRATION_MINUTES;
    const otpCode = await this.otpCodeRepository.create({
      credentialId: credential.id,
      code,
      type: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + otpExpireMinutes * 60 * 1000), // 10 mins
    });

    // TODO - send event to notification service to send OTP email
    this.logger.info(
      { email, otpCodeId: otpCode.id },
      "User registered successfully",
    );
  }

  public async logout(refreshToken: string): Promise<void> {
    this.logger.info("Logout attempt");

    const hashedRefreshToken = await this.hashManager.sha256(refreshToken);
    const record =
      await this.refreshTokenRepository.findByRefreshToken(hashedRefreshToken);
    if (!record) {
      this.logger.error("Logout failed: Refresh token not found");
      throw new NotFoundError({ message: "Refresh token not found" });
    }

    await this.refreshTokenRepository.deleteMany([record.id]);

    this.logger.info("Logout successful");
  }

  public async verifyEmail(credentialId: string, code: string): Promise<void> {
    this.logger.info({ credentialId }, "Email verification attempt");

    const otpRecord = await this.otpCodeRepository.findOTP(
      credentialId,
      code,
      "EMAIL_VERIFICATION",
    );

    if (!otpRecord) {
      this.logger.error(
        { credentialId },
        "Email verification failed: Invalid OTP code",
      );
      throw new BadRequestError({ message: "Invalid OTP code" });
    }
    if (otpRecord.expiresAt < new Date()) {
      this.logger.error(
        { credentialId },
        "Email verification failed: OTP code has expired",
      );
      throw new BadRequestError({ message: "OTP code has expired" });
    }

    await this.credentialRepository.markEmailAsVerified(credentialId);
    await this.otpCodeRepository.markOTPAsUsed(otpRecord.id);

    this.logger.info({ credentialId }, "Email verified successfully");
  }

  public async forgotPassword(email: string): Promise<void> {
    this.logger.info({ email }, "Forgot password attempt");

    const credential =
      await this.credentialRepository.findCredentialByEmail(email);
    if (!credential) {
      this.logger.error(
        { email },
        "Forgot password failed: Credential not found",
      );
      throw new NotFoundError({ message: "Credential not found" });
    }

    const code = crypto.randomInt(100000, 1000000).toString();

    const otpExpireMinutes =
      this.env.OTP_CODE_EXPIRATION_MINUTES || OTP_CODE_EXPIRATION_MINUTES;
    await this.otpCodeRepository.create({
      credentialId: credential.id,
      code,
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + otpExpireMinutes * 60 * 1000), // 10 mins
    });

    // TODO - send event to notification service to send OTP email
    this.logger.info({ email }, "Forgot password OTP generated successfully");
  }

  public async resetPassword(
    credentialId: string,
    code: string,
    data: ResetPasswordDTO,
  ): Promise<void | Error> {
    this.logger.info({ credentialId }, "Reset password attempt");

    const otpRecord = await this.otpCodeRepository.findOTP(
      credentialId,
      code,
      "PASSWORD_RESET",
    );

    if (!otpRecord) {
      this.logger.error(
        { credentialId },
        "Reset password failed: Invalid OTP code",
      );
      throw new BadRequestError({ message: "Invalid OTP code" });
    }
    if (otpRecord.expiresAt < new Date()) {
      this.logger.error(
        { credentialId },
        "Reset password failed: OTP code has expired",
      );
      throw new BadRequestError({ message: "OTP code has expired" });
    }

    const hashedPassword = await this.hashManager.hash(data.password);
    await this.credentialRepository.update(credentialId, {
      password: hashedPassword,
    });
    await this.otpCodeRepository.markOTPAsUsed(otpRecord.id);
    this.logger.info({ credentialId }, "Password reset successfully");
  }

  public async refreshToken(oldRefreshToken: string): Promise<{
    accessToken: string;
    accessTokenExpiry: number;
    refreshToken: string;
    refreshTokenExpiry: number;
  }> {
    this.logger.info("Refresh token attempt");

    const hashedOldRefreshToken =
      await this.hashManager.sha256(oldRefreshToken);
    const record = await this.refreshTokenRepository.findByRefreshToken(
      hashedOldRefreshToken,
    );
    if (!record) {
      this.logger.error("Refresh token not found");
      throw new NotFoundError({ message: "Refresh token not found" });
    }

    const credential = await this.credentialRepository.findCredentialById(
      record.credentialId,
    );
    if (!credential) {
      this.logger.error("Credential not found");
      throw new NotFoundError({ message: "Credential not found" });
    }

    await this.refreshTokenRepository.revokeByToken(hashedOldRefreshToken);

    const refreshTokenId = crypto.randomUUID();
    const accessTokenPayload = {
      sub: credential.userId,
      email: credential.email,
      isVerified: credential.isVerified,
      jti: refreshTokenId,
    };

    const refreshTokenPayload = {
      sub: credential.userId,
      jti: refreshTokenId,
    };

    const newAccessToken =
      await this.tokenManager.signAccessToken(accessTokenPayload);
    const newRefreshToken =
      await this.tokenManager.signRefreshToken(refreshTokenPayload);

    const hashedAccessToken = await this.hashManager.sha256(newAccessToken);
    const hashedRefreshToken = await this.hashManager.sha256(newRefreshToken);

    await this.refreshTokenRepository.create({
      id: refreshTokenId,
      credential: {
        connect: { id: credential.id },
      },
      token: hashedRefreshToken,
      accessToken: hashedAccessToken,
      expiresAt: this.tokenManager.getExpiry("refresh"),
    });

    this.logger.info("Token refreshed successfully");

    return {
      accessToken: newAccessToken,
      accessTokenExpiry: this.tokenManager.getExpiry("access").getTime(),
      refreshToken: newRefreshToken,
      refreshTokenExpiry: this.tokenManager.getExpiry("refresh").getTime(),
    };
  }
}
