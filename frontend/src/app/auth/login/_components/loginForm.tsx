"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginFormSchema } from "@/schemas/loginSchema";
import { useRouter } from "next/navigation";
import { toast } from "@/toast/toastManager";
import { InputField } from "../../../../components/inputField";
import Image from "next/image";
import Link from "next/link";
import api, { setAccessToken } from "@/services/api";
import { useUserStore } from "@/stores/userStore";

export default function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const { isSubmitting } = form.formState;

  const { setUser, loading } = useUserStore();

  async function onSubmit(data: LoginFormData) {
    try {
      const res = await api.post("/api/auth/loginU", data);
      const result = res.data;

      setAccessToken(result.accessToken);
      setUser(result.user);

      toast.success("Login realizado com sucesso!");
      router.replace("/user/dashboard");
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Email ou senha incorretos";
      toast.error(message);
    }
  }

  return (
    <main className="w-full flex flex-col items-center">
      <Card className="lg:w-1/4 w-full flex flex-col items-center space-y-2 py-3 px-4">
        <header className="flex flex-col items-center space-y-1">
          <Image src="/images/logo.png" alt="Logo" width={100} height={100} className="w-20 h-20" />
          <h1 className="text-lg font-bold text-zinc-800">Sistema de Gestão</h1>
          <p className="text-sm text-zinc-600">Entre com suas credenciais para continuar</p>
        </header>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col items-center space-y-4 px-2"
        >
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
          <InputField
            id="password"
            type="password"
            placeholder="Digite sua senha"
            label="Senha"
            className="w-full"
            register={form.register("password")}
            errorInvalid={form.formState.errors.password !== undefined}
            errorMessage={form.formState.errors.password?.message}
          />
          <Button disabled={isSubmitting} className="w-3/4 cursor-pointer disabled:opacity-50">
            {isSubmitting ? "Entrando..." : "Login"}
          </Button>
        </form>
        <Link href="/" className="text-sm text-zinc-600 underline cursor-pointer">Voltar para a página inicial</Link>
      </Card>
    </main>
  );
}
