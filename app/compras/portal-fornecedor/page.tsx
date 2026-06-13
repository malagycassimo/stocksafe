"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SupplierPortalContent } from "@/components/features/purchasing/supplier-portal-content"

export default function SupplierPortalPage() {
  const user = {
    name: "Fornecedor A",
    email: "contato@fornecedora.com",
    profile: "FORNECEDOR",
    initials: "FA",
  }

  return (
    <DashboardLayout user={user}>
      <SupplierPortalContent />
    </DashboardLayout>
  )
}




