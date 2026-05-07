import useSWR from "swr";
import api from "@/services/api";

interface Params {
  busca?: string;
  periodo?: "hoje" | "posteriores" | "passados" | "todos";
  status?: string;
  page?: number;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useMeusAgendamentos(params: Params = {}, enabled = true) {
  const query = new URLSearchParams();
  if (params.busca) query.set("busca", params.busca);
  if (params.periodo) query.set("periodo", params.periodo);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));

  const key = enabled ? `${process.env.NEXT_PUBLIC_API_URL}/api/agenda/meus?${query.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher);

  return {
    agendamentos: data?.agendamentos ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    mutate,
  };
}