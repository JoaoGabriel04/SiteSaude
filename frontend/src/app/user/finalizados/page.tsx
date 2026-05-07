"use client";

import { useUserStore } from "@/stores/userStore";
import LoadingScreen from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import Title1 from "@/components/Title1";
import Subtitle from "@/components/Subtitle";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
  paciente: { id: string; nome: string; cpf: string; fone: string; nascimento?: string };
  medico: { userId: string; crm: string; especialidade: string; user: { nome: string } };
}

const urgenciaColor: Record<string, string> = {
  URGENTE: "bg-red-500 text-white",
  MODERADO: "bg-yellow-500 text-white",
  BAIXO: "bg-emerald-500 text-white",
};

export default function Finalizados() {
  const { user, loading } = useUserStore();

  const [current, setCurrent] = useState(1);
  const [busca, setBusca] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [inputUrgencia, setInputUrgencia] = useState("TODOS");
  const [statusUrgencia, setStatusUrgencia] = useState("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState<AgendaData | null>(null);

  const { data: agendaData, error: agendaError, isLoading: agendaLoading, mutate } = useViewAgendamentos({
    busca,
    status: "FINALIZADO",
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

  function confirmarExclusao(agenda: AgendaData) {
    setAgendamentoParaExcluir(agenda);
    setOpenConfirm(true);
  }

  return (
    <>
      <div className="w-full flex items-start justify-between">
        <div>
          <Title1>Finalizados</Title1>
          <Subtitle>Gerencie os agendamentos finalizados.</Subtitle>
        </div>
      </div>

      <section className="w-full flex flex-col gap-4 mt-10">
        <Card className="px-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-700">Buscar finalizados</h1>
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
          <div className="w-full flex flex-col">
            <h1 className="text-lg font-bold text-zinc-700">Lista de Finalizados</h1>
            <span className="text-sm text-zinc-800/50">{agendaData?.length ?? 0} agendamento(s) encontrado(s)</span>
          </div>

          {agendaLoading ? (
            <span className="text-sm text-zinc-400">Carregando...</span>
          ) : agendaData && agendaData.length > 0 ? (
            <div className="w-full overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Paciente</TableHead>
                    <TableHead className="w-[130px]">Data/Hora</TableHead>
                    <TableHead className="w-[130px]">Médico</TableHead>
                    <TableHead className="w-[80px]">Tipo</TableHead>
                    <TableHead className="w-[80px]">Urgência</TableHead>
                    <TableHead className="w-[120px]">Motivo</TableHead>
                    <TableHead className="w-[90px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agendaData.map((agenda: any) => (
                    <TableRow key={agenda.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{agenda.paciente.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{agenda.paciente.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{new Date(agenda.horario_atend).toLocaleString("pt-BR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}</span>
                      </TableCell>
                      <TableCell>
                        <span className="truncate">{agenda.medico.user.nome}</span>
                      </TableCell>
                      <TableCell>{agenda.tipo}</TableCell>
                      <TableCell>
                        {agenda.statusUrgencia ? (
                          <Badge className={`${urgenciaColor[agenda.statusUrgencia] || ""}`}>
                            {agenda.statusUrgencia?.toUpperCase()}
                          </Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <span className="truncate max-w-[110px]">{agenda.motivo ?? "-"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {(user.role === "ADMIN" || user.role === "ATENDENTE") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-red-600 border-red-600 hover:bg-red-50 cursor-pointer"
                            onClick={(e) => { e.preventDefault(); confirmarExclusao(agenda); }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <span className="text-sm text-zinc-700/50">Nenhum agendamento encontrado</span>
            </div>
          )}

          <div className="flex flex-row w-full gap-3 items-center justify-center mt-4">
            <Button disabled={!hasPreviousPage} onClick={() => setCurrent(current - 1)}>
              Página Anterior
            </Button>
            <Button className="bg-blue-600 font-bold text-white" disabled={!hasNextPage} onClick={() => setCurrent(current + 1)}>
              Próxima página
            </Button>
          </div>
        </Card>
      </section>

      <Modal size="sm" isOpen={openConfirm} onClose={() => setOpenConfirm(false)} title="Confirmar Exclusão">
        <div className="flex flex-col gap-4">
          <p className="text-zinc-700">
            Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
          </p>
          {agendamentoParaExcluir && (
            <div className="text-sm text-zinc-600">
              <strong>Paciente:</strong> {agendamentoParaExcluir.paciente.nome}<br />
              <strong>Data:</strong> {new Date(agendamentoParaExcluir.horario_atend).toLocaleString("pt-BR")}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpenConfirm(false)}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={excluirAgendamento}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}