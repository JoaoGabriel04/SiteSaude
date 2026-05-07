"use client";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Phone, User } from "lucide-react";
import { toast } from "@/toast/toastManager";
import { getStatusVisual, StatusVisual } from "@/utils/agendamentoStatus";

interface Props {
  agendamento: any;
  destaque?: boolean;
  passado?: boolean;
  onUpdate: () => void;
}

const statusColors: Record<StatusVisual, string> = {
  AGENDADO: "bg-blue-100 text-blue-700",
  FINALIZADO: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-zinc-200 text-zinc-700",
  ATRASADO: "bg-amber-100 text-amber-700", // 🟡 chama atenção sem alarmar
};

const urgenciaColor: Record<string, string> = {
  URGENTE: "bg-red-500 text-white",
  MODERADO: "bg-yellow-500 text-white",
  BAIXO: "bg-emerald-500 text-white",
};

export function CardAgendamentoMedico({
  agendamento,
  destaque,
  passado,
  onUpdate,
}: Props) {
  const hora = new Date(agendamento.horario_atend).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const idade = agendamento.paciente?.nascimento
    ? Math.floor(
      (Date.now() - new Date(agendamento.paciente.nascimento).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
    )
    : null;

  async function finalizar() {
    try {
      await api.patch(`/agendamentos/${agendamento.id}/finalizar`);
      toast.success("Agendamento finalizado");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao finalizar");
    }
  }

  async function cancelar() {
    const motivo = prompt("Motivo do cancelamento (opcional):") ?? undefined;
    if (motivo === null) return;
    try {
      await api.patch(`/agendamentos/${agendamento.id}/cancelar`, {
        cancelReason: motivo,
      });
      toast.success("Agendamento cancelado");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao cancelar");
    }
  }

  const statusVisual = getStatusVisual(
    agendamento.status,
    agendamento.horario_atend
  );
  
  const podeAgir = ["AGENDADO", "ATRASADO"].includes(statusVisual);

  return (
    <div
      className={`border rounded-lg p-4 space-y-3 transition hover:shadow-md ${destaque ? "border-green-500 bg-green-50/40" : ""
        } ${passado ? "opacity-75" : ""}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-2xl font-bold">{hora}</p>
          {agendamento.statusUrgencia && (
            <Badge className={`mt-1 ${urgenciaColor[agendamento.statusUrgencia]}`}>
              {agendamento.statusUrgencia}
            </Badge>
          )}
        </div>
        <Badge className={statusColors[statusVisual] || ""}>
          {agendamento.status}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 font-medium">
          <User className="w-4 h-4" />
          {agendamento.paciente?.nome}
        </div>
        {idade !== null && (
          <p className="text-sm text-muted-foreground">{idade} anos</p>
        )}
        {agendamento.paciente?.fone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3 h-3" />
            {agendamento.paciente.fone}
          </div>
        )}
        {agendamento.tipo && (
          <p className="text-xs uppercase text-muted-foreground tracking-wide">
            {agendamento.tipo}
          </p>
        )}
      </div>

      {agendamento.motivo && (
        <p className="text-sm">
          <span className="font-medium">Motivo: </span>
          {agendamento.motivo}
        </p>
      )}
      {agendamento.observacoes && (
        <p className="text-sm bg-muted p-2 rounded">{agendamento.observacoes}</p>
      )}

      {podeAgir && (
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" onClick={finalizar} className="flex-1">
            <CheckCircle className="w-4 h-4 mr-1" /> Finalizar
          </Button>
          <Button size="sm" variant="outline" onClick={cancelar}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}