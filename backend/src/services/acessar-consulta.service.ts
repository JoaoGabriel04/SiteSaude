import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { PacienteRepository } from '../repositories/paciente.repository.js';
import { AppError } from '../errors/AppError.js';
import { AcessarConsultaInput } from '../schemas/AcessarConsultaSchema.js';

type PacienteComAgendas = NonNullable<Awaited<ReturnType<PacienteRepository["findByCpf"]>>>;
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

type AcessarConsultaResult = {
  paciente: PacienteDetalhado;
  consultas: ConsultaDetalhada[];
};

const tipoLabels: Record<string, string> = {
    CONSULTA: 'Consulta',
    EXAME: 'Exame',
    PROCEDIMENTO: 'Procedimento',
    RETORNO: 'Retorno',
};

const statusLabels: Record<string, { label: string; variant: string }> = {
    AGENDADO: { label: 'Pendente', variant: 'yellow' },
    CANCELADO: { label: 'Cancelado', variant: 'red' },
    FINALIZADO: { label: 'Finalizado', variant: 'green' },
};

const urgenciaLabels: Record<string, string> = {
    URGENTE: 'Urgente',
    MODERADO: 'Moderado',
    BAIXO: 'Baixo',
};

const sexoLabels: Record<string, string> = {
    MASCULINO: 'Masculino',
    FEMININO: 'Feminino',
    OUTRO: 'Outro',
};

export class AcessarConsultaService {
    private pacienteRepository = new PacienteRepository();

    async execute({ nomeCompleto, cpf }: AcessarConsultaInput): Promise<AcessarConsultaResult> {
        const cpfLimpo = cpf.replace(/\D/g, '');

        const paciente = await this.pacienteRepository.findByCpf(cpfLimpo);

        if (!paciente) {
            throw new AppError("Paciente não encontrado. Verifique o CPF informado.", 404);
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
            consultas: paciente.agendas?.map((agenda) => {
                const dataObj = typeof agenda.horario_atend === 'string'
                    ? parseISO(agenda.horario_atend)
                    : agenda.horario_atend;

                const statusInfo = statusLabels[agenda.status as string] || { label: agenda.status, variant: 'gray' };

                return {
                    id: agenda.id,
                    atendimento: tipoLabels[agenda.tipo as string] || agenda.tipo,
                    medico: agenda.medico?.user?.nome || "Médico não informado",
                    medicoCrm: agenda.medico?.crm || "",
                    medicoEspecialidade: agenda.medico?.especialidade || "",
                    data: format(dataObj, 'dd/MM/yyyy', { locale: ptBR }),
                    hora: format(dataObj, 'HH:mm', { locale: ptBR }),
                    status: statusInfo.label,
                    statusVariant: statusInfo.variant,
                    motivo: agenda.motivo || "",
                    statusUrgencia: urgenciaLabels[agenda.statusUrgencia as string] || agenda.statusUrgencia,
                    observacoes: agenda.observacoes || "",
                    tipo: tipoLabels[agenda.tipo as string] || agenda.tipo,
                    duracaoMin: agenda.duracaoMin,
                };
            }) || []
        };
    }
}