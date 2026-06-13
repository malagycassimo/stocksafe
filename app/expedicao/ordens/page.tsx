"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PickingOrdersContent } from "@/components/features/shipping/picking-orders-content"

export default function PickingOrdersPage() {
  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <PickingOrdersContent />
    </DashboardLayout>
  )
}




