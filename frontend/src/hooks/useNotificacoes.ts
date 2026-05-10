'use client'
import { useState, useEffect, useCallback } from "react"
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore"

type Notificacao = {
  id: string;
  userId: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  createdAt: string;
};

export function useNotificacoes() {
  const { isAuthenticated, loading } = useUserStore()
  const [notificacoes, setNotificacoes] = useState<Notificacao[] | null>(null)
  const [naoLidas, setNaoLidas] = useState<number | null>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (loading || !isAuthenticated) return

    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await api.get("/api/notificacoes")
        setNotificacoes(res.data.notificacoes)
        setNaoLidas(res.data.naoLidas)
      } catch (err: any) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, loading])

  const mutate = useCallback(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await api.get("/api/notificacoes")
        setNotificacoes(res.data.notificacoes)
        setNaoLidas(res.data.naoLidas)
      } catch (err: any) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return { notificacoes, naoLidas, isLoading, error, mutate }
}