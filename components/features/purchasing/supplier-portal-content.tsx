"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, Clock, AlertCircle, TrendingUp, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockPendingRfqs = [
  {
    id: "RFQ-2025-001",
    receivedAt: "2025-01-15 10:00",
    deadline: "2025-01-17T18:00:00",
    itemsCount: 2,
    client: "StockSafe Corp",
    status: "Pendente",
  },
  {
    id: "RFQ-2025-002",
    receivedAt: "2025-01-14 14:30",
    deadline: "2025-01-16T12:00:00",
    itemsCount: 5,
    client: "StockSafe Corp",
    status: "Em Andamento",
  },
]

const mockHistory = [
  {
    id: "RFQ-2025-003",
    date: "2025-01-13",
    items: 3,
    status: "Aprovada",
    value: "2.450,00 MT",
  },
  {
    id: "RFQ-2024-125",
    date: "2024-12-28",
    items: 8,
    status: "Rejeitada",
    value: "5.200,00 MT",
  },
]

const scoreData = [
  { month: "Jul", score: 85 },
  { month: "Ago", score: 87 },
  { month: "Set", score: 89 },
  { month: "Out", score: 90 },
  { month: "Nov", score: 91 },
  { month: "Dez", score: 92 },
]

const statusColors: Record<string, string> = {
  Pendente: "bg-yellow-100 text-yellow-800",
  "Em Andamento": "bg-blue-100 text-blue-800",
  Enviada: "bg-twilight text-imperial",
}

export function SupplierPortalContent() {
  const [periodFilter, setPeriodFilter] = useState("30")

  const getHoursUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffInHours = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    return diffInHours
  }

  const getCountdownColor = (deadline: string) => {
    const hours = getHoursUntilDeadline(deadline)
    if (hours < 12) return "text-red-600"
    if (hours <= 24) return "text-orange-600"
    return "text-imperial"
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/compras" className="hover:text-imperial">
          Compras
        </Link>
        {" / "}
        <span className="text-foreground">Portal do Fornecedor</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-imperial mb-2">Portal do Fornecedor - Fornecedor A</h1>
        <div className="flex items-center gap-4">
          <span className="text-lg font-medium">Score Atual:</span>
          <div className="flex items-center gap-2">
            <Progress value={92} className="w-32 h-3" />
            <span className="text-2xl font-bold text-imperial">92%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              RFQs Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{mockPendingRfqs.length}</div>
            <Badge className="bg-red-100 text-red-800 mt-2">1 urgente</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">RFQs Respondidas (Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">85%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">POs Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending RFQs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>RFQs Pendentes de Resposta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nº RFQ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Data Recebimento</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Prazo Resposta</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Qtd Itens</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Cliente/Comprador</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold w-[120px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockPendingRfqs.map((rfq) => {
                  const hoursUntil = getHoursUntilDeadline(rfq.deadline)
                  const isUrgent = hoursUntil <= 12

                  return (
                    <tr key={rfq.id} className={`hover:bg-gray-50 ${isUrgent ? "bg-red-50" : ""}`}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/compras/portal-fornecedor/rfqs/${rfq.id}`}
                          className="font-mono text-sm text-imperial hover:text-imperial hover:underline"
                        >
                          {rfq.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">{rfq.receivedAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${getCountdownColor(rfq.deadline)}`} />
                          <span className={`text-sm font-medium ${getCountdownColor(rfq.deadline)}`}>
                            {new Date(rfq.deadline).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {hoursUntil > 0 ? `${hoursUntil}h restantes` : "Vencido"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{rfq.itemsCount}</td>
                      <td className="px-4 py-3 text-sm">{rfq.client}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={statusColors[rfq.status]}>{rfq.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/compras/portal-fornecedor/rfqs/${rfq.id}/responder`}>
                            <Button size="sm" className="bg-imperial hover:bg-imperial">
                              Responder
                            </Button>
                          </Link>
                          <Link href={`/compras/portal-fornecedor/rfqs/${rfq.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Histórico de Cotações</CardTitle>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-mono text-sm text-imperial">{item.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("pt-BR")} • {item.items} itens
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={item.status === "Aprovada" ? "bg-twilight text-imperial" : "bg-red-100 text-red-800"}
                    >
                      {item.status}
                    </Badge>
                    <div className="text-sm font-medium mt-1">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/compras/portal-fornecedor/historico">
              <Button variant="link" className="w-full mt-4 text-imperial">
                Ver Histórico Completo
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Score and Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-imperial" />
              Meu Score e Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Taxa de Conformidade</div>
                <div className="text-2xl font-bold text-imperial">95%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Pontualidade Respostas</div>
                <div className="text-2xl font-bold text-imperial">92%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Pontualidade Entregas</div>
                <div className="text-2xl font-bold text-imperial">88%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Não Conformidades</div>
                <div className="text-2xl font-bold text-yellow-600">3</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="font-medium">Certificado ISO 9001</div>
                  <div className="text-sm text-muted-foreground">Vence em 15 dias</div>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Atualizar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium">Ficha Técnica - Produto ALM-001</div>
                  <div className="text-sm text-red-600">Vencido há 3 dias</div>
                </div>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                Atualizar Urgente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




