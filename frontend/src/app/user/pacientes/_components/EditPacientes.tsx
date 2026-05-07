'use client'

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/inputField";
import Subtitle from "@/components/Subtitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/toast/toastManager";
import api from "@/services/api";
import { useState } from "react";
import { Trash2 } from "lucide-react";

const editFormPatient = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO"], { error: "Selecione o sexo" }),
  nascimento: z.string()
    .min(1, "Data de nascimento obrigatória")
    .refine((v) => !isNaN(new Date(v).getTime()), { message: "Data inválida" })
    .refine((v) => new Date(v) <= new Date(), { message: "Data de nascimento inválida" }),
  fone: z.string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10 || v.length === 11, { message: "Telefone inválido" }),
  email: z.email("Email inválido").optional(),
});

type EditFormPatient = z.input<typeof editFormPatient>;

type PacienteData = {
  id: string;
  nome: string;
  sexo: "MASCULINO" | "FEMININO" | "OUTRO";
  cpf: string;
  cartaoSus: string;
  nascimento: string;
  fone: string;
  email?: string;
}

type EditPacientesProps = {
  paciente: PacienteData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPacientes({ paciente, onClose, onSuccess }: EditPacientesProps) {

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<EditFormPatient>({
    resolver: zodResolver(editFormPatient),
    defaultValues: {
      nome: paciente.nome,
      sexo: paciente.sexo,
      nascimento: new Date(paciente.nascimento).toISOString().split("T")[0],
      fone: paciente.fone,
      email: paciente.email ?? "",
    }
  });

  const { isSubmitting } = form.formState;

  async function editPaciente(data: EditFormPatient) {
    try {
      await api.patch(`/api/atendente/paciente/${paciente.id}`, data);
      toast.success("Paciente atualizado com sucesso!");
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Erro ao atualizar paciente";
      toast.error(message);
    }
  }

  async function deletePaciente() {
    try {
      setIsDeleting(true);
      await api.delete(`/api/atendente/paciente/${paciente.id}`);
      toast.success("Paciente excluído com sucesso!");
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Erro ao excluir paciente";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  }

  return (
    <main className="w-full">
      <Subtitle>Editar dados do paciente</Subtitle>

      <div className="w-full h-10 flex justify-center items-center">
        <hr className="w-[calc(100%-4px)]" />
      </div>

      {/* Info não editável */}
      <div className="w-full grid grid-cols-2 gap-2 mb-4 p-3 bg-zinc-100 rounded-md">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500 font-medium">CPF</span>
          <span className="text-sm text-zinc-700">{paciente.cpf}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500 font-medium">Cartão do SUS</span>
          <span className="text-sm text-zinc-700">{paciente.cartaoSus}</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(editPaciente)} className="w-full">

        <InputField
          id="nome"
          type="text"
          placeholder="Nome Completo"
          label="Nome Completo *"
          register={form.register("nome")}
          errorInvalid={form.formState.errors.nome !== undefined}
          errorMessage={form.formState.errors.nome?.message}
        />

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
          <InputField
            id="nascimento"
            type="date"
            placeholder="01/01/2000"
            label="Data de Nascimento *"
            register={form.register("nascimento")}
            errorInvalid={form.formState.errors.nascimento !== undefined}
            errorMessage={form.formState.errors.nascimento?.message}
          />
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Sexo *</label>
            <Controller
              control={form.control}
              name="sexo"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.sexo && (
              <span className="text-red-500 text-xs">{form.formState.errors.sexo.message}</span>
            )}
          </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
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
          <InputField
            id="email"
            type="email"
            placeholder="email@exemplo.com"
            label="Email"
            register={form.register("email")}
            errorInvalid={form.formState.errors.email !== undefined}
            errorMessage={form.formState.errors.email?.message}
          />
        </div>

        <div className="w-full flex justify-between items-center mt-4">

          {!confirmDelete ? (
            <Button
              type="button"
              variant="outline"
              className="text-red-500 border-red-300 hover:text-red-600 hover:bg-red-50 cursor-pointer"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Excluir paciente
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-500 font-medium">Confirmar exclusão?</span>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                className="cursor-pointer"
                onClick={deletePaciente}
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
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>

      </form>
    </main>
  )
}