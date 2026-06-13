"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InventoryScheduleContent } from "@/components/features/inventory/inventory-schedule-content"

export default function InventorySchedulePage() {
  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <InventoryScheduleContent />
    </DashboardLayout>
  )
}




