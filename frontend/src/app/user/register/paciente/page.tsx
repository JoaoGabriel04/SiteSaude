'use client';
import { useUserStore } from "@/stores/userStore";
import PatientRegisterForm from "./_components/registerForm"
import { useViewportHeight } from "@/hooks/useViewportHeight";

export default function Paciente() {

  const vh = useViewportHeight();
  const { loading } = useUserStore();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <main style={{ height: vh }} className="flex flex-col items-center justify-center bg-sky-200/40">
      {/* <h1>Olá Mundo!</h1> */}
      <PatientRegisterForm />
    </main>
  )
}
