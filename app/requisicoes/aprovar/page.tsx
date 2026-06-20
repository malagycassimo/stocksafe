"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ApproveRequisitionsContent } from "@/components/features/requisitions/approve-requisitions-content"

export default function ApproveRequisitionsPage() {
  const user = {
    name: "João Silva",
    email: "joao.silva@stocksafe.com",
    profile: "GERAL" as const,
    initials: "JS",
  }

  return (
    <DashboardLayout user={user}>
      <ApproveRequisitionsContent />
    </DashboardLayout>
  )
}
