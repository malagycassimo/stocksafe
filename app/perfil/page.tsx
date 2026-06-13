"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProfileContent } from "@/components/shared/profile-content"
import { useAuth } from "@/hooks/useAuth"

export default function ProfilePage() {
  const { user: authUser } = useAuth()

  // Mapeia o utilizador autenticado ou exibe carregando
  const user = authUser ? {
    name: authUser.nome || "Usuário",
    email: authUser.email || "",
    profile: authUser.perfil === "ADMIN" ? "Administrador" :
             ((authUser.perfil as string) === "COMPRAS_PROCUREMENT" || (authUser.perfil as string) === "COMPRAS") ? "Compras" :
             ((authUser.perfil as string) === "RECEBIMENTO_ARMAZEM" || (authUser.perfil as string) === "RECEBIMENTO") ? "Recebimento" :
             ((authUser.perfil as string) === "QUALIDADE_QA" || (authUser.perfil as string) === "QA") ? "Qualidade" : "Requisitante",
    initials: authUser.nome
      ? authUser.nome.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "US",
    phone: (authUser as any).telefone || "",
    department: (authUser as any).departamento || "",
    position: (authUser as any).cargo || "",
    lastAccess: (authUser as any).updatedAt ? new Date((authUser as any).updatedAt).toLocaleString("pt-BR") : new Date().toLocaleString("pt-BR"),
    avatar: null,
  } : {
    name: "Carregando...",
    email: "",
    profile: "Requisitante",
    initials: "US",
    phone: "",
    department: "",
    position: "",
    lastAccess: "",
    avatar: null,
  }

  return (
    <DashboardLayout user={user}>
      <ProfileContent user={user} />
    </DashboardLayout>
  )
}
