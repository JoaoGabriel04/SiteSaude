import api from "@/services/api";
import { useUserStore } from "@/stores/userStore";
import useSWR from "swr";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useDashboardStats() {
  const { isAuthenticated } = useUserStore();

  const url = isAuthenticated
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`
    : null;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, { refreshInterval: 60000 });

  return { data, error, isLoading, mutate };  // ← retorna data direto ✅
}