"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PosListContent } from "@/components/features/purchasing/pos-list-content"

export default function PosListPage() {
  const user = {
    name: "João Silva",
    email: "joao.silva@stocksafe.com",
    profile: "COMPRAS" as const,
    initials: "JS",
  }

  return (
    <DashboardLayout user={user}>
      <PosListContent />
    </DashboardLayout>
  )
}




