"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import Header from "@/components/Header";
import Title1 from "@/components/Title1";
import Subtitle from "@/components/Subtitle";
import { Button } from "@/components/ui/button";
import { Pencil, PlusIcon } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "@/toast/toastManager";
import { useViewPacientes } from "@/hooks/useViewPacientes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Modal from "@/components/Modal";
import PatientRegisterForm from "./_components/PacienteRegister";
import EditPacientes from "./_components/EditPacientes";

type PacienteData = {
  id: string;
  nome: string;
  cpf: string;
  cartaoSus: string;
  nascimento: string;
  fone: string;
  email?: string;
  sexo: "MASCULINO" | "FEMININO" | "OUTRO";
}

export default function Paciente() {

  const vh = useViewportHeight();

  /* === Config Modal === */
  const [openPacient, setOpenPacient] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  function handlePac() { setOpenPacient(!openPacient) }
  function handleEdit() { setOpenEdit(!openEdit) }

  /* === Config Edit === */

  const [paciente, setPaciente] = useState<PacienteData>();

  /* === Config Busca === */

  const [current, setCurrent] = useState(1);
  const [busca, setBusca] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [sexo, setSexo] = useState("");
  const [inputSexo, setInputSexo] = useState("TODOS");

  const { user } = useUserStore();

  const { data: pacienteData, error: pacienteError, isLoading: pacienteLoading, mutate } = useViewPacientes({ busca, current, sexo });

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
    <main style={{ height: vh }} className="w-full flex flex-col">

      <Header user={user} current="Pacientes" />

      <section className="flex-1 w-full p-1 md:p-2 overflow-hidden">

        <section className="w-full h-full px-4 pt-4 pb-2 bg-zinc-300/50 overflow-y-auto rounded-sm md:shadow-[0px_0px_4px_#00000060]">

          <div className="w-full flex items-start justify-between">
            <div>
              <Title1>Pacientes</Title1>
              <Subtitle>Gerencie seus pacientes</Subtitle>
            </div>
            {(user.role === "ATENDENTE" || user.role === "ADMIN") && (
              <div className="flex flex-col lg:flex-row gap-2 lg:items-center justify-between">
                <Button className="cursor-pointer" onClick={(e) => { e.preventDefault(); handlePac(); }}>
                  <PlusIcon className="w-4 h-4" />
                  <span>Novo Paciente</span>
                </Button>
              </div>
            )}
          </div>

          <section className="w-full flex flex-col gap-4 mt-10">

            <Card className="px-3">
              <div>
                <h1 className="text-xl font-bold text-zinc-800">Buscar pacientes</h1>
                <span className="text-zinc-400 text-sm">Encontre um paciente pelo nome, CPF ou telefone</span>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault()
                setBusca(inputValue)
                setSexo(inputSexo === "TODOS" ? "" : inputSexo)
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
                  <Select value={inputSexo} onValueChange={(value) => setInputSexo(value)}>
                    <SelectTrigger className="w-1/4 self-center">
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="TODOS" >Todos</SelectItem>
                      <SelectItem value="FEMININO">Feminino</SelectItem>
                      <SelectItem value="MASCULINO">Masculino</SelectItem>
                      <SelectItem value="OUTROS">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 font-bold text-white px-10 cursor-pointer" type="submit">
                  Buscar
                </Button>
              </form>
            </Card>

            <Card className="w-full px-4">

              <div className="w-full flex flex-col">
                <h1 className="text-lg font-poppins font-bold text-zinc-700">Resultados da busca</h1>
                <span className="text-sm text-zinc-800/50">{pacienteData ? pacienteData?.length : "0"} paciente(s) encontrado(s)</span>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {pacienteData && pacienteData.length > 0 && pacienteData.map((paciente: PacienteData, index: number) => {

                  return (
                    <Card key={paciente.id} className="w-full shadow-md hover:shadow-lg transition group">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src={'/images/avatar-1.png'} />
                            <AvatarFallback>{paciente.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {paciente.nome}
                        </CardTitle>
                        <Pencil
                          className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 cursor-pointer transition-all"
                          onClick={(e) => { e.preventDefault(); setPaciente(paciente); handleEdit(); }}
                        />
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

        </section>
      </section>

      <Modal size="xl" isOpen={openPacient} onClose={handlePac} title="Novo Paciente">
        <PatientRegisterForm onSubmit={() => { handlePac(); mutate(); }} />
      </Modal>

      {paciente && (
        <Modal size="xl" isOpen={openEdit} onClose={handleEdit} title="Editar Paciente">
          <EditPacientes paciente={paciente} onClose={handleEdit} onSuccess={()=> {handleEdit(); mutate(); }} />
        </Modal>
      )}

    </main>
  )
}
