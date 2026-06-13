"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NonConformityRegistrationContent } from "@/components/features/receiving/non-conformity-registration-content"

export default function NonConformityRegistrationPage() {
  const user = {
    name: "Recebimento User",
    email: "recebimento@stocksafe.com",
    profile: "RECEBIMENTO",
    initials: "RU",
  }

  return (
    <DashboardLayout user={user}>
      <NonConformityRegistrationContent />
    </DashboardLayout>
  )
}




