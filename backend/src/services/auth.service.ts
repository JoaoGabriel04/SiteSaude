import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserRepository from "../repositories/user.repository.js";
import { Role } from "../../generated/prisma/index.js";
import { AppError } from "../errors/AppError.js";
import { getMasterAdminId } from "../utils/getMasterAdmin.js";

export const generateAccessToken = (payload: object) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT secret not found", 500);
  }
  return jwt.sign(payload, secret, { expiresIn: "15m" });
}
export const generateRefreshToken = (payload: object) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT secret not found", 500);
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export class AuthService {
  constructor(private userRepo: UserRepository) { }

  async registerUser(data: {
    nome: string;
    email: string;
    password: string;
    cpf: string;
    nascimento: Date;
    role: Role;
    fone: string;
    avatar?: string;
    crm?: string;
    especialidade?: string;
    setor?: string;
  }) {

    const userFound = await this.userRepo.findByEmail(data.email);
    const cpfFound = await this.userRepo.findByCpfUser(data.cpf);
    const crmFound = data.crm ? await this.userRepo.findByCrm(data.crm) : null;

    if (crmFound) {
      throw new AppError("CRM já registrado", 400);
    }

    if (userFound) {
      throw new AppError("Email já registrado", 400);
    }

    if (cpfFound) {
      throw new AppError("CPF já registrado", 400);
    }

    let passwordHash = await bcrypt.hash(data.password, 10);

    try {
      let user;

      const nascimentoDate = new Date(data.nascimento);
      const foneNormalized = data.fone.replace(/\D/g, "")

      if (data.role === Role.MEDICO) {
        user = await this.userRepo.createDoctor({
          nome: data.nome,
          cpf: data.cpf,
          nascimento: nascimentoDate,
          fone: foneNormalized,
          email: data.email,
          password: passwordHash,
          role: data.role,
          avatar: data.avatar,
          crm: data.crm?.toUpperCase(),
          especialidade: data.especialidade?.toUpperCase(),
        });
      } else if (data.role === Role.ATENDENTE) {
        user = await this.userRepo.createAttend({
          nome: data.nome,
          cpf: data.cpf,
          nascimento: nascimentoDate,
          fone: foneNormalized,
          email: data.email,
          password: passwordHash,
          role: data.role,
          avatar: data.avatar,
          setor: data.setor?.toUpperCase(),
        });
      }

      if (!user) {
        throw new AppError("Role inválida", 400);
      }

      return { user };
    } catch (err) {
      throw err;
    }
  }

  async loginCredentials(email: string, password: string) {
    if (
      email === process.env.MASTER_ADMIN_EMAIL &&
      password === process.env.MASTER_ADMIN_PASSWORD
    ) {
      const adminId = await getMasterAdminId();

      const accessToken = generateAccessToken({
        sub: adminId,
        role: Role.ADMIN,
      });

      const refreshToken = generateRefreshToken({
        sub: adminId,
        role: Role.ADMIN,
      });

      const token = { accessToken, refreshToken };

      return {
        user: {
          id: adminId,
          nome: "Master Admin",
          cpf: null,
          nascimento: null,
          fone: null,
          avatar: null,
          email,
          role: Role.ADMIN,
          crm: null,
          especialidade: null,
          setor: null,
          medico: null,
          atendente: null,
        },
        token,
      };
    }

    let user = await this.userRepo.findByEmail(email);

    if (!user || !user.password) {
      throw new AppError("Email ou senha inválidos", 400);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError("Email ou senha inválidos", 400);
    }

    const accessToken = generateAccessToken({ sub: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ sub: user.id, role: user.role });

    const token = {
      accessToken,
      refreshToken,
    };

    const { password: _, ...userSafe } = user; // Remove a senha do objeto de usuário retornado

    return { user: userSafe, token };
  }

  async refreshToken(oldRefreshToken: string) {
    try {

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new AppError("JWT secret not found", 500);
      }

      const decoded = jwt.verify(oldRefreshToken, jwtSecret) as jwt.JwtPayload;

      const userId = decoded.sub;
      const userRole = decoded.role as Role;

      if (!userId || !userRole) {
        throw new AppError("Invalid token payload", 400);
      }

      const accessToken = generateAccessToken({ sub: userId, role: userRole });
      const refreshToken = generateRefreshToken({ sub: userId, role: userRole });

      return {
        token: {
          accessToken,
          refreshToken,
        },
      };
    } catch (err) {
      throw new AppError("Invalid refresh token", 400);
    }
  }

}
