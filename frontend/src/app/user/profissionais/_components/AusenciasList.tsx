'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Calendar, Plane, Briefcase, Heart, List } from "lucide-react"
import api from "@/services/api"
import { toast } from "@/toast/toastManager"

type Excecao = {
  id: string
  docId: string
  data: string
  dataFim?: string
  motivo: string | null
  tipo?: "unico" | "periodo"
  totalDias?: number
}

type AusenciasListProps = {
  excecoes: Excecao[] | null
  isLoading: boolean
  podeEditar: boolean
  onRefresh?: () => void
  onDeleteSuccess?: (id: string) => void
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

export default function AusenciasList({ excecoes, isLoading, podeEditar, onRefresh, onDeleteSuccess }: AusenciasListProps) {
  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/medico/excecao/${id}`)
      toast.success("Ausência removida com sucesso")
      onRefresh?.()
      onDeleteSuccess?.(id)
    } catch (error) {
      toast.error("Erro ao remover ausência")
    }
  }

  function formatarPeriodo(exc: Excecao) {
    if (exc.tipo === "periodo" && exc.dataFim) {
      const inicio = new Date(exc.data).toLocaleDateString("pt-BR")
      const fim = new Date(exc.dataFim).toLocaleDateString("pt-BR")
      return `${inicio} a ${fim}`
    }
    return new Date(exc.data).toLocaleDateString("pt-BR")
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
        
        return (
          <Card key={excecao.id} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              {excecao.tipo === "periodo" && (
                <List className="w-4 h-4 text-blue-500" />
              )}
              <Icon className="w-4 h-4 text-zinc-500" />
              <div className="flex flex-col">
                <span className="text-sm text-zinc-700 flex items-center gap-1">
                  {excecao.motivo || label}
                  {excecao.totalDias && excecao.totalDias > 1 && (
                    <Badge variant="outline" className="text-xs ml-1 h-5">
                      {excecao.totalDias} dias
                    </Badge>
                  )}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatarPeriodo(excecao)}
                </span>
              </div>
            </div>
            {podeEditar && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={() => handleDelete(excecao.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </Card>
        )
      })}
    </div>
  )
}