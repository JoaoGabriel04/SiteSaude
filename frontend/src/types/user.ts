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