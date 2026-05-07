'use client'
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore";
import useSWR from "swr";

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useBuscarMedicos() {
  const { isAuthenticated } = useUserStore();

  const url = isAuthenticated
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/user`
    : null;

  const { data, error, isLoading } = useSWR(url, fetcher);

  // filtra só os médicos
  const medicos = data?.filter((u: any) => u.role === "MEDICO") ?? [];

  return { medicos, error, isLoading };
}