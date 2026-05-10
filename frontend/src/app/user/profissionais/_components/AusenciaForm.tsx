'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/inputField"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/services/api"
import { toast } from "@/toast/toastManager"

type AusenciaFormProps = {
  docId: string
  onSuccess: () => void
  onCancel: () => void
}

const tipoAusencia = [
  { value: "Férias", label: "Férias" },
  { value: "Viagem", label: "Viagem" },
  { value: "Doença", label: "Doença" },
  { value: "Outro", label: "Outro" },
]

export default function AusenciaForm({ docId, onSuccess, onCancel }: AusenciaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tipo, setTipo] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [observacao, setObservacao] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!tipo || !dataInicio) {
      toast.error("Preencha o tipo e a data de início")
      return
    }

    setIsSubmitting(true)
    try {
      if (dataFim && dataFim > dataInicio) {
        await api.post("/api/medico/excecao/periodo", {
          docId,
          dataInicio,
          dataFim,
          motivo: tipo
        })
        toast.success("Ausências cadastradas com sucesso!")
      } else {
        await api.post("/api/medico/excecao", {
          docId,
          data: dataInicio,
          motivo: tipo
        })
        toast.success("Ausência cadastrada com sucesso!")
      }
      onSuccess()
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Erro ao cadastrar ausência"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Tipo de ausência *</label>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {tipoAusencia.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InputField
          id="data-inicio"
          type="date"
          label="Data início *"
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

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Observação (opcional)</label>
        <textarea
          className="w-full p-2 border rounded-md text-sm resize-none"
          rows={2}
          placeholder="Ex: Retorno em..."
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}