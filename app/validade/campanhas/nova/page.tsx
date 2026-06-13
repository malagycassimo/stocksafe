"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NewCampaignContent } from "@/components/features/validity/new-campaign-content"

export default function NewCampaignPage() {
  const user = {
    name: "Stock User",
    email: "stock@stocksafe.com",
    profile: "ADMIN",
    initials: "SU",
  }

  return (
    <DashboardLayout user={user}>
      <NewCampaignContent />
    </DashboardLayout>
  )
}




