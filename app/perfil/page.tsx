"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProfileContent } from "@/components/shared/profile-content"

export default function ProfilePage() {
  // Mock user data - in production this would come from auth/session
  const user = {
    name: "João Silva",
    email: "joao.silva@stocksafe.com",
    profile: "Requisitante",
    initials: "JS",
    phone: "+258 84 123 4567",
    department: "Logística",
    position: "Coordenador de Estoque",
    lastAccess: "2025-01-24 14:30",
    avatar: null,
  }

  return (
    <DashboardLayout user={user}>
      <ProfileContent user={user} />
    </DashboardLayout>
  )
}




