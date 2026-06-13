"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LocationsContent } from "@/components/features/registrations/locations-content"

export default function LocationsPage() {
  const user = {
    name: "Admin User",
    email: "admin@stocksafe.com",
    profile: "ADMIN",
    initials: "AU",
  }

  return (
    <DashboardLayout user={user}>
      <LocationsContent />
    </DashboardLayout>
  )
}




