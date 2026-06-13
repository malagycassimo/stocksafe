"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ExpiryDashboardContent } from "@/components/expiry-dashboard-content"

export default function ExpiryDashboardPage() {
  return (
    <DashboardLayout>
      <ExpiryDashboardContent />
    </DashboardLayout>
  )
}
