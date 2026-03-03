import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col justify-center items-center space-y-2">
      <div>Hello world!</div>
      <Link href="/auth/login" className="">
        <Button className="w-30 cursor-pointer">Login</Button>
      </Link>
      <Link href="/auth/register">
        <Button className="w-30 cursor-pointer">Register</Button>
      </Link>
      <Link href="/dashboard">
        <Button className="w-30 cursor-pointer">Dashboard</Button>
      </Link>
    </main>
  );
}
