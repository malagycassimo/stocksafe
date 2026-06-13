"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CampaignsListContent } from "@/components/campaigns-list-content"

export default function CampaignsListPage() {
  return (
    <DashboardLayout>
      <CampaignsListContent />
    </DashboardLayout>
  )
}
