'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, Loader2, User, Phone, CalendarDays, Mail, CreditCard, Info, AlertTriangle, FileText, Stethoscope, Timer } from 'lucide-react';
import Modal from "@/components/Modal";

type Consulta = {
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
  duracaoMin: number;
};

type PacienteInfo = {
  id: string;
  nomeCompleto: string;
  cpf: string;
  fone: string;
  nascimento: string;
  email: string | null;
  cartaoSus: string;
  sexo: string;
};

type DadosPaciente = {
  paciente: PacienteInfo;
  consultas: Consulta[];
};

const statusColors: Record<string, string> = {
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
};

const urgenciaColors: Record<string, string> = {
  'Urgente': 'bg-red-100 text-red-700 border-red-200',
  'Moderado': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Baixo': 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const STORAGE_KEY = 'pacienteConsultas';
const SESSION_MAX_AGE = 30 * 60 * 1000; // 30 minutos

function PaginaConsulta() {
  const router = useRouter();
  const [dados, setDados] = useState<DadosPaciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem('consultVerified');
    if (!verified) {
      notFound();
      return;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      notFound();
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.paciente || !parsed.paciente.nomeCompleto || !parsed.paciente.cpf) {
        localStorage.removeItem(STORAGE_KEY);
        notFound();
        return;
      }
      setDados(parsed as DadosPaciente);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      notFound();
    } finally {
      setLoading(false);
    }
  }, []);

  function handleOpenModal(consulta: Consulta) {
    setSelectedConsulta(consulta);
    setOpenModal(true);
  }
  function handleCloseModal() {
    setOpenModal(false);
    setSelectedConsulta(null);
  }

  function formatarFone(fone: string): string {
    const nums = fone.replace(/\D/g, '');
    if (nums.length === 11) {
      const ddd = nums.slice(0, 2);
      const p1 = nums.slice(2, 7);
      const p2 = nums.slice(7);
      return "(" + ddd + ") " + p1 + "-" + p2;
    }
    if (nums.length === 10) {
      const ddd = nums.slice(0, 2);
      const p1 = nums.slice(2, 6);
      const p2 = nums.slice(6);
      return "(" + ddd + ") " + p1 + "-" + p2;
    }
    return fone;
  }

  function formatarNascimento(data: string): string {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  function formatarCpf(cpf: string): string {
    const nums = cpf.replace(/\D/g, '');
    if (nums.length === 11) {
      return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
    }
    return cpf;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!dados) return null;

  const { paciente, consultas } = dados;

  return (
    <div className="min-h-screen bg-[#E5E7EB] flex flex-col">

      <header className="bg-white h-16 flex items-center justify-between px-6 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo-maior.png"
            alt="Logo Medflow"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="font-bold text-xl text-gray-800 tracking-tight">Medflow</span>
        </div>

        <Link href="/consult-acess" className="flex items-center gap-2 text-gray-500 hover:text-blue-500 font-medium transition-colors">
          <ArrowLeft size={18} />
          <span>Nova consulta</span>
        </Link>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Consultas Agendadas</h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Visualização Geral</p>
        </div>

        {/* Card do paciente - informações mais completas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
              <User size={22} />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">{paciente.nomeCompleto}</p>
              <p className="text-sm text-gray-400">CPF: {formatarCpf(paciente.cpf)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-gray-100 pt-4">
            {paciente.fone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={15} className="text-gray-400 shrink-0" />
                <span>{formatarFone(paciente.fone)}</span>
              </div>
            )}
            {paciente.nascimento && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays size={15} className="text-gray-400 shrink-0" />
                <span>Nasc: {formatarNascimento(paciente.nascimento)}</span>
              </div>
            )}
            {paciente.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={15} className="text-gray-400 shrink-0" />
                <span className="truncate">{paciente.email}</span>
              </div>
            )}
            {paciente.cartaoSus && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard size={15} className="text-gray-400 shrink-0" />
                <span>Cartão SUS: {paciente.cartaoSus}</span>
              </div>
            )}
            {paciente.sexo && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={15} className="text-gray-400 shrink-0" />
                <span>Sexo: {paciente.sexo}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-white">
            <h2 className="font-bold text-gray-800">Agendamentos do Sistema</h2>
            <p className="text-sm text-gray-400">{consultas.length} consulta(s) encontrada(s)</p>
          </div>

          {consultas.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Calendar size={48} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {consultas.map((consulta) => (
                <button
                  key={consulta.id}
                  onClick={() => handleOpenModal(consulta)}
                  className="w-full p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{consulta.atendimento}</h4>
                      <p className="text-sm text-blue-500 font-medium">{consulta.medico}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={12} /> {consulta.hora}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {consulta.data}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[consulta.statusVariant] || statusColors.gray}`}>
                      {consulta.status}
                    </span>
                    <Calendar size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Modal size="lg" isOpen={openModal} onClose={handleCloseModal} title="Detalhes do Agendamento">
          {selectedConsulta && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <p className="font-bold text-gray-800">{selectedConsulta.atendimento}</p>
                <p className="text-sm text-blue-600">{selectedConsulta.medico}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={12} /> {selectedConsulta.hora}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {selectedConsulta.data}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={14} className="text-blue-500" />
                    <h5 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Motivo</h5>
                  </div>
                  <p className="text-sm text-gray-600">{selectedConsulta.motivo || "Não informado"}</p>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-orange-500" />
                    <h5 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Urgência</h5>
                  </div>
                  {selectedConsulta.statusUrgencia ? (
                    <span className={"inline-block px-2 py-0.5 rounded-full text-xs font-bold border " + (urgenciaColors[selectedConsulta.statusUrgencia] || "bg-gray-100 text-gray-600")}>
                      {selectedConsulta.statusUrgencia}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Não informado</span>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Info size={14} className="text-blue-500" />
                    <h5 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Tipo</h5>
                  </div>
                  <span className="text-sm text-gray-600">{selectedConsulta.tipo}</span>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Timer size={14} className="text-blue-500" />
                    <h5 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Duração</h5>
                  </div>
                  <span className="text-sm text-gray-600">{selectedConsulta.duracaoMin || 30} minutos</span>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Stethoscope size={14} className="text-blue-500" />
                    <h5 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Profissional</h5>
                  </div>
                  <p className="text-sm text-gray-600">{selectedConsulta.medico}</p>
                  {selectedConsulta.medicoCrm && (
                    <p className="text-xs text-gray-400">CRM: {selectedConsulta.medicoCrm}</p>
                  )}
                  {selectedConsulta.medicoEspecialidade && (
                    <p className="text-xs text-gray-400">{selectedConsulta.medicoEspecialidade}</p>
                  )}
                </div>

                {selectedConsulta.observacoes && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 md:col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={14} className="text-gray-500" />
                      <h5 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Observações</h5>
                    </div>
                    <p className="text-sm text-gray-600">{selectedConsulta.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </main>

      <footer className="mt-auto py-6 text-center text-gray-400 text-xs">
        <p>© 2026 Medflow, Inc. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default PaginaConsulta;