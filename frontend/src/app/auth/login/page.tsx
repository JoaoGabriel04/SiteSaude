'use client';
import LoginForm from "./_components/loginForm";
import { useEffect, useState } from "react";

export default function Login() {

  const [vh, setVh] = useState("100vh");

  useEffect(() => {
    const updateVh = () => setVh(`${window.innerHeight}px`);
    updateVh();
    window.addEventListener("resize", updateVh);

    return () => window.removeEventListener("resize", updateVh);
  }, []);
  
  return (
    <main style={{ height: vh }} className="flex flex-col items-center justify-center px-8 bg-sky-200/40">
      
      <LoginForm />
      
    </main>
  );
}