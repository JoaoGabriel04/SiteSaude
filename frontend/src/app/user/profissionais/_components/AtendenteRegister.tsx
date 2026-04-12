'use client'
import { InputField } from "@/components/inputField";
import Subtitle from "@/components/Subtitle";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { toast } from "@/toast/toastManager";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Role } from "@/types/user";
import { regFormAtendente, RegisterFormAtendente } from "@/schemas/registerAtendente";

type AtendenteRegProps = {
  onSubmit: () => void;
}

export default function AtendenteRegister({ onSubmit }: AtendenteRegProps) {

  const form = useForm<RegisterFormAtendente>({
    resolver: zodResolver(regFormAtendente),
  });

  const { isSubmitting } = form.formState;

  async function registerAtendente(data: RegisterFormAtendente) {
    try {
      const { confirmPassword, ...payload } = data;
      const newData = { ...payload, role: Role.ATENDENTE }
      await api.post("http://localhost:7000/api/auth/registerU", newData);

      console.log("Registro realizado com sucesso.")
      toast.success("Registro realizado com sucesso.");
      onSubmit();

    } catch (error: any) {

      const message = error?.response?.data?.message ?? "Erro ao cadastrar atendente";
      toast.error(message);
      console.log(error);

    }
  }

  return (
    <main className="w-full h-full">
      <Subtitle>Cadastre um novo Atendente</Subtitle>

      <div className="w-full h-10 flex justify-center items-center">
        <hr className="w-[calc(100%-4px)] " />
      </div>

      <form onSubmit={form.handleSubmit(registerAtendente)} className="w-full">
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

        <InputField
          id="setor"
          type="text"
          placeholder="Diga o setor"
          label="Setor *"
          className="w-full"
          register={form.register("setor")}
          errorInvalid={form.formState.errors.setor !== undefined}
          errorMessage={form.formState.errors.setor?.message}
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

    </main>
  )

}