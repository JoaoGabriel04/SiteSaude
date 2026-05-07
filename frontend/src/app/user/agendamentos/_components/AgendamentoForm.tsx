'use client'

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/inputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { toast } from "@/toast/toastManager";
import api from "@/services/api";
import { useViewPacientes } from "@/hooks/useViewPacientes";
import { useBuscarMedicos } from "@/hooks/useBuscarMedicos";
import { useSlotsDisponiveis } from "@/hooks/useSlotsDisponiveis";
import { CheckCircle, ChevronRight, Clock, User, Stethoscope, ClipboardList } from "lucide-react";

const agendamentoSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  docId: z.string().min(1, "Selecione um médico"),
  data: z.string().min(1, "Selecione uma data"),
  horario: z.string().min(1, "Selecione um horário"),
  tipo: z.enum(["CONSULTA", "EXAME", "PROCEDIMENTO", "RETORNO"], { error: "Selecione o tipo" }),
  statusUrgencia: z.enum(["URGENTE", "MODERADO", "BAIXO"], { error: "Selecione a urgência" }),
  motivo: z.string().optional(),
  observacoes: z.string().optional(),
});

type AgendamentoForm = z.input<typeof agendamentoSchema>;

type PacienteData = {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  fone: string;
}

type MedicoData = {
  id: string;
  nome: string;
  medico: {
    crm: string;
    especialidade: string;
  }
}

type AgendamentoFormProps = {
  onSuccess: () => void;
  userId: string;
}

