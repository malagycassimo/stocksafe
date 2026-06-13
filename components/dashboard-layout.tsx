"use client"

import type React from "react"
import { useState } from "react"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { useAuth } from "@/hooks/useAuth"

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    email: string
    profile: string
    initials: string
  }
}

export function DashboardLayout({ children, user: propUser }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { user: authUser } = useAuth()

  // Use auth user data if available, fallback to prop user or default values
  let activeUser = propUser || {
    name: "Usuário",
    email: "",
    profile: "REQUISITANTE",
    initials: "US"
  }

  if (authUser) {
    let frontendProfile = "REQUISITANTE";
    const userRole = authUser.perfil as string;
    if (userRole === "ADMIN") frontendProfile = "ADMIN";
    else if (userRole === "COMPRAS_PROCUREMENT" || userRole === "COMPRAS") frontendProfile = "COMPRAS";
    else if (userRole === "RECEBIMENTO_ARMAZEM" || userRole === "RECEBIMENTO") frontendProfile = "RECEBIMENTO";
    else if (userRole === "QUALIDADE_QA" || userRole === "QA") frontendProfile = "QA";

    const initials = authUser.nome
      ? authUser.nome.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "US";

    activeUser = {
      name: authUser.nome || "Usuário",
      email: authUser.email || "",
      profile: frontendProfile,
      initials: initials
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        user={activeUser}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <div className="flex pt-16">
        {/* Sidebar */}
        <DashboardSidebar isCollapsed={isSidebarCollapsed} userProfile={activeUser.profile} />

        {/* Main Content */}
        <main className={`flex-1 p-4 transition-all duration-300 max-w-full overflow-x-hidden ${isSidebarCollapsed ? "ml-20" : "ml-[260px]"}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
