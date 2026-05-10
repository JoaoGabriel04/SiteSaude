'use client'
import { useState, useCallback } from "react"
import api from "@/services/api"
import { useUserStore } from "@/stores/userStore"

type PerfilData = {
  id: string
  nome: string
  email: string
  cpf: string
  nascimento: string
  fone: string
  avatar: string | null
  role: string
  medico?: {
    crm: string
    especialidade: string
  }
  atendente?: {
    setor: string
  }
}

export function usePerfil() {
  const { user, setUser } = useUserStore()
  const [perfil, setPerfil] = useState<PerfilData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const fetchPerfil = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const res = await api.get("/api/user/me")
      setPerfil(res.data)
      setUser(res.data)
    } catch (err: any) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [user, setUser])

  const updatePerfil = async (data: {
    nome?: string
    email?: string
    password?: string
    avatar?: string
    especialidade?: string
  }) => {
    setIsLoading(true)
    try {
      const res = await api.put("/api/user/profile", data)
      setPerfil(res.data)
      setUser(res.data)
      return { success: true }
    } catch (err: any) {
      setError(err)
      return { success: false, error: err?.response?.data?.message || "Erro ao atualizar perfil" }
    } finally {
      setIsLoading(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    const formData = new FormData()
    formData.append("avatar", file)
    
    try {
      const res = await api.post("/api/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      return res.data.url
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Erro ao fazer upload")
    }
  }

  return {
    perfil,
    isLoading,
    error,
    fetchPerfil,
    updatePerfil,
    uploadAvatar
  }
}