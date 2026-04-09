import { create } from "zustand";

type User = {
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
};

type UserStore = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      loading: false,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
    }),

  setLoading: (loading) => set({ loading }),
}));