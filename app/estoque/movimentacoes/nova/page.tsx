"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NewManualMovementContent } from "@/components/features/inventory/new-manual-movement-content"

export default function NewManualMovementPage() {
  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <NewManualMovementContent />
    </DashboardLayout>
  )
}




