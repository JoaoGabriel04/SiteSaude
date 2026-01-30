import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserRepository from "../repositories/UserRepository.js";
import { lgUserJoi, regUserJoi } from "../modules/validate.js";
import { Role } from "../../generated/prisma/index.js";

export class AuthService {
  constructor(private userRepo: UserRepository) {}

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

    const userFinded = await this.userRepo.findByEmail(data.email);

    if (userFinded) {
      throw new Error("Email already registered");
    }

    let passwordHash = await bcrypt.hash(data.password, 10);

    try {
      let user;

      const nascimentoDate = new Date(data.nascimento);

      if (data.role === Role.MEDICO) {
        user = await this.userRepo.createDoctor({
          nome: data.nome,
          cpf: data.cpf,
          nascimento: nascimentoDate,
          fone: data.fone,
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
          fone: data.fone,
          email: data.email,
          password: passwordHash,
          role: data.role,
          setor: data.setor?.toUpperCase(),
        });
      }

      if (!user) {
        throw new Error("Invalid Role");
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" },
      );

      return { user, token };
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

    const user = await this.userRepo.findByEmail(email);

    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "15m",
      },
    );

    return { user, token };
  }
}
