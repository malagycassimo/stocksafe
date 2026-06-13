import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckSquare, ClipboardCheck, Package, AlertCircle, Barcode } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function RecebimentoDashboard() {
  const kpis = {
    aguardandoCheckin: 4,
    emConferencia: 2,
    recebidosHoje: 15,
    taxaConformidade: 98.5,
    emQuarentena: 3,
  }

  const proximosRecebimentos = [
    { po: "PO-001", fornecedor: "Fornecedor A", previsao: "Hoje, 14:00", itens: 12, status: "Aguardando" },
    { po: "PO-002", fornecedor: "Fornecedor B", previsao: "Hoje, 16:30", itens: 8, status: "Aguardando" },
    { po: "PO-003", fornecedor: "Fornecedor C", previsao: "Amanhã, 09:00", itens: 20, status: "Agendado" },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Check-in</CardTitle>
            <CheckSquare className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.aguardandoCheckin}</div>
            {kpis.aguardandoCheckin > 0 && (
              <Badge variant="secondary" className="mt-2">
                Atrasado
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Conferência</CardTitle>
            <ClipboardCheck className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.emConferencia}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recebidos Hoje</CardTitle>
            <Package className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.recebidosHoje}</div>
            <p className="text-xs text-imperial mt-1">{kpis.taxaConformidade}% conformidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Quarentena</CardTitle>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{kpis.emQuarentena}</div>
            <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-700">
              Atenção
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action */}
      <Card className="bg-twilight border-twilight">
        <CardContent className="pt-6">
          <Button className="w-full h-16 bg-imperial hover:bg-imperial text-white text-lg font-medium">
            <Barcode className="w-6 h-6 mr-2" />
            Scan de Etiqueta Provisória
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Recebimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">PO</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Fornecedor</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Previsão</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Itens</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {proximosRecebimentos.map((rec) => (
                  <tr key={rec.po} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{rec.po}</td>
                    <td className="py-3 px-4">{rec.fornecedor}</td>
                    <td className="py-3 px-4">{rec.previsao}</td>
                    <td className="py-3 px-4">{rec.itens}</td>
                    <td className="py-3 px-4">
                      <Badge variant={rec.status === "Aguardando" ? "default" : "secondary"}>{rec.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" className="bg-imperial hover:bg-imperial">
                        Iniciar Check-in
                      </Button>
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




