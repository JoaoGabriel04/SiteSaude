import { User } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, ClipboardList, Calendar } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import AusenciasManager from "./AusenciasManager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProfissionalDetailsProps = {
  profissional: User;
  onClose: () => void;
};

const statusColors: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-700",
  INATIVO: "bg-red-100 text-red-700",
};

const roleColors: Record<string, string> = {
  MEDICO: "bg-blue-100 text-blue-600",
  ATENDENTE: "bg-purple-100 text-purple-600",
  ADMIN: "bg-amber-100 text-amber-600",
};

export default function ProfissionalDetails({
  profissional,
  onClose,
}: ProfissionalDetailsProps) {
  const { user } = useUserStore()

  const podeEditar = user && (
    user.role === "ADMIN" ||
    user.role === "ATENDENTE" ||
    (profissional.role === "MEDICO" && user.id === profissional.id)
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 pb-3 border-b">
        <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center">
          <Avatar className="w-full h-full">
            <AvatarImage src={profissional.avatar ? profissional.avatar : '/images/avatar-1.png'} />
            <AvatarFallback>{profissional.nome.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-800">{profissional.nome}</h2>
          <p className="text-sm text-zinc-500">ID: {profissional.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-xs text-zinc-500 uppercase">Cargo</span>
          <div>
            <Badge className={`${roleColors[profissional.role!] || ""}`}>
              {profissional.role === "MEDICO" ? "Médico" : profissional.role === "ATENDENTE" ? "Atendente" : "Admin"}
            </Badge>
          </div>
        </div>

        {profissional.role === "MEDICO" && profissional.medico && (
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase">Status</span>
            <div>
              <Badge className={`${statusColors[profissional.medico.status!] || ""}`}>
                {profissional.medico.status}
              </Badge>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2 border-t">
        <div className="space-y-1">
          <span className="text-xs text-zinc-500 uppercase">CPF</span>
          <p className="text-sm text-zinc-700">{profissional.cpf}</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-zinc-500 uppercase">Email</span>
          <p className="text-sm text-zinc-700">{profissional.email}</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-zinc-500 uppercase">Telefone</span>
          <p className="text-sm text-zinc-700">{profissional.fone}</p>
        </div>

        {profissional.role === "MEDICO" && profissional.medico && (
          <>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 uppercase flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> CRM
              </span>
              <p className="text-sm text-zinc-700">{profissional.medico.crm}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-zinc-500 uppercase flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> Especialidade
              </span>
              <p className="text-sm text-zinc-700">{profissional.medico.especialidade}</p>
            </div>
          </>
        )}

        {profissional.role === "ATENDENTE" && profissional.atendente && (
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase flex items-center gap-1">
              <ClipboardList className="w-3 h-3" /> Setor
            </span>
            <p className="text-sm text-zinc-700">{profissional.atendente.setor}</p>
          </div>
        )}

        {profissional.role === "MEDICO" && profissional.medico && podeEditar && (
          <div className="pt-2 border-t">
            <AusenciasManager
              docId={profissional.id}
              podeEditar={podeEditar}
            />
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2 border-t">
        <div className="space-y-1">
          <span className="text-xs text-zinc-500 uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Data de Criação
          </span>
          <p className="text-sm text-zinc-700">
            {profissional.createdAt
              ? new Date(profissional.createdAt).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              : "-"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-zinc-500 uppercase">Última Atualização</span>
          <p className="text-sm text-zinc-700">
            {profissional.updatedAt
              ? new Date(profissional.updatedAt).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}