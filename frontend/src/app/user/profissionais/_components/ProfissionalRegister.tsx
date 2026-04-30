'use client'
import { InputField } from "@/components/inputField";
import Subtitle from "@/components/Subtitle";
import { Button } from "@/components/ui/button";
import { regFormMedico, RegisterFormMedico } from "@/schemas/registerMedico";
import api from "@/services/api";
import { toast } from "@/toast/toastManager";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Role } from "@/types/user";
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, CheckCircle, ChevronRight, User, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

type MedicoRegProps = {
  onSubmit: () => void;
}

const DIAS = [
  { label: "D", value: 0, nome: "Domingo" },
  { label: "S", value: 1, nome: "Segunda" },
  { label: "T", value: 2, nome: "Terça" },
  { label: "Q", value: 3, nome: "Quarta" },
  { label: "Q", value: 4, nome: "Quinta" },
  { label: "S", value: 5, nome: "Sexta" },
  { label: "S", value: 6, nome: "Sábado" },
];

type Disponibilidade = {
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  almocoInicio: string;
  almocoFim: string;
}

export default function ProfissionalRegister({ onSubmit }: MedicoRegProps) {

  const [etapa, setEtapa] = useState(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado do médico registrado (após etapa 1)
  const [medicoId, setMedicoId] = useState<string | null>(null);

  // Estado da disponibilidade
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([]);
  const [horaInicio, setHoraInicio] = useState("07:00");
  const [horaFim, setHoraFim] = useState("18:00");
  const [almocoInicio, setAlmocoInicio] = useState("12:00");
  const [almocoFim, setAlmocoFim] = useState("14:00");

  const form = useForm<RegisterFormMedico>({
    resolver: zodResolver(regFormMedico),
  });

  const { isSubmitting } = form.formState;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar(file: File): Promise<string | null> {
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.post("http://localhost:7000/api/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data.url;
    } catch {
      toast.error("Erro ao fazer upload da imagem");
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  }

  function toggleDia(dia: number) {
    setDiasSelecionados(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  }

  async function registerProfissional(data: RegisterFormMedico) {
    try {
      let avatarUrl: string | null = null;

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
        if (!avatarUrl) return;
      }

      const { confirmPassword, ...payload } = data;
      const newData = {
        ...payload,
        role: Role.MEDICO,
        ...(avatarUrl && { avatar: avatarUrl })
      };

      const res = await api.post("http://localhost:7000/api/auth/registerU", newData);
      setMedicoId(res.data.user.id);
      setEtapa(2);

    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Erro ao cadastrar médico";
      toast.error(message);
    }
  }

  async function registrarDisponibilidade() {
    if (diasSelecionados.length === 0) {
      toast.error("Selecione pelo menos um dia de atendimento");
      return;
    }

    try {
      setIsSubmittingFinal(true);

      await Promise.all(diasSelecionados.map(dia =>
        api.post("http://localhost:7000/api/medico/disponibilidade", {
          docId: medicoId,
          diaSemana: dia,
          horaInicio,
          horaFim,
          almocoInicio,
          almocoFim,
        })
      ));

      toast.success("Médico cadastrado com sucesso!");
      onSubmit();
    } catch (error: any) {
      const message = error?.response?.data?.error ?? "Erro ao cadastrar médico";
      toast.error(message);
    } finally {
      setIsSubmittingFinal(false);
    }
  }

  const etapas = [
    { num: 1, label: "Dados do Médico", icon: User },
    { num: 2, label: "Disponibilidade", icon: Clock },
  ];

  return (
    <main className="w-full">
      <Subtitle>Cadastre um novo Profissional</Subtitle>

      <div className="w-full h-10 flex justify-center items-center">
        <hr className="w-[calc(100%-4px)]" />
      </div>

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

      {/* ETAPA 1 - Dados do médico */}
      {etapa === 1 && (
        <form onSubmit={form.handleSubmit(registerProfissional)} className="w-full">

          {/* Avatar */}
          <div className="w-full flex justify-center mb-4">
            <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview ?? ""} />
                <AvatarFallback className="text-2xl bg-zinc-100">
                  <Camera className="w-6 h-6 text-zinc-400" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <InputField
            id="nome"
            type="text"
            placeholder="Digite seu nome completo"
            label="Nome Completo *"
            register={form.register("nome")}
            errorInvalid={form.formState.errors.nome !== undefined}
            errorMessage={form.formState.errors.nome?.message}
          />
          <InputField
            id="email"
            type="email"
            placeholder="Digite seu email"
            label="Email *"
            register={form.register("email")}
            errorInvalid={form.formState.errors.email !== undefined}
            errorMessage={form.formState.errors.email?.message}
          />
          <div className="w-full grid grid-cols-2 gap-2">
            <InputField
              id="password"
              type="password"
              placeholder="Senha"
              label="Senha *"
              className="w-full"
              register={form.register("password")}
              errorInvalid={form.formState.errors.password !== undefined}
              errorMessage={form.formState.errors.password?.message}
            />
            <InputField
              id="confirmPassword"
              type="password"
              placeholder="Confirmar Senha"
              label="Confirmar Senha *"
              className="w-full"
              register={form.register("confirmPassword")}
              errorInvalid={form.formState.errors.confirmPassword !== undefined}
              errorMessage={form.formState.errors.confirmPassword?.message}
            />
          </div>

          <InputField
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            label="CPF *"
            className="w-full"
            mask="cpf"
            register={form.register("cpf")}
            errorInvalid={form.formState.errors.cpf !== undefined}
            errorMessage={form.formState.errors.cpf?.message}
          />
          <InputField
            id="nascimento"
            type="date"
            placeholder="01/01/2000"
            label="Data de Nascimento *"
            className="w-full"
            register={form.register("nascimento")}
            errorInvalid={form.formState.errors.nascimento !== undefined}
            errorMessage={form.formState.errors.nascimento?.message}
          />
          <InputField
            id="fone"
            type="tel"
            placeholder="(00) 00000-0000"
            label="Telefone *"
            className="w-full"
            mask="phone"
            register={form.register("fone")}
            errorInvalid={form.formState.errors.fone !== undefined}
            errorMessage={form.formState.errors.fone?.message}
          />

          <div className="w-full grid grid-cols-2 gap-2">
            <InputField
              id="crm"
              type="text"
              placeholder="XXX-YY 000000"
              label="CRM *"
              className="w-full"
              register={form.register("crm")}
              errorInvalid={form.formState.errors.crm !== undefined}
              errorMessage={form.formState.errors.crm?.message}
            />
            <InputField
              id="especialidade"
              type="text"
              placeholder="Diga a especialidade"
              label="Especialidade *"
              className="w-full"
              register={form.register("especialidade")}
              errorInvalid={form.formState.errors.especialidade !== undefined}
              errorMessage={form.formState.errors.especialidade?.message}
            />
          </div>

          <div className="w-full flex justify-end mt-4">
            <Button
              type="submit"
              disabled={isSubmitting || uploadingAvatar}
              className="cursor-pointer"
            >
              {uploadingAvatar ? "Enviando imagem..." : isSubmitting ? "Cadastrando..." : "Próximo"}
            </Button>
          </div>
        </form>
      )}

      {/* ETAPA 2 - Disponibilidade */}
      {etapa === 2 && (
        <div className="w-full flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-700">Dias de atendimento</h2>
            <span className="text-sm text-zinc-400">Selecione os dias que o médico atende</span>
          </div>

          {/* Seletor de dias */}
          <div className="flex gap-2 justify-center">
            {DIAS.map((dia) => (
              <button
                key={dia.value}
                type="button"
                onClick={() => toggleDia(dia.value)}
                title={dia.nome}
                className={`w-9 h-9 rounded-full text-sm font-bold transition cursor-pointer border
                  ${diasSelecionados.includes(dia.value)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-blue-400"}`}
              >
                {dia.label}
              </button>
            ))}
          </div>

          {/* Horários */}
          <Card className="p-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-zinc-700">Horários</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 font-medium">Entrada</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 font-medium">Saída</label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 font-medium">Início do Almoço</label>
                <input
                  type="time"
                  value={almocoInicio}
                  onChange={(e) => setAlmocoInicio(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 font-medium">Fim do Almoço</label>
                <input
                  type="time"
                  value={almocoFim}
                  onChange={(e) => setAlmocoFim(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </Card>

          <div className="w-full flex justify-end mt-2">
            <Button
              type="button"
              disabled={isSubmittingFinal || diasSelecionados.length === 0}
              className="cursor-pointer"
              onClick={registrarDisponibilidade}
            >
              {isSubmittingFinal ? "Cadastrando..." : "Confirmar cadastro"}
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}