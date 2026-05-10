'use client'
import { useState, useEffect, useCallback } from "react"
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore"

type SolicitacaoDia = {
  id: string
  data: string
}

type Solicitacao = {
  id: string
  docId: string
  data: string
  dataFim?: string
  motivo: string | null
  status: "PENDENTE" | "APROVADO" | "NEGADO"
  observacaoAdmin: string | null
  dataSolicitacao: string
  dataResposta: string | null
  aprovadoPor: { nome: string } | null
  medico?: {
    user: {
      id: string
      nome: string
      email: string
    }
    especialidade: string
  }
  dias?: SolicitacaoDia[]
  tipo: "unico" | "periodo"
  totalDias?: number
}

export function useSolicitacoesPendentes() {
  const { isAuthenticated, loading } = useUserStore()
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (loading || !isAuthenticated) return

    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await api.get("/api/medico/solicitacoes")
        setSolicitacoes(res.data)
      } catch (err: any) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, loading])

  const mutate = useCallback(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await api.get("/api/medico/solicitacoes")
        setSolicitacoes(res.data)
      } catch (err: any) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return { solicitacoes, isLoading, error, mutate }
}

export function useMinhasSolicitacoes(docId: string) {
  const { isAuthenticated, loading } = useUserStore()
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (loading || !isAuthenticated || !docId) return

    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await api.get(`/api/medico/minhas-solicitacoes/${docId}`)
        setSolicitacoes(res.data)
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
        const res = await api.get(`/api/medico/minhas-solicitacoes/${docId}`)
        setSolicitacoes(res.data)
      } catch (err: any) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [docId])

  return { solicitacoes, isLoading, error, mutate }
}

export function useExcecoesAprovadas(docId: string) {
  const { isAuthenticated, loading } = useUserStore()
  const [excecoes, setExcecoes] = useState<Solicitacao[] | null>(null)
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