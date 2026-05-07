'use client'
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore";
import useSWR from "swr";

type ProfissionaisProps = {
  busca?: string;
  role?: string;
  page?: number;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useViewProfissionais({ busca, role, page }: ProfissionaisProps) {
  const { isAuthenticated } = useUserStore();

  const params = new URLSearchParams();
  if (busca) params.append("busca", busca);
  if (role && role !== "TODOS") params.append("role", role);
  if (page && page > 1) params.append("page", String(page));

  const query = params.toString();
  const url = isAuthenticated
    ? query
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/user/search/profissionais?${query}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/user/search/profissionais`
    : null;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return { data, error, isLoading, mutate };
}