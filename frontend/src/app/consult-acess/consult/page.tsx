'use client'
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { useRouter } from "next/navigation";


const PaginaConsulta = () => {
  const router = useRouter()
  const agendamentos = [
    { atendimento: "Exame de Sangue", medico: "Dr. Ricardo Alves", status: "Confirmado", data: "15/10/2026", hora: "09:30" },
    { atendimento: "Eletrocardiograma", medico: "Dr. Japa", status: "Pendente", data: "22/10/2026", hora: "14:30" }
  ];

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
        
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-500 font-medium transition-colors" onClick={() => router.back()}>
          <ArrowLeft size={18} />
          <span>Voltar ao início</span>
        </Link>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Consultas Agendadas</h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Visualização Geral</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-white">
            <h2 className="font-bold text-gray-800">Agendamentos do Sistema</h2>
            <p className="text-sm text-gray-400">{agendamentos.length} consulta(s) encontrada(s)</p>
          </div>

          <div className="divide-y divide-gray-100">
            {agendamentos.map((consulta, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
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
                
                <div className="flex items-center gap-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    consulta.status === 'Confirmado' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {consulta.status}
                  </span>
                  <button className="text-gray-300 group-hover:text-blue-500 transition-colors">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white flex justify-center gap-4 border-t border-gray-50">
            <button className="bg-[#9CA3AF] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-500 transition-colors">
              Página Anterior
            </button>
            <button className="bg-[#93C5FD] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-400 transition-colors">
              Próxima página
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-6 text-center text-gray-400 text-xs">
        <p>© 2026 Medflow, Inc. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default PaginaConsulta;