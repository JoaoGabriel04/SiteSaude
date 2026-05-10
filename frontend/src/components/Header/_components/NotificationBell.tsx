'use client'

import { useState } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotificacoes } from "@/hooks/useNotificacoes"
import { User } from "@/types/user"
import api from "@/services/api"
import { toast } from "@/toast/toastManager"

type NotificationBellProps = {
  user: User | null
}

export default function NotificationBell({ user }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { notificacoes, naoLidas, mutate } = useNotificacoes()

  async function handleMarcarLida(id: string) {
    try {
      await api.put(`/api/notificacoes/${id}/lida`)
      mutate()
    } catch (error) {
      toast.error("Erro ao marcar como lida")
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await api.delete(`/api/notificacoes/${id}`)
      mutate()
    } catch (error) {
      toast.error("Erro ao excluir notificação")
    }
  }

  if (!user) return null

  return (
    <div className="relative inline-flex">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5 text-zinc-600" />
        {naoLidas !== null && naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-zinc-200 z-50 max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b">
              <span className="font-medium text-sm">Notificações</span>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-80">
              {notificacoes && notificacoes.length > 0 ? (
                notificacoes.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 border-b border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors group ${!notif.lida ? "bg-blue-50" : ""}`}
                    onClick={() => !notif.lida && handleMarcarLida(notif.id)}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.lida && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                      <div className={!notif.lida ? "" : "ml-4"}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-zinc-800 flex-1">{notif.titulo}</p>
                          <button
                            onClick={(e) => handleDelete(notif.id, e)}
                            className="text-zinc-400 hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 -mr-1 -mt-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{notif.mensagem}</p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {new Date(notif.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-zinc-400 text-sm">
                  Nenhuma notificação
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}