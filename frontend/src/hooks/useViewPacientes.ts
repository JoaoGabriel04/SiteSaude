'use client'
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore";
import useSWR from "swr";

type PacienteProps = {
  busca?: string;
  current?: number;
  sexo?: string;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useViewPacientes({ busca, current, sexo }: PacienteProps) {

  const { isAuthenticated } = useUserStore();

  const params = new URLSearchParams();
  if (busca) params.append("busca", busca);
  if (current && current > 1) params.append("page", String(current));  // só manda se não for página 1
  if (sexo && sexo !== "TODOS") params.append("sexo", sexo);

  const query = params.toString();
  const url = isAuthenticated
    ? query
      ? `http://localhost:7000/api/user/search/pacientes?${query}`
      : "http://localhost:7000/api/user/search/pacientes"
    : null;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return { data, error, isLoading, mutate };
}