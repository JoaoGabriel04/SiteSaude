'use client'
import { Button } from "@/components/ui/button";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { Copyright, PhoneCall } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faInstagram, faWhatsapp, faYoutube } from '@fortawesome/free-brands-svg-icons'
import Image from "next/image";
import Link from "next/link";

const footerOptions = [
  {text: "Início", url: "/"},
  {text: "Profissionais", url: "/profissionais"},
  {text: "Atendentes", url: "/atendentes"},
  {text: "Sobre", url: "/sobre"},
  {text: "Ajuda", url: "/ajuda"},
]

export default function Home() {

  const vh = useViewportHeight();

  return (
    <main className="w-full flex flex-col bg-[url('/images/fundo-papel-amassado.jpg')] bg-fixed bg-cover bg-no-repeat">
      <header className="absolute w-full top-0 left-0 py-4 px-4 lg:px-20 flex justify-between z-999">
        <div>
          <Image src={'/images/logo-maior.png'} alt="logo-medflow" width={200} height={200} className="w-10 lg:w-15 drop-shadow-[0px_0px_1px_#05d5ff]" />
        </div>
        <nav className="flex justify-center items-center gap-2">
          <Link href={'/agendas'} className="cursor-pointer">
            <Button className="w-25 bg-sky-500 hover:bg-sky-400 transition-all shadow-md cursor-pointer">
              Consultar
            </Button>
          </Link>
          <Link href={'/auth/login'} className="cursor-pointer">
            <Button className="w-25 bg-emerald-500 hover:bg-emerald-400 transition-all shadow-md cursor-pointer">
              Entrar
            </Button>
          </Link>
        </nav>
      </header>

      <section className="relative w-full h-[90vh] bg-[url('/images/jovem-atendente-mascara.jpg')] bg-position-[center_left_-15rem] lg:bg-center bg-cover bg-no-repeat rounded-b-[40px] shadow-lg overflow-hidden z-1">
        <div className="w-full h-full flex flex-col justify-center items-center px-5 bg-teal-900/70">
          <h1 className="lg:w-200 text-center text-zinc-100 text-2xl lg:text-4xl font-montserrat font-semibold tracking-wide">Simplifique a gestão de consultas da sua clínica.</h1>
          <Image src={'/images/traco-linha-preto.png'} alt="linha-preata" width={500} height={500} className="w-40 lg:w-50 -mt-4 invert" />
          <p className="lg:w-160 text-center font-montserrat text-xs/6 lg:text-sm/6 text-zinc-300 tracking-wide -mt-4">Um sistema pensado para atendentes, médicos e pacientes acompanharem agendamentos com organização, praticidade e segurança.</p>
        </div>
      </section>

      <section className="w-full flex flex-col items-center px-4 pb-4 z-1">

        <Image src={'/images/profissionais.png'} alt="profissionais" width={500} height={500} className="w-85 lg:w-200 -mt-20 drop-shadow-lg/40 relative z-0" />
        <div className="w-full lg:w-8/10 grid grid-cols-3 lg:grid-cols-4 bg-white shadow-md/20 font-montserrat text-[10px] lg:text-sm text-center py-4 px-2 rounded-4xl lg:rounded-full relative z-10">
          <span className="flex justify-center items-center text-zinc-500 border-r border-zinc-300 tracking-wide">Profissionais de Confiança</span>
          <span className="flex justify-center items-center text-zinc-500 border-r border-zinc-300 tracking-wide">Seus agendamentos organizados</span>
          <span className="flex justify-center items-center text-zinc-500 lg:border-r lg:border-zinc-300 tracking-wide">Plataforma segura</span>
          <div className="flex justify-center items-center col-span-3 lg:col-span-1 mt-4 lg:mt-0">
            <Button className="cursor-pointer font-inter bg-zinc-500 hover:bg-zinc-400 rounded-full">
              <Link href={'/contact'} className="flex justify-center items-center gap-2">
                <PhoneCall />
                Contate-nos
              </Link>
            </Button>
          </div>

        </div>

      </section>

      <footer className="w-full h-50 lg:h-60 flex flex-col justify-center items-center gap-4 bg-zinc-700 shadow-[0px_-4px_10px_#00000040] z-1">
        <ul className="w-full flex justify-center items-center gap-4 lg:gap-10 text-sm text-zinc-100/60 font-montserrat">
          {
            footerOptions.map((link, index)=>(
              <li><Link key={index} href={link.url} className="hover:font-bold transition-all">{link.text}</Link></li>
            ))
          }
        </ul>
        <ul className="w-full flex justify-center items-center gap-4 lg:gap-10 text-2xl text-zinc-100/60">
          <li className="cursor-pointer"><FontAwesomeIcon icon={faFacebook} /></li>
          <li className="cursor-pointer"><FontAwesomeIcon icon={faInstagram} /></li>
          <li className="cursor-pointer"><FontAwesomeIcon icon={faYoutube} /></li>
          <li className="cursor-pointer"><FontAwesomeIcon icon={faWhatsapp} /></li>
        </ul>
        <div className="w-full flex justify-center items-center mt-4">
          <span className="flex justify-center items-center gap-2 text-zinc-100/60 text-xs font-light"><Copyright size={15}/> 2026 Medflow, Inc. All rights reserved.</span>
        </div>
      </footer>
      <div style={{ height: vh }} className="fixed w-full bg-zinc-100/70 top-0 left-0 z-0"></div>
    </main>
  );
}
