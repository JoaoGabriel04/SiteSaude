"use client";

import { useUserStore } from "@/stores/userStore";
import LoadingScreen from "@/components/LoadingScreen";
import { useEffect, useMemo, useState } from "react";
import Title1 from "@/components/Title1";
import Subtitle from "@/components/Subtitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, ClockIcon, History, Phone, CheckCircle, XCircle } from "lucide-react";
import { useMeusAgendamentos } from "@/hooks/useMeusAgendamentos";
import { toast } from "@/toast/toastManager";
import api from "@/services/api";
import { Badge } from "@/components/ui/badge";
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
  observacoes?: string;
  paciente: {
    id: string;
    nome: string;
    cpf: string;
    fone: string;
    nascimento: string;
    sexo: string;
  };
};

const statusColors: Record<string, string> = {
  AGENDADO: "bg-blue-100 text-blue-600",
  CONFIRMADO: "bg-green-100 text-green-600",
  CANCELADO: "bg-red-100 text-red-600",
  FINALIZADO: "bg-zinc-100 text-zinc-600",
};

const urgenciaColors: Record<string, string> = {
  URGENTE: "bg-red-500 text-white",
  MODERADO: "bg-yellow-500 text-white",
  BAIXO: "bg-green-500 text-white",
};

export default function MeusAgendamentos() {
  const { user, loading } = useUserStore();

  const [busca, setBusca] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [inputStatus, setInputStatus] = useState("ATIVOS");
  const [status, setStatus] = useState("");
  const [mostrarPassados, setMostrarPassados] = useState(false);

  const hoje = useMeusAgendamentos({ busca, status, periodo: "hoje" });
  const posteriores = useMeusAgendamentos({ busca, status, periodo: "posteriores" });
  const passados = useMeusAgendamentos(
    { busca, status, periodo: "passados" },
    mostrarPassados
  );

  useEffect(() => {
    if (hoje.error || posteriores.error || passados.error) {
      toast.error("Erro ao buscar agendamentos!");
    }
  }, [hoje.error, posteriores.error, passados.error]);

  const refreshAll = () => {
    hoje.mutate();
    posteriores.mutate();
    passados.mutate();
  };

  // Agrupar posteriores por data
  const posterioresAgrupados = useMemo(() => {
    const grupos: Record<string, AgendaData[]> = {};
    (posteriores.agendamentos ?? []).forEach((ag: AgendaData) => {
      const data = new Date(ag.horario_atend).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
      if (!grupos[data]) grupos[data] = [];
      grupos[data].push(ag);
    });
    return grupos;
  }, [posteriores.agendamentos]);

  async function finalizar(id: string) {
    try {
      await api.patch(`/api/agenda/${id}/finalizar`);
      toast.success("Agendamento finalizado!");
      refreshAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao finalizar");
    }
  }

  async function cancelar(id: string) {
    const motivo = prompt("Motivo do cancelamento (opcional):");
    if (motivo === null) return;
    try {
      await api.patch(`/agendamentos/${id}/cancelar`, { cancelReason: motivo });
      toast.success("Agendamento cancelado!");
      refreshAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao cancelar");
    }
  }

  if (loading || !user) return <LoadingScreen />;

  const hojeList: AgendaData[] = hoje.agendamentos ?? [];
  const posterioresList: AgendaData[] =
    posteriores.agendamentos ?? [];
  const passadosList: AgendaData[] =
    passados.agendamentos ?? [];

  return (
    <>
      <div className="w-full flex items-start justify-between">
        <div>
          <Title1>Meus Agendamentos</Title1>
          <Subtitle>Visualize suas consultas de hoje e dos próximos dias.</Subtitle>
        </div>
      </div>

      <section className="w-full flex flex-col gap-4 mt-10">
        {/* FILTROS */}
        <Card className="px-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-700">Buscar consultas</h1>
            <span className="text-sm text-zinc-800/50">
              Encontre suas consultas pelo nome ou CPF do paciente
            </span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setBusca(inputValue);
              setStatus(inputStatus === "ATIVOS" ? "AGENDADO" : inputStatus === "TODOS" ? "" : inputStatus);
            }}
            className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2"
          >
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
                  <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <Switch
                  checked={mostrarPassados}
                  onCheckedChange={setMostrarPassados}
                />
                Mostrar passados
              </label>
              <Button
                className="bg-blue-600 hover:bg-blue-700 font-bold text-white px-10 cursor-pointer"
                type="submit"
              >
                Buscar
              </Button>
            </div>
          </form>
        </Card>

        {/* HOJE */}
        <Card className="w-full px-4">
          <div className="w-full flex flex-col">
            <h1 className="text-lg font-bold text-zinc-700 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-green-600" />
              Hoje
            </h1>
            <span className="text-sm text-zinc-800/50">
              {hojeList.length} consulta(s) para hoje
            </span>
          </div>

          {hoje.isLoading ? (
            <span className="text-sm text-zinc-400">Carregando...</span>
          ) : hojeList.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-sm text-zinc-700/50">
                Nenhuma consulta para hoje
              </span>
            </div>
          ) : (
            <div className="w-full overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Paciente</TableHead>
                    <TableHead className="w-[70px]">Horário</TableHead>
                    <TableHead className="w-[50px]">Idade</TableHead>
                    <TableHead className="w-[90px]">Telefone</TableHead>
                    <TableHead className="w-[80px]">Tipo</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[80px]">Urgência</TableHead>
                    <TableHead className="w-[120px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hojeList.map((agenda) => (
                    <TableRow key={agenda.id} className="border-l-4 border-l-green-500">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{agenda.paciente.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{agenda.paciente.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{new Date(agenda.horario_atend).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </TableCell>
                      <TableCell>
                        {agenda.paciente.nascimento ?
                          `${Math.floor((Date.now() - new Date(agenda.paciente.nascimento).getTime()) / (1000 * 60 * 60 * 24 * 365.25))}`
                          : "-"}
                      </TableCell>
                      <TableCell>{agenda.paciente.fone}</TableCell>
                      <TableCell>{agenda.tipo}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[agenda.status]}`}>{agenda.status?.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${urgenciaColors[agenda.statusUrgencia]}`}>{agenda.statusUrgencia?.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {agenda.status !== "FINALIZADO" && agenda.status !== "CANCELADO" && (
                          <div className="flex gap-1 justify-end">
                            {user.role === "MEDICO" && (
                              <Button size="sm" className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white cursor-pointer" onClick={() => finalizar(agenda.id)}>
                                <CheckCircle className="w-3 h-3 mr-1" /> Finalizar
                              </Button>
                            )}
                            {(user.role === "ATENDENTE" || user.role === "ADMIN") && (
                              <Button size="sm" variant="outline" className="h-8 px-2 cursor-pointer" onClick={() => cancelar(agenda.id)}>
                                <XCircle className="w-3 h-3 mr-1" /> Cancelar
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* POSTERIORES */}
        <Card className="w-full px-4">
          <div className="w-full flex flex-col">
            <h1 className="text-lg font-bold text-zinc-700 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Próximos 30 dias
            </h1>
            <span className="text-sm text-zinc-800/50">
              {posterioresList.length} consulta(s) agendada(s)
            </span>
          </div>

          {posteriores.isLoading ? (
            <span className="text-sm text-zinc-400">Carregando...</span>
          ) : posterioresList.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-sm text-zinc-700/50">
                Nenhuma consulta nos próximos dias
              </span>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4">
              {Object.entries(posterioresAgrupados).map(([data, lista]) => (
                <div key={data}>
                  <h3 className="text-sm font-semibold uppercase text-zinc-600 mb-2">{data}</h3>
                  <div className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Paciente</TableHead>
                          <TableHead className="w-[70px]">Horário</TableHead>
                          <TableHead className="w-[50px]">Idade</TableHead>
                          <TableHead className="w-[90px]">Telefone</TableHead>
                          <TableHead className="w-[80px]">Tipo</TableHead>
                          <TableHead className="w-[80px]">Status</TableHead>
                          <TableHead className="w-[80px]">Urgência</TableHead>
                          <TableHead className="w-[120px] text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lista.map((agenda) => (
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
                              <span>{new Date(agenda.horario_atend).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                            </TableCell>
                            <TableCell>
                              {agenda.paciente.nascimento ?
                                `${Math.floor((Date.now() - new Date(agenda.paciente.nascimento).getTime()) / (1000 * 60 * 60 * 24 * 365.25))}`
                                : "-"}
                            </TableCell>
                            <TableCell>{agenda.paciente.fone}</TableCell>
                            <TableCell>{agenda.tipo}</TableCell>
                            <TableCell>
                              <Badge className={`${statusColors[agenda.status]}`}>{agenda.status?.toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${urgenciaColors[agenda.statusUrgencia]}`}>{agenda.statusUrgencia?.toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {agenda.status !== "FINALIZADO" && agenda.status !== "CANCELADO" && (
                                <div className="flex gap-1 justify-end">
                                  {user.role === "MEDICO" && (
                                    <Button size="sm" className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white cursor-pointer" onClick={() => finalizar(agenda.id)}>
                                      <CheckCircle className="w-3 h-3 mr-1" /> Finalizar
                                    </Button>
                                  )}
                                  {(user.role === "ATENDENTE" || user.role === "ADMIN") && (
                                    <Button size="sm" variant="outline" className="h-8 px-2 cursor-pointer" onClick={() => cancelar(agenda.id)}>
                                      <XCircle className="w-3 h-3 mr-1" /> Cancelar
                                    </Button>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* PASSADOS */}
        {mostrarPassados && (
          <Card className="w-full px-4">
            <div className="w-full flex flex-col">
              <h1 className="text-lg font-bold text-zinc-700 flex items-center gap-2">
                <History className="w-5 h-5 text-zinc-500" />
                Histórico
              </h1>
              <span className="text-sm text-zinc-800/50">
                {passadosList.length} consulta(s) anteriores
              </span>
            </div>

            {passados.isLoading ? (
              <span className="text-sm text-zinc-400">Carregando...</span>
            ) : passadosList.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <span className="text-sm text-zinc-700/50">Sem histórico</span>
              </div>
            ) : (
              <div className="w-full overflow-x-auto mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Paciente</TableHead>
                      <TableHead className="w-[130px]">Data/Hora</TableHead>
                      <TableHead className="w-[50px]">Idade</TableHead>
                      <TableHead className="w-[90px]">Telefone</TableHead>
                      <TableHead className="w-[80px]">Tipo</TableHead>
                      <TableHead className="w-[80px]">Status</TableHead>
                      <TableHead className="w-[80px]">Urgência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passadosList.map((agenda) => (
                      <TableRow key={agenda.id} className="opacity-80">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{agenda.paciente.nome.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{agenda.paciente.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(agenda.horario_atend).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                        <TableCell>
                          {agenda.paciente.nascimento ?
                            `${Math.floor((Date.now() - new Date(agenda.paciente.nascimento).getTime()) / (1000 * 60 * 60 * 24 * 365.25))}`
                            : "-"}
                        </TableCell>
                        <TableCell>{agenda.paciente.fone}</TableCell>
                        <TableCell>{agenda.tipo}</TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[agenda.status]}`}>{agenda.status?.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${urgenciaColors[agenda.statusUrgencia]}`}>{agenda.statusUrgencia?.toUpperCase()}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>

        )}
      </section>
    </>
  );
}

/* =======================
   Subcomponente: Card da consulta
======================= */
type CardConsultaProps = {
  agenda: AgendaData;
  destaque?: boolean;
  passado?: boolean;
  onFinalizar?: (id: string) => void;
  onCancelar?: (id: string) => void;
};

function CardConsulta({
  agenda,
  destaque,
  passado,
  onFinalizar,
  onCancelar,
}: CardConsultaProps) {
  const hora = new Date(agenda.horario_atend).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const idade = agenda.paciente.nascimento
    ? Math.floor(
      (Date.now() - new Date(agenda.paciente.nascimento).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
    )
    : null;

  const podeAgir =
    !passado && agenda.status !== "FINALIZADO" && agenda.status !== "CANCELADO";

  return (
    <Card
      className={`w-full shadow-md hover:shadow-lg transition ${destaque ? "border-l-4 border-l-green-500" : ""
        } ${passado ? "opacity-80" : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Avatar>
            <AvatarFallback>{agenda.paciente.nome.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="truncate">{agenda.paciente.nome}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex gap-1 flex-wrap">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[agenda.status]}`}
          >
            {agenda.status?.toUpperCase()}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgenciaColors[agenda.statusUrgencia]}`}
          >
            {agenda.statusUrgencia?.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <ClockIcon className="w-3 h-3" />
          <span className="font-semibold text-foreground">{hora}</span>
        </div>

        {idade !== null && (
          <div className="flex justify-between">
            <span className="font-medium text-foreground">Idade:</span>
            <span>{idade} anos</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          <span>{agenda.paciente.fone}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-foreground">Tipo:</span>
          <span>{agenda.tipo}</span>
        </div>

        {agenda.motivo && (
          <div className="flex justify-between">
            <span className="font-medium text-foreground">Motivo:</span>
            <span className="truncate max-w-[60%]">{agenda.motivo}</span>
          </div>
        )}

        {podeAgir && onFinalizar && onCancelar && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              onClick={() => onFinalizar(agenda.id)}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Finalizar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onCancelar(agenda.id)}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}