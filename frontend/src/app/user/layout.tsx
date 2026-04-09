"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useUserStore } from "@/stores/userStore";
import LoadingScreen from "@/components/LoadingScreen";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import AuthProvider from "@/providers/AuthProvider";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const vh = useViewportHeight();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.get("/api/user/me");

        console.log(res.data);
        setUser(res.data);
      } catch (error) {
        router.replace("/auth/login");
      }
    }

    if (!user) {
      checkAuth();
    }
  }, [user]);

  if (!user) {
    return (
      <main style={{ height: vh }} className="w-full">
        <LoadingScreen />
      </main>
    ); // ou LoadingScreen
  }

  return <><AuthProvider>{children}</AuthProvider></>;
}