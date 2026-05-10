'use client'

import { useState } from "react"
import Title1 from "@/components/Title1"
import Subtitle from "@/components/Subtitle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InputField } from "@/components/inputField"
import LoadingScreen from "@/components/LoadingScreen"
import { useUserStore } from "@/stores/userStore"
import { useMinhasSolicitacoes, useExcecoesAprovadas } from "@/hooks/useSolicitacoes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/toast/toastManager"
import api from "@/services/api"
import Modal from "@/components/Modal"
import { Plus, Calendar, CheckCircle, XCircle, AlertCircle, List, Trash2 } from "lucide-react"

const statusColors = {
  PENDENTE: "bg-yellow-100 text-yellow-700",
  APROVADO: "bg-green-100 text-green-700",
  NEGADO: "bg-red-100 text-red-700",
}

const statusLabels = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  NEGADO: "Negado",
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
  tipo: "unico" | "periodo"
  totalDias?: number
}

export default function AusenciasPage() {
  const { user } = useUserStore()
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tipo, setTipo] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { solicitacoes, isLoading: loadingSolicitacoes, mutate: mutateSolicitacoes } = useMinhasSolicitacoes(user?.id || "")
  const { excecoes, isLoading: loadingExcecoes } = useExcecoesAprovadas(user?.id || "")

  if (!user) return <LoadingScreen />
  
  if (user.role !== "MEDICO") {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-red-500">Acesso restrito a médicos</span>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!tipo || !dataInicio) {
      toast.error("Preencha o tipo e a data de início")
      return
    }

    setIsSubmitting(true)
    try {
      await api.post("/api/medico/excecao/periodo", {
        docId: user!.id,
        dataInicio,
        dataFim: dataFim || dataInicio,
        motivo: tipo
      })
      toast.success("Solicitação enviada! Aguarde a aprovação.")
      setShowForm(false)
      setTipo("")
      setDataInicio("")
      setDataFim("")
      mutateSolicitacoes()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao enviar solicitação")
    } finally {
      setIsSubmitting(false)
    }
  }

  function formatarPeriodo(sol: Solicitacao): string {
    if (sol.tipo === "periodo" && sol.dataFim) {
      const inicio = new Date(sol.data).toLocaleDateString("pt-BR")
      const fim = new Date(sol.dataFim).toLocaleDateString("pt-BR")
      return `${inicio} a ${fim}`
    }
    return new Date(sol.data).toLocaleDateString("pt-BR")
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/medico/excecao/${id}`)
      toast.success("Ausência removida com sucesso")
      mutateSolicitacoes()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao excluir")
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    setIsSubmitting(true)
    try {
      await api.delete(`/api/medico/excecao/${deleteId}`)
      toast.success("Ausência removida com sucesso")
      setDeleteId(null)
      mutateSolicitacoes()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao excluir")
    } finally {
      setIsSubmitting(false)
    }
  }

  const loading = loadingSolicitacoes || loadingExcecoes

  if (loading) return <LoadingScreen />

  const solicitacoesPendentes = solicitacoes?.filter(s => s.status === "PENDENTE") || []
  const solicitacoesProcessadas = solicitacoes?.filter(s => s.status !== "PENDENTE") || []

  return (
    <div className="w-full">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Title1>Ausências</Title1>
          <Subtitle>Gerencie suas solicitações de ausência</Subtitle>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nova Solicitação
        </Button>
      </div>

      <Modal
        size="md"
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Nova Solicitação de Ausência"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600">Tipo de ausência</label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Férias">Férias</SelectItem>
                <SelectItem value="Viagem">Viagem</SelectItem>
                <SelectItem value="Doença">Doença</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <InputField
              id="data-inicio"
              type="date"
              label="Data início"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
            <InputField
              id="data-fim"
              type="date"
              label="Data fim (opcional)"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <div className="text-xs text-zinc-500">
            {dataFim && dataFim > dataInicio 
              ? `Serão bloqueados ${Math.floor((new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1} dias`
              : dataInicio && !dataFim 
                ? " será bloqueado 1 dia"
                : "Selecione as datas para período de ausência"
            }
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowForm(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="space-y-6">
        {solicitacoesPendentes.length > 0 && (
          <Card className="p-4">
            <h3 className="font-medium text-zinc-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Pendentes ({solicitacoesPendentes.length})
            </h3>
            <div className="space-y-2">
              {solicitacoesPendentes.map((sol) => (
                <div key={sol.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md border border-yellow-100">
                  <div className="flex items-start gap-3">
                    {sol.tipo === "periodo" && (
                      <List className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-700 flex items-center gap-1">
                        {sol.motivo || "Ausência"}
                        {sol.totalDias && sol.totalDias > 1 && (
                          <Badge variant="outline" className="text-xs ml-1">
                            {sol.totalDias} dias
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatarPeriodo(sol)}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[sol.status]}>
                    {statusLabels[sol.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h3 className="font-medium text-zinc-700 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Aprovadas ({solicitacoesProcessadas.filter(s => s.status === "APROVADO").length})
          </h3>
          {solicitacoesProcessadas.filter(s => s.status === "APROVADO").length > 0 ? (
            <div className="space-y-2">
              {solicitacoesProcessadas.filter(s => s.status === "APROVADO").map((sol) => (
                <div key={sol.id} className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-100">
                  <div className="flex items-start gap-3">
                    {sol.tipo === "periodo" && (
                      <List className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-700 flex items-center gap-1">
                        {sol.motivo || "Ausência"}
                        {sol.totalDias && sol.totalDias > 1 && (
                          <Badge variant="outline" className="text-xs ml-1">
                            {sol.totalDias} dias
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatarPeriodo(sol)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[sol.status]}>
                      {statusLabels[sol.status]}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      onClick={() => setDeleteId(sol.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">Nenhuma solicitação aprovada</p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-medium text-zinc-700 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Negadas ({solicitacoesProcessadas.filter(s => s.status === "NEGADO").length})
          </h3>
          {solicitacoesProcessadas.filter(s => s.status === "NEGADO").length > 0 ? (
            <div className="space-y-2">
              {solicitacoesProcessadas.filter(s => s.status === "NEGADO").map((sol) => (
                <div key={sol.id} className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-100">
                  <div className="flex items-start gap-3">
                    {sol.tipo === "periodo" && (
                      <List className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-700 flex items-center gap-1">
                        {sol.motivo || "Ausência"}
                        {sol.totalDias && sol.totalDias > 1 && (
                          <Badge variant="outline" className="text-xs ml-1">
                            {sol.totalDias} dias
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatarPeriodo(sol)}
                      </p>
                      {sol.observacaoAdmin && (
                        <p className="text-xs text-red-600 mt-1">Motivo: {sol.observacaoAdmin}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[sol.status]}>
                      {statusLabels[sol.status]}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      onClick={() => setDeleteId(sol.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">Nenhuma solicitação negada</p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-medium text-zinc-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Ausências Ativas ({excecoes?.length || 0})
          </h3>
          {excecoes && excecoes.length > 0 ? (
            <div className="space-y-2">
              {excecoes.map((exc) => (
                <div key={exc.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-100">
                  <div className="flex items-start gap-3">
                    {exc.tipo === "periodo" && (
                      <List className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-700 flex items-center gap-1">
                        {exc.motivo || "Ausência"}
                        {exc.totalDias && exc.totalDias > 1 && (
                          <Badge variant="outline" className="text-xs ml-1">
                            {exc.totalDias} dias
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatarPeriodo(exc)}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    Ativo
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">Nenhuma ausência ativa</p>
          )}
        </Card>
      </div>

      <Modal
        size="sm"
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Excluir Ausência"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600">
            Tem certeza que deseja excluir esta ausência? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? "Excluindo..." : "Sim, excluir"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}