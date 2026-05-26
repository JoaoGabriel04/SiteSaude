'use client'
import { useState, useEffect, useCallback } from "react"
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore"
import { connectSocket, disconnectSocket, getSocket } from "@/services/socket"

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

  const fetchData = useCallback(async () => {
    if (loading || !isAuthenticated) return
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
  }, [isAuthenticated, loading])

  useEffect(() => {
    if (!isAuthenticated || loading) return

    fetchData()

    connectSocket()
    const socket = getSocket()
    socket.on("nova-notificacao", fetchData)

    return () => {
      socket.off("nova-notificacao", fetchData)
    }
  }, [isAuthenticated, loading, fetchData])

  const mutate = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { notificacoes, naoLidas, isLoading, error, mutate }
}
