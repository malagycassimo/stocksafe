"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UsersListContent } from "@/components/features/admin/users-list-content"

export default function UsersPage() {
  const user = {
    name: "Admin User",
    email: "admin@stocksafe.com",
    profile: "ADMIN",
    initials: "AU",
  }

  return (
    <DashboardLayout user={user}>
      <UsersListContent />
    </DashboardLayout>
  )
}




