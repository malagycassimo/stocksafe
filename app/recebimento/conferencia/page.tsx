"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PhysicalInspectionContent } from "@/components/features/quality/physical-inspection-content"

function InspectionPageContent() {
  const searchParams = useSearchParams()
  const poId = searchParams.get("po")
  const labelCode = searchParams.get("etiqueta")

  const mockUser = {
    name: "João Silva",
    email: "joao.silva@stocksafe.com",
    profile: "RECEBIMENTO" as const,
    initials: "JS",
  }

  return (
    <DashboardLayout user={mockUser}>
      <PhysicalInspectionContent poId={poId} labelCode={labelCode} />
    </DashboardLayout>
  )
}

export default function InspectionPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <InspectionPageContent />
    </Suspense>
  )
}




