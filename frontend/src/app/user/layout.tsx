"use client";

import { useUserStore } from "@/stores/userStore";
import LoadingScreen from "@/components/LoadingScreen";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import AuthProvider from "@/providers/AuthProvider";

function UserGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserStore();
  const vh = useViewportHeight();

  if (loading || !user) {
    return (
      <main style={{ height: vh }} className="w-full">
        <LoadingScreen />
      </main>
    );
  }

  return <>{children}</>;
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