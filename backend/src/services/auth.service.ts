import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserRepository from "../repositories/user.repository.js";
import { Role } from "../../generated/prisma/index.js";
import type { User, Doctor, Attend } from "../../generated/prisma/index.js";
import { AppError } from "../errors/AppError.js";

type UserWithMedico = Awaited<ReturnType<UserRepository["createDoctor"]>>;
type UserWithAtendente = Awaited<ReturnType<UserRepository["createAttend"]>>;
type UserWithRelations = Awaited<ReturnType<UserRepository["findByEmail"]>>;
type UserWithoutPassword = Omit<NonNullable<UserWithRelations>, "password">;

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export const generateAccessToken = (payload: object): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT secret not found", 500);
  }
  return jwt.sign(payload, secret, { expiresIn: "15m" });
}
export const generateRefreshToken = (payload: object): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new AppError("JWT refresh secret not found", 500);
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
  }): Promise<{ user: UserWithMedico | UserWithAtendente }> {

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

  async loginCredentials(email: string, password: string): Promise<{ user: UserWithoutPassword; token: TokenPair }> {
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

  async refreshToken(oldRefreshToken: string): Promise<{ token: TokenPair }> {
    try {

      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!jwtRefreshSecret) {
        throw new AppError("JWT refresh secret not found", 500);
      }

      const decoded = jwt.verify(oldRefreshToken, jwtRefreshSecret) as jwt.JwtPayload;

      const userId = decoded.sub;
      const userRole = decoded.role as Role;

      if (!userId || !userRole) {
        throw new AppError("Invalid token payload", 400);
      }

      const user = await this.userRepo.findById(String(userId));
      if (!user) {
        throw new AppError("Invalid refresh token", 400);
      }

      if (user.role !== userRole) {
        throw new AppError("Invalid refresh token", 400);
      }

      const accessToken = generateAccessToken({ sub: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ sub: user.id, role: user.role });

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
