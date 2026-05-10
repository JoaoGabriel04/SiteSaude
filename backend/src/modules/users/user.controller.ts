import { NextFunction, Request, Response } from "express";
import UserRepository from "../../repositories/UserRepository.js";
import { UserService } from "../../services/UserService.js";
import { Role, Sexo } from "../../../generated/prisma/index.js";

const userService = new UserService(new UserRepository());

export class UserController {

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAll();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getProfissionais(req: Request, res: Response, next: NextFunction) {
    const { busca, role, page } = req.query as {
      busca?: string;
      role?: string;
      page?: string;
    };

    try {
      const profissionais = await userService.getProfissionais({
        busca,
        role,
        page: page ? parseInt(page) : 1,
      });
      return res.json(profissionais);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {

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
      next(error);
    }

  }

  async getPacient(req: Request, res: Response, next: NextFunction) {
    const { busca, page, sexo } = req.query as { busca?: string; page?: string; sexo?: Sexo };

    try {
      const pacientes = await userService.getPacient(busca, page ? parseInt(page) : 1, sexo);
      return res.json(pacientes);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { nome, email, password, avatar, especialidade } = req.body;

    try {
      const result = await userService.updateProfile(req.user.id, {
        nome,
        email,
        password,
        avatar,
        especialidade
      });
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}