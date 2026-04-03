"use client"
import Header from "@/components/Header"
import { useSession } from "next-auth/react"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import useSWR from "swr";
import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/inputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/dist/client/link";
import { Badge } from "@/components/ui/badge";
import { set } from "zod";

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

    const pageName = "BuscaPaciente";
    const { data: session, status } = useSession();

    const fetcher = (url: string) => fetch(url, {
        headers: session?.accessToken
            ? { Authorization: `Bearer ${session?.accessToken}` } : {}
    }).then((res) => res.json());

    const router = useRouter();
    const vh = useViewportHeight();
    const userId = session?.user?.id;
    const ultimoNome = session?.user.nome
        .trim()
        .split(/\s+/)
        .at(-1)
    const { data, error, isLoading } = useSWR(
        userId ? `/api/atendente/profile/${userId}` : null
    );

    const shouldFetch = status === "authenticated";
    const { data: pacienteData, error: pacienteError, isLoading: pacienteLoading } = useSWR(
        shouldFetch
            ? `http://localhost:7000/api/user/search/pacientes?busca=${busca}&page=${current}&urgencia=${urgencia}`
            : null,
        fetcher)

    const hasPreviousPage = current > 1;
    const hasNextPage = pacienteData && pacienteData.length === 10;


    useEffect(() => {
        if (data) {
            useUserStore.getState().setUser(data);
        }
    }, [data]);

    if (status === "loading" || isLoading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    return (
        <div style={{ height: vh }} className="w-full flex flex-col items-center">
            <Header session={session} current={pageName} />
            <main className="w-full flex flex-col items-center lg:w-2/3 p-3 pl-4 pr-4 ">
                <section className="w-full">
                    <div className="flex flex-col">
                        <div className="flex flex-row justify-between">
                            <h1 className="text-2xl font-bold text-zinc-800">Pacientes</h1>
                            <Button className="font-bold">
                                <Link href="/dashboard/register/paciente">
                                    + Novo Paciente
                                </Link>
                            </Button>

                        </div>
                        <div>
                            <span className="text-sm text-zinc-600">Gerencie seus pacientes</span>
                        </div>
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
                        }}>
                            <div className="flex flex-row gap-1">
                                <InputField
                                    id="barra-busca"
                                    type="search"
                                    label=""
                                    className="w-2/3"
                                    placeholder="Digite para buscar..."
                                    value={inputValue}
                                    onChange={(e) => { setInputValue(e.target.value) }}
                                />
                                <Select value={inputUrgencia} onValueChange={(value) => setInputUrgencia(value)}>
                                    <SelectTrigger className="w-1/3 self-center">
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
                            <Button className="bg-blue-600 font-bold text-white w-full" type="submit">
                                Buscar
                            </Button>
                        </form>
                    </Card>
                </section>

                <section className="w-full min-h-50">
                    <Card className="p-2 mt-2 gap-2">
                        <div>
                            <h1 className="text-xl font-bold text-zinc-800">Resultados da busca</h1>
                            <span className="text-zinc-400 text-sm">{pacienteData?.length} paciente(s) encontrado(s)</span>
                        </div>
                        {pacienteData?.map((paciente: PacienteData, index: number) => {

                            return (
                            <Card key={paciente.id} className="w-full shadow-md hover:shadow-lg transition">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">{paciente.nome}</CardTitle>
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