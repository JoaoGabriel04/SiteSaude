'use client'
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore";
import useSWR from "swr";

type SlotsProps = {
  docId?: string;
  data?: string;
  patientId?: string;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useSlotsDisponiveis({ docId, data, patientId }: SlotsProps) {
  const { isAuthenticated } = useUserStore();

  const params = new URLSearchParams();
  if (data) params.set("data", data);
  if (patientId) params.set("patientId", patientId);

  const url = isAuthenticated && docId && data
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/medico/slots/${docId}?${params.toString()}`
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