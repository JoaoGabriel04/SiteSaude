"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import api from "@/services/api";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  
  const { setUser, clearUser, setLoading } = useUserStore();

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);

        const res = await api.get("/api/user/me");

        setUser(res.data);

      } catch (error) {
        // 🔥 se falhar, limpa usuário
        clearUser();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return <>{children}</>;
}