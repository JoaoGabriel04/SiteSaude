"use client";

import { useUserStore } from "@/stores/userStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import LogoutButton from "./_components/logoutButton";
import { toast } from "react-toastify";

export default function Dashboard() {
  const router = useRouter();

  const { data: session, status } = useSession();

  const userId = session?.user?.id;

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
    setTimeout(()=>{
      router.push("/");
    }, 1000);
  }

  return (
    <main className="w-full min-h-screen flex flex-col justify-center items-center space-y-2">
      <p>You&apos;re in the Dashboard</p>
      <p>Hello {session?.user.nome}</p>
      <p>Email: {session?.user.email}</p>
      <p>Role: {session?.user.role}</p>
      <LogoutButton />
    </main>
  );
}
