import Link from "next/link";
import LoginForm from "./_components/loginForm";

export default function Login() {
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <LoginForm />
      <Link href="/" className="mt-2 underline text-sm text-sky-600 cursor-pointer">
        Retornar a Página Inicial
      </Link>
    </main>
  );
}