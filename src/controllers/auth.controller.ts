import {
  ForgotPasswordDTO,
  SignInDTO,
  SignUpDTO,
  VerifyEmailDTO,
} from "#Schemas/auth.schema";
import AuthService from "#Services/auth.service";
import { Request, Response } from "express";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "#Constants";

export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response) {
    const { email, password } = req.body as SignInDTO;

    const result = await this.authService.login({ email, password });

    const accessTokenCookie = {
      ...ACCESS_TOKEN_COOKIE,
      maxAge: result.accessTokenExpiry - Date.now(),
    };

    const refreshTokenCookie = {
      ...REFRESH_TOKEN_COOKIE,
      maxAge: result.refreshTokenExpiry - Date.now(),
    };

    res
      .cookie("accessToken", result.accessToken, accessTokenCookie)
      .cookie("refreshToken", result.refreshToken, refreshTokenCookie)
      .json({ success: true, message: "Login successful" });
  }

  async register(req: Request, res: Response) {
    const {
      email,
      password,
      firstName,
      lastName,
      middleName,
      birthdate,
      confirmPassword,
    } = req.body as SignUpDTO;

    await this.authService.register({
      email,
      password,
      firstName,
      lastName,
      middleName,
      birthdate,
      confirmPassword,
    });

    res.json({ success: true, message: "User registered successfully" });
  }

  async verifyEmail(req: Request, res: Response) {
    const { credentialId, code } = req.body as VerifyEmailDTO;

    await this.authService.verifyEmail(credentialId, code);

    res.json({ success: true, message: "Email verified successfully" });
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json({ success: true, message: "Logout successful" });
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body as ForgotPasswordDTO;

    await this.authService.forgotPassword(email);

    res.json({ success: true, message: "OTP code sent to email if it exists" });
  }

  async resetPassword(req: Request, res: Response) {
    const { credentialId, code, newPassword, confirmNewPassword } = req.body;

    await this.authService.resetPassword(credentialId, code, {
      password: newPassword,
      confirmPassword: confirmNewPassword,
    });

    res.json({ success: true, message: "Password reset successful" });
  }

  async refreshToken(req: Request, res: Response) {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
    }

    const { accessToken, accessTokenExpiry, refreshToken, refreshTokenExpiry } =
      await this.authService.refreshToken(oldRefreshToken);

    const accessTokenCookie = {
      ...ACCESS_TOKEN_COOKIE,
      maxAge: accessTokenExpiry - Date.now(),
    };

    const refreshTokenCookie = {
      ...REFRESH_TOKEN_COOKIE,
      maxAge: refreshTokenExpiry - Date.now(),
    };

    res
      .cookie("accessToken", accessToken, accessTokenCookie)
      .cookie("refreshToken", refreshToken, refreshTokenCookie)
      .json({ success: true, message: "Token refreshed successfully" });
  }
}
