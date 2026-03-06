"use client";

import { useUserStore } from "@/stores/userStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import Header from "./_components/Header";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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

  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", onSelect)

    // define o inicial
    onSelect()

    return () => {
      api.off("select", onSelect)
    }
  }, [api])

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

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <main style={{ height: vh }} className="w-full flex flex-col overflow-hidden">

      <Header session={session} current={pageName} />

      <section className="flex-1 w-full md:px-2 md:py-2">
        <section className="w-full h-full px-4 pt-4 pb-2 bg-zinc-300/50 overflow-y-auto rounded-sm md:shadow-[0px_0px_4px_#00000060]">
          <span className="text-sm text-zinc-800 font-semibold ml-1">Boa Noite, {session?.user.nome.split(" ")[0] + " " + ultimoNome + "!"}</span>
          <Carousel className="w-full mt-4">
            <CarouselContent className="-ml-4">
              <CarouselItem className="pl-4 basis-2/3 md:basis-1/6">
                <Card className="flex flex-col items-start justify-start gap-1 p-3">
                  <span className="text-zinc-900 text-sm font-roboto font-medium">Total de Pacientes:</span>
                  <h1 className="text-4xl text-zinc-800/70 font-roboto">0</h1>
                  <span className="text-xs text-zinc-700/60 font-roboto font-medium mt-3">Marcados com urgência: 0</span>
                </Card>
              </CarouselItem>
              <CarouselItem className="pl-4 basis-2/3 md:basis-1/6">
                <Card className="flex flex-col items-start justify-start gap-1 p-3">
                  <span className="text-zinc-900 text-sm font-roboto font-medium">Agendamentos hoje:</span>
                  <h1 className="text-4xl text-zinc-800/70 font-roboto">0</h1>
                  <span className="text-xs text-zinc-700/60 font-roboto font-medium mt-3">Agendamentos no total: 0</span>
                </Card>
              </CarouselItem>
              <CarouselItem className="pl-4 basis-2/3 md:basis-1/6">
                <Card className="flex flex-col items-start justify-start gap-1 p-3">
                  <span className="text-zinc-900 text-sm font-roboto font-medium">Agendamentos hoje:</span>
                  <h1 className="text-4xl text-zinc-800/70 font-roboto">0</h1>
                  <span className="text-xs text-zinc-700/60 font-roboto font-medium mt-3">Agendamentos no total: 0</span>
                </Card>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          
        </section>
      </section>

    </main>
  );
}
