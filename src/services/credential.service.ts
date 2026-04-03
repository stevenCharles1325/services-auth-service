import { Credential } from "#Prisma";
import type CredentialRepository from "#Repositories/credential.repository";
import type OTPCodeRepository from "#Repositories/otp-code.repository";
import type RefreshTokenRepository from "#Repositories/refresh-token.repository";
import { SignInDTO, SignUpDTO } from "#Schemas/auth.schema";
import type HashManager from "src/config/managers/hash.manager";
import TokenManager from "src/config/managers/token.manager";

export default class AuthService {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly otpCodeRepository: OTPCodeRepository,
    private readonly hashManager: HashManager,
    private readonly tokenManager: TokenManager,
  ) {}

  public async login(signIn: SignInDTO): Promise<{ accessToken: string, refreshToken: string } | Error> {
    const { email, password } = signIn;

    const credential = await this.credentialRepository.findCredentialByEmail(email);
    if (!credential) throw new Error("User not found");

    const isPasswordMatch = await this.hashManager.compare(password, credential.password);
    if (!isPasswordMatch) throw new Error("Incorrect password");
    
    const refreshRecord = await this.refreshTokenRepository.create({
      credential: {
        connect: { id: credential.id }
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

    const accessToken = await this.tokenManager.signAccessToken(accessTokenPayload);
    const refreshToken = await this.tokenManager.signRefreshToken(refreshTokenPayload);

    const hashedAccessToken = await this.hashManager.sha256(accessToken);
    const hashedRefreshToken = await this.hashManager.sha256(refreshToken);

    await this.refreshTokenRepository.update(refreshRecord.id, {
      token: hashedRefreshToken,
      accessToken: hashedAccessToken,
    });

    return { accessToken, refreshToken };
  }

  public async register(signUp: SignUpDTO) {
    const { email, password } = signUp;

    const existing = await this.credentialRepository.findCredentialByEmail(email);
    if (existing) throw new Error("User already exists");

    const userId = crypto.randomUUID();

    const credential = await this.credentialRepository.create({
      userId,
      email,
      password: await this.hashManager.hash(password),
    });

    // TODO - invoke create user event to create user in user-service

    const refreshRecord = await this.refreshTokenRepository.create({
      credential: {
        connect: { id: credential.id }
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

    const accessToken = await this.tokenManager.signAccessToken(accessTokenPayload);
    const refreshToken = await this.tokenManager.signRefreshToken(refreshTokenPayload);

    const hashedAccessToken = await this.hashManager.sha256(accessToken);
    const hashedRefreshToken = await this.hashManager.sha256(refreshToken);

    await this.refreshTokenRepository.update(refreshRecord.id, {
      token: hashedRefreshToken,
      accessToken: hashedAccessToken,
    });

    return { accessToken, refreshToken };
  }

  /**
   * @todo
   * - Continue the register flow
   * - OTP & Email verification
   * - Logout
   * - Refresh token
   * - Forgot password & Reset password
   */
}