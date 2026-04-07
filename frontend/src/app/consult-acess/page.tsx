"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Fingerprint, ArrowRight } from 'lucide-react';

const AcessoConsulta = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');

  const handleAcessar = (e: React.FormEvent) => {
    e.preventDefault();
    //Colocar uma valiação de CPF e Nome 
    if (nome && cpf) {
      router.push('/consult-acess/consult'); 
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <Image 
            src="/images/logo-maior.png" 
            alt="Logo Medflow" 
            width={80} 
            height={80} 
            className="object-contain mb-2"
          />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Medflow</h1>
          <p className="text-gray-500 text-sm">Portal do Paciente</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Acessar Consultas</h2>
            <p className="text-sm text-gray-400">Informe seus dados para visualizar seus agendamentos.</p>
          </div>

          <form onSubmit={handleAcessar} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                CPF
              </label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-gray-700"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#2D2D2D] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg mt-4">Visualizar Agendamentos
              <ArrowRight size={20} />
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          Acesso restrito para consulta de pacientes cadastrados.
        </p>
      </div>
    </div>
  );
};

export default AcessoConsulta;