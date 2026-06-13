"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReportsHubContent } from "@/components/shared/reports-hub-content"

export default function ReportsPage() {
  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <ReportsHubContent />
    </DashboardLayout>
  )
}




