import { ResetPasswordDTO, SignInDTO, SignUpDTO } from "#Core/schemas/auth.schema";

export interface IAuthenticatedUser {
  id: string;
  email: string;
}

export interface IAuthService {
  login(data: SignInDTO): Promise<AuthResponse>;
  register(data: SignUpDTO): Promise<void>;
  logout(refreshToken: string): Promise<void>;
  verifyEmail(credentialId: string, code: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(
    credentialId: string,
    code: string,
    data: ResetPasswordDTO,
  ): Promise<void | Error>;
  refreshToken(oldRefreshToken: string): Promise<AuthResponse>;
}

export type AuthResponse = {
  accessToken: string;
  accessTokenExpiry: number;
  refreshToken: string;
  refreshTokenExpiry: number;
}