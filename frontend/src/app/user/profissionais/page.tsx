'use client';
import Modal from "@/components/Modal";
import Subtitle from "@/components/Subtitle";
import Title1 from "@/components/Title1";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, PlusIcon, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/toast/toastManager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputField } from "@/components/inputField";
import LoadingScreen from "@/components/LoadingScreen";
import { useUserStore } from "@/stores/userStore";
import ProfissionalRegister from "./_components/ProfissionalRegister";
import AtendenteRegister from "./_components/AtendenteRegister";
import { useViewProfissionais } from "@/hooks/useViewProfissionais";
import { User } from "@/types/user";
import { Stethoscope, ClipboardList } from "lucide-react";
import EditProfissional from "./_components/EditProfissional";
import ProfissionalDetails from "./_components/ProfissionalDetails";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const roleColors: Record<string, string> = {
  MEDICO: "bg-blue-100 text-blue-600",
  ATENDENTE: "bg-purple-100 text-purple-600",
};

const statusColors: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-700",
  INATIVO: "bg-red-100 text-red-700",
};

export default function ProfissionaisPage() {
  const [openProf, setOpenProf] = useState(false);
  const [openAtend, setOpenAtend] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  const { user } = useUserStore();

  const [profissional, setProfissional] = useState<User | null>(null);
  const [current, setCurrent] = useState(1);
  const [busca, setBusca] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [role, setRole] = useState("");
  const [inputRole, setInputRole] = useState("TODOS");

  const { data: profData, error: profError, isLoading: profLoading, mutate } = useViewProfissionais({
    busca, role, page: current
  });

  const hasPreviousPage = current > 1;
  const hasNextPage = profData && profData.length === 12;

  useEffect(() => {
    if (profError) {
      toast.error("Erro ao encontrar profissionais!");
    }
  }, [profError]);

  function handleOpenProf() { setOpenProf(true); }
  function handleCloseProf() { setOpenProf(false); }
  function handleOpenAtend() { setOpenAtend(true); }
  function handleCloseAtend() { setOpenAtend(false); }

  function handleOpenEdit(prof: User) { setProfissional(prof); setOpenEdit(true); }
  function handleCloseEdit() { setOpenEdit(false); }

  function handleOpenDetails(prof: User) { setProfissional(prof); setOpenDetails(true); }
  function handleCloseDetails() { setOpenDetails(false); }

  if (profLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span className="text-red-500 text-sm">Erro ao carregar a sessão!</span>
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex items-start justify-between">
        <div>
          <Title1>Profissionais</Title1>
          <Subtitle>Gerencie o cadastro de médicos, cirurgiões e atendentes.</Subtitle>
        </div>
        {user.role === "ADMIN" && (
          <div className="h-full flex flex-col lg:flex-row gap-2 lg:items-center">
            <Button className="cursor-pointer" onClick={(e) => { e.preventDefault(); handleOpenProf(); }}>
              <PlusIcon className="w-4 h-4" />
              <span>Novo Profissional</span>
            </Button>
            <Button className="cursor-pointer" onClick={(e) => { e.preventDefault(); handleOpenAtend(); }}>
              <PlusIcon className="w-4 h-4" />
              <span>Novo Atendente</span>
            </Button>
          </div>
        )}
      </div>

      <section className="w-full flex flex-col gap-4 mt-10">
        <Card className="px-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-700">Buscar profissionais</h1>
            <span className="text-sm text-zinc-800/50">Encontre os profissionais pelo nome ou CPF</span>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            setBusca(inputValue);
            setRole(inputRole === "TODOS" ? "" : inputRole);
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
              <Select value={inputRole} onValueChange={setInputRole}>
                <SelectTrigger className="w-1/4 self-center">
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="MEDICO">Médicos</SelectItem>
                  <SelectItem value="ATENDENTE">Atendentes</SelectItem>
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
            <h1 className="text-lg font-bold text-zinc-700">Lista de Profissionais</h1>
            <span className="text-sm text-zinc-800/50">{profData?.length ?? 0} profissional(is) encontrado(s)</span>
          </div>

          {profLoading ? (
            <span className="text-sm text-zinc-400">Carregando...</span>
          ) : profData && profData.length > 0 ? (
            <div className="w-full overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Nome</TableHead>
                    <TableHead className="w-[80px]">Cargo</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[120px]">Detalhe</TableHead>
                    <TableHead className="w-[100px]">CPF</TableHead>
                    <TableHead className="w-[100px]">Telefone</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profData.map((prof: User) => (
                    <TableRow key={prof.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={prof.avatar ?? ""} />
                            <AvatarFallback>{prof.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{prof.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[prof.role!] ?? "bg-zinc-100 text-zinc-600"}`}>
                          {prof.role === "MEDICO" ? "MÉDICO" : "ATENDENTE"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {prof.role === "MEDICO" && prof.medico ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[prof.medico.status!] ?? "bg-zinc-100 text-zinc-600"}`}>
                            {prof.medico.status}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {prof.medico && (
                          <div className="flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" />
                            <span className="truncate">{prof.medico.especialidade}</span>
                          </div>
                        )}
                        {prof.atendente && (
                          <div className="flex items-center gap-1">
                            <ClipboardList className="w-3 h-3" />
                            <span className="truncate">{prof.atendente.setor}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{prof.cpf}</TableCell>
                      <TableCell>{prof.fone}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 cursor-pointer"
                            onClick={(e) => { e.preventDefault(); handleOpenDetails(prof); }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                          {user.role === "ADMIN" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 cursor-pointer"
                              onClick={(e) => { e.preventDefault(); handleOpenEdit(prof); }}
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <span className="text-sm text-zinc-700/50">Nenhum profissional encontrado</span>
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

      <Modal size="xl" isOpen={openProf} onClose={handleCloseProf} title="Novo Profissional">
        <ProfissionalRegister onSubmit={() => { handleCloseProf(); mutate(); }} />
      </Modal>

      <Modal size="xl" isOpen={openAtend} onClose={handleCloseAtend} title="Novo Atendente">
        <AtendenteRegister onSubmit={() => { handleCloseAtend(); mutate(); }} />
      </Modal>

      {profissional && (
        <Modal size="md" isOpen={openDetails} onClose={handleCloseDetails} title="Detalhes do Profissional">
          <ProfissionalDetails profissional={profissional} onClose={handleCloseDetails} />
        </Modal>
      )}

      {profissional && (
        <Modal size="xl" isOpen={openEdit} onClose={handleCloseEdit} title="Editar Profissional">
          <EditProfissional profissional={profissional} onClose={handleCloseEdit} onSuccess={() => { handleCloseEdit(); mutate(); }} />
        </Modal>
      )}
    </>
  );
}