"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NewPoContent } from "@/components/features/purchasing/new-po-content"

export default function NewPoPage() {
  const user = {
    name: "João Silva",
    email: "joao.silva@stocksafe.com",
    profile: "COMPRAS" as const,
    initials: "JS",
  }

  return (
    <DashboardLayout user={user}>
      <NewPoContent />
    </DashboardLayout>
  )
}
