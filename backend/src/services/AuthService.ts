import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserRepository from "../repositories/UserRepository.js";
import { lgUserJoi, regUserJoi } from "../api/middlewares/validate.js";
import { Role } from "../../generated/prisma/index.js";

export const generateAccessToken = (payload: object) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret not found");
  }
  return jwt.sign(payload, secret, { expiresIn: "15m" });
}
export const generateRefreshToken = (payload: object) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret not found");
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
    crm?: string;
    especialidade?: string;
    setor?: string;
  }) {
    const { error } = regUserJoi(data);
    if (error) {
      throw new Error(error.message);
    }

    const userFound = await this.userRepo.findByEmail(data.email);

    if (userFound) {
      throw new Error("Email already registered");
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
          setor: data.setor?.toUpperCase(),
        });
      }

      if (!user) {
        throw new Error("Invalid Role");
      }

      return { user };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async loginCredentials(email: string, password: string) {
    const { error } = lgUserJoi({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    // 🔥 MASTER ADMIN (antes de consultar o banco)
    if (
      email === process.env.MASTER_ADMIN_EMAIL &&
      password === process.env.MASTER_ADMIN_PASSWORD
    ) {
      const accessToken = generateAccessToken({
        sub: "master-admin",
        role: Role.ADMIN,
      });

      const refreshToken = generateRefreshToken({
        sub: "master-admin",
        role: Role.ADMIN,
      });

      const token = {
        accessToken,
        refreshToken,
      };

      return {
        user: {
          id: "master-admin",
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

    const user = await this.userRepo.findByEmail(email);

    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken({ sub: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ sub: user.id, role: user.role });

    const token = {
      accessToken,
      refreshToken,
    };

    return { user, token };
  }

  async refreshToken(oldRefreshToken: string) {
    try {

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT secret not found");
      }

      const decoded = jwt.verify(oldRefreshToken, jwtSecret) as jwt.JwtPayload;

      const userId = decoded.sub;
      const userRole = decoded.role as Role;

      if (!userId || !userRole) {
        throw new Error("Invalid token payload");
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
      throw new Error("Invalid refresh token");
    }
  }

}
