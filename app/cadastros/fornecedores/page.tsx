"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SuppliersListContent } from "@/components/features/registrations/suppliers-list-content"

export default function SuppliersPage() {
  const user = {
    name: "Admin User",
    email: "admin@stocksafe.com",
    profile: "ADMIN",
    initials: "AU",
  }

  return (
    <DashboardLayout user={user}>
      <SuppliersListContent />
    </DashboardLayout>
  )
}




