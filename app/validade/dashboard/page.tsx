"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ExpiryDashboardContent } from "@/components/features/validity/expiry-dashboard-content"

export default function ExpiryDashboardPage() {
  return (
    <DashboardLayout>
      <ExpiryDashboardContent />
    </DashboardLayout>
  )
}




