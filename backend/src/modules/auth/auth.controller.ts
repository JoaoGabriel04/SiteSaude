import { CookieOptions, NextFunction, Request, Response } from "express";
import { AuthService } from "../../services/auth.service.js";
import UserRepository from "../../repositories/user.repository.js";

const authService = new AuthService(new UserRepository());

const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {

  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.registerUser(req.body);

      return res.status(201).json({ message: "Profissional Registrado com Sucesso!", user: result.user });

    } catch (error) {
      next(error);
    }
  }

  async loginCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.loginCredentials(email, password);

      res.cookie("refresh_token", result.token.refreshToken, cookieConfig);

      return res.json({
        accessToken: result.token.accessToken,
        user: result.user,
      });

    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token ausente" });
      }

      const result = await authService.refreshToken(refreshToken);

      res.cookie("refresh_token", result.token.refreshToken, cookieConfig);

      return res.json({
        accessToken: result.token.accessToken,
      });

    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("refresh_token", cookieConfig);
    return res.status(200).json({ message: "Logout realizado com sucesso" });
  }
}