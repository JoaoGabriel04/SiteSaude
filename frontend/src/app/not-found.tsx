'use client'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center space-y-2">
      <p>Página não encontrada</p>
      <Link href="/" onClick={(e) => {
        e.preventDefault()
        router.back()
      }}>
        <Button className="w-50 cursor-pointer">Retornar</Button>
      </Link>
    </div>
  );
}
