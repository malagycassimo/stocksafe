import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FlaskConical, Clock, TrendingUp, AlertTriangle } from "lucide-react"

export function QADashboard() {
  const kpis = {
    emQuarentena: 8,
    percentualEstoque: 2.5,
    inspecoesPendentes: 5,
    tempoMedioFila: "4.2h",
    taxaAprovacao: 96.5,
    ncsAbertas: 3,
  }

  const filaInspecao = [
    { produto: "Produto A", lote: "L-2025-001", motivo: "Inspeção de Rotina", tempo: "2h 30min", prioridade: "Alta" },
    { produto: "Produto B", lote: "L-2025-002", motivo: "Não Conformidade", tempo: "5h 15min", prioridade: "Alta" },
    { produto: "Produto C", lote: "L-2025-003", motivo: "Inspeção de Rotina", tempo: "1h 45min", prioridade: "Média" },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Itens em Quarentena</CardTitle>
            <FlaskConical className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{kpis.emQuarentena}</div>
            <p className="text-xs text-muted-foreground mt-1">{kpis.percentualEstoque}% do estoque total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inspeções Pendentes</CardTitle>
            <Clock className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.inspecoesPendentes}</div>
            <p className="text-xs text-muted-foreground mt-1">Tempo médio: {kpis.tempoMedioFila}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</CardTitle>
            <TrendingUp className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.taxaAprovacao}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-imperial h-2 rounded-full" style={{ width: `${kpis.taxaAprovacao}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">NCs Abertas</CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpis.ncsAbertas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Inspection Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fila de Inspeção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Produto</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Lote</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Motivo</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Tempo em Quarentena</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filaInspecao.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b hover:bg-gray-50 ${item.prioridade === "Alta" ? "bg-red-50" : item.prioridade === "Média" ? "bg-yellow-50" : ""}`}
                  >
                    <td className="py-3 px-4 font-medium">{item.produto}</td>
                    <td className="py-3 px-4">{item.lote}</td>
                    <td className="py-3 px-4">{item.motivo}</td>
                    <td className="py-3 px-4">{item.tempo}</td>
                    <td className="py-3 px-4">
                      <Button size="sm" className="bg-imperial hover:bg-imperial">
                        Inspecionar
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




