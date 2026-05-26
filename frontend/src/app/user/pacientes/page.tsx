"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import Title1 from "@/components/Title1";
import Subtitle from "@/components/Subtitle";
import { Button } from "@/components/ui/button";
import { Mars, Venus, CircleDashed, Pencil, PlusIcon } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "@/toast/toastManager";
import { useViewPacientes } from "@/hooks/useViewPacientes";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Modal from "@/components/Modal";
import PatientRegisterForm from "./_components/PacienteRegister";
import EditPacientes from "./_components/EditPacientes";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

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

const SexoIcon = ({ sexo }: { sexo: string }) => {
  if (sexo === "MASCULINO") return <Mars className="w-4 h-4 text-blue-500" />;
  if (sexo === "FEMININO") return <Venus className="w-4 h-4 text-pink-500" />;
  return <CircleDashed className="w-4 h-4 text-green-500" />;
};

const sexoLabel: Record<string, string> = {
  MASCULINO: "Masculino",
  FEMININO: "Feminino",
  OUTRO: "Outro",
};

export default function Paciente() {

  const { user, loading } = useUserStore();

  const [openPacient, setOpenPacient] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [paciente, setPaciente] = useState<PacienteData>();

  const [current, setCurrent] = useState(1);
  const [busca, setBusca] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [sexo, setSexo] = useState("");
  const [inputSexo, setInputSexo] = useState("TODOS");

  const { data: pacienteData, error: pacienteError, isLoading: pacienteLoading, mutate } = useViewPacientes({ busca, current, sexo });

  const hasPreviousPage = current > 1;
  const hasNextPage = pacienteData && pacienteData.length === 12;

  useEffect(() => {
    if (pacienteError) {
      toast.error("Erro ao buscar pacientes!");
    }
  }, [pacienteError]);

  function handlePac() { setOpenPacient(!openPacient); }
  function handleEdit() { setOpenEdit(!openEdit); }

  if (loading || !user) return <LoadingScreen />;

  return (
    <>
      <div className="w-full flex items-start justify-between">
        <div>
          <Title1>Pacientes</Title1>
          <Subtitle>Gerencie seus pacientes</Subtitle>
        </div>
        {(user.role === "ATENDENTE" || user.role === "ADMIN") && (
          <Button className="cursor-pointer" onClick={(e) => { e.preventDefault(); handlePac(); }}>
            <PlusIcon className="w-4 h-4" />
            <span>Novo Paciente</span>
          </Button>
        )}
      </div>

      <section className="w-full flex flex-col gap-4 mt-10">

        <Card className="px-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-800">Buscar pacientes</h1>
            <span className="text-zinc-400 text-sm">Encontre um paciente pelo nome, CPF ou telefone</span>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            setBusca(inputValue);
            setSexo(inputSexo === "TODOS" ? "" : inputSexo);
            setCurrent(1);
          }} className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
            <div className="flex flex-row gap-1 flex-1">
              <InputField
                id="barra-busca"
                type="search"
                label=""
                className="w-full"
                placeholder="Digite para buscar..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Select value={inputSexo} onValueChange={setInputSexo}>
                <SelectTrigger className="w-1/4 self-center">
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="FEMININO">Feminino</SelectItem>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
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
            <h1 className="text-lg font-bold text-zinc-700">Resultados da busca</h1>
            <span className="text-sm text-zinc-800/50">{pacienteData?.length ?? 0} paciente(s) encontrado(s)</span>
          </div>

          {pacienteLoading ? (
            <span className="text-sm text-zinc-400">Carregando...</span>
          ) : pacienteData && pacienteData.length > 0 ? (
            <div className="w-full overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Nome</TableHead>
                    <TableHead className="w-[90px]">Sexo</TableHead>
                    <TableHead className="w-[110px]">CPF</TableHead>
                    <TableHead className="w-[100px]">SUS</TableHead>
                    <TableHead className="w-[100px]">Nascimento</TableHead>
                    <TableHead className="w-[100px]">Telefone</TableHead>
                    <TableHead className="w-[80px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacienteData.map((paciente: PacienteData) => (
                    <TableRow key={paciente.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{paciente.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{paciente.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <SexoIcon sexo={paciente.sexo} />
                          <span>{sexoLabel[paciente.sexo]}</span>
                        </div>
                      </TableCell>
                      <TableCell>{paciente.cpf}</TableCell>
                      <TableCell>{paciente.cartaoSus}</TableCell>
                      <TableCell>{new Date(paciente.nascimento).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{paciente.fone}</TableCell>
                      <TableCell className="text-right">
                        {(user.role === "ATENDENTE" || user.role === "ADMIN") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 cursor-pointer"
                            onClick={(e) => { e.preventDefault(); setPaciente(paciente); handleEdit(); }}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <span className="text-sm text-zinc-700/50">Nenhum paciente encontrado</span>
            </div>
          )}

          <div className="flex flex-row w-full gap-3 items-center justify-center mt-4">
            <Button disabled={!hasPreviousPage} onClick={() => setCurrent(current - 1)}>
              Página Anterior
            </Button>
            <Button className="bg-blue-600 font-bold text-white" disabled={!hasNextPage} onClick={() => setCurrent(current + 1)}>
              Próxima página
            </Button>
          </div>
        </Card>
      </section>

      <Modal size="xl" isOpen={openPacient} onClose={handlePac} title="Novo Paciente">
        <PatientRegisterForm onSubmit={() => { handlePac(); mutate(); }} />
      </Modal>

      {paciente && (
        <Modal size="xl" isOpen={openEdit} onClose={handleEdit} title="Editar Paciente">
          <EditPacientes paciente={paciente} onClose={handleEdit} onSuccess={() => { handleEdit(); mutate(); }} />
        </Modal>
      )}
    </>
  );
}