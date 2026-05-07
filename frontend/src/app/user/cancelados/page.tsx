"use client";

import { useUserStore } from "@/stores/userStore";
import LoadingScreen from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import Title1 from "@/components/Title1";
import Subtitle from "@/components/Subtitle";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, XCircle, CalendarIcon, StethoscopeIcon } from "lucide-react";
import Modal from "@/components/Modal";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useViewAgendamentos } from "@/hooks/useViewAgendamentos";
import { toast } from "@/toast/toastManager";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type AgendaData = {
  id: string;
  horario_atend: string;
  status: string;
  statusUrgencia: string;
  tipo: string;
  motivo?: string;
  cancelReason?: string;
  canceledAt?: string;
  canceledBy?: { nome: string };
  paciente: { id: string; nome: string; cpf: string; fone: string };
  medico: { userId: string; crm: string; especialidade: string; user: { nome: string } };
}

const urgenciaColor: Record<string, string> = {
  URGENTE: "bg-red-500 text-white",
  MODERADO: "bg-yellow-500 text-white",
  BAIXO: "bg-emerald-500 text-white",
};

export default function Cancelados() {
  const { user, loading } = useUserStore();

  const [current, setCurrent] = useState(1);
  const [busca, setBusca] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [inputUrgencia, setInputUrgencia] = useState("TODOS");
  const [statusUrgencia, setStatusUrgencia] = useState("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [openConfirmRestaurar, setOpenConfirmRestaurar] = useState(false);
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState<AgendaData | null>(null);
  const [agendamentoParaRestaurar, setAgendamentoParaRestaurar] = useState<AgendaData | null>(null);

  const { data: agendaData, error: agendaError, isLoading: agendaLoading, mutate } = useViewAgendamentos({
    busca,
    status: "CANCELADO",
    statusUrgencia,
    page: current
  });

  const hasPreviousPage = current > 1;
  const hasNextPage = agendaData && agendaData.length === 12;

  useEffect(() => {
    if (agendaError) {
      toast.error("Erro ao buscar agendamentos!");
    }
  }, [agendaError]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  async function excluirAgendamento() {
    if (!agendamentoParaExcluir) return;

    try {
      await api.delete(`/api/agenda/${agendamentoParaExcluir.id}`);
      toast.success("Agendamento excluído!");
      setOpenConfirm(false);
      setAgendamentoParaExcluir(null);
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao excluir");
    }
  }

  async function restaurarAgendamento() {
    if (!agendamentoParaRestaurar) return;

    try {
      await api.patch(`/api/agenda/${agendamentoParaRestaurar.id}/restaurar`);
      toast.success("Agendamento restaurado!");
      setOpenConfirmRestaurar(false);
      setAgendamentoParaRestaurar(null);
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao restaurar");
    }
  }

  function handleExcluir(agenda: AgendaData) {
    setAgendamentoParaExcluir(agenda);
    setOpenConfirm(true);
  }

  function handleRestaurar(agenda: AgendaData) {
    setAgendamentoParaRestaurar(agenda);
    setOpenConfirmRestaurar(true);
  }

  return (
    <>
      <div className="w-full flex items-start justify-between">
        <div>
          <Title1>Cancelados</Title1>
          <Subtitle>Gerencie os agendamentos cancelados.</Subtitle>
        </div>
      </div>

      <section className="w-full flex flex-col gap-4 mt-10">
        <Card className="px-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-700">Buscar cancelados</h1>
            <span className="text-sm text-zinc-800/50">Encontre pelo nome ou CPF do paciente</span>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            setBusca(inputValue);
            setStatusUrgencia(inputUrgencia === "TODOS" ? "" : inputUrgencia);
            setCurrent(1);
          }} className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
            <div className="flex flex-row gap-1 flex-1">
              <InputField
                id="barra-busca"
                type="search"
                label=""
                className="w-full"
                placeholder="Nome ou CPF do paciente..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Select value={inputUrgencia} onValueChange={setInputUrgencia}>
                <SelectTrigger className="w-1/4 self-center">
                  <SelectValue placeholder="Urgência" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="URGENTE">Urgente</SelectItem>
                  <SelectItem value="MODERADO">Moderado</SelectItem>
                  <SelectItem value="BAIXO">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 font-bold text-white px-10 cursor-pointer" type="submit">
              Buscar
            </Button>
          </form>
        </Card>

        <Card className="w-full px-4">
          <div className="w-full overflow-x-auto">
            {agendaLoading ? (
              <div className="text-center py-8">
                <p className="text-zinc-500">Carregando...</p>
              </div>
            ) : agendaData && agendaData.length === 0 ? (
              <div className="text-center py-8">
                <XCircle className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
                <p className="text-zinc-500">Nenhum agendamento cancelado encontrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Data/Hora</TableHead>
                    <TableHead className="w-[150px]">Paciente</TableHead>
                    <TableHead className="w-[120px]">Médico</TableHead>
                    <TableHead className="w-[100px]">Tipo</TableHead>
                    <TableHead className="w-[80px]">Urgência</TableHead>
                    <TableHead className="w-[120px]">Motivo</TableHead>
                    <TableHead className="w-[150px]">Cancelado por</TableHead>
                    <TableHead className="w-[120px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agendaData?.map((agenda: AgendaData) => (
                    <TableRow key={agenda.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm">
                            {new Date(agenda.horario_atend).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{agenda.paciente.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[100px]">{agenda.paciente.nome}</p>
                            <p className="text-xs text-zinc-500">{agenda.paciente.cpf}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <StethoscopeIcon className="w-3 h-3 text-zinc-400" />
                          <span className="text-sm truncate">{agenda.medico.especialidade}</span>
                        </div>
                        <p className="text-xs text-zinc-500">{agenda.medico.user.nome}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                          {agenda.tipo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${urgenciaColor[agenda.statusUrgencia] || "bg-zinc-100 text-zinc-600"}`}>
                          {agenda.statusUrgencia}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm truncate block max-w-[100px]" title={agenda.cancelReason || agenda.motivo || "-"}>
                          {agenda.cancelReason || agenda.motivo || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{agenda.canceledBy?.nome || "-"}</span>
                        {agenda.canceledAt && (
                          <p className="text-xs text-zinc-500">
                            {new Date(agenda.canceledAt).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {(user.role === "ATENDENTE" || user.role === "ADMIN") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 cursor-pointer"
                              onClick={() => handleRestaurar(agenda)}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Restaurar
                            </Button>
                          )}
                          {(user.role === "ATENDENTE" || user.role === "ADMIN") && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 px-2 cursor-pointer"
                              onClick={() => handleExcluir(agenda)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {agendaData && agendaData.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrent((p) => Math.max(1, p - 1))}
                disabled={!hasPreviousPage}
              >
                Anterior
              </Button>
              <span className="text-sm text-zinc-500">Página {current}</span>
              <Button
                variant="outline"
                onClick={() => setCurrent((p) => p + 1)}
                disabled={!hasNextPage}
              >
                Próxima
              </Button>
            </div>
          )}
        </Card>
      </section>

      <Modal isOpen={openConfirm} onClose={() => setOpenConfirm(false)} title="Confirmar Exclusão">
        <div className="space-y-4">
          <p className="text-zinc-600">
            Tem certeza que deseja <strong>excluir</strong> este agendamento? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpenConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" className="cursor-pointer" onClick={excluirAgendamento}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={openConfirmRestaurar} onClose={() => setOpenConfirmRestaurar(false)} title="Confirmar Restauração">
        <div className="space-y-4">
          <p className="text-zinc-600">
            Tem certeza que deseja <strong>restaurar</strong> este agendamento? Ele voltará para a lista de agendamentos ativos.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpenConfirmRestaurar(false)}>
              Cancelar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white cursor-pointer" onClick={restaurarAgendamento}>
              Restaurar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}