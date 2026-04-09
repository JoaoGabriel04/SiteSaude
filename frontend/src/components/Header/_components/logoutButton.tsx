"use client"

import { useUserStore } from "@/stores/userStore"
import { DoorOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import api from "@/services/api"

export default function LogoutButton() {
  const router = useRouter();
  const clearUser = useUserStore((state) => state.clearUser);

  async function handleLogout() {
    try {
      await api.post("/api/auth/logout"); // 🔥 limpa cookie no backend
    } catch (error) {
      // mesmo se der erro, continua logout local
    }

    clearUser(); // limpa Zustand

    router.replace("/auth/login"); // redireciona
  }

  return (
    <button
      className="flex items-center text-red-500 px-4 cursor-pointer"
      onClick={handleLogout}
    >
      <DoorOpen size={20} />
      <span className="ml-4 font-bold">Sair</span>
    </button>
  );
}