"use client";

import { useUserStore } from "@/stores/userStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import Header from "./_components/Header";
import { useViewportHeight } from "@/hooks/useViewportHeight";

export default function Dashboard() {
  const router = useRouter();
  const pageName = "Dashboard";
  const vh = useViewportHeight();

  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const ultimoNome = session?.user.nome
    .trim()
    .split(/\s+/)
    .at(-1)
  const { data, error, isLoading } = useSWR(
    userId ? `/api/atendente/profile/${userId}` : null
  );

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

  if (status === "unauthenticated") {
    toast.error("Você não está logado");
    setTimeout(() => {
      router.push("/");
    }, 1000);
  }

  return (
    <main style={{ height: vh }} className="w-full flex flex-col">

      <Header session={session} current={pageName} />

      <section className="flex-1 w-full px-4 py-2 bg-zinc-300/50 overflow-y-auto">
        <span className="text-sm text-zinc-800 font-semibold ml-1">Boa Noite, {session?.user.nome.split(" ")[0] + " " + ultimoNome + "!"}</span>
      </section>

    </main>
  );
}
