import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, Package, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function RequisitanteDashboard() {
  // Mock data
  const kpis = {
    pendentes: 3,
    aprovadas: 7,
    recebidos: 24,
  }

  const requisicoes = [
    { id: "RI-001", data: "20/01/2025", itens: 5, status: "Pendente" },
    { id: "RI-002", data: "19/01/2025", itens: 3, status: "Aprovada" },
    { id: "RI-003", data: "18/01/2025", itens: 8, status: "Em Compra" },
    { id: "RI-004", data: "17/01/2025", itens: 2, status: "Recebida" },
    { id: "RI-005", data: "16/01/2025", itens: 6, status: "Recebida" },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Requisições Pendentes</CardTitle>
            <FileText className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">{kpis.pendentes}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando aprovação</p>
            <Button variant="link" className="px-0 mt-2 text-imperial hover:text-imperial">
              Ver todas →
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Requisições Aprovadas</CardTitle>
            <CheckCircle className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">{kpis.aprovadas}</div>
            <p className="text-xs text-muted-foreground mt-1">Em processo de compra</p>
            <Button variant="link" className="px-0 mt-2 text-imperial hover:text-imperial">
              Ver todas →
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Itens Recebidos</CardTitle>
            <Package className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">{kpis.recebidos}</div>
            <p className="text-xs text-muted-foreground mt-1">Nos últimos 7 dias</p>
            <Button variant="link" className="px-0 mt-2 text-imperial hover:text-imperial">
              Ver detalhes →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="h-20 bg-imperial hover:bg-imperial text-white text-lg font-medium">
          <Plus className="w-6 h-6 mr-2" />
          Nova Requisição
        </Button>
        <Button
          variant="outline"
          className="h-20 border-imperial text-imperial hover:bg-twilight text-lg font-medium bg-transparent"
        >
          <Search className="w-6 h-6 mr-2" />
          Consultar Estoque
        </Button>
      </div>

      {/* Recent Requisitions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Últimas Requisições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Nº RI</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Itens</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {requisicoes.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{req.id}</td>
                    <td className="py-3 px-4">{req.data}</td>
                    <td className="py-3 px-4">{req.itens}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          req.status === "Pendente" ? "secondary" : req.status === "Aprovada" ? "default" : "outline"
                        }
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="link" className="text-imperial hover:text-imperial px-0">
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <Button variant="link" className="text-imperial hover:text-imperial">
              Ver todas as requisições →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




