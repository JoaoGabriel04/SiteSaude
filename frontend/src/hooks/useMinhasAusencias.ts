'use client'
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore";
import useSWR from "swr";

type ExcecaoMedico = {
  id: string;
  docId: string;
  data: string;
  motivo: string | null;
};

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useMinhasAusencias() {
  const { user, isAuthenticated } = useUserStore();

  const url = isAuthenticated && user?.id
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/medico/excecao/${user.id}`
    : null;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    excecoes: data as ExcecaoMedico[] | null,
    error,
    isLoading,
    mutate
  };
}