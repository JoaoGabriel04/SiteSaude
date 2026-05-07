"use client";

import { useUserStore } from "@/stores/userStore";
import LoadingScreen from "@/components/LoadingScreen";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import AuthProvider from "@/providers/AuthProvider";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

const routeToPageName: Record<string, string> = {
  "/user/dashboard": "Dashboard",
  "/user/pacientes": "Pacientes",
  "/user/agendamentos": "Agendamentos",
  "/user/profissionais": "Profissionais",
  "/user/finalizados": "Finalizados",
  "/user/cancelados": "Cancelados",
  "/user/meusAgendamentos": "Meus Agendamentos",
};

function UserGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserStore();
  const vh = useViewportHeight();
  const pathname = usePathname();

  const pageName = routeToPageName[pathname] || "";

  if (loading || !user) {
    return (
      <main style={{ height: vh }} className="w-full">
        <LoadingScreen fullPage />
      </main>
    );
  }

  return (
    <main style={{ height: vh }} className="w-full flex flex-col">
      <Header user={user} current={pageName} />

      <section className="flex-1 w-full p-1 md:p-2 overflow-hidden">
        <section className="w-full h-full px-4 pt-4 pb-2 bg-zinc-300/50 overflow-y-auto rounded-sm md:shadow-[0px_0px_4px_#00000060]">
          {children}
        </section>
      </section>
    </main>
  );
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <UserGuard>{children}</UserGuard>
    </AuthProvider>
  );
}