'use client';
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import Subtitle from "@/components/Subtitle";
import Title1 from "@/components/Title1";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { PlusIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/toast/toastManager";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputField } from "@/components/inputField";
import LoadingScreen from "@/components/LoadingScreen";
import api from "@/services/api";
import { useUserStore } from "@/stores/userStore";

export default function ProfissionaisPage() {

  const [openProf, setOpenProf] = useState(false);
  const [openAtend, setOpenAtend] = useState(false);

  const vh = useViewportHeight();
  const { user, isAuthenticated } = useUserStore();

  /* Config de Busca dos Profissionais */

  const [current, setCurrent] = useState(1);
  const [busca, setBusca] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [seletor, setSeletor] = useState("TODOS");
  const [inputSeletor, setInputSeletor] = useState("");

  const fetcher = (url: string) => api.get(url).then(res => res.data);

  const shouldFetch = isAuthenticated;
  const { data: profData, error: profError, isLoading: profLoading } = useSWR(
    shouldFetch
      ? `http://localhost:7000/api/user`
      : null,
    fetcher
  )

  useEffect(() => {
    if (profError) {
      toast.error("Erro ao encontrar profissionais!");
    }
  }, [profError])

  const listaFiltrada = useMemo(() => {
    const lista = profData ?? [];

    const termo = busca.toLowerCase(); // 👈 usa busca (submit), não inputValue

    return lista
      .filter((prof: User) => {

        const matchBusca =
          !termo ||
          (prof.nome ?? "").toLowerCase().includes(termo) ||
          String(prof.cpf).includes(termo);

        const matchCargo =
          seletor === "TODOS" || !seletor
            ? true
            : prof.role === seletor;

        return matchBusca && matchCargo;
      })
      .sort((a: User, b: User) => a.nome.localeCompare(b.nome));

  }, [profData, busca, seletor]);

  const hasPreviousPage = current > 1;
  const hasNextPage = profData && profData.length === 10;

  function handleOpenProf() {
    setOpenProf(true);
  }

  function handleCloseProf() {
    setOpenProf(false);
  }

  function handleOpenAtend() {
    setOpenAtend(true);
  }

  function handleCloseAtend() {
    setOpenAtend(false);
  }

  if (profLoading) {
    return (
      <LoadingScreen />
    )
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

      <Header user={user} current="Profissionais" />

      <section className="flex-1 w-full p-1 md:p-2 overflow-hidden">

        <section className="w-full h-full px-4 pt-4 pb-2 bg-zinc-300/50 overflow-y-auto rounded-sm md:shadow-[0px_0px_4px_#00000060]">

          <div className="w-full flex items-start justify-between">
            <div>
              <Title1>Profissionais</Title1>
              <Subtitle>Gerencie o cadastro de médicos, cirurgiões e atendentes.</Subtitle>
            </div>
            {user.role === "ADMIN" && (
              <div className="h-full flex flex-col lg:flex-row gap-2 lg:items-center justify-between">
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
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="TODOS" >Todos</SelectItem>
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
                <h1 className="text-lg font-poppins font-bold text-zinc-700">Lista de Profissionais</h1>
                <span className="text-sm text-zinc-800/50">{profData?.length} profissionais encontrados</span>
              </div>

              <div className="w-full flex flex-wrap gap-2">
                {listaFiltrada.length > 0 ? listaFiltrada.map((prof: User, index: number) => {

                  const role = prof.role ?? "";
                  const roleFormatada =
                    role.length > 0
                      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
                      : "";

                  return (
                    <Card key={prof.id} className="w-full lg:w-1/4 px-1">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src={'/images/avatar-1.png'} />
                            <AvatarFallback>{prof.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {prof.nome}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Cargo:</span>
                          <span>{roleFormatada}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">CPF:</span>
                          <span>{prof.cpf}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Nascimento:</span>
                          <span>{new Date(prof.nascimento).toLocaleDateString("pt-BR")}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Telefone:</span>
                          <span>{prof.fone}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }) : (
                  <div className="w-full h-full flex justify-center items-center">
                    <span className="text-sm text-zinc-700/50">Nenhum Usuário Encontrado</span>
                  </div>
                )}
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

          <Modal isOpen={openProf} onClose={handleCloseProf} title="Novo Profissional">
            <h1>Oi</h1>
          </Modal>

          <Modal isOpen={openAtend} onClose={handleCloseAtend} title="Novo Atendente">
            <h1>Oi</h1>
          </Modal>

        </section>
      </section>
    </main>
  )
}