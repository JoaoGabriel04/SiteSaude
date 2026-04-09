'use client';
import { Card, CardTitle, CardHeader } from "@/components/ui/card";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MedicoRegisterPage() {

  const vh = useViewportHeight();
  const router = useRouter();

  return (
    <main style={{ height: vh }} className="flex flex-col items-center justify-center bg-sky-200/40">
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <button onClick={() => router.back()} className="cursor-pointer">
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <CardTitle>Novo Profissional</CardTitle>
        </CardHeader>
      </Card>

    </main>
  )
}