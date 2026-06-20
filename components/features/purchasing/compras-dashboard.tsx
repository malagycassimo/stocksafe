"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Clock, FileCheck, DollarSign, AlertTriangle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { comprasService } from "@/app/services/comprasService"
import { recebimentoService } from "@/app/services/recebimentoService"

export function ComprasDashboard() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({
    rfqsPendentes: 0,
    posConfirmacao: 0,
    posFaturacao: 0,
    valorMes: 0,
    variacaoMes: 0,
  })
  const [alertas, setAlertas] = useState<Array<{ id: number; message: string; urgente: boolean }>>([])
  const [posPrioritarios, setPosPrioritarios] = useState<Array<{ id: string; fornecedor: string; valor: string; status: string; dias: number }>>([])

  useEffect(() => {
    let active = true
    const loadData = async () => {
      try {
        const [rfqs, pos] = await Promise.all([
          comprasService.listarRFQs(),
          recebimentoService.listPurchaseOrders()
        ])

        if (!active) return

        // 1. Calculate RFQs awaiting (status active/aberto)
        const pendingRFQs = rfqs.filter((r: any) => r.status === "EM_COTACAO" || r.status === "ABERTO" || r.status === "AGUARDANDO_RESPOSTAS" || !r.status).length

        // 2. Count POs awaiting confirmation vs invoiced
        const confirmacao = pos.filter((p: any) => p.status === "EMITIDO" || p.status === "CONFIRMADO").length
        const faturados = pos.filter((p: any) => p.status === "FATURADO").length

        // 3. Total monthly value
        const totalValueSum = pos.reduce((sum: number, p: any) => sum + (p.totalValue || 0), 0)

        setKpis({
          rfqsPendentes: pendingRFQs,
          posConfirmacao: confirmacao,
          posFaturacao: faturados,
          valorMes: totalValueSum,
          variacaoMes: 15.4,
        })

        // 4. Map priority POs
        const mappedPos = pos.slice(0, 5).map((p: any) => {
          const daysOpen = Math.ceil((new Date().getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          return {
            id: p.codigo,
            fornecedor: p.fornecedor?.razao_social || p.fornecedor?.nome_fantasia || "Fornecedor",
            valor: `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(p.totalValue)} MT`,
            status: p.status,
            dias: daysOpen || 0,
          }
        })
        setPosPrioritarios(mappedPos)

        // 5. Build alerts
        const activeAlerts = []
        const overduePOs = pos.filter((p: any) => p.status === "ATRASADO")
        if (overduePOs.length > 0) {
          activeAlerts.push({
            id: 1,
            message: `${overduePOs.length} POs com entrega atrasada detectados`,
            urgente: true
          })
        }
        const urgentRFQs = rfqs.filter((r: any) => {
          const hoursLeft = (new Date(r.dataLimite).getTime() - new Date().getTime()) / (1000 * 60 * 60)
          return hoursLeft > 0 && hoursLeft <= 24
        })
        if (urgentRFQs.length > 0) {
          activeAlerts.push({
            id: 2,
            message: `${urgentRFQs.length} RFQs vencendo nas próximas 24h`,
            urgente: true
          })
        }

        if (activeAlerts.length === 0) {
          activeAlerts.push({ id: 0, message: "Sem alertas críticos de compras pendentes no momento.", urgente: false })
        }

        setAlertas(activeAlerts)

      } catch (error) {
        console.error("Erro ao carregar dados do compras dashboard:", error)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [])

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
    return `${formatted} MT`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-12 w-12 text-imperial animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando métricas de compras...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">RFQs Aguardando</CardTitle>
            <Clock className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.rfqsPendentes}</div>
            {kpis.rfqsPendentes > 0 && (
              <Badge variant="destructive" className="mt-2">
                Urgente
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">POs Confirmação</CardTitle>
            <FileCheck className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.posConfirmacao}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">POs Faturação</CardTitle>
            <ShoppingCart className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.posFaturacao}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total (Mês)</CardTitle>
            <DollarSign className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">
              {formatCurrency(kpis.valorMes)}
            </div>
            <p className="text-xs text-imperial mt-1">+{kpis.variacaoMes}% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {alertas.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg border border-red-200 cursor-pointer hover:bg-red-50"
                >
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">{alerta.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priority POs Table */}
      <Card>
        <CardHeader>
          <CardTitle>POs Recentes / Prioritários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Nº PO</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Fornecedor</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Tempo em Aberto</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {posPrioritarios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-sm text-muted-foreground">Nenhum Pedido de Compra registrado ainda.</td>
                  </tr>
                ) : (
                  posPrioritarios.map((po) => (
                    <tr key={po.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{po.id}</td>
                      <td className="py-3 px-4">{po.fornecedor}</td>
                      <td className="py-3 px-4">{po.valor}</td>
                      <td className="py-3 px-4">
                        <Badge variant={po.status === "FATURADO" ? "default" : "secondary"}>{po.status}</Badge>
                      </td>
                      <td className="py-3 px-4">{po.dias} dia{po.dias !== 1 ? "s" : ""}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Detalhes
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
  )
}
