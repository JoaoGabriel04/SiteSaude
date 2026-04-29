'use client'
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore";
import useSWR from "swr";

type AgendamentoProps = {
  busca?: string;
  docId?: string;
  status?: string;
  statusUrgencia?: string;
  data?: string;
  page?: number;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useViewAgendamentos({ busca, docId, status, statusUrgencia, data, page }: AgendamentoProps) {
  const { isAuthenticated } = useUserStore();

  const params = new URLSearchParams();
  if (busca) params.append("busca", busca);
  if (docId) params.append("docId", docId);
  if (status && status !== "TODOS") params.append("status", status);
  if (statusUrgencia && statusUrgencia !== "TODOS") params.append("statusUrgencia", statusUrgencia);
  if (data) params.append("data", data);
  if (page && page > 1) params.append("page", String(page));

  const query = params.toString();
  const url = isAuthenticated
    ? query
      ? `http://localhost:7000/api/atendente/agendamentos?${query}`
      : "http://localhost:7000/api/atendente/agendamentos"
    : null;

  const { data: agendaData, error, isLoading, mutate } = useSWR(url, fetcher);

  return { data: agendaData, error, isLoading, mutate };
}