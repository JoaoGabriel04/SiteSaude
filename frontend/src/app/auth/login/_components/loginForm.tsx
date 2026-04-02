"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginFormSchema } from "@/schemas/loginSchema";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/toast/toastManager";
import { useEffect, useState } from "react";
import { InputField } from "../../../../components/inputField";
import Image from "next/image";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const { isSubmitting } = form.formState;
  const [isLoading, setIsLoading] = useState(true);

  async function onSubmit(data: LoginFormData) {
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res && res.error) {
      toast.error("Email ou senha incorretos");
      return;
    }
    router.push("/dashboard");
  }

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      console.log(status); // "authenticated"
      setIsLoading(false);
      router.replace("/dashboard");
    }
  }, [status, router, session]);

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
            placeholder="password"
            label="Senha"
            className="w-full"
            register={form.register("password")}
            errorInvalid={form.formState.errors.password !== undefined}
            errorMessage={form.formState.errors.password?.message}
          />
          <Button disabled={isSubmitting || status === "loading" || isLoading} className="w-3/4 cursor-pointer disabled:opacity-50">
            Login
          </Button>
        </form>
        <Link href="/" className="text-sm text-zinc-600 underline cursor-pointer">Voltar para a página inicial</Link>
      </Card>
    </main>
  );
}
