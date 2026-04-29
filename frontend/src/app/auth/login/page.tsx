'use client';
import { useEffect, useState } from "react";
import LoginForm from "./_components/loginForm";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { useUserStore } from "@/stores/userStore";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function Login() {

  const vh = useViewportHeight();
  const [isLoading, setIsLoading] = useState(true); // começa true
  const { setUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.get("/api/user/me");
        setUser(res.data);
        router.replace("/user/dashboard"); // redireciona direto com os dados da resposta
      } catch {
        // token inválido ou ausente, fica na página de login
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main style={{ height: vh }} className="flex flex-col items-center justify-center px-8 bg-sky-200/40">
      <LoginForm />
    </main>
  );
}