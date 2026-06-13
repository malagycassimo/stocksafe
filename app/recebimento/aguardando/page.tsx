"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AwaitingReceiptContent } from "@/components/features/receiving/awaiting-receipt-content"

export default function AwaitingReceiptPage() {
  const user = {
    name: "Carlos Santos",
    email: "carlos.santos@stocksafe.com",
    profile: "RECEBIMENTO",
    initials: "CS",
  }

  return (
    <DashboardLayout user={user}>
      <AwaitingReceiptContent />
    </DashboardLayout>
  )
}




