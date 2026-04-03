"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import SearchPacient from "./_components/searchPage";

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
        <div className="flex flex-col items-center justify-center">
            
            <SearchPacient />
            
        </div>
    )
}
