"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RfqsListContent } from "@/components/features/purchasing/rfqs-list-content"

export default function RfqsListPage() {
  const user = {
    name: "Maria Santos",
    email: "maria.santos@stocksafe.com",
    profile: "COMPRAS",
    initials: "MS",
  }

  return (
    <DashboardLayout user={user}>
      <RfqsListContent />
    </DashboardLayout>
  )
}




