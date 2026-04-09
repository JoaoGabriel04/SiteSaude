interface User {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  fone: string;
  email: string;
  avatar: string | null;
  role: "ADMIN" | "MEDICO" | "ATENDENTE" | null;
  crm?: string;
  especialidade?: string;
  setor?: string;
  medico?: string[] | null;
  atendente?: string[] | null;
}

enum Role {
  ADMIN,
  MEDICO,
  ATENDENTE
}