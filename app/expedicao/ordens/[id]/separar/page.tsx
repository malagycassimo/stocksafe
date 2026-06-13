"use client"

import { use } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PickingExecutionContent } from "@/components/features/shipping/picking-execution-content"

export default function PickingExecutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <PickingExecutionContent orderId={id} />
    </DashboardLayout>
  )
}


