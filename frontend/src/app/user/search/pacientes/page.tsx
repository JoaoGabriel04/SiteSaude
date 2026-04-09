"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import SearchPacient from "./_components/searchPage";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import Header from "@/components/Header";

export default function Paciente() {

  const vh = useViewportHeight();
  const { user, loading } = useUserStore();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div style={{ height: vh }} className="w-full flex flex-col">

      <Header user={user} current="Pacientes" />
      <section className="flex-1 w-full md:px-2 md:py-2 overflow-hidden">
        <section className="w-full h-full px-4 pt-4 pb-2 bg-zinc-300/50 overflow-y-auto rounded-sm md:shadow-[0px_0px_4px_#00000060]">
          <SearchPacient />
        </section>
      </section>

    </div>
  )
}
