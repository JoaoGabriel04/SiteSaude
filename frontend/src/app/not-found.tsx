import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center space-y-2">
      <p>Página não encontrada</p>
      <Link href="/">
        <Button className="w-50 cursor-pointer">Retornar a Página Inicial</Button>
      </Link>
    </div>
  );
}
