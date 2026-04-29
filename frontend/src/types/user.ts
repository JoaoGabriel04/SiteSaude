export interface Medico {
  userId: string;
  crm: string;
  especialidade: string;
}

export interface Atendente {
  userId: string;
  setor: string;
}

export interface User {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  fone: string;
  email: string;
  avatar: string | null;
  role: "ADMIN" | "MEDICO" | "ATENDENTE" | null;
  medico?: Medico | null;
  atendente?: Atendente | null;
}

export enum Role {
  ADMIN = "ADMIN",
  MEDICO = "MEDICO",
  ATENDENTE = "ATENDENTE"
}