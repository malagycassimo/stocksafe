"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InspectionsListContent } from "@/components/features/quality/inspections-list-content"

export default function InspectionsListPage() {
  const user = {
    name: "QA User",
    email: "qa@stocksafe.com",
    profile: "QA",
    initials: "QA",
  }

  return (
    <DashboardLayout user={user}>
      <InspectionsListContent />
    </DashboardLayout>
  )
}
