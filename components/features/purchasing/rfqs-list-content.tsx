"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Download, Plus, MoreVertical, Eye, Clock, XIcon, RefreshCw, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"

const mockRfqs = [
  {
    id: "RFQ-2025-001",
    riOrigin: "RI-2025-003",
    createdAt: "2025-01-15",
    deadline: "2025-01-17T18:00:00",
    suppliers: [
      { name: "Fornecedor A", initials: "FA" },
      { name: "Fornecedor B", initials: "FB" },
      { name: "Fornecedor C", initials: "FC" },
    ],
    responsesReceived: 2,
    totalSuppliers: 3,
    status: "Parcialmente Respondida",
  },
  {
    id: "RFQ-2025-002",
    riOrigin: "RI-2025-005",
    createdAt: "2025-01-14",
    deadline: "2025-01-16T12:00:00",
    suppliers: [
      { name: "Fornecedor D", initials: "FD" },
      { name: "Fornecedor E", initials: "FE" },
    ],
    responsesReceived: 0,
    totalSuppliers: 2,
    status: "Aguardando Respostas",
  },
  {
    id: "RFQ-2025-003",
    riOrigin: "RI-2025-001",
    createdAt: "2025-01-13",
    deadline: "2025-01-20T18:00:00",
    suppliers: [
      { name: "Fornecedor A", initials: "FA" },
      { name: "Fornecedor F", initials: "FF" },
      { name: "Fornecedor G", initials: "FG" },
    ],
    responsesReceived: 3,
    totalSuppliers: 3,
    status: "Totalmente Respondida",
  },
]

const statusColors: Record<string, string> = {
  "Aguardando Respostas": "bg-yellow-100 text-yellow-800",
  "Parcialmente Respondida": "bg-blue-100 text-blue-800",
  "Totalmente Respondida": "bg-twilight text-imperial",
  Fechada: "bg-gray-100 text-gray-800",
}

export function RfqsListContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todas")
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)

  const getHoursUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffInHours = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    return diffInHours
  }

  const getDeadlineColor = (deadline: string) => {
    const hours = getHoursUntilDeadline(deadline)
    if (hours < 0) return "text-red-600"
    if (hours <= 24) return "text-orange-600"
    return "text-imperial"
  }

  const getDeadlineIndicator = (deadline: string) => {
    const hours = getHoursUntilDeadline(deadline)
    if (hours < 0) return "bg-red-500"
    if (hours <= 24) return "bg-yellow-500"
    return "bg-imperial"
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
        <span className="text-foreground">RFQs</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">Cotações (RFQ)</h1>
        <Link href="/compras/rfqs/nova">
          <Button className="bg-imperial hover:bg-imperial">
            <Plus className="w-4 h-4 mr-2" />
            Nova RFQ
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">RFQs Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockRfqs.filter((r) => r.status !== "Fechada").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {mockRfqs.filter((r) => r.status === "Aguardando Respostas").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Respostas Recebidas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa Média de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">78%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[300px]">
            <label className="text-sm font-medium mb-2 block">Busca</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número RFQ, RI origem, fornecedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-[200px]">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Aguardando Respostas">Aguardando Respostas</SelectItem>
                <SelectItem value="Parcialmente Respondida">Parcialmente Respondida</SelectItem>
                <SelectItem value="Totalmente Respondida">Totalmente Respondida</SelectItem>
                <SelectItem value="Fechada">Fechada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="urgent"
              checked={showUrgentOnly}
              onCheckedChange={(checked) => setShowUrgentOnly(!!checked)}
            />
            <label htmlFor="urgent" className="text-sm font-medium cursor-pointer">
              Mostrar apenas urgentes ({"<"} 24h)
            </label>
          </div>

          <Button variant="outline">Limpar Filtros</Button>
          <Button variant="outline" className="text-imperial border-imperial bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nº RFQ</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">RI Origem</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Criação</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prazo de Resposta</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fornecedores Convidados</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Respostas Recebidas</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[120px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockRfqs.map((rfq) => {
                const hoursUntil = getHoursUntilDeadline(rfq.deadline)
                const isUrgent = hoursUntil <= 24 && hoursUntil >= 0
                const isOverdue = hoursUntil < 0

                return (
                  <tr
                    key={rfq.id}
                    className={`hover:bg-gray-50 ${isUrgent ? "bg-yellow-50" : ""} ${isOverdue ? "bg-red-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/compras/rfqs/${rfq.id}`}
                        className="font-mono text-sm text-imperial hover:text-imperial hover:underline"
                      >
                        {rfq.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/requisicoes/${rfq.riOrigin}`}
                        className="font-mono text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {rfq.riOrigin}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">{new Date(rfq.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getDeadlineIndicator(rfq.deadline)}`} />
                        <span className={`text-sm font-medium ${getDeadlineColor(rfq.deadline)}`}>
                          {new Date(rfq.deadline).toLocaleString("pt-BR")}
                        </span>
                        {isUrgent && <Clock className="w-4 h-4 text-orange-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {rfq.suppliers.slice(0, 3).map((supplier, idx) => (
                            <Avatar key={idx} className="w-8 h-8 border-2 border-white">
                              <AvatarFallback className="bg-twilight text-imperial text-xs">
                                {supplier.initials}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">({rfq.totalSuppliers})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {rfq.responsesReceived} de {rfq.totalSuppliers}
                        </div>
                        <Progress value={(rfq.responsesReceived / rfq.totalSuppliers) * 100} className="h-2" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={statusColors[rfq.status]}>{rfq.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/compras/rfqs/${rfq.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reenviar para Fornecedores
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="w-4 h-4 mr-2" />
                              Estender Prazo
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <XIcon className="w-4 h-4 mr-2" />
                              Cancelar RFQ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}




