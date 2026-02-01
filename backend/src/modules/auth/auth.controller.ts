import { Request, Response } from "express";
import { AuthService } from "../../services/AuthService.js";
import UserRepository from "../../repositories/UserRepository.js";

const authService = new AuthService(new UserRepository());

export class AuthController {

  async registerUser(req: Request, res: Response) {
    try {
      const { nome, email, password, cpf, nascimento, role, fone, crm, especialidade, setor } = req.body;

      const result = await authService.registerUser({
        nome,
        email,
        password,
        cpf,
        nascimento,
        role,
        fone,
        crm,
        especialidade,
        setor
      });

      res.cookie("refresh_token", result.token.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        accessToken: result.token.accessToken,
        user: result.user,
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async loginCredentials(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.loginCredentials(email, password);

      res.cookie("refresh_token", result.token.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        accessToken: result.token.accessToken,
        user: result.user,
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
  
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        throw new Error("Refresh token not found");
      }

      const result = await authService.refreshToken(refreshToken);

      res.cookie("refresh_token", result.token.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        accessToken: result.token.accessToken,
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
    });
    res.status(200).json({ message: "Logged out successfully" });
  }
}