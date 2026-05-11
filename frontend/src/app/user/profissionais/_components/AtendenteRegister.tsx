'use client'
import { InputField } from "@/components/inputField";
import Subtitle from "@/components/Subtitle";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { toast } from "@/toast/toastManager";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Role } from "@/types/user";
import { regFormAtendente, RegisterFormAtendente } from "@/schemas/registerAtendente";
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

type AtendenteRegProps = {
  onSubmit: () => void;
}

export default function AtendenteRegister({ onSubmit }: AtendenteRegProps) {

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RegisterFormAtendente>({
    resolver: zodResolver(regFormAtendente),
  });

  const { isSubmitting } = form.formState;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar(file: File): Promise<string | null> {
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.post("/api/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data.url;
    } catch {
      toast.error("Erro ao fazer upload da imagem");
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function registerAtendente(data: RegisterFormAtendente) {
    try {
      let avatarUrl: string | null = null;

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
        if (!avatarUrl) return;
      }

      const { confirmPassword, ...payload } = data;
      const newData = {
        ...payload,
        role: Role.ATENDENTE,
        ...(avatarUrl && { avatar: avatarUrl })
      };

      await api.post("/api/auth/registerU", newData);
      toast.success("Registro realizado com sucesso.");
      onSubmit();

    } catch (error: any) {
      const message = error?.response?.data?.error ?? "Erro ao cadastrar atendente";
      toast.error(message);
    }
  }

  return (
    <main className="w-full">
      <Subtitle>Cadastre um novo Atendente</Subtitle>

      <div className="w-full h-10 flex justify-center items-center">
        <hr className="w-[calc(100%-4px)]" />
      </div>

      <form onSubmit={form.handleSubmit(registerAtendente)} className="w-full">

        {/* Avatar */}
        <div className="w-full flex justify-center mb-4">
          <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarPreview ?? ""} />
              <AvatarFallback className="text-2xl bg-zinc-100">
                <Camera className="w-6 h-6 text-zinc-400" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <InputField
          id="nome"
          type="text"
          placeholder="Digite seu nome completo"
          label="Nome Completo *"
          register={form.register("nome")}
          errorInvalid={form.formState.errors.nome !== undefined}
          errorMessage={form.formState.errors.nome?.message}
        />
        <InputField
          id="email"
          type="email"
          placeholder="Digite seu email"
          label="Email *"
          register={form.register("email")}
          errorInvalid={form.formState.errors.email !== undefined}
          errorMessage={form.formState.errors.email?.message}
        />
        <div className="w-full grid grid-cols-2 gap-2">
          <InputField
            id="password"
            type="password"
            placeholder="Senha"
            label="Senha *"
            className="w-full"
            register={form.register("password")}
            errorInvalid={form.formState.errors.password !== undefined}
            errorMessage={form.formState.errors.password?.message}
          />
          <InputField
            id="confirmPassword"
            type="password"
            placeholder="Confirmar Senha"
            label="Confirmar Senha *"
            className="w-full"
            register={form.register("confirmPassword")}
            errorInvalid={form.formState.errors.confirmPassword !== undefined}
            errorMessage={form.formState.errors.confirmPassword?.message}
          />
        </div>

        <InputField
          id="cpf"
          type="text"
          placeholder="000.000.000-00"
          label="CPF *"
          className="w-full"
          mask="cpf"
          register={form.register("cpf")}
          errorInvalid={form.formState.errors.cpf !== undefined}
          errorMessage={form.formState.errors.cpf?.message}
        />
        <InputField
          id="nascimento"
          type="date"
          placeholder="01/01/2000"
          label="Data de Nascimento *"
          className="w-full"
          register={form.register("nascimento")}
          errorInvalid={form.formState.errors.nascimento !== undefined}
          errorMessage={form.formState.errors.nascimento?.message}
        />
        <InputField
          id="fone"
          type="tel"
          placeholder="(00) 00000-0000"
          label="Telefone *"
          className="w-full"
          mask="phone"
          register={form.register("fone")}
          errorInvalid={form.formState.errors.fone !== undefined}
          errorMessage={form.formState.errors.fone?.message}
        />

        <InputField
          id="setor"
          type="text"
          placeholder="Diga o setor"
          label="Setor *"
          className="w-full"
          register={form.register("setor")}
          errorInvalid={form.formState.errors.setor !== undefined}
          errorMessage={form.formState.errors.setor?.message}
        />

        <div className="w-full flex justify-center items-center mt-4">
          <Button
            type="submit"
            disabled={isSubmitting || uploadingAvatar}
            className="w-full md:w-auto cursor-pointer"
          >
            {uploadingAvatar ? "Enviando imagem..." : isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </div>
      </form>
    </main>
  )
}