import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Clock, FileCheck, DollarSign, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ComprasDashboard() {
  const kpis = {
    rfqsPendentes: 5,
    posConfirmacao: 3,
    posFaturacao: 8,
    valorMes: 125000,
    variacaoMes: 12.5,
  }

  const alertas = [
    { id: 1, message: "RFQ #123 vence em 2 horas", urgente: true },
    { id: 2, message: "PO #456 atrasado há 3 dias", urgente: true },
  ]

  const posPrioritarios = [
    { id: "PO-001", fornecedor: "Fornecedor A", valor: "R$ 15.000", status: "Confirmado", dias: 2 },
    { id: "PO-002", fornecedor: "Fornecedor B", valor: "R$ 8.500", status: "Pendente", dias: 5 },
    { id: "PO-003", fornecedor: "Fornecedor C", valor: "R$ 22.000", status: "Confirmado", dias: 1 },
  ]

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
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.valorMes)}
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
          <CardTitle>POs Prioritários</CardTitle>
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
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Dias em Aberto</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {posPrioritarios.map((po) => (
                  <tr key={po.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{po.id}</td>
                    <td className="py-3 px-4">{po.fornecedor}</td>
                    <td className="py-3 px-4">{po.valor}</td>
                    <td className="py-3 px-4">
                      <Badge variant={po.status === "Confirmado" ? "default" : "secondary"}>{po.status}</Badge>
                    </td>
                    <td className="py-3 px-4">{po.dias} dias</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Faturar
                        </Button>
                        <Button size="sm" variant="link" className="text-imperial">
                          Ver
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




