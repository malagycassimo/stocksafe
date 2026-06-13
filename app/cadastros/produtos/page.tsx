"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductsListContent } from "@/components/features/registrations/products-list-content"

const MOCK_USER = {
  name: "João Silva",
  email: "joao.silva@empresa.com",
  profile: "ADMIN",
  initials: "JS",
}

export default function ProductsListPage() {
  return (
    <DashboardLayout user={MOCK_USER}>
      <ProductsListContent />
    </DashboardLayout>
  )
}




