import type CredentialRepository from "#Repositories/credential.repository";
import type OTPCodeRepository from "#Repositories/otp-code.repository";
import type RefreshTokenRepository from "#Repositories/refresh-token.repository";
import { ResetPasswordDTO, SignInDTO, SignUpDTO } from "#Schemas/auth.schema";
import type HashManager from "src/config/managers/hash.manager";
import TokenManager from "src/config/managers/token.manager";
import crypto from "crypto";
import { OTP_CODE_EXPIRATION_MINUTES } from "src/config/constants";
import { ENV } from "src/config/env";
import { BadRequestError, NotFoundError } from "#Errors/http.error";

export default class AuthService {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly otpCodeRepository: OTPCodeRepository,
    private readonly hashManager: HashManager,
    private readonly tokenManager: TokenManager,
    private readonly env: ENV,
  ) {}

  public async login(
    signIn: SignInDTO,
  ): Promise<{ accessToken: string; refreshToken: string } | Error> {
    const { email, password } = signIn;

    const credential =
      await this.credentialRepository.findCredentialByEmail(email);
    if (!credential)
      throw new NotFoundError({ message: "Credential not found" });

    const isPasswordMatch = await this.hashManager.compare(
      password,
      credential.password,
    );
    if (!isPasswordMatch)
      throw new BadRequestError({ message: "Incorrect password" });

    const refreshRecord = await this.refreshTokenRepository.create({
      credential: {
        connect: { id: credential.id },
      },
      token: "pending",
      accessToken: "pending",
      expiresAt: this.tokenManager.getExpiry("access"),
    });

    const accessTokenPayload = {
      sub: credential.userId,
      email: credential.email,
      isVerified: credential.isVerified,
      jti: refreshRecord.id,
    };

    const refreshTokenPayload = {
      sub: credential.userId,
      jti: refreshRecord.id,
    };

    const accessToken =
      await this.tokenManager.signAccessToken(accessTokenPayload);
    const refreshToken =
      await this.tokenManager.signRefreshToken(refreshTokenPayload);

    const hashedAccessToken = await this.hashManager.sha256(accessToken);
    const hashedRefreshToken = await this.hashManager.sha256(refreshToken);

    await this.refreshTokenRepository.update(refreshRecord.id, {
      token: hashedRefreshToken,
      accessToken: hashedAccessToken,
    });

    return { accessToken, refreshToken };
  }

  public async register(signUp: SignUpDTO): Promise<void | Error> {
    const { email, password } = signUp;

    const existing =
      await this.credentialRepository.findCredentialByEmail(email);
    if (existing)
      throw new BadRequestError({ message: "Email already in use" });

    const userId = crypto.randomUUID();

    const credential = await this.credentialRepository.create({
      userId,
      email,
      password: await this.hashManager.hash(password),
    });

    // TODO - invoke create user event to create user in user-service

    const refreshRecord = await this.refreshTokenRepository.create({
      credential: {
        connect: { id: credential.id },
      },
      token: "pending",
      accessToken: "pending",
      expiresAt: this.tokenManager.getExpiry("refresh"),
    });

    const accessTokenPayload = {
      sub: credential.userId,
      email: credential.email,
      isVerified: credential.isVerified,
      jti: refreshRecord.id,
    };

    const refreshTokenPayload = {
      sub: credential.userId,
      jti: refreshRecord.id,
    };

    const accessToken =
      await this.tokenManager.signAccessToken(accessTokenPayload);
    const refreshToken =
      await this.tokenManager.signRefreshToken(refreshTokenPayload);

    const hashedAccessToken = await this.hashManager.sha256(accessToken);
    const hashedRefreshToken = await this.hashManager.sha256(refreshToken);

    await this.refreshTokenRepository.update(refreshRecord.id, {
      token: hashedRefreshToken,
      accessToken: hashedAccessToken,
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
  }

  public async verifyEmail(
    credentialId: string,
    code: string,
  ): Promise<void | Error> {
    const otpRecord = await this.otpCodeRepository.findOTP(
      credentialId,
      code,
      "EMAIL_VERIFICATION",
    );

    if (!otpRecord) throw new BadRequestError({ message: "Invalid OTP code" });
    if (otpRecord.expiresAt < new Date())
      throw new BadRequestError({ message: "OTP code has expired" });

    await this.credentialRepository.markEmailAsVerified(credentialId);
    await this.otpCodeRepository.markOTPAsUsed(otpRecord.id);
  }

  public async forgotPassword(email: string): Promise<void | Error> {
    const credential =
      await this.credentialRepository.findCredentialByEmail(email);
    if (!credential)
      throw new NotFoundError({ message: "Credential not found" });

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
  }

  public async resetPassword(
    credentialId: string,
    code: string,
    data: ResetPasswordDTO,
  ): Promise<void | Error> {
    const otpRecord = await this.otpCodeRepository.findOTP(
      credentialId,
      code,
      "PASSWORD_RESET",
    );

    if (!otpRecord) throw new BadRequestError({ message: "Invalid OTP code" });
    if (otpRecord.expiresAt < new Date())
      throw new BadRequestError({ message: "OTP code has expired" });

    const hashedPassword = await this.hashManager.hash(data.password);
    await this.credentialRepository.update(credentialId, {
      password: hashedPassword,
    });
    await this.otpCodeRepository.markOTPAsUsed(otpRecord.id);
  }

  public async logout(refreshToken: string): Promise<void | Error> {
    const hashedRefreshToken = await this.hashManager.sha256(refreshToken);
    const record =
      await this.refreshTokenRepository.findByRefreshToken(hashedRefreshToken);
    if (!record)
      throw new NotFoundError({ message: "Refresh token not found" });

    await this.refreshTokenRepository.deleteMany([record.id]);
  }

  public async refreshToken(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string } | Error> {
    const hashedOldRefreshToken =
      await this.hashManager.sha256(oldRefreshToken);
    const record = await this.refreshTokenRepository.findByRefreshToken(
      hashedOldRefreshToken,
    );
    if (!record)
      throw new NotFoundError({ message: "Refresh token not found" });

    const credential = await this.credentialRepository.findCredentialById(
      record.credentialId,
    );
    if (!credential)
      throw new NotFoundError({ message: "Credential not found" });

    const accessTokenPayload = {
      sub: credential.userId,
      email: credential.email,
      isVerified: credential.isVerified,
      jti: record.id,
    };

    const refreshTokenPayload = {
      sub: credential.userId,
      jti: record.id,
    };

    const newAccessToken =
      await this.tokenManager.signAccessToken(accessTokenPayload);
    const newRefreshToken =
      await this.tokenManager.signRefreshToken(refreshTokenPayload);

    const hashedAccessToken = await this.hashManager.sha256(newAccessToken);
    const hashedRefreshToken = await this.hashManager.sha256(newRefreshToken);

    await this.refreshTokenRepository.update(record.id, {
      token: hashedRefreshToken,
      accessToken: hashedAccessToken,
      expiresAt: this.tokenManager.getExpiry("refresh"),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
