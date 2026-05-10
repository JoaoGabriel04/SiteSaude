'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { Calendar, CalendarCheck, Gauge, LucideIcon, Menu, Archive, Users, UserStar, XCircle, FileText, Briefcase } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LogoutButton from "./_components/logoutButton";
import NotificationBell from "./_components/NotificationBell";
import PerfilModal from "@/components/PerfilModal";
import { Role, User } from "@/types/user";
import { useUserStore } from "@/stores/userStore";

type HeaderProps = {
  user: User | null;
  current: string;
}

type MenuOption = {
  text: string;
  url: string;
  icon: LucideIcon;
  roles?: Role[];
  group?: string;
};

const menuOptions: MenuOption[] = [
  { text: "Dashboard", url: "/user/dashboard", icon: Gauge, group: "GERAL" },
  { text: "Pacientes", url: "/user/pacientes", icon: Users, group: "CADASTROS" },
  { text: "Profissionais", url: "/user/profissionais", icon: UserStar, group: "CADASTROS" },
  { text: "Agendamentos", url: "/user/agendamentos", icon: Calendar, group: "AGENDA" },
  { text: "Finalizados", url: "/user/finalizados", icon: Archive, group: "AGENDA" },
  { text: "Cancelados", url: "/user/cancelados", icon: XCircle, group: "AGENDA" },
  {
    text: "Meus Agendamentos",
    url: "/user/meusAgendamentos",
    icon: CalendarCheck,
    roles: [Role.MEDICO],
    group: "AGENDA",
  },
  {
    text: "Ausências",
    url: "/user/ausencias",
    icon: Briefcase,
    roles: [Role.MEDICO],
    group: "AUSENCIAS",
  },
  {
    text: "Solicitações",
    url: "/user/solicitacoes",
    icon: FileText,
    roles: [Role.ADMIN, Role.ATENDENTE],
    group: "AUSENCIAS",
  },
];

export default function Header({ user, current }: HeaderProps) {
  const router = useRouter();
  const { setUser } = useUserStore();

  const vh = useViewportHeight();
  const [isOpen, setIsOpen] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);

  const nome = user?.nome ?? "";
  const partes = nome.split(" ");

  const primeiroNome = partes[0] ?? "";
  const ultimoNome = partes.length > 1 ? partes.at(-1) ?? "" : "";

  const role = user?.role ?? "";
  const roleFormatada =
    role.length > 0
      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      : "";

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

  const visibleOptions = menuOptions.filter(
    (option) => !option.roles || (user?.role && option.roles.includes(user.role as Role))
  );

  const groupedOptions = visibleOptions.reduce((acc, option) => {
    const group = option.group || "OUTROS";
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, MenuOption[]>);

  const groupLabels: Record<string, string> = {
    GERAL: "Geral",
    CADASTROS: "Cadastros",
    AGENDA: "Agenda",
    AUSENCIAS: "Ausências",
    OUTROS: "Outros",
  };

  return (
    <header className="w-full h-18 lg:h-16 grid grid-cols-3 px-4 shadow-sm font-montserrat">
      <button onClick={handleMenuClick} className="cursor-pointer"><Menu className="w-9 h-9 border border-zinc-500/60 p-1 rounded-sm" /></button>
      <nav ref={menuRef} style={{ height: vh }} className={`fixed left-0 top-0 z-999 w-6/10 lg:w-1/5 bg-zinc-200 flex flex-col py-4 border-r border-zinc-600/30 rounded-r-md shadow-[2px_0px_5px_#00000020]`}>
        <div className="w-full border-y border-y-zinc-600/30 text-sm flex justify-start items-center gap-2 px-2 cursor-pointer" onClick={() => setShowPerfil(true)}>
          <Avatar>
            <AvatarImage src={user?.avatar ? user.avatar : '/images/avatar-1.png'} />
            <AvatarFallback>{user?.nome.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center gap-1 py-3 pl-2">
            <span className="font-semibold">{primeiroNome + " " + ultimoNome}</span>
            <span className="text-zinc-800/70">
              {roleFormatada}
            </span>
          </div>
        </div>
        <ul className="w-full px-4 py-1 mt-4 overflow-y-auto">
          {Object.entries(groupedOptions).map(([group, options]) => (
            <li key={group} className="mb-6">
              {group !== "OUTROS" && (
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 px-2">
                  {groupLabels[group]}
                </div>
              )}
              <div className="space-y-1">
                {options.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <Link 
                      key={`${group}-${index}`} 
                      href={option.url} 
                      className={`flex items-center gap-3 px-2 py-2 rounded-sm ${current === option.text ? 'bg-blue-600 text-zinc-100 font-semibold' : 'hover:bg-blue-600/20 text-zinc-800'} cursor-pointer transition-all`}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{option.text}</span>
                    </Link>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
        <div className="w-full border-y border-y-zinc-600/30 text-sm flex flex-col justify-center gap-1 py-3 pl-2 mt-auto hover:bg-zinc-300/40 transition-all">
          <LogoutButton />
        </div>
      </nav>
      <div className="flex justify-center items-center gap-2">
        <Image src='/images/logo.png' alt="logo" width={100} height={100} className="w-10 h-10" />
        <h1 className="text-lg font-ubuntu-bold cursor-pointer" onClick={() => { router.push("/") }}>Medflow</h1>
      </div>
      <div className="flex justify-end items-center gap-3">
        <NotificationBell user={user} />
        <Avatar className="cursor-pointer" onClick={() => setShowPerfil(true)}>
          <AvatarImage src={user?.avatar ? user.avatar : '/images/avatar-1.png'} />
          <AvatarFallback>{user?.nome.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div style={{ height: vh }} className={`${isOpen ? 'block' : 'hidden'} w-full h-full fixed top-0 left-0 z-990 bg-zinc-800/60`} onClick={handleMenuClick}></div>

      <PerfilModal
        isOpen={showPerfil}
        onClose={() => setShowPerfil(false)}
      />
    </header>
  )

}