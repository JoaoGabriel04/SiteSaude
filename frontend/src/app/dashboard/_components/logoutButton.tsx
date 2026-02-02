'use client'

import { Button } from "@/components/ui/button"
import { useUserStore } from "@/stores/userStore"
import { signOut } from "next-auth/react"

export default function LogoutButton() {

  return (
    <Button
      className="cursor-pointer"
      onClick={()=>{
        signOut()
        useUserStore.getState().clearUser();
      }}
    >
      Logout
    </Button>
  )
}