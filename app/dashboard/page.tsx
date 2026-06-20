"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RequisitanteDashboard } from "@/components/features/requisitions/requisitante-dashboard"
import { ComprasDashboard } from "@/components/features/purchasing/compras-dashboard"
import { RecebimentoDashboard } from "@/components/features/receiving/recebimento-dashboard"
import { QADashboard } from "@/components/features/quality/qa-dashboard"
import { AdminDashboard } from "@/components/features/admin/admin-dashboard"

import { useAuth } from "@/hooks/useAuth"

// Mock user profile - in production, this would come from auth context
const MOCK_USER = {
  name: "João Silva",
  email: "joao.silva@empresa.com",
  profile: "REQUISITANTE" as const, // Change to test different profiles: REQUISITANTE | COMPRAS | RECEBIMENTO | QA | ADMIN
  initials: "JS",
}

export default function DashboardPage() {
  const { user: authUser } = useAuth()

  const getProfile = () => {
    if (!authUser) return "REQUISITANTE"
    const userRole = authUser.perfil as string
    if (userRole === "ADMIN") return "ADMIN"
    if (userRole === "COMPRAS_PROCUREMENT" || userRole === "COMPRAS") return "COMPRAS"
    if (userRole === "RECEBIMENTO_ARMAZEM" || userRole === "RECEBIMENTO") return "RECEBIMENTO"
    if (userRole === "QUALIDADE_QA" || userRole === "QA") return "QA"
    return "REQUISITANTE"
  }

  const userProfile = getProfile()

  const renderDashboardContent = () => {
    switch (userProfile) {
      case "REQUISITANTE":
        return <RequisitanteDashboard />
      case "COMPRAS":
        return <ComprasDashboard />
      case "RECEBIMENTO":
        return <RecebimentoDashboard />
      case "QA":
        return <QADashboard />
      case "ADMIN":
        return <AdminDashboard />
      default:
        return <RequisitanteDashboard />
    }
  }

  return (
    <DashboardLayout user={MOCK_USER}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Home</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-primary font-medium">Dashboard</span>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-imperial">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        {/* Dynamic Dashboard Content */}
        {renderDashboardContent()}
      </div>
    </DashboardLayout>
  )
}





