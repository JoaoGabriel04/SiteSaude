"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormPatient, regFormPatient } from "@/schemas/registerSchema";
import { useRouter } from "next/navigation";
import { toast } from "@/toast/toastManager";
import { SubmitHandler } from "react-hook-form";
import { InputField } from "@/components/inputField";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import api from "@/services/api";

export default function PatientRegisterForm() {
    const router = useRouter()
    const {user} = useUserStore();

    const form = useForm<RegisterFormPatient>({
        resolver: zodResolver(regFormPatient)
    })

    const { isSubmitting } = form.formState

    const onSubmit: SubmitHandler<RegisterFormPatient> = async (data) => {
        try {
            await api.post("http://localhost:7000/api/atendente/registerP", data);
            
            toast.success("Paciente cadastrado com sucesso!")
            router.push("/user/search/pacientes")
        } catch (error) {
            toast.error("Erro ao cadastrar paciente")
            console.log(error);
        }
    }

    return (
        <div className="p-5 w-full flex flex-col items-center">
            <Card className="lg:w-1/2 w-full gap-1 flex flex-col items-center space-y-2 py-3 px-4">
                <header className="flex flex-col items-center w-full">
                    <div className="flex flex-row justify-between items-center w-full">
                        <ArrowLeft size={35} className="cursor-pointer" onClick={() => router.back()} />
                        <Image src="/images/logo.png" alt="Logo" width={100} height={100} className="w-20 h-20" />
                    </div>
                </header>
                <div className="w-full gap-3 flex flex-col items-center space-y-2">
                    <div className="w-full items-center flex flex-col space-y-1">
                        <h1 className="text-lg font-bold text-zinc-800">Cadastro de Novo Paciente</h1>
                    </div>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col items-center space-y-2">
                        <InputField
                            id="nome"
                            type="text"
                            placeholder="Nome Completo"
                            label="Nome Completo *"
                            className="w-full"
                            register={form.register("nome")}
                            errorInvalid={form.formState.errors.nome !== undefined}
                            errorMessage={form.formState.errors.nome?.message}
                        />
                        <InputField
                            id="nascimento"
                            type="date"
                            placeholder="01/01/2000"
                            label="Data de Nascimento *"
                            className="w-full"
                            register={form.register("nascimento")}
                            errorInvalid={form.formState.errors.nascimento !== undefined}
                            errorMessage={form.formState.errors.nascimento?.message}
                        />
                        <InputField
                            id="fone"
                            type="tel"
                            placeholder="(00) 00000-0000"
                            label="Telefone *"
                            className="w-full"
                            mask="phone"
                            register={form.register("fone")}
                            errorInvalid={form.formState.errors.fone !== undefined}
                            errorMessage={form.formState.errors.fone?.message}
                        />
                        <InputField
                            id="cpf"
                            type="text"
                            placeholder="000.000.000-00"
                            label="CPF *"
                            className="w-full"
                            mask="cpf"
                            register={form.register("cpf")}
                            errorInvalid={form.formState.errors.cpf !== undefined}
                            errorMessage={form.formState.errors.cpf?.message}
                        />
                        <InputField
                            id="cartaoSus"
                            type="text"
                            placeholder="000 0000 0000 0000"
                            label="Cartão do SUS *"
                            className="w-full"
                            mask="cns"
                            register={form.register("cartaoSus")}
                            errorInvalid={form.formState.errors.cartaoSus !== undefined}
                            errorMessage={form.formState.errors.cartaoSus?.message}
                        />
                        <InputField
                            id="email"
                            type="email"
                            placeholder="email@exemplo.com"
                            label="Email"
                            className="w-full"
                            register={form.register("email")}
                            errorInvalid={form.formState.errors.email !== undefined}
                            errorMessage={form.formState.errors.email?.message}
                        />
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-3/4 cursor-pointer mt-4"
                        >
                            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                        </Button>
                    </form>
                </div>
                <Link href="/dashboard" className="text-sm text-zinc-600 underline cursor-pointer">Voltar para dashboard</Link>
            </Card>
        </div>
    )
}