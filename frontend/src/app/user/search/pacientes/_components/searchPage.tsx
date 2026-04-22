"use client"

import { useState } from "react";
import useSWR from "swr";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/inputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/dist/client/link";
import Title1 from "@/components/Title1";
import Subtitle from "@/components/Subtitle";
import LoadingScreen from "@/components/LoadingScreen";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/toast/toastManager";
import api from "@/services/api";
import { useUserStore } from "@/stores/userStore";
import { useViewPacientes } from "@/hooks/useViewPacientes";

type PacienteData = {
  id: string;
  nome: string;
  cpf: string;
  cartaoSus: string;
  nascimento: string;
  fone: string;
  email?: string;
}

export default function SearchPacient() {

  const [current, setCurrent] = useState(1);
  const [busca, setBusca] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [urgencia, setUrgencia] = useState("");
  const [inputUrgencia, setInputUrgencia] = useState("TODOS");

  const { user } = useUserStore();

  const { data: pacienteData, error: pacienteError, isLoading: pacienteLoading } = useViewPacientes({ busca, current, urgencia });

  const hasPreviousPage = current > 1;
  const hasNextPage = pacienteData && pacienteData.length === 12;

  useEffect(() => {
    if (pacienteError) {
      toast.error("Erro ao buscar pacientes!")
    }
    console.log(pacienteData)
    console.log(user)
  }, [pacienteData, pacienteError])

  if (pacienteLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span className="text-red-500 text-sm">Erro ao carregar a sessão!</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <main className="w-full flex flex-col items-center">

        <section className="w-full">
          <div className="w-full flex items-start justify-between">
            <div>
              <Title1>Pacientes</Title1>
              <Subtitle>Gerencie seus pacientes</Subtitle>
            </div>
            {(user.role === "ATENDENTE" || user.role === "ADMIN") && (
              <Button className="font-bold">
                <Link href="/user/register/paciente">
                  + Novo Paciente
                </Link>
              </Button>
            )}
          </div>
          <Card className="p-2 mt-2 gap-2">
            <div>
              <h1 className="text-xl font-bold text-zinc-800">Buscar pacientes</h1>
              <span className="text-zinc-400 text-sm">Encontre um paciente pelo nome, CPF ou telefone</span>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              setBusca(inputValue)
              setUrgencia(inputUrgencia === "TODOS" ? "" : inputUrgencia)
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
                <Select value={inputUrgencia} onValueChange={(value) => setInputUrgencia(value)}>
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

        <section className="w-full min-h-50">
          <Card className="p-2 mt-2 gap-2">
            <div>
              <h1 className="text-xl font-bold text-zinc-800">Resultados da busca</h1>
              <span className="text-zinc-400 text-sm">{pacienteData ? pacienteData?.length : "0"} paciente(s) encontrado(s)</span>
            </div>
            <div className="w-full flex gap-2 flex-wrap">
              {pacienteData && pacienteData.length > 0 && pacienteData.map((paciente: PacienteData, index: number) => {

                return (
                  <Card key={paciente.id} className="w-full md:w-[calc(25%-6px)] shadow-md hover:shadow-lg transition">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={'/images/avatar-1.png'} />
                          <AvatarFallback>{paciente.nome.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {paciente.nome}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">CPF:</span>
                        <span>{paciente.cpf}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">CNS:</span>
                        <span>{paciente.cartaoSus}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">Nascimento:</span>
                        <span>{new Date(paciente.nascimento).toLocaleDateString("pt-BR")}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">Telefone:</span>
                        <span>{paciente.fone}</span>
                      </div>
                    </CardContent>
                  </Card>)
              })}
            </div>
            <div className="flex flex-row w-full gap-3 items-center justify-center">
              <Button className="" disabled={!hasPreviousPage} onClick={() => setCurrent(current - 1)}>
                Pagina Anterior
              </Button>
              <Button className="bg-blue-600 font-bold text-white" disabled={!hasNextPage} onClick={() => setCurrent(current + 1)}>
                Próxima página
              </Button>
            </div>
          </Card>
        </section>
      </main>

    </div>
  )
}