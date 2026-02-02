import { create } from "zustand";

type UserStore = {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  fone: string;
  email: string;
  avatar: string | null;
  role: "ADMIN" | "MEDICO" | "ATENDENTE" | null;
  medico?: string[] | null;
  atendente?: string[] | null;
  loading: boolean;
  error: string | null;

  setUser: (user: Partial<UserStore>) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  id: "",
  nome: "",
  cpf: "",
  nascimento: "",
  fone: "",
  email: "",
  avatar: null,
  role: null,
  medico: null,
  atendente: null,
  loading: false,
  error: null,

  setUser: (user) => set(user),
  clearUser: () =>
    set({
      id: "",
      nome: "",
      email: "",
      role: "ATENDENTE",
      loading: false,
      error: null,
    }),
}));
