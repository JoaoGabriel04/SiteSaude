"use client";

import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import LoadingScreen from "@/components/LoadingScreen";
import { useEffect } from "react";

export default function Dashboard() {

  const pageName = "Dashboard";
  const vh = useViewportHeight();

  const { user, loading, isAuthenticated } = useUserStore();

  const ultimoNome = user?.nome
    .trim()
    .split(/\s+/)
    .at(-1)

  useEffect(()=>{
    console.log(isAuthenticated);
  }, [])

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <main style={{ height: vh }} className="w-full flex flex-col overflow-hidden">

      <Header user={user} current={pageName} />

      <section className="flex-1 w-full md:px-2 md:py-2">
        <section className="w-full h-full px-4 pt-4 pb-2 bg-zinc-300/50 overflow-y-auto rounded-sm md:shadow-[0px_0px_4px_#00000060]">
          <span className="text-sm text-zinc-800 font-semibold ml-1">Boa Noite, {user?.nome.split(" ")[0] + " " + ultimoNome + "!"}</span>
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
