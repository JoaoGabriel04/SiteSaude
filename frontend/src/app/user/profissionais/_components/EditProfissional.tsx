'use client'

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/inputField";
import Subtitle from "@/components/Subtitle";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/toast/toastManager";
import api from "@/services/api";
import { useState, useRef } from "react";
import { Trash2, Camera } from "lucide-react";
import { Medico, Atendente } from "@/types/user";

const editFormUser = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  email: z.email("Email inválido"),
  nascimento: z.string()
    .min(1, "Data de nascimento obrigatória")
    .refine((v) => !isNaN(new Date(v).getTime()), { message: "Data inválida" }),
  fone: z.string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10 || v.length === 11, { message: "Telefone inválido" }),
  password: z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,30}$/, {
      message: "A senha deve ter maiúsculas, minúsculas, número e caractere especial"
    })
    .optional()
    .or(z.literal("")),
  especialidade: z.string().min(3).optional().or(z.literal("")),
  setor: z.string().min(3).optional().or(z.literal("")),
});

type EditFormUser = z.input<typeof editFormUser>;

type ProfissionalData = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  nascimento: string;
  fone: string;
  avatar?: string | null;
  role: "MEDICO" | "ATENDENTE" | "ADMIN" | null;
  medico?: Medico | null;
  atendente?: Atendente | null;
}

type EditProfissionalProps = {
  profissional: ProfissionalData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProfissional({ profissional, onClose, onSuccess }: EditProfissionalProps) {

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profissional.avatar ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditFormUser>({
    resolver: zodResolver(editFormUser),
    defaultValues: {
      nome: profissional.nome,
      email: profissional.email,
      nascimento: new Date(profissional.nascimento).toISOString().split("T")[0],
      fone: profissional.fone,
      password: "",
      especialidade: profissional.medico?.especialidade ?? "",
      setor: profissional.atendente?.setor ?? "",
    }
  });

  const { isSubmitting } = form.formState;
  console.log("errors:", form.formState.errors);

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

  async function editProfissional(data: EditFormUser) {
    let newAvatarUrl: string | null = null;

    try {
      let avatarUrl = profissional.avatar;

      if (avatarFile) {
        newAvatarUrl = await uploadAvatar(avatarFile);
        if (!newAvatarUrl) return;
        avatarUrl = newAvatarUrl;
      }

      const payload: Record<string, unknown> = {
        nome: data.nome,
        email: data.email,
        nascimento: data.nascimento,
        fone: data.fone,
        ...(avatarUrl && { avatar: avatarUrl }),
        ...(data.password && { password: data.password }),
        ...(data.especialidade && { especialidade: data.especialidade }),
        ...(data.setor && { setor: data.setor }),
      };

      await api.patch(`/api/atendente/profissional/${profissional.id}`, payload);
      toast.success("Profissional atualizado com sucesso!");
      onSuccess();
    } catch (error: unknown) {
      // Se o upload aconteceu mas o patch falhou, limpa a imagem nova do Cloudinary
      if (newAvatarUrl) {
        try { await api.delete("/api/upload/avatar", { data: { url: newAvatarUrl } }); } catch { /* silencia */ }
      }

      const apiError = error as { response?: { data?: { message?: string; error?: string } } };
      const message = apiError.response?.data?.message ?? "Erro ao atualizar profissional";
      toast.error(message);
    }
  }

  async function deleteProfissional() {
    try {
      setIsDeleting(true);
      await api.delete(`/api/atendente/profissional/${profissional.id}`);
      toast.success("Profissional excluído com sucesso!");
      onSuccess();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string; error?: string } } };
      const message = apiError.response?.data?.message ?? "Erro ao excluir profissional";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="w-full">
      <Subtitle>Editar dados do profissional</Subtitle>

      <div className="w-full h-10 flex justify-center items-center">
        <hr className="w-[calc(100%-4px)]" />
      </div>

      {/* Info não editável */}
      <div className="w-full grid grid-cols-2 gap-2 mb-4 p-3 bg-zinc-100 rounded-md">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500 font-medium">CPF</span>
          <span className="text-sm text-zinc-700">{profissional.cpf}</span>
        </div>
        {profissional.medico && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 font-medium">CRM</span>
            <span className="text-sm text-zinc-700">{profissional.medico.crm}</span>
          </div>
        )}
      </div>

      <form onSubmit={form.handleSubmit(editProfissional)} className="w-full">

        {/* Avatar */}
        <div className="w-full flex justify-center mb-4">
          <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-20 h-20 object-cover rounded-full border border-zinc-200" />
            ) : (
              <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                <Camera className="w-6 h-6 text-zinc-400" />
              </div>
            )}
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
          placeholder="Nome Completo"
          label="Nome Completo *"
          register={form.register("nome")}
          errorInvalid={form.formState.errors.nome !== undefined}
          errorMessage={form.formState.errors.nome?.message}
        />

        <InputField
          id="email"
          type="email"
          placeholder="email@exemplo.com"
          label="Email *"
          register={form.register("email")}
          errorInvalid={form.formState.errors.email !== undefined}
          errorMessage={form.formState.errors.email?.message}
        />

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
          <InputField
            id="nascimento"
            type="date"
            label="Data de Nascimento *"
            register={form.register("nascimento")}
            errorInvalid={form.formState.errors.nascimento !== undefined}
            errorMessage={form.formState.errors.nascimento?.message}
          />
          <InputField
            id="fone"
            type="tel"
            placeholder="(00) 00000-0000"
            label="Telefone *"
            mask="phone"
            register={form.register("fone")}
            errorInvalid={form.formState.errors.fone !== undefined}
            errorMessage={form.formState.errors.fone?.message}
          />
        </div>

        <InputField
          id="password"
          type="password"
          placeholder="Deixe em branco para não alterar"
          label="Nova Senha"
          register={form.register("password")}
          errorInvalid={form.formState.errors.password !== undefined}
          errorMessage={form.formState.errors.password?.message}
        />

        {profissional.role === "MEDICO" && (
          <InputField
            id="especialidade"
            type="text"
            placeholder="Especialidade"
            label="Especialidade *"
            register={form.register("especialidade")}
            errorInvalid={form.formState.errors.especialidade !== undefined}
            errorMessage={form.formState.errors.especialidade?.message}
          />
        )}

        {profissional.role === "ATENDENTE" && (
          <InputField
            id="setor"
            type="text"
            placeholder="Setor"
            label="Setor *"
            register={form.register("setor")}
            errorInvalid={form.formState.errors.setor !== undefined}
            errorMessage={form.formState.errors.setor?.message}
          />
        )}

        <div className="w-full flex justify-between items-center mt-4">
          {!confirmDelete ? (
            <Button
              type="button"
              variant="outline"
              className="text-red-500 border-red-300 hover:bg-red-50 cursor-pointer"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Excluir profissional
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-500 font-medium">Confirmar exclusão?</span>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                className="cursor-pointer"
                onClick={deleteProfissional}
              >
                {isDeleting ? "Excluindo..." : "Sim, excluir"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </Button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || uploadingAvatar}
            className="cursor-pointer"
          >
            {uploadingAvatar ? "Enviando imagem..." : isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </main>
  );
}