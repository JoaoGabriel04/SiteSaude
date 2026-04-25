'use client'
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore";
import useSWR from "swr";

type PacienteProps = {
  busca?: string;
  current?: number;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useViewPacientes({ busca, current }: PacienteProps) {
  
  const { isAuthenticated } = useUserStore();

  const url = isAuthenticated
  ? (() => {
      const base = "http://localhost:7000/api/user/search/pacientes";
      if (!busca && !current) return base;

      const params = new URLSearchParams();
      if (busca) params.append("busca", busca);
      if (current) params.append("page", String(current));

      return `${base}?${params.toString()}`;
    })()
  : null;

  const { data, error, isLoading } = useSWR(url, fetcher);
  
  return { data, error, isLoading };
}