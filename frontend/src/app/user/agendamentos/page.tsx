"use client";

import { useUserStore } from "@/stores/userStore";
import Header from "@/components/Header";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import LoadingScreen from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import Title1 from "@/components/Title1";
import Subtitle from "@/components/Subtitle";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Modal from "@/components/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AgendamentoForm from "./_components/AgendamentoForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useViewAgendamentos } from "@/hooks/useViewAgendamentos";
import { toast } from "@/toast/toastManager";
import { CalendarIcon, StethoscopeIcon } from "lucide-react";

type AgendaData = {
  id: string;
  horario_atend: string;
  status: string;
  statusUrgencia: string;
  tipo: string;
  motivo?: string;
  paciente: { id: string; nome: string; cpf: string; fone: string; };
  medico: { userId: string; crm: string; especialidade: string; user: { nome: string } };
}

const statusColors: Record<string, string> = {
  AGENDADO: "bg-blue-100 text-blue-600",
  CONFIRMADO: "bg-green-100 text-green-600",
  CANCELADO: "bg-red-100 text-red-600",
  FINALIZADO: "bg-zinc-100 text-zinc-600",
};

const urgenciaColors: Record<string, string> = {
  URGENTE: "bg-red-100 text-red-600",
  MODERADO: "bg-yellow-100 text-yellow-600",
  BAIXO: "bg-green-100 text-green-600",
};

export default function Agendamentos() {

  const [openAgend, setOpenAgend] = useState(false);
  const pageName = "Agendamentos";
  const vh = useViewportHeight();
  const { user, loading } = useUserStore();

  const [current, setCurrent] = useState(1);
  const [busca, setBusca] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [inputStatus, setInputStatus] = useState("TODOS");
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

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <main style={{ height: vh }} className="w-full flex flex-col">

      <Header user={user} current={pageName} />

      <section className="flex-1 w-full p-1 md:p-2 overflow-hidden">
        <section className="w-full h-full px-4 pt-4 pb-2 bg-zinc-300/50 overflow-y-auto rounded-sm md:shadow-[0px_0px_4px_#00000060]">

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
                setStatus(inputStatus === "TODOS" ? "" : inputStatus);
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
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="AGENDADO">Agendado</SelectItem>
                      <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                      <SelectItem value="FINALIZADO">Finalizado</SelectItem>
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
                <span className="text-sm text-zinc-800/50">{agendaData?.length ?? 0} agendamento(s) encontrado(s)</span>
              </div>

              {agendaLoading ? (
                <span className="text-sm text-zinc-400">Carregando...</span>
              ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {agendaData && agendaData.length > 0 ? agendaData.map((agenda: AgendaData) => (
                    <Card key={agenda.id} className="w-full shadow-md hover:shadow-lg transition">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Avatar>
                            <AvatarFallback>{agenda.paciente.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{agenda.paciente.nome}</span>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[agenda.status]}`}>
                            {agenda.status}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgenciaColors[agenda.statusUrgencia]}`}>
                            {agenda.statusUrgencia}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{new Date(agenda.horario_atend).toLocaleString("pt-BR", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <StethoscopeIcon className="w-3 h-3" />
                          <span className="truncate">{agenda.medico.user.nome}</span>
                        </div>

                        {agenda.motivo && (
                          <div className="flex justify-between">
                            <span className="font-medium text-foreground">Motivo:</span>
                            <span className="truncate max-w-[60%]">{agenda.motivo}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-4 flex justify-center items-center py-8">
                      <span className="text-sm text-zinc-700/50">Nenhum agendamento encontrado</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-row w-full gap-3 items-center justify-center">
                <Button disabled={!hasPreviousPage} onClick={() => setCurrent(current - 1)}>
                  Página Anterior
                </Button>
                <Button className="bg-blue-600 font-bold text-white" disabled={!hasNextPage} onClick={() => setCurrent(current + 1)}>
                  Próxima página
                </Button>
              </div>
            </Card>

          </section>

          <Modal size="xl" isOpen={openAgend} onClose={handleCloseAgend} title="Novo agendamento">
            <AgendamentoForm onSuccess={() => { handleCloseAgend(); mutate(); }} userId={user.id} />
          </Modal>

        </section>
      </section>

    </main>
  );
}