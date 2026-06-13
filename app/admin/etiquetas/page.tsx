"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LabelStandardsContent } from "@/components/features/admin/label-standards-content"

export default function LabelStandardsPage() {
  const user = {
    name: "Admin User",
    email: "admin@stocksafe.com",
    profile: "ADMIN",
    initials: "AU",
  }

  return (
    <DashboardLayout user={user}>
      <LabelStandardsContent />
    </DashboardLayout>
  )
}




