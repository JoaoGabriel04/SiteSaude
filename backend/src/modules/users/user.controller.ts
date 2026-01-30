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

      res.cookie("access_token", result.token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async loginCredentials(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.loginCredentials(email, password);

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}