export default function AgendamentoForm({ onSuccess, userId }: AgendamentoFormProps) {

  const [etapa, setEtapa] = useState(1);
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [inputBusca, setInputBusca] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<PacienteData | null>(null);
  const [medicoSelecionado, setMedicoSelecionado] = useState<MedicoData | null>(null);

  const form = useForm<AgendamentoForm>({
    resolver: zodResolver(agendamentoSchema),
  });

  const { isSubmitting } = form.formState;
  const dataWatch = form.watch("data");
  const docIdWatch = form.watch("docId");

  const { data: pacienteData, isLoading: pacienteLoading } = useViewPacientes({ busca: buscaPaciente });
  const { medicos, isLoading: medicoLoading } = useBuscarMedicos();
  const { slots, isLoading: slotsLoading, error: slotsError } = useSlotsDisponiveis({
    docId: docIdWatch,
    data: dataWatch
  });

  async function onSubmit(data: AgendamentoForm) {
    try {
      const [ano, mes, dia] = data.data.split("-").map(Number);
      const [hora, minuto] = data.horario.split(":").map(Number);
      const horario_atend = new Date(ano, mes - 1, dia, hora, minuto);

      await api.post("/api/atendente/agendamento", {
        patientId: data.patientId,
        docId: data.docId,
        horario_atend,
        tipo: data.tipo,
        statusUrgencia: data.statusUrgencia,
        motivo: data.motivo,
        observacoes: data.observacoes,
        createdById: userId,
      });

      toast.success("Agendamento criado com sucesso!");
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Erro ao criar agendamento";
      toast.error(message);
    }
  }

  // Indicador de etapas
  const etapas = [
    { num: 1, label: "Paciente", icon: User },
    { num: 2, label: "Médico e Data", icon: Stethoscope },
    { num: 3, label: "Detalhes", icon: ClipboardList },
  ];

  return (
    <main className="w-full">

      {/* Indicador de etapas */}
      <div className="w-full flex items-center justify-center gap-2 mb-6">
        {etapas.map((e, i) => {
          const Icon = e.icon;
          const ativa = etapa === e.num;
          const concluida = etapa > e.num;
          return (
            <div key={e.num} className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all
                ${concluida ? "bg-green-100 text-green-600" : ativa ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-400"}`}>
                {concluida ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                {e.label}
              </div>
              {i < etapas.length - 1 && <ChevronRight className="w-4 h-4 text-zinc-300" />}
            </div>
          );
        })}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">

        {/* ETAPA 1 - Paciente */}
        {etapa === 1 && (
          <div className="w-full flex flex-col gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-700">Buscar paciente</h2>
              <span className="text-sm text-zinc-400">Busque pelo nome ou CPF</span>
            </div>

            <div className="flex items-center gap-2">
              <InputField
                id="busca-paciente"
                type="search"
                label=""
                placeholder="Nome ou CPF..."
                className="flex-1"
                value={inputBusca}
                onChange={(e) => setInputBusca(e.target.value)}
              />
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                onClick={() => setBuscaPaciente(inputBusca)}
              >
                Buscar
              </Button>
            </div>

            {pacienteLoading && <span className="text-sm text-zinc-400">Buscando...</span>}

            {pacienteData && pacienteData.length > 0 && (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {pacienteData.map((p: PacienteData) => (
                  <Card
                    key={p.id}
                    onClick={() => {
                      setPacienteSelecionado(p);
                      form.setValue("patientId", p.id);
                    }}
                    className={`p-3 cursor-pointer transition hover:shadow-md flex items-center gap-3
                      ${pacienteSelecionado?.id === p.id ? "border-blue-500 border-2 bg-blue-50" : ""}`}
                  >
                    <Avatar>
                      <AvatarFallback>{p.nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-700">{p.nome}</span>
                      <span className="text-xs text-zinc-400">CPF: {p.cpf}</span>
                    </div>
                    {pacienteSelecionado?.id === p.id && (
                      <CheckCircle className="w-4 h-4 text-blue-500 ml-auto" />
                    )}
                  </Card>
                ))}
              </div>
            )}

            {pacienteData && pacienteData.length === 0 && buscaPaciente && (
              <span className="text-sm text-zinc-400">Nenhum paciente encontrado.</span>
            )}

            <div className="flex justify-end mt-2">
              <Button
                type="button"
                disabled={!pacienteSelecionado}
                className="cursor-pointer"
                onClick={() => setEtapa(2)}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* ETAPA 2 - Médico e Data */}
        {etapa === 2 && (
          <div className="w-full flex flex-col gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-700">Médico e data</h2>
              <span className="text-sm text-zinc-400">Selecione o médico e a data do atendimento</span>
            </div>

            {/* Paciente selecionado */}
            <Card className="p-3 bg-blue-50 border-blue-200 flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{pacienteSelecionado?.nome.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-zinc-700">{pacienteSelecionado?.nome}</span>
                <span className="text-xs text-zinc-400">CPF: {pacienteSelecionado?.cpf}</span>
              </div>
            </Card>

            {/* Select médico */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Médico *</label>
              <Controller
                control={form.control}
                name="docId"
                render={({ field }) => (
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    const med = medicos.find((m: any) => m.id === value);
                    setMedicoSelecionado(med ?? null);
                    form.setValue("horario", "");
                  }} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o médico" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicos.map((m: any) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nome} — {m.medico?.especialidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.docId && (
                <span className="text-red-500 text-xs">{form.formState.errors.docId.message}</span>
              )}
            </div>

            {/* Data */}
            <InputField
              id="data"
              type="date"
              label="Data do atendimento *"
              register={form.register("data")}
              errorInvalid={form.formState.errors.data !== undefined}
              errorMessage={form.formState.errors.data?.message}
            />

            {/* Slots */}
            {docIdWatch && dataWatch && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Horário disponível *</label>

                {slotsLoading && <span className="text-sm text-zinc-400">Buscando horários...</span>}

                {slotsError && (
                  <span className="text-sm text-red-400">
                    {slotsError?.response?.data?.error ?? "Médico não atende nesse dia"}
                  </span>
                )}

                {!slotsLoading && !slotsError && slots.length > 0 && (
                  <Controller
                    control={form.control}
                    name="horario"
                    render={({ field }) => (
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map((slot: string) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => field.onChange(slot)}
                            className={`flex items-center justify-center gap-1 py-2 rounded-md border text-sm font-medium transition cursor-pointer
                              ${field.value === slot
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-zinc-700 border-zinc-200 hover:border-blue-400"}`}
                          >
                            <Clock className="w-3 h-3" />
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                )}

                {!slotsLoading && !slotsError && slots.length === 0 && (
                  <span className="text-sm text-zinc-400">Nenhum horário disponível nesse dia.</span>
                )}

                {form.formState.errors.horario && (
                  <span className="text-red-500 text-xs">{form.formState.errors.horario.message}</span>
                )}
              </div>
            )}

            <div className="flex justify-between mt-2">
              <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setEtapa(1)}>
                Voltar
              </Button>
              <Button
                type="button"
                disabled={!docIdWatch || !dataWatch || !form.watch("horario")}
                className="cursor-pointer"
                onClick={() => setEtapa(3)}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* ETAPA 3 - Detalhes */}
        {etapa === 3 && (
          <div className="w-full flex flex-col gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-700">Detalhes do agendamento</h2>
              <span className="text-sm text-zinc-400">Preencha as informações do atendimento</span>
            </div>

            {/* Resumo */}
            <Card className="p-3 bg-zinc-50 flex flex-col gap-1 text-sm text-zinc-600">
              <span><strong>Paciente:</strong> {pacienteSelecionado?.nome}</span>
              <span><strong>Médico:</strong> {medicoSelecionado?.nome}</span>
              <span><strong>Data:</strong> {new Date(dataWatch + "T00:00:00").toLocaleDateString("pt-BR")}</span>
              <span><strong>Horário:</strong> {form.watch("horario")}</span>
            </Card>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Tipo *</label>
                <Controller
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONSULTA">Consulta</SelectItem>
                        <SelectItem value="EXAME">Exame</SelectItem>
                        <SelectItem value="PROCEDIMENTO">Procedimento</SelectItem>
                        <SelectItem value="RETORNO">Retorno</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.tipo && (
                  <span className="text-red-500 text-xs">{form.formState.errors.tipo.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Urgência *</label>
                <Controller
                  control={form.control}
                  name="statusUrgencia"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a urgência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="URGENTE">Urgente</SelectItem>
                        <SelectItem value="MODERADO">Moderado</SelectItem>
                        <SelectItem value="BAIXO">Baixo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.statusUrgencia && (
                  <span className="text-red-500 text-xs">{form.formState.errors.statusUrgencia.message}</span>
                )}
              </div>
            </div>

            <InputField
              id="motivo"
              type="text"
              label="Motivo *"
              placeholder="Motivo da consulta..."
              register={form.register("motivo")}
              errorInvalid={false}
            />

            <InputField
              id="observacoes"
              type="text"
              label="Observações"
              placeholder="Observações adicionais..."
              register={form.register("observacoes")}
              errorInvalid={false}
            />

            <div className="flex justify-between mt-2">
              <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setEtapa(2)}>
                Voltar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? "Agendando..." : "Confirmar agendamento"}
              </Button>
            </div>
          </div>
        )}

      </form>
    </main>
  );
}