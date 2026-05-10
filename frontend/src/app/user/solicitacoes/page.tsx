'use client'

import { useState } from "react"
import Title1 from "@/components/Title1"
import Subtitle from "@/components/Subtitle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Modal from "@/components/Modal"
import LoadingScreen from "@/components/LoadingScreen"
import { useUserStore } from "@/stores/userStore"
import { useSolicitacoesPendentes } from "@/hooks/useSolicitacoes"
import api from "@/services/api"
import { toast } from "@/toast/toastManager"
import { FileText, Check, X, Calendar, List } from "lucide-react"

const statusColors = {
  PENDENTE: "bg-yellow-100 text-yellow-700",
  APROVADO: "bg-green-100 text-green-700",
  NEGADO: "bg-red-100 text-red-700",
}

const tipoLabels: Record<string, string> = {
  "Férias": "Férias",
  "Viagem": "Viagem",
  "Doença": "Doença",
  "Outro": "Outro",
}

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
  status: string
  dataSolicitacao: string
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

export default function SolicitacoesAusenciasPage() {
  const { user } = useUserStore()
  const { solicitacoes, isLoading, mutate } = useSolicitacoesPendentes()
  
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [observacao, setObservacao] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) return <LoadingScreen />

  if (user.role !== "ADMIN" && user.role !== "ATENDENTE") {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-red-500">Acesso não autorizado</span>
      </div>
    )
  }

  function handleVer(solicitacao: Solicitacao) {
    setSelectedSolicitacao(solicitacao)
    setObservacao("")
    setShowModal(true)
  }

  async function handleAprovar() {
    if (!selectedSolicitacao) return
    
    setIsSubmitting(true)
    try {
      await api.put(`/api/medico/solicitacoes/${selectedSolicitacao.id}/aprovar`)
      toast.success("Solicitação aprovada!")
      setShowModal(false)
      mutate()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao aprovar")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleNegar() {
    if (!selectedSolicitacao) return
    
    if (!observacao.trim()) {
      toast.error("Informe o motivo da negação")
      return
    }
    
    setIsSubmitting(true)
    try {
      await api.put(`/api/medico/solicitacoes/${selectedSolicitacao.id}/negar`, {
        observacao: observacao
      })
      toast.success("Solicitação negada!")
      setShowModal(false)
      mutate()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao negar")
    } finally {
      setIsSubmitting(false)
    }
  }

  function formatarPeriodo(solicitacao: Solicitacao): string {
    if (solicitacao.tipo === "periodo" && solicitacao.dataFim) {
      const inicio = new Date(solicitacao.data).toLocaleDateString("pt-BR")
      const fim = new Date(solicitacao.dataFim).toLocaleDateString("pt-BR")
      return `${inicio} a ${fim}`
    }
    return new Date(solicitacao.data).toLocaleDateString("pt-BR")
  }

  function getInfoAdicional(solicitacao: Solicitacao): string {
    if (solicitacao.tipo === "periodo" && solicitacao.totalDias) {
      return `${solicitacao.totalDias} dia(s)`
    }
    return ""
  }

  if (isLoading) return <LoadingScreen />

  return (
    <div className="w-full">
      <div className="mb-6">
        <Title1>Solicitações de Ausência</Title1>
        <Subtitle>Gerencie as solicitações de ausência dos médicos</Subtitle>
      </div>

      <Card className="p-4">
        {solicitacoes && solicitacoes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-sm font-medium text-zinc-500">Médico</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-zinc-500">Tipo</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-zinc-500">Período</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-zinc-500">Dias</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-zinc-500">Status</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-zinc-500">Ação</th>
                </tr>
              </thead>
              <tbody>
                {solicitacoes.map((sol) => (
                  <tr key={sol.id} className="border-b hover:bg-zinc-50">
                    <td className="py-3 px-2">
                      <div>
                        <span className="text-sm font-medium text-zinc-800">{sol.medico?.user.nome}</span>
                        <span className="text-xs text-zinc-500 block">{sol.medico?.especialidade}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        {sol.tipo === "periodo" && <List className="w-3 h-3 text-blue-500" />}
                        <span className="text-sm text-zinc-700">{sol.motivo || "Ausência"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm text-zinc-700">
                        {formatarPeriodo(sol)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm text-zinc-500">
                        {getInfoAdicional(sol)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={statusColors[sol.status as keyof typeof statusColors]}>
                        {sol.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => handleVer(sol)}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <Calendar className="w-12 h-12 mb-2" />
            <span className="text-sm">Nenhuma solicitação pendente</span>
          </div>
        )}
      </Card>

      <Modal
        size="lg"
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detalhes da Solicitação"
      >
        {selectedSolicitacao && (
          <div className="flex flex-col gap-4">
            <div className="bg-zinc-50 p-3 rounded-md">
              <p className="text-sm font-medium text-zinc-700">Médico</p>
              <p className="text-sm text-zinc-600">{selectedSolicitacao.medico?.user.nome}</p>
              <p className="text-xs text-zinc-400">{selectedSolicitacao.medico?.user.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-50 p-3 rounded-md">
                <p className="text-xs text-zinc-500">Tipo</p>
                <p className="text-sm text-zinc-700">{selectedSolicitacao.motivo || "Ausência"}</p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-md">
                <p className="text-xs text-zinc-500">Período</p>
                <p className="text-sm text-zinc-700">
                  {formatarPeriodo(selectedSolicitacao)}
                </p>
              </div>
            </div>

            {selectedSolicitacao.dias && selectedSolicitacao.dias.length > 0 && (
              <div className="bg-zinc-50 p-3 rounded-md">
                <p className="text-xs text-zinc-500 mb-2">Datas solicitadas</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSolicitacao.dias.map((dia) => (
                    <Badge key={dia.id} variant="outline" className="text-xs">
                      {new Date(dia.data).toLocaleDateString("pt-BR")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedSolicitacao.totalDias && selectedSolicitacao.totalDias > 1 && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <p className="text-sm text-blue-700">
                  <strong>Total:</strong> {selectedSolicitacao.totalDias} dia(s)
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Ao aprovar, todos os dias acima serão bloqueados para agendamento.
                </p>
              </div>
            )}

            <div className="bg-zinc-50 p-3 rounded-md">
              <p className="text-xs text-zinc-500">Data da solicitação</p>
              <p className="text-sm text-zinc-700">
                {new Date(selectedSolicitacao.dataSolicitacao).toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">Observação (para negar)</label>
              <textarea
                className="w-full p-2 border rounded-md text-sm resize-none"
                rows={2}
                placeholder="Motivo da negação..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleNegar}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                <X className="w-3 h-3 mr-1" />
                Negar
              </Button>
              <Button
                onClick={handleAprovar}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                <Check className="w-3 h-3 mr-1" />
                Aprovar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}