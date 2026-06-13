"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AuditTrailContent } from "@/components/features/admin/audit-trail-content"

export default function AuditTrailPage() {
  const user = {
    name: "Admin User",
    email: "admin@stocksafe.com",
    profile: "ADMIN",
    initials: "AU",
  }

  return (
    <DashboardLayout user={user}>
      <AuditTrailContent />
    </DashboardLayout>
  )
}




