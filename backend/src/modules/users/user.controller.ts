import { Request, Response } from "express";
import UserRepository from "../../repositories/UserRepository.js";
import { UserService } from "../../services/UserService.js";
import { Role } from "../../../generated/prisma/index.js";

const userService = new UserService(new UserRepository());

export class UserController {

  async getAll(req: Request, res: Response) {
    try {
      const users = await userService.getAll();
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  async getProfile(req: Request, res: Response) {

    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    try {
      if (req.user.role !== Role.ADMIN) {
        const user = await userService.getUserById(req.user.id);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        return res.json({
          id: user.id,
          nome: user.nome,
          email: user.email,
          cpf: user.cpf,
          nascimento: user.nascimento,
          fone: user.fone,
          avatar: user.avatar,
          role: user.role,
          medico: user.medico,
          atendente: user.atendente,
        });
      }
      return res.json({
        id: "master-admin",
        nome: "Master Admin",
        cpf: null,
        nascimento: null,
        fone: null,
        avatar: null,
        email: process.env.MASTER_ADMIN_EMAIL,
        role: Role.ADMIN,
        crm: null,
        especialidade: null,
        setor: null,
        medico: null,
        atendente: null,
      })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }

  }

  async getPacient(req: Request, res: Response) {
    const { busca, page, sexo } = req.query as { busca?: string; page?: string; sexo?: string };
  
    try {
      const pacientes = await userService.getPacient(busca, page ? parseInt(page) : 1, sexo);
      return res.json(pacientes);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar pacientes" });
    }
  }
}