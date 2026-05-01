import AuthController from "#App/controllers/auth.controller";
import DatabaseProvider from "#Infrastructure/providers/database.provider";
import CredentialRepository from "#App/repositories/credential.repository";
import OTPCodeRepository from "#App/repositories/otp-code.repository";
import RefreshTokenRepository from "#App/repositories/refresh-token.repository";
import AuthService from "#App/services/auth.service";
import { envManager } from "#Core/config/env/index";
import HashManager from "#Core/config/managers/hash.manager";
import TokenManager from "#Core/config/managers/token.manager";
import { RequestHandler } from "express";
import { RateLimitOptions } from "#Core/types/rate-limit.type";
import { CreateRequestHandler } from "#Core/types/common.type";
import TransactionManager from "#Core/config/managers/transaction.manager";
import { createRateLimitMiddleware } from "#Middleware/rate-limit.middleware";
import { createTurnstileMiddleware } from "#Middleware/turnstile.middleware";

export default class Container {
  private static instance: Container;

  // Controllers
  public authController!: AuthController;

  // Middlewares
  public turnstileMiddleware!: RequestHandler;

  // Create middlewares
  public createRateLimit!: CreateRequestHandler<[options: RateLimitOptions]>;

  private constructor() {}

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public async init() {
    const env = await envManager.load();

    // Initialize managers
    const hashManager = new HashManager(env.HASH_SALT_ROUNDS);
    const tokenManager = new TokenManager(
      env.JWT_SECRET,
      env.JWT_ACCESS_TOKEN_EXPIRATION,
      env.JWT_REFRESH_TOKEN_EXPIRATION,
    );

    // Initialize Database provider
    const databaseProvider = new DatabaseProvider(env.DATABASE_URL);
    await databaseProvider.connect();
    const dbClient = databaseProvider.getClient();

    // const transactionManager = new TransactionManager(dbClient);

    this.turnstileMiddleware = createTurnstileMiddleware();
    this.createRateLimit = createRateLimitMiddleware;

    // Initialize repositories
    const credentialRepository = new CredentialRepository(dbClient);
    const refreshTokenRepository = new RefreshTokenRepository(dbClient);
    const otpCodeRepository = new OTPCodeRepository(dbClient);

    // Initialize services
    const authService = new AuthService(
      credentialRepository,
      refreshTokenRepository,
      otpCodeRepository,
      hashManager,
      tokenManager,
      env,
    );

    this.authController = new AuthController(authService);
  }
}
