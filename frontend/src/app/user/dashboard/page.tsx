"use client";

import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/LoadingScreen";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  Users,
  CalendarDays,
  Stethoscope,
  AlertCircle,
  TrendingUp,
  ClipboardCheck,
  PlusIcon,
  UserPlus,
  CalendarPlus,
  ArrowRight,
  Clock,
} from "lucide-react";

function getSaudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Dashboard() {
  const router = useRouter();

  const { user, loading } = useUserStore();
  const {
    data,
    isLoading,
  } = useDashboardStats();

  const general = data?.general;
  const medicoStats = data?.medicoStats;
  const agendamentosHoje = data?.agendamentosHoje ?? [];
  const medicosHoje = data?.medicosHoje ?? [];

  if (loading || !user || isLoading) return <LoadingScreen />;

  const ultimoNome = user.nome.trim().split(/\s+/).at(-1) ?? "";
  const primeiroNome = user.nome.split(" ")[0];
  const saudacao = getSaudacao();

  const isAdmin = user.role === "ADMIN";
  const isAtendente = user.role === "ATENDENTE";
  const isMedico = user.role === "MEDICO";

  return (
    <>
      <div className="ml-1">
        <span className="text-sm text-zinc-800 font-semibold">
          {saudacao}, {primeiroNome} {ultimoNome}!
        </span>
        <p className="text-xs text-zinc-600 mt-0.5">
          Bem-vindo de volta ao MedFlow.
        </p>
      </div>

      <Carousel className="w-full mt-4">
        <CarouselContent className="-ml-4">
          <CarouselItem className="pl-4 basis-2/3 md:basis-1/4 lg:basis-1/6">
            <StatCard
              icon={<Users className="w-5 h-5 text-blue-600" />}
              title="Total de Pacientes"
              value={general?.totalPacientes ?? 0}
              subtitle={`${general?.pacientesUrgentes ?? 0} marcados como urgência`}
            />
          </CarouselItem>

          <CarouselItem className="pl-4 basis-2/3 md:basis-1/4 lg:basis-1/6">
            <StatCard
              icon={<CalendarDays className="w-5 h-5 text-green-600" />}
              title="Agendamentos Hoje"
              value={general?.agendamentosHoje ?? 0}
              subtitle={`${general?.agendamentosTotal ?? 0} no total`}
            />
          </CarouselItem>

          <CarouselItem className="pl-4 basis-2/3 md:basis-1/4 lg:basis-1/6">
            <StatCard
              icon={<AlertCircle className="w-5 h-5 text-red-600" />}
              title="Agendamentos Urgentes"
              value={general?.agendamentosUrgentes ?? 0}
              subtitle="Pendentes de atendimento"
            />
          </CarouselItem>

          {isAdmin && (
            <CarouselItem className="pl-4 basis-2/3 md:basis-1/4 lg:basis-1/6">
              <StatCard
                icon={<Stethoscope className="w-5 h-5 text-purple-600" />}
                title="Profissionais Ativos"
                value={general?.profissionaisAtivos ?? 0}
                subtitle={`${general?.totalMedicos ?? 0} médicos · ${general?.totalAtendentes ?? 0} atendentes`}
              />
            </CarouselItem>
          )}

          {isAdmin && (
            <CarouselItem className="pl-4 basis-2/3 md:basis-1/4 lg:basis-1/6">
              <StatCard
                icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
                title="Taxa de Conclusão"
                value={`${general?.taxaConclusao ?? 0}%`}
                subtitle={`${general?.finalizadosMes ?? 0} finalizados este mês`}
              />
            </CarouselItem>
          )}

          {isMedico && (
            <CarouselItem className="pl-4 basis-2/3 md:basis-1/4 lg:basis-1/6">
              <StatCard
                icon={<CalendarDays className="w-5 h-5 text-blue-600" />}
                title="Minhas Consultas Hoje"
                value={medicoStats?.hojeCount ?? 0}
                subtitle={`${medicoStats?.prox7Dias ?? 0} nos próximos 7 dias`}
              />
            </CarouselItem>
          )}

          {isMedico && (
            <CarouselItem className="pl-4 basis-2/3 md:basis-1/4 lg:basis-1/6">
              <StatCard
                icon={<ClipboardCheck className="w-5 h-5 text-emerald-600" />}
                title="Atendidos no Mês"
                value={medicoStats?.atendidosMes ?? 0}
                subtitle="Consultas finalizadas"
              />
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>

      <section className="w-full mt-6">
        <h2 className="text-md font-bold text-zinc-700 ml-1 mb-2">Atalhos rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {(isAdmin || isAtendente) && (
            <QuickAction
              icon={<CalendarPlus className="w-5 h-5" />}
              label="Novo Agendamento"
              onClick={() => router.push("/user/agendamentos")}
            />
          )}
          {(isAdmin || isAtendente) && (
            <QuickAction
              icon={<UserPlus className="w-5 h-5" />}
              label="Novo Paciente"
              onClick={() => router.push("/user/pacientes")}
            />
          )}
          {isAdmin && (
            <QuickAction
              icon={<Stethoscope className="w-5 h-5" />}
              label="Novo Profissional"
              onClick={() => router.push("/user/profissionais")}
            />
          )}
          {isMedico && (
            <QuickAction
              icon={<CalendarDays className="w-5 h-5" />}
              label="Meus Agendamentos"
              onClick={() => router.push("/user/meusAgendamentos")}
            />
          )}
        </div>
      </section>

      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 mb-4">
        <Card className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-700">Agendamentos</h2>
              <p className="text-xs text-zinc-500">
                {isMedico ? "Suas consultas de hoje" : "Consultas programadas para hoje"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(isMedico ? "/user/meusAgendamentos" : "/user/agendamentos")
              }
              className="text-xs"
            >
              Ver todos <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          {agendamentosHoje.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
              <CalendarDays className="w-10 h-10 mb-2" />
              <span className="text-sm">Nenhum agendamento programado para hoje</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {agendamentosHoje.map((ag: any) => (
                <div
                  key={ag.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-100 transition cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center w-12 text-center bg-blue-50 text-blue-600 rounded-md py-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-bold">
                      {new Date(ag.horario_atend).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 truncate">
                      {ag.paciente.nome}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {isMedico
                        ? ag.paciente.fone
                        : `Dr(a). ${ag.medico.user.nome} · ${ag.medico.especialidade}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      ag.statusUrgencia === "URGENTE"
                        ? "bg-red-100 text-red-600"
                        : ag.statusUrgencia === "MODERADO"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {ag.statusUrgencia}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-700">Médicos disponíveis hoje</h2>
              <p className="text-xs text-zinc-500">
                Profissionais com horários para atendimento
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/user/profissionais")}
              className="text-xs"
            >
              Ver todos <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          {medicosHoje.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
              <Stethoscope className="w-10 h-10 mb-2" />
              <span className="text-sm">Nenhum médico disponível hoje</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {medicosHoje.map((med: any) => (
                <div
                  key={med.userId}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-100 transition"
                >
                  <Avatar>
                    <AvatarImage src={med.user.avatar ?? "/images/avatar-1.png"} />
                    <AvatarFallback>{med.user.nome.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 truncate">
                      {med.user.nome}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {med.especialidade} ·{" "}
                      {med.disponibilidades?.[0]?.horaInicio ?? "--:--"} às{" "}
                      {med.disponibilidades?.[0]?.horaFim ?? "--:--"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <Card className="flex flex-col items-start justify-start gap-1 p-3 h-full">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-zinc-900 text-sm font-roboto font-medium">{title}</span>
      </div>
      <h1 className="text-4xl text-zinc-800/70 font-roboto">{value}</h1>
      <span className="text-xs text-zinc-700/60 font-roboto font-medium mt-3">
        {subtitle}
      </span>
    </Card>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-3 bg-white hover:bg-blue-50 border border-zinc-200 rounded-md transition cursor-pointer text-left"
    >
      <div className="p-2 bg-blue-100 text-blue-600 rounded-md">{icon}</div>
      <span className="text-sm font-medium text-zinc-700">{label}</span>
    </button>
  );
}