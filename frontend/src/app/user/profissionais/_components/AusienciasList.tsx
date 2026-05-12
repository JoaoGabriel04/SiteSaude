'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Calendar, Plane, Briefcase, Heart } from "lucide-react"
import api from "@/services/api"
import { toast } from "@/toast/toastManager"

type Excecao = {
  id: string
  docId: string
  data: string
  motivo: string | null
  tipo?: "unico" | "periodo"
  solicitacaoId?: string
}

type AusienciasListProps = {
  excecoes: Excecao[] | null
  isLoading: boolean
  podeEditar: boolean
  onDeleteSuccess: (id: string) => void
}

const getMotivoIcon = (motivo: string | null) => {
  if (motivo?.toLowerCase().includes('ferias')) return Briefcase
  if (motivo?.toLowerCase().includes('viagem')) return Plane
  if (motivo?.toLowerCase().includes('doenç') || motivo?.toLowerCase().includes('doenca')) return Heart
  return Calendar
}

const getMotivoLabel = (motivo: string | null) => {
  if (motivo?.toLowerCase().includes('ferias')) return 'Férias'
  if (motivo?.toLowerCase().includes('viagem')) return 'Viagem'
  if (motivo?.toLowerCase().includes('doenç') || motivo?.toLowerCase().includes('doenca')) return 'Doença'
  return 'Ausência'
}

export default function AusienciasList({ excecoes, isLoading, podeEditar, onDeleteSuccess }: AusienciasListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (deletingId) return

    setDeletingId(id)
    try {
      await api.delete(`/api/medico/excecao/${id}`)
      toast.success("Ausência removida com sucesso")
      onDeleteSuccess(id)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      console.error("[handleDelete] Erro:", error)
      toast.error(err.response?.data?.message || "Erro ao remover ausência")
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return <span className="text-sm text-zinc-400">Carregando...</span>
  }

  if (!excecoes || excecoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-zinc-400">
        <Calendar className="w-8 h-8 mb-2" />
        <span className="text-sm">Nenhuma ausência cadastrada</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
      {excecoes.map((excecao) => {
        const Icon = getMotivoIcon(excecao.motivo)
        const label = getMotivoLabel(excecao.motivo)
        const isDeleting = deletingId === excecao.id

        return (
          <Card key={excecao.id} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-700">
                {new Date(excecao.data).toLocaleDateString('pt-BR')}
              </span>
              <span className="text-xs text-zinc-400">({label})</span>
            </div>
            {podeEditar && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 disabled:opacity-50"
                onClick={() => handleDelete(excecao.id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </Button>
            )}
          </Card>
        )
      })}
    </div>
  )
}