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
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Agendamentos() {

  const [openAgend, setOpenAgend] = useState(false);

  const pageName = "Agendamentos";
  const vh = useViewportHeight();

  const { user, loading, isAuthenticated } = useUserStore();

  const [current, setCurrent] = useState(1);
  const [busca, setBusca] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [seletor, setSeletor] = useState("TODOS");
  const [inputSeletor, setInputSeletor] = useState("");

  useEffect(() => {
    console.log(isAuthenticated);
  }, [])

  function handleOpenAgend() {
    setOpenAgend(true);
  }

  function handleCloseAgend() {
    setOpenAgend(false);
  }

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <main style={{ height: vh }} className="w-full flex flex-col overflow-hidden">

      <Header user={user} current={pageName} />

      <section className="flex-1 w-full md:px-2 md:py-2">
        <section className="w-full h-full px-4 pt-4 pb-2 bg-zinc-300/50 overflow-y-auto rounded-sm md:shadow-[0px_0px_4px_#00000060]">

          <div className="w-full flex items-start justify-between">
            <div>
              <Title1>Agendamentos</Title1>
              <Subtitle>Gerencie os agendamentos de todos os pacientes.</Subtitle>
            </div>
            {(user.role === "ADMIN" || user.role === "ATENDENTE") && (
              <div className="h-full flex flex-col lg:flex-row gap-2 lg:items-center justify-between">
                <Button className="cursor-pointer" onClick={(e) => { e.preventDefault(); handleOpenAgend(); }}>
                  <PlusIcon className="w-4 h-4" />
                  <span>Novo Agendamento</span>
                </Button>
              </div>
            )}
          </div>

          <section className="w-full flex flex-col gap-4 mt-10">

            <Card className="px-3">
              <div>
                <h1 className="text-xl font-bold text-zinc-700">Buscar agendamentos</h1>
                <span className="text-sm text-zinc-800/50">Encontre os agendamentos pelo nome ou CPF</span>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault()
                setBusca(inputValue)
                setSeletor(inputSeletor === "TODOS" ? "" : inputSeletor)
                setCurrent(1)
              }} className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
                <div className="flex flex-row gap-1 flex-1">
                  <InputField
                    id="barra-busca"
                    type="search"
                    label=""
                    className="w-full"
                    placeholder="Digite para buscar..."
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value) }}
                  />
                  <Select value={inputSeletor} onValueChange={(value) => setInputSeletor(value)}>
                    <SelectTrigger className="w-1/4 self-center">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="TODOS" >Todos</SelectItem>
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

          </section>

          <Modal size="xl" isOpen={openAgend} onClose={handleCloseAgend} title="Novo Profissional">
            <span>Olá Mundo</span>
          </Modal>
        </section>
      </section>

    </main>
  );
}
