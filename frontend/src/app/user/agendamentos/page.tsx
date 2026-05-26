"use client";

import { useUserStore } from "@/stores/userStore";
import LoadingScreen from "@/components/LoadingScreen";
import { useEffect, useState, useMemo } from "react";
import Title1 from "@/components/Title1";
import Subtitle from "@/components/Subtitle";
import { Button } from "@/components/ui/button";
import { PlusIcon, XCircle, Eye, Phone, CalendarDays, Mail, CreditCard, User, FileText, Stethoscope, Timer, Info } from "lucide-react";
import Modal from "@/components/Modal";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AgendamentoForm from "./_components/AgendamentoForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useViewAgendamentos } from "@/hooks/useViewAgendamentos";
import { toast } from "@/toast/toastManager";
import { Badge } from "@/components/ui/badge";
import { getStatusVisual, StatusVisual } from "@/utils/agendamentoStatus";
import api from "@/services/api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatDataHora } from "@/utils/formatDate";

type AgendaData = {
  id: string;
  horario_atend: string;
  status: string;
  statusUrgencia: string;
  tipo: string;
  motivo?: string;
  observacoes?: string;
  duracaoMin?: number;
  displayStatus?: string;
  paciente: {
    id: string; nome: string; cpf: string; fone: string;
    nascimento?: string; email?: string | null; sexo?: string; cartaoSus?: string;
  };
  medico: { userId: string; crm: string; especialidade: string; user: { nome: string } };
  cancelReason?: string;
  canceledBy?: { nome: string };
}

const statusColors: Record<StatusVisual | string, string> = {
  AGENDADO: "bg-blue-100 text-blue-700",
  FINALIZADO: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-zinc-200 text-zinc-700",
  ATRASADO: "bg-amber-100 text-amber-700",
};

const urgenciaColor: Record<string, string> = {
  URGENTE: "bg-red-500 text-white",
  MODERADO: "bg-yellow-500 text-white",
  BAIXO: "bg-emerald-500 text-white",
};

export default function Agendamentos() {
  const [openAgend, setOpenAgend] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaData | null>(null);
  const { user, loading } = useUserStore();

  const [current, setCurrent] = useState(1);
  const [busca, setBusca] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [inputStatus, setInputStatus] = useState("ATIVOS");
  const [inputUrgencia, setInputUrgencia] = useState("TODOS");
  const [status, setStatus] = useState("");
  const [statusUrgencia, setStatusUrgencia] = useState("");

  const { data: agendaData, error: agendaError, isLoading: agendaLoading, mutate } = useViewAgendamentos({
    busca, status, statusUrgencia, page: current
  });

  const hasPreviousPage = current > 1;
  const hasNextPage = agendaData && agendaData.length === 12;

  useEffect(() => {
    if (agendaError) {
      toast.error("Erro ao buscar agendamentos!");
    }
  }, [agendaError]);

  function handleOpenAgend() { setOpenAgend(true); }
  function handleCloseAgend() { setOpenAgend(false); }

  function handleOpenDetails(agenda: AgendaData) {
    setSelectedAgenda(agenda);
    setOpenDetails(true);
  }
  function handleCloseDetails() {
    setOpenDetails(false);
    setSelectedAgenda(null);
  }

  const sexoLabels: Record<string, string> = {
    MASCULINO: 'Masculino', FEMININO: 'Feminino', OUTRO: 'Outro',
  };
  const urgenciaForDisplay: Record<string, string> = {
    URGENTE: 'Urgente', MODERADO: 'Moderado', BAIXO: 'Baixo',
  };
  const tipoLabels: Record<string, string> = {
    CONSULTA: 'Consulta', EXAME: 'Exame', PROCEDIMENTO: 'Procedimento', RETORNO: 'Retorno',
  };

  function formatarFone(fone: string): string {
    const nums = fone.replace(/\D/g, '');
    if (nums.length === 11) return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
    if (nums.length === 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    return fone;
  }
  function formatarNascimento(data?: string): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  async function cancelarAgendamento(id: string) {
    const motivo = prompt("Motivo do cancelamento (opcional):");
    if (motivo === null) return;
    try {
      await api.patch(`/api/agenda/${id}/cancelar`, { cancelReason: motivo });
      toast.success("Agendamento cancelado!");
      mutate();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string; error?: string } } };
      toast.error(apiError.response?.data?.error || "Erro ao cancelar");
    }
  }

  const statusOrder = useMemo<Record<string, number>>(
    () => ({ AGENDADO: 0, FINALIZADO: 1, CANCELADO: 2, ATRASADO: 3 }),
    []
  );

  const { mainList, overdueList } = useMemo(() => {
    const raw: AgendaData[] = agendaData ?? [];

    const processed = raw.map((a) => {
      const displayStatus = getStatusVisual(a.status, a.horario_atend) as StatusVisual | string;
      return { ...a, displayStatus };
    });

    const overdue = processed.filter((p) => p.displayStatus === "ATRASADO");
    const main = processed
      .filter((p) => p.displayStatus !== "ATRASADO")
      .sort((a, b) => {
        const da = String(a.displayStatus);
        const db = String(b.displayStatus);
        const pa = statusOrder[da] ?? 99;
        const pb = statusOrder[db] ?? 99;
        if (pa !== pb) return pa - pb;
        return a.paciente.nome.localeCompare(b.paciente.nome, "pt-BR", { sensitivity: "base" });
      });

    return { mainList: main, overdueList: overdue };
  }, [agendaData, statusOrder]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <>
      <div className="w-full flex items-start justify-between">
        <div>
          <Title1>Agendamentos</Title1>
          <Subtitle>Gerencie os agendamentos de todos os pacientes.</Subtitle>
        </div>
        {(user.role === "ADMIN" || user.role === "ATENDENTE") && (
          <Button className="cursor-pointer" onClick={(e) => { e.preventDefault(); handleOpenAgend(); }}>
            <PlusIcon className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </Button>
        )}
      </div>

      <section className="w-full flex flex-col gap-4 mt-10">
        <Card className="px-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-700">Buscar agendamentos</h1>
            <span className="text-sm text-zinc-800/50">Encontre os agendamentos pelo nome ou CPF do paciente</span>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            setBusca(inputValue);
            setStatus(inputStatus === "ATIVOS" ? "AGENDADO" : inputStatus === "TODOS" ? "" : inputStatus);
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
              <Select value={inputStatus} onValueChange={setInputStatus}>
                <SelectTrigger className="w-1/4 self-center">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ATIVOS">Ativos</SelectItem>
                  <SelectItem value="AGENDADO">Agendado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
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
            <h1 className="text-lg font-bold text-zinc-700">Lista de Agendamentos</h1>
            <span className="text-sm text-zinc-800/50">{mainList.length} agendamento(s) encontrado(s)</span>
          </div>

          {agendaLoading ? (
            <span className="text-sm text-zinc-400">Carregando...</span>
          ) : mainList && mainList.length > 0 ? (
            <div className="w-full overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Paciente</TableHead>
                    <TableHead className="w-[130px]">Data/Hora</TableHead>
                    <TableHead className="w-[130px]">Médico</TableHead>
                    <TableHead className="w-[90px]">Status</TableHead>
                    <TableHead className="w-[80px]">Urgência</TableHead>
                    <TableHead className="w-[120px]">Motivo</TableHead>
                    <TableHead className="w-[90px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mainList.map((agenda: AgendaData) => (
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
                        <span className="text-sm">{formatDataHora(agenda.horario_atend)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="truncate">{agenda.medico.user.nome}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[agenda.displayStatus ?? agenda.status] || ""}`}>
                          {(agenda.displayStatus ?? agenda.status)?.toUpperCase()}
                        </Badge>
                      </TableCell>
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
                      <TableCell className="text-right flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 cursor-pointer"
                          onClick={(e) => { e.preventDefault(); handleOpenDetails(agenda); }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Detalhes
                        </Button>
                        {(user.role === "ADMIN" || user.role === "ATENDENTE") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 cursor-pointer"
                            onClick={(e) => { e.preventDefault(); cancelarAgendamento(agenda.id); }}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancelar
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

        {overdueList && overdueList.length > 0 && (
          <Card className="w-full px-4">
            <div className="w-full flex flex-col">
              <h1 className="text-lg font-bold text-zinc-700">Agendamentos Atrasados</h1>
              <span className="text-sm text-zinc-800/50">{overdueList.length} agendamento(s) atrasado(s)</span>
            </div>

            <div className="w-full overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Paciente</TableHead>
                    <TableHead className="w-[130px]">Horário</TableHead>
                    <TableHead className="w-[130px]">Médico</TableHead>
                    <TableHead className="w-[90px]">Status</TableHead>
                    <TableHead className="w-[80px]">Urgência</TableHead>
                    <TableHead className="w-[120px]">Motivo</TableHead>
                    <TableHead className="w-[90px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueList.map((agenda: AgendaData) => (
                    <TableRow key={agenda.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{agenda.paciente.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[140px]">{agenda.paciente.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDataHora(agenda.horario_atend)}</span>
                      </TableCell>
                      <TableCell>{agenda.medico.user.nome}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors["ATRASADO"]}`}>
                          ATRASADO
                        </Badge>
                      </TableCell>
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
                      <TableCell className="text-right flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 cursor-pointer"
                          onClick={(e) => { e.preventDefault(); handleOpenDetails(agenda); }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Detalhes
                        </Button>
                        {(user.role === "ADMIN" || user.role === "ATENDENTE") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 cursor-pointer"
                            onClick={(e) => { e.preventDefault(); cancelarAgendamento(agenda.id); }}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </section>

      {/* Modal de detalhes do agendamento */}
      <Modal size="lg" isOpen={openDetails} onClose={handleCloseDetails} title="Detalhes do Agendamento">
        {selectedAgenda && (
          <div className="space-y-5">
            {/* Informações do Paciente */}
            <div>
              <h3 className="font-semibold text-zinc-700 mb-2 flex items-center gap-2">
                <User size={16} /> Informações do Paciente
              </h3>
              <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-zinc-500">Nome:</span> <span className="font-medium">{selectedAgenda.paciente.nome}</span></div>
                <div><span className="text-zinc-500">CPF:</span> <span>{selectedAgenda.paciente.cpf}</span></div>
                {selectedAgenda.paciente.fone && <div className="flex items-center gap-1"><Phone size={13} className="text-zinc-400" /><span className="text-zinc-500">Telefone:</span> <span>{formatarFone(selectedAgenda.paciente.fone)}</span></div>}
                {selectedAgenda.paciente.nascimento && <div className="flex items-center gap-1"><CalendarDays size={13} className="text-zinc-400" /><span className="text-zinc-500">Nascimento:</span> <span>{formatarNascimento(selectedAgenda.paciente.nascimento)}</span></div>}
                {selectedAgenda.paciente.email && <div className="flex items-center gap-1"><Mail size={13} className="text-zinc-400" /><span className="text-zinc-500">Email:</span> <span className="truncate">{selectedAgenda.paciente.email}</span></div>}
                {selectedAgenda.paciente.cartaoSus && <div className="flex items-center gap-1"><CreditCard size={13} className="text-zinc-400" /><span className="text-zinc-500">Cartão SUS:</span> <span>{selectedAgenda.paciente.cartaoSus}</span></div>}
                {selectedAgenda.paciente.sexo && <div><span className="text-zinc-500">Sexo:</span> <span>{sexoLabels[selectedAgenda.paciente.sexo] || selectedAgenda.paciente.sexo}</span></div>}
              </div>
            </div>

            {/* Informações da Consulta */}
            <div>
              <h3 className="font-semibold text-zinc-700 mb-2 flex items-center gap-2">
                <Info size={16} /> Informações da Consulta
              </h3>
              <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="sm:col-span-2">
                  <span className="text-zinc-500">Data/Hora:</span>
                  <span className="ml-1 font-medium">
                    {new Date(selectedAgenda.horario_atend).toLocaleString("pt-BR", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                </div>
                <div><span className="text-zinc-500">Tipo:</span> <span>{tipoLabels[selectedAgenda.tipo] || selectedAgenda.tipo}</span></div>
                <div><span className="text-zinc-500">Duração:</span> <span>{selectedAgenda.duracaoMin || 30} min</span></div>
                <div>
                  <span className="text-zinc-500">Status:</span>
                  <Badge className={`ml-1 ${statusColors[selectedAgenda.displayStatus ?? selectedAgenda.status] || ""}`}>
                    {(selectedAgenda.displayStatus ?? selectedAgenda.status)?.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-zinc-500">Urgência:</span>
                  {selectedAgenda.statusUrgencia ? (
                    <Badge className={`ml-1 ${urgenciaColor[selectedAgenda.statusUrgencia] || ""}`}>
                      {urgenciaForDisplay[selectedAgenda.statusUrgencia] || selectedAgenda.statusUrgencia}
                    </Badge>
                  ) : <span className="ml-1">-</span>}
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-start gap-1">
                    <FileText size={13} className="text-zinc-400 mt-0.5" />
                    <span className="text-zinc-500">Motivo:</span>
                  </div>
                  <p className="text-zinc-700 mt-1">{selectedAgenda.motivo || "Não informado"}</p>
                </div>
                {selectedAgenda.observacoes && (
                  <div className="sm:col-span-2">
                    <div className="flex items-start gap-1">
                      <FileText size={13} className="text-zinc-400 mt-0.5" />
                      <span className="text-zinc-500">Observações:</span>
                    </div>
                    <p className="text-zinc-700 mt-1">{selectedAgenda.observacoes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Médico */}
            <div>
              <h3 className="font-semibold text-zinc-700 mb-2 flex items-center gap-2">
                <Stethoscope size={16} /> Médico Responsável
              </h3>
              <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-3 text-sm">
                <div><span className="text-zinc-500">Nome:</span> <span className="font-medium">{selectedAgenda.medico.user.nome}</span></div>
                <div><span className="text-zinc-500">CRM:</span> <span>{selectedAgenda.medico.crm}</span></div>
                <div><span className="text-zinc-500">Especialidade:</span> <span>{selectedAgenda.medico.especialidade}</span></div>
              </div>
            </div>

            {/* Cancelamento */}
            {selectedAgenda.status === "CANCELADO" && selectedAgenda.cancelReason && (
              <div>
                <h3 className="font-semibold text-red-600 mb-2">Motivo do Cancelamento</h3>
                <div className="bg-red-50 rounded-lg border border-red-200 p-3 text-sm">
                  <p className="text-red-700">{selectedAgenda.cancelReason}</p>
                  {selectedAgenda.canceledBy?.nome && (
                    <p className="text-red-500 text-xs mt-1">Cancelado por: {selectedAgenda.canceledBy.nome}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal size="xl" isOpen={openAgend} onClose={handleCloseAgend} title="Novo agendamento">
        <AgendamentoForm onSuccess={() => { handleCloseAgend(); mutate(); }} userId={user.id} />
      </Modal>
    </>
  );
}