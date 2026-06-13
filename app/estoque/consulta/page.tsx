"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockQueryContent } from "@/components/features/inventory/stock-query-content"

export default function StockQueryPage() {
  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <StockQueryContent />
    </DashboardLayout>
  )
}




