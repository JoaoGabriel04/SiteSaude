'use client'
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore";
import useSWR from "swr";

type SlotsProps = {
  docId?: string;
  data?: string; // formato "YYYY-MM-DD"
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useSlotsDisponiveis({ docId, data }: SlotsProps) {
  const { isAuthenticated } = useUserStore();

  const url = isAuthenticated && docId && data
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/medico/slots/${docId}?data=${data}`
    : null;

  const { data: slotsData, error, isLoading } = useSWR(url, fetcher);

  return {
    slots: slotsData?.slots ?? [],
    ocupados: slotsData?.ocupados ?? [],
    disponibilidade: slotsData?.disponibilidade ?? null,
    error,
    isLoading
  };
}