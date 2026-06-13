"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NewPickingOrderContent } from "@/components/features/shipping/new-picking-order-content"

export default function NewPickingOrderPage() {
  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <NewPickingOrderContent />
    </DashboardLayout>
  )
}




