"use client"

import { use } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InventoryCountingContent } from "@/components/features/inventory/inventory-counting-content"

export default function InventoryCountingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <InventoryCountingContent inventoryId={id} />
    </DashboardLayout>
  )
}


