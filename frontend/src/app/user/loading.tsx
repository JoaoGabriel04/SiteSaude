"use client";

import LoadingScreen from "@/components/LoadingScreen";
import { useViewportHeight } from "@/hooks/useViewportHeight";

export default function Loading() {
  const vh = useViewportHeight();

  return (
    <main style={{ height: vh }} className="w-full flex flex-col">
      <div className="h-16 bg-zinc-800 animate-pulse" />
      <section className="flex-1 w-full p-1 md:p-2 overflow-hidden">
        <section className="w-full h-full px-4 pt-4 pb-2 bg-zinc-300/50 overflow-y-auto rounded-sm md:shadow-[0px_0px_4px_#00000060]">
          <LoadingScreen />
        </section>
      </section>
    </main>
  );
}