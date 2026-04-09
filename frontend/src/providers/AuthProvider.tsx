"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import api, { setAccessToken } from "@/services/api";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser, setLoading } = useUserStore();

  useEffect(() => {
    async function initAuth() {
      try {
        setLoading(true);

        // 🔄 tenta renovar token usando cookie
        const refreshRes = await api.post("/api/auth/refresh");

        const newToken = refreshRes.data.accessToken;

        // 💾 salva accessToken em memória
        setAccessToken(newToken);

        // 👤 busca usuário autenticado
        const userRes = await api.get("/api/user/me");

        setUser(userRes.data);

      } catch (error) {
        // ❌ não autenticado
        clearUser();
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  return <>{children}</>;
}