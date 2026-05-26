'use client'

import { useState, useEffect } from "react"
import Modal from "@/components/Modal"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/inputField"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/toast/toastManager"
import { Camera, Lock, User } from "lucide-react"
import { useUserStore } from "@/stores/userStore"
import api from "@/services/api"

type PerfilModalProps = {
  isOpen: boolean
  onClose: () => void
}

const roleLabels: Record<string, string> = {
  MEDICO: "Médico",
  ATENDENTE: "Atendente",
  ADMIN: "Administrador"
}

export default function PerfilModal({ isOpen, onClose }: PerfilModalProps) {
  const { user, setUser } = useUserStore()
  const [activeTab, setActiveTab] = useState<"info" | "senha">("info")
  const [isLoading, setIsLoading] = useState(false)
  
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [crm, setCrm] = useState<string | null>(null)
  const [especialidade, setEspecialidade] = useState<string | null>(null)
  const [setor, setSetor] = useState<string | null>(null)
  const [role, setRole] = useState("")
  
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")

  useEffect(() => {
    if (isOpen && user) {
      setNome(user.nome || "")
      setEmail(user.email || "")
      setAvatar(user.avatar || null)
      setAvatarPreview(null)
      setAvatarFile(null)
      setRole(user.role || "")
      setEspecialidade(user.medico?.especialidade || null)
      setCrm(user.medico?.crm || null)
      setSetor(user.atendente?.setor || null)
    }
  }, [isOpen, user])

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  async function handleSaveInfo() {
    if (!nome.trim()) {
      toast.error("Nome é obrigatório")
      return
    }

    setIsLoading(true)
    try {
      const dataToSend: Record<string, unknown> = { nome }

      if (role === "MEDICO" && especialidade) {
        dataToSend.especialidade = especialidade
      }

      if (avatarFile) {
        const formData = new FormData()
        formData.append("avatar", avatarFile)
        
        const res = await api.post("/api/upload/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        
        dataToSend.avatar = res.data.url
        setAvatar(res.data.url)
      }

      const res = await api.put("/api/user/profile", dataToSend)
      
      setUser(res.data)
      toast.success("Perfil atualizado com sucesso!")
      setAvatarFile(null)
      setAvatarPreview(null)
      onClose()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      console.error("[handleSaveInfo] Erro:", error)
      toast.error(err.response?.data?.message || "Erro ao salvar")
    } finally {
      setIsLoading(false)
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande (máx 5MB)")
        return
      }
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  function handleRemoveAvatar() {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  async function handleSaveSenha() {
    if (!novaSenha) {
      toast.error("Informe a nova senha")
      return
    }
    
    if (novaSenha.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres")
      return
    }
    
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem")
      return
    }

    setIsLoading(true)
    try {
      await api.put("/api/user/profile", { password: novaSenha })
      toast.success("Senha atualizada com sucesso!")
      setNovaSenha("")
      setConfirmarSenha("")
      onClose()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      console.error("[handleSaveSenha] Erro:", error)
      toast.error(err.response?.data?.message || "Erro ao salvar")
    } finally {
      setIsLoading(false)
    }
  }

  const isAdmin = role === "ADMIN"
  const displayAvatar = avatarPreview || avatar || "/images/avatar-1.png"
  const hasNewAvatar = !!avatarFile

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meu Perfil" size="xl">
      <div className="flex flex-col gap-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={displayAvatar} />
              <AvatarFallback className="text-2xl">
                {nome.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!isAdmin && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>
          {hasNewAvatar && (
            <button
              onClick={handleRemoveAvatar}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remover nova imagem
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "info"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <User className="w-4 h-4" />
            Informações
          </button>
          {!isAdmin && (
            <button
              onClick={() => setActiveTab("senha")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "senha"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Lock className="w-4 h-4" />
              Segurança
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
          <div className="flex flex-col gap-4">
            <InputField
              id="nome"
              type="text"
              label="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={isAdmin}
              errorInvalid={false}
            />

            <InputField
              id="email"
              type="email"
              label="Email"
              value={email}
              disabled
              errorInvalid={false}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-600">Cargo</label>
                <div className="p-2 bg-zinc-50 rounded-md text-sm text-zinc-700">
                  {roleLabels[role] || role}
                </div>
              </div>

              {crm && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-zinc-600">CRM</label>
                  <div className="p-2 bg-zinc-50 rounded-md text-sm text-zinc-700">
                    {crm}
                  </div>
                </div>
              )}

              {setor && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-zinc-600">Setor</label>
                  <div className="p-2 bg-zinc-50 rounded-md text-sm text-zinc-700">
                    {setor}
                  </div>
                </div>
              )}
            </div>

            {role === "MEDICO" && (
              <InputField
                id="especialidade"
                type="text"
                label="Especialidade"
                value={especialidade || ""}
                onChange={(e) => setEspecialidade(e.target.value)}
                disabled={isAdmin}
                errorInvalid={false}
              />
            )}

            {!isAdmin && (
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveInfo}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "senha" && !isAdmin && (
          <div className="flex flex-col gap-4">
            <InputField
              id="nova-senha"
              type="password"
              label="Nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />

            <InputField
              id="confirmar-senha"
              type="password"
              label="Confirmar nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveSenha}
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? "Salvando..." : "Atualizar senha"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}