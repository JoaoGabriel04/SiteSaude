"use client";

import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormPatient, regFormPatient } from "@/schemas/registerSchema";
import { toast } from "@/toast/toastManager";
import { InputField } from "@/components/inputField";
import api from "@/services/api";
import Subtitle from "@/components/Subtitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PacRegProps = {
  onSubmit: () => void;
}

export default function PatientRegisterForm({ onSubmit }: PacRegProps) {

  const form = useForm<RegisterFormPatient>({
    resolver: zodResolver(regFormPatient)
  })

  const { isSubmitting } = form.formState

  async function registerPaciente(data: RegisterFormPatient) {
    try {
      await api.post("/api/atendente/registerP", data);

      console.log("Registro realizado com sucesso.")
      toast.success("Registro realizado com sucesso.");
      onSubmit();

    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string; error?: string } } };
      const message = apiError.response?.data?.message ?? "Erro ao cadastrar paciente";
      toast.error(message);
      console.log(error);
    }
  }

  return (
    <main className="w-full h-full">
      <Subtitle>Cadastre um novo Paciente</Subtitle>

      <div className="w-full h-10 flex justify-center items-center">
        <hr className="w-[calc(100%-4px)] " />
      </div>

      <form onSubmit={form.handleSubmit(registerPaciente)} className="w-full">

        <InputField
          id="nome"
          type="text"
          placeholder="Nome Completo"
          label="Nome Completo *"
          register={form.register("nome")}
          errorInvalid={form.formState.errors.nome !== undefined}
          errorMessage={form.formState.errors.nome?.message}
        />

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">

        <InputField
          id="nascimento"
          type="date"
          placeholder="01/01/2000"
          label="Data de Nascimento *"
          register={form.register("nascimento")}
          errorInvalid={form.formState.errors.nascimento !== undefined}
          errorMessage={form.formState.errors.nascimento?.message}
        />
        <InputField
          id="fone"
          type="tel"
          placeholder="(00) 00000-0000"
          label="Telefone *"
          mask="phone"
          register={form.register("fone")}
          errorInvalid={form.formState.errors.fone !== undefined}
          errorMessage={form.formState.errors.fone?.message}
        />

        {/* Campo Sexo */}
        <div className="w-full flex flex-col gap-3">
          <label className="text-sm font-medium">Sexo *</label>
          <Controller
            control={form.control}
            name="sexo"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMININO">Feminino</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.sexo && (
            <span className="text-red-500 text-xs">{form.formState.errors.sexo.message}</span>
          )}
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
        <InputField
          id="cpf"
          type="text"
          placeholder="000.000.000-00"
          label="CPF *"
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
          mask="cns"
          register={form.register("cartaoSus")}
          errorInvalid={form.formState.errors.cartaoSus !== undefined}
          errorMessage={form.formState.errors.cartaoSus?.message}
        />
      </div>

      <InputField
        id="email"
        type="email"
        placeholder="email@exemplo.com"
        label="Email"
        register={form.register("email")}
        errorInvalid={form.formState.errors.email !== undefined}
        errorMessage={form.formState.errors.email?.message}
      />

      <div className="w-full flex justify-center items-center mt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto cursor-pointer"
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </div>
    </form>

    </main >
  )
}