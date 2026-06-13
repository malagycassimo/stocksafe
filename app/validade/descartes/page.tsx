"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DisposalsContent } from "@/components/features/validity/disposals-content"

export default function DisposalsPage() {
  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <DisposalsContent />
    </DashboardLayout>
  )
}




