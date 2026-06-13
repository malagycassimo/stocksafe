"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QualityInspectionContent } from "@/components/features/quality/quality-inspection-content"

export default function QualityInspectionPage() {
  const user = {
    name: "QA User",
    email: "qa@stocksafe.com",
    profile: "QA",
    initials: "QA",
  }

  return (
    <DashboardLayout user={user}>
      <QualityInspectionContent />
    </DashboardLayout>
  )
}


