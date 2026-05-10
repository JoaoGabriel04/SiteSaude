'use client'
import { useState, useEffect, useCallback } from "react"
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore"

type ExcecaoMedico = {
  id: string;
  docId: string;
  data: string;
  motivo: string | null;
  tipo?: "unico" | "periodo";
  totalDias?: number;
};

export function useExcecoesMedico(docId: string) {
  const { isAuthenticated, loading } = useUserStore()
  const [excecoes, setExcecoes] = useState<ExcecaoMedico[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (loading || !isAuthenticated || !docId) return

    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await api.get(`/api/medico/excecao/${docId}`)
        setExcecoes(res.data)
      } catch (err: any) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, loading, docId])

  const mutate = useCallback(() => {
    if (!docId) return
    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await api.get(`/api/medico/excecao/${docId}`)
        setExcecoes(res.data)
      } catch (err: any) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [docId])

  return { excecoes, isLoading, error, mutate }
}