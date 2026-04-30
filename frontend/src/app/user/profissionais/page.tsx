'use client';
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import Subtitle from "@/components/Subtitle";
import Title1 from "@/components/Title1";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { Pencil, PlusIcon } from "lucide-react";
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

const roleColors: Record<string, string> = {
  MEDICO: "bg-blue-100 text-blue-600",
  ATENDENTE: "bg-purple-100 text-purple-600",
};

export default function ProfissionaisPage() {

  const [openProf, setOpenProf] = useState(false);
  const [openAtend, setOpenAtend] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);


  const vh = useViewportHeight();
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

  if (profLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span className="text-red-500 text-sm">Erro ao carregar a sessão!</span>
      </div>
    );
  }

  return (
    <main style={{ height: vh }} className="w-full flex flex-col">

      <Header user={user} current="Profissionais" />

      <section className="flex-1 w-full p-1 md:p-2 overflow-hidden">
        <section className="w-full h-full px-4 pt-4 pb-2 bg-zinc-300/50 overflow-y-auto rounded-sm md:shadow-[0px_0px_4px_#00000060]">

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
              ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {profData && profData.length > 0 ? profData.map((prof: User) => (
                    <Card key={prof.id} className="w-full shadow-md hover:shadow-lg transition group">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src={prof.avatar ?? ""} />
                            <AvatarFallback>{prof.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{prof.nome}</span>
                        </CardTitle>
                        {user.role === "ADMIN" && (
                          <Pencil
                            className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 cursor-pointer transition-all shrink-0"
                            onClick={(e) => { e.preventDefault(); handleOpenEdit(prof); }}
                          />
                        )}
                      </CardHeader>

                      <CardContent className="space-y-2 text-sm text-muted-foreground px-4 md:px-7">
                        <div className="flex gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[prof.role!] ?? "bg-zinc-100 text-zinc-600"}`}>
                            {prof.role === "MEDICO" ? "Médico" : "Atendente"}
                          </span>
                        </div>

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

                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">CPF:</span>
                          <span>{prof.cpf}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Telefone:</span>
                          <span>{prof.fone}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-4 flex justify-center items-center py-8">
                      <span className="text-sm text-zinc-700/50">Nenhum profissional encontrado</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-row w-full gap-3 items-center justify-center">
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
            <Modal size="xl" isOpen={openEdit} onClose={handleCloseEdit} title="Editar Profissional">
              <EditProfissional profissional={profissional} onClose={handleCloseEdit} onSuccess={() => { handleCloseEdit(); mutate(); }} />
            </Modal>
          )}

        </section>
      </section>
    </main>
  );
}