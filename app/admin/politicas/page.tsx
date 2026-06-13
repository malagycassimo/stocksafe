"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ValidityPoliciesContent } from "@/components/features/admin/validity-policies-content"

export default function ValidityPoliciesPage() {
  const user = {
    name: "Admin User",
    email: "admin@stocksafe.com",
    profile: "ADMIN",
    initials: "AU",
  }

  return (
    <DashboardLayout user={user}>
      <ValidityPoliciesContent />
    </DashboardLayout>
  )
}




