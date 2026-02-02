import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      nome: string;
      cpf: string;
      nascimento: string;
      fone: string;
      email: string;
      avatar: string | null;
      role: "ADMIN" | "MEDICO" | "ATENDENTE";
      crm?: string;
      especialidade?: string;
      setor?: string;
      medico?: string[] | null;
      atendente?: string[] | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    nome: string;
    cpf: string;
    nascimento: string;
    fone: string;
    email: string;
    avatar: string | null;
    role: "ADMIN" | "MEDICO" | "ATENDENTE";
    crm?: string;
    especialidade?: string;
    setor?: string;
    medico?: string[] | null;
    atendente?: string[] | null;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    id: string;
    nome: string;
    cpf: string;
    nascimento: string;
    fone: string;
    email: string;
    avatar: string | null;
    role: string;
    crm?: string;
    especialidade?: string;
    setor?: string;
    medico?: string[] | null;
    atendente?: string[] | null;
  }
}