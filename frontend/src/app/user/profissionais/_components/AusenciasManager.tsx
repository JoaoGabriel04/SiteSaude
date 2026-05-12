'use client'

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { useExcecoesMedico } from "@/hooks/useExcecoesMedico"
import AusenciasList from "./AusienciasList"
import { useUserStore } from "@/stores/userStore"

type AusenciasManagerProps = {
  docId: string
  podeEditar: boolean
}

export default function AusenciasManager({ docId, podeEditar }: AusenciasManagerProps) {
  const { user } = useUserStore()
  const { excecoes, isLoading, mutate } = useExcecoesMedico(docId)

  const isOwner = user?.id === docId

  function handleDeleteSuccess(id: string) {
    mutate()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700">Ausências Aprovadas</h3>
        <Link href="/user/ausencias">
          <Button size="sm" variant="outline" className="h-7 text-xs cursor-pointer">
            Ver todas
          </Button>
        </Link>
      </div>

      <AusienciasList
        excecoes={excecoes}
        isLoading={isLoading}
        podeEditar={podeEditar || isOwner}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  )
}