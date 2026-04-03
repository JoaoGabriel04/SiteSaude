'use client'

import { useUserStore } from "@/stores/userStore"
import { DoorOpen } from "lucide-react"
import { signOut } from "next-auth/react"

export default function LogoutButton() {

  return (
    <button className="flex items-center text-red-500 px-4 cursor-pointer" onClick={()=>{
      signOut()
      useUserStore.getState().clearUser();
    }}>
      <DoorOpen size={20}/>
      <span className="ml-4 font-bold">Sair</span>
    </button>
  )
}