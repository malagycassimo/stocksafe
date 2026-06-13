"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CampaignsListContent } from "@/components/features/validity/campaigns-list-content"

export default function CampaignsListPage() {
  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <CampaignsListContent />
    </DashboardLayout>
  )
}




