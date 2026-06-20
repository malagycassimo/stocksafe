"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Eye, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { recebimentoService } from "@/app/services/recebimentoService"

export default function FiscalReceivingListPage() {
  const router = useRouter()
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const user = {
    name: "Finance User",
    email: "finance@stocksafe.com",
    profile: "ADMIN",
    initials: "FU",
  }

  useEffect(() => {
    setLoading(true)
    recebimentoService.listPurchaseOrders()
      .then((data) => {
        if (data && data.length > 0) {
          // Filter to POs that have check-in completed, or are in dynamic state
          const mapped = data
            .filter((po: any) => po.checkIn !== null)
            .map((po: any) => ({
              id: po.codigo,
              dbId: po.id,
              checkinDate: po.checkIn ? new Date(po.checkIn.createdAt).toLocaleString("pt-BR") : null,
              supplier: po.fornecedor?.razao_social || "Fornecedor",
              expectedDate: po.expectedDelivery.split('T')[0],
              totalValue: po.totalValue,
              status: po.status
            }))
          setPurchaseOrders(mapped)
        } else {
          setPurchaseOrders([])
        }
      })
      .catch((err) => {
        console.error("Erro ao listar POs:", err)
        setPurchaseOrders([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filteredPOs = purchaseOrders.filter((po) => {
    return po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
           po.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="text-sm text-muted-foreground mb-4">
          <Link href="/dashboard" className="hover:text-imperial">
            Home
          </Link>
          {" / "}
          <span>Recebimento</span>
          {" / "}
          <span className="text-foreground font-medium">Conferência Fiscal</span>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Conferência Fiscal
            </h1>
            <p className="text-muted-foreground">
              Selecione um pedido de compra que já realizou check-in para efetuar a conferência fiscal da nota fiscal.
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código do PO ou fornecedor..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos de Compra com Check-in Concluído</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-muted-foreground text-xs uppercase font-semibold">
                    <th className="px-4 py-3">PO Código</th>
                    <th className="px-4 py-3">Fornecedor</th>
                    <th className="px-4 py-3">Data Check-in</th>
                    <th className="px-4 py-3 text-right">Valor Total</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-imperial" />
                        Carregando pedidos de compra...
                      </td>
                    </tr>
                  ) : filteredPOs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum pedido de compra pronto para conferência fiscal.
                      </td>
                    </tr>
                  ) : (
                    filteredPOs.map((po) => (
                      <tr key={po.dbId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm font-semibold text-imperial">
                          {po.id}
                        </td>
                        <td className="px-4 py-3 text-sm">{po.supplier}</td>
                        <td className="px-4 py-3 text-sm">{po.checkinDate}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {po.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={po.status === 'FATURADO' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                            {po.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              className="bg-imperial hover:bg-imperial"
                              onClick={() => router.push(`/recebimento/fiscal/${po.dbId}`)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Conferir Fiscal
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
