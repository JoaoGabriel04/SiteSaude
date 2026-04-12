'use client'
import { InputField } from "@/components/inputField";
import Subtitle from "@/components/Subtitle";
import { Button } from "@/components/ui/button";
import { regFormMedico, RegisterFormMedico } from "@/schemas/registerMedico";
import api from "@/services/api";
import { toast } from "@/toast/toastManager";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Role } from "@/types/user";

type MedicoRegProps = {
  onSubmit: () => void;
}

export default function ProfissionalRegister({ onSubmit }: MedicoRegProps) {

  const form = useForm<RegisterFormMedico>({
    resolver: zodResolver(regFormMedico),
  });

  const { isSubmitting } = form.formState;

  async function registerProfissional(data: RegisterFormMedico) {
    try {
      const { confirmPassword, ...payload } = data;
      const newData = { ...payload, role: Role.MEDICO }
      await api.post("http://localhost:7000/api/auth/registerU", newData);

      console.log("Registro realizado com sucesso.")
      toast.success("Registro realizado com sucesso.");
      onSubmit();

    } catch (error: any) {

      const message = error?.response?.data?.message ?? "Erro ao cadastrar médico";
      toast.error(message);
      console.log(error);

    }
  }

  return (
    <main className="w-full h-full">
      <Subtitle>Cadastre um novo Profissional</Subtitle>

      <div className="w-full h-10 flex justify-center items-center">
        <hr className="w-[calc(100%-4px)] " />
      </div>

      <form onSubmit={form.handleSubmit(registerProfissional)} className="w-full">
        <InputField
          id="nome"
          type="text"
          placeholder="Digite seu nome completo"
          label="Nome Completo *"
          register={form.register("nome")}
          errorInvalid={form.formState.errors.nome !== undefined}
          errorMessage={form.formState.errors.nome?.message}
        />
        <InputField
          id="email"
          type="email"
          placeholder="Digite seu email"
          label="Email *"
          register={form.register("email")}
          errorInvalid={form.formState.errors.email !== undefined}
          errorMessage={form.formState.errors.email?.message}
        />
        <div className="w-full grid grid-cols-2 gap-2">
          <InputField
            id="password"
            type="password"
            placeholder="Senha"
            label="Senha *"
            className="w-full"
            register={form.register("password")}
            errorInvalid={form.formState.errors.password !== undefined}
            errorMessage={form.formState.errors.password?.message}
          />
          <InputField
            id="confirmPassword"
            type="password"
            placeholder="Confirmar Senha"
            label="Confirmar Senha *"
            className="w-full"
            register={form.register("confirmPassword")}  // agora registrado no form
            errorInvalid={form.formState.errors.confirmPassword !== undefined}
            errorMessage={form.formState.errors.confirmPassword?.message}
          />
        </div>

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

        <div className="w-full grid grid-cols-2 gap-2">
          <InputField
            id="crm"
            type="text"
            placeholder="XXX-YY 000000"
            label="CRM *"
            className="w-full"
            register={form.register("crm")}
            errorInvalid={form.formState.errors.crm !== undefined}
            errorMessage={form.formState.errors.crm?.message}
          />
          <InputField
            id="especialidade"
            type="text"
            placeholder="Diga a especialidade"
            label="Especialidade *"
            className="w-full"
            register={form.register("especialidade")}
            errorInvalid={form.formState.errors.especialidade !== undefined}
            errorMessage={form.formState.errors.especialidade?.message}
          />
        </div>

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

    </main>
  )

}