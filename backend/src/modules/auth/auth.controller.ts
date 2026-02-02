import { Request, Response } from "express";
import { AuthService } from "../../services/AuthService.js";
import UserRepository from "../../repositories/UserRepository.js";

const authService = new AuthService(new UserRepository());

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {

  async registerUser(req: Request, res: Response) {
    try {
      const result = await authService.registerUser(req.body);

      res.cookie("refresh_token", result.token.refreshToken, cookieConfig);

      return res.status(201).json({
        accessToken: result.token.accessToken,
        user: result.user,
      });

    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async loginCredentials(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.loginCredentials(email, password);

      res.cookie("refresh_token", result.token.refreshToken, cookieConfig);

      return res.json({
        accessToken: result.token.accessToken,
        user: result.user,
      });

    } catch (error) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }
  }

  async refreshToken(req: Request, res: Response) {
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
      return res.status(401).json({ error: "Refresh token inválido" });
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("refresh_token", cookieConfig);
    return res.status(200).json({ message: "Logout realizado com sucesso" });
  }
}