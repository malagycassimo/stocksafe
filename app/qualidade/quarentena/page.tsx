"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QuarantineQueueContent } from "@/components/features/quality/quarantine-queue-content"

export default function QuarantineQueuePage() {
  const user = {
    name: "QA User",
    email: "qa@stocksafe.com",
    profile: "QA",
    initials: "QA",
  }

  return (
    <DashboardLayout user={user}>
      <QuarantineQueueContent />
    </DashboardLayout>
  )
}




