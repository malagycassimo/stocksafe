"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { WorkflowsContent } from "@/components/features/admin/workflows-content"

export default function WorkflowsPage() {
  const user = {
    name: "Admin User",
    email: "admin@stocksafe.com",
    profile: "ADMIN",
    initials: "AU",
  }

  return (
    <DashboardLayout user={user}>
      <WorkflowsContent />
    </DashboardLayout>
  )
}




