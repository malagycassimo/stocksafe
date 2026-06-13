"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NewInventoryContent } from "@/components/features/inventory/new-inventory-content"

export default function NewInventoryPage() {
  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <NewInventoryContent />
    </DashboardLayout>
  )
}




