import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { AppError } from "../errors/AppError.js";
import { PacienteRepository } from "../repositories/paciente.repository.js";

type PacienteComAgendas = NonNullable<Awaited<ReturnType<PacienteRepository["findById"]>>>;
type AgendaItem = PacienteComAgendas["agendas"][number];

type ConsultaDetalhada = {
  id: string;
  atendimento: string;
  medico: string;
  medicoCrm: string;
  medicoEspecialidade: string;
  data: string;
  hora: string;
  status: string;
  statusVariant: string;
  motivo: string;
  statusUrgencia: string;
  observacoes: string;
  tipo: string;
  duracaoMin: number | null;
};

type PacienteDetalhado = {
  id: string;
  nomeCompleto: string;
  cpf: string;
  fone: string | null;
  nascimento: Date | null;
  email: string | null;
  cartaoSus: string | null;
  sexo: string;
};

export type PacienteConsultasResult = {
  paciente: PacienteDetalhado;
  consultas: ConsultaDetalhada[];
};

const tipoLabels: Record<string, string> = {
  CONSULTA: "Consulta",
  EXAME: "Exame",
  PROCEDIMENTO: "Procedimento",
  RETORNO: "Retorno",
};

const statusLabels: Record<string, { label: string; variant: string }> = {
  AGENDADO: { label: "Pendente", variant: "yellow" },
  CANCELADO: { label: "Cancelado", variant: "red" },
  FINALIZADO: { label: "Finalizado", variant: "green" },
};

const urgenciaLabels: Record<string, string> = {
  URGENTE: "Urgente",
  MODERADO: "Moderado",
  BAIXO: "Baixo",
};

const sexoLabels: Record<string, string> = {
  MASCULINO: "Masculino",
  FEMININO: "Feminino",
  OUTRO: "Outro",
};

function mapAgenda(agenda: AgendaItem): ConsultaDetalhada {
  const dataObj = typeof agenda.horario_atend === "string" ? parseISO(agenda.horario_atend) : agenda.horario_atend;
  const statusInfo = statusLabels[agenda.status as string] || { label: agenda.status, variant: "gray" };

  return {
    id: agenda.id,
    atendimento: tipoLabels[agenda.tipo as string] || agenda.tipo,
    medico: agenda.medico?.user?.nome || "Médico não informado",
    medicoCrm: agenda.medico?.crm || "",
    medicoEspecialidade: agenda.medico?.especialidade || "",
    data: format(dataObj, "dd/MM/yyyy", { locale: ptBR }),
    hora: format(dataObj, "HH:mm", { locale: ptBR }),
    status: statusInfo.label,
    statusVariant: statusInfo.variant,
    motivo: agenda.motivo || "",
    statusUrgencia: urgenciaLabels[agenda.statusUrgencia as string] || agenda.statusUrgencia,
    observacoes: agenda.observacoes || "",
    tipo: tipoLabels[agenda.tipo as string] || agenda.tipo,
    duracaoMin: agenda.duracaoMin,
  };
}

export class PacienteConsultasService {
  private pacienteRepository = new PacienteRepository();

  async execute(patientId: string): Promise<PacienteConsultasResult> {
    const paciente = await this.pacienteRepository.findById(patientId);

    if (!paciente) {
      throw new AppError("Sessão inválida", 401);
    }

    return {
      paciente: {
        id: paciente.id,
        nomeCompleto: paciente.nome,
        cpf: paciente.cpf,
        fone: paciente.fone,
        nascimento: paciente.nascimento,
        email: paciente.email,
        cartaoSus: paciente.cartaoSus,
        sexo: sexoLabels[paciente.sexo as string] || paciente.sexo,
      },
      consultas: paciente.agendas?.map(mapAgenda) || [],
    };
  }
}

