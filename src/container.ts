import AuthController from "#Controllers/auth.controller";
import DatabaseProvider from "#Providers/database.provider";
import CredentialRepository from "#Repositories/credential.repository";
import OTPCodeRepository from "#Repositories/otp-code.repository";
import RefreshTokenRepository from "#Repositories/refresh-token.repository";
import AuthService from "#Services/auth.service";
import { envManager } from "./config/env";
import HashManager from "./config/managers/hash.manager";
import TokenManager from "./config/managers/token.manager";

export default class Container {
  private static instance: Container;

  public authController!: AuthController;

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
