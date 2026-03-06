'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { Calendar, Gauge, LucideIcon, Menu, Users, UserStar } from "lucide-react";
import { Session } from "next-auth";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LogoutButton from "../logoutButton";

type HeaderProps = {
  session: Session | null;
  current: string;
}

type MenuOption = {
  text: string;
  url: string;
  icon: LucideIcon
}

const menuOptions: MenuOption[] = [
  { text: "Dashboard", url: "/dashboard", icon: Gauge },
  { text: "Pacientes", url: "/pacientes", icon: Users },
  { text: "Agendamentos", url: "/agendamentos", icon: Calendar },
  { text: "Profissionais", url: "/profissionais", icon: UserStar }
]

export default function Header({ session, current }: HeaderProps) {

  const router = useRouter();

  const vh = useViewportHeight();
  const [isOpen, setIsOpen] = useState(false);

  const ultimoNome = session?.user.nome
    .trim()
    .split(/\s+/)
    .at(-1)

  const menuRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (menuRef.current) {
      gsap.set(menuRef.current, { x: "-100%" })
    }
  }, [])

  const openMenu = () => {
    if (menuRef.current) {
      gsap.to(menuRef.current, {
        x: 0,
        duration: 0.5,
        ease: "power3.out",
      })
    }
  }

  const closeMenu = () => {
    if (menuRef.current) {
      gsap.to(menuRef.current, {
        x: "-100%",
        duration: 0.5,
        ease: "power3.inOut",
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      openMenu()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
      closeMenu()
    }
  }, [isOpen])

  function handleMenuClick() {
    if (isOpen) {
      closeMenu()
    } else {
      openMenu()
    }
    setIsOpen(!isOpen)
  }

  return (
    <header className="w-full h-16 flex justify-between items-center px-4 shadow-sm font-montserrat">
      <button onClick={handleMenuClick} className="w-1/4 cursor-pointer"><Menu className="w-9 h-full border border-zinc-500/60 p-1 rounded-sm" /></button>
      <nav ref={menuRef} style={{ height: vh }} className={`fixed left-0 top-0 z-999 w-6/10 lg:w-1/5 bg-zinc-200 flex flex-col py-4 border-r border-zinc-600/30 rounded-r-md shadow-[2px_0px_5px_#00000020]`}>
        <div className="w-full border-y border-y-zinc-600/30 text-sm flex justify-start items-center gap-2 px-2">
          <Avatar>
            <AvatarImage src={session?.user.avatar ? session?.user.avatar : 'images/avatar-1.png'} />
            <AvatarFallback>{session?.user.nome.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center gap-1 py-3 pl-2">
            <span className="font-semibold">{session?.user.nome.split(" ")[0] + " " + ultimoNome}</span>
            <span className="text-zinc-800/70">{session?.user.role.charAt(0).toUpperCase() + session?.user.role.slice(1).toLowerCase()}</span>
          </div>
        </div>
        <ul className="w-full px-4 py-1 mt-4 space-y-3 lg:space-y-4">
          {menuOptions.map((option, index) => {
            const Icon = option.icon;

            return (
              <li key={index} className={`flex items-center gap-4 px-2 py-2 rounded-sm ${current === option.text ? 'bg-sky-500/80 text-zinc-100 font-semibold' : 'hover:bg-sky-500/20 text-zinc-800'} cursor-pointer transition-all`}>
                <Icon size={20} />
                <Link href={option.url} className="text-sm lg:text-md">{option.text}</Link>
              </li>
            )
          })}
        </ul>
        <div className="w-full border-y border-y-zinc-600/30 text-sm flex flex-col justify-center gap-1 py-3 pl-2 mt-auto hover:bg-zinc-300/40 transition-all">
          <LogoutButton />
        </div>
      </nav>
      <div className="w-2/4 flex justify-center items-center gap-2">
        <Image src='/images/logo.png' alt="logo" width={100} height={100} className="w-10 h-10" />
        <h1 className="text-lg font-ubuntu-bold cursor-pointer" onClick={() => { router.push("/") }}>Medflow</h1>
      </div>
      <div className="w-1/4 flex justify-end items-center">
        <Avatar>
          <AvatarImage src={session?.user.avatar ? session?.user.avatar : 'images/avatar-1.png'} />
          <AvatarFallback>{session?.user.nome.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div style={{ height: vh }} className={`${isOpen ? 'block' : 'hidden'} w-full h-full fixed top-0 left-0 z-990 bg-zinc-800/60`} onClick={handleMenuClick}></div>
    </header>
  )

}