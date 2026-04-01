'use client';

import { useUserStore } from "@/stores/userStore";
import PatientRegisterForm from "./_components/registerForm"
import { useEffect, useState } from "react";

export default function Paciente() {

      const [vh, setVh] = useState("100vh");
      const { loading } = useUserStore();
    
      useEffect(() => {
        const updateVh = () => setVh(`${window.innerHeight}px`);
        updateVh();
        window.addEventListener("resize", updateVh);
    
        return () => window.removeEventListener("resize", updateVh);
      }, []);
    
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
