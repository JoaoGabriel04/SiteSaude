"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormPatient, regFormPatient } from "@/schemas/registerSchema";
import { useRouter } from "next/navigation";
import { toast } from "@/toast/toastManager";
import { SubmitHandler } from "react-hook-form";
import { InputField } from "@/components/inputField";
import { AxiosError } from "axios";
import { useUserStore } from "@/stores/userStore";
import api from "@/services/api";
import Subtitle from "@/components/Subtitle";

type ApiError = {
  error: string;
};

export default function PatientRegisterForm() {
  const router = useRouter()
  const { user } = useUserStore();

  const form = useForm<RegisterFormPatient>({
    resolver: zodResolver(regFormPatient)
  })

  const { isSubmitting } = form.formState

  const onSubmit: SubmitHandler<RegisterFormPatient> = async (data) => {
    try {
      await api.post("/api/atendente/registerP", data);

      toast.success("Paciente cadastrado com sucesso!")
      router.push("/user/search/pacientes")
    } catch (err) {
      const error = err as AxiosError<ApiError>
      toast.error(error.response?.data.error || "Erro ao cadastrar paciente!")
    }
  }

  return (
    <main className="p-5 w-full flex flex-col items-center">
      <Subtitle>Cadastre um novo Profissional</Subtitle>

      <div className="w-full h-10 flex justify-center items-center">
        <hr className="w-[calc(100%-4px)] " />
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

    </main >
  )
}