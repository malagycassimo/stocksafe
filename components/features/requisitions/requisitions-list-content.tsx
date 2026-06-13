"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Download, Plus, MoreVertical, Eye, Edit, Copy, Printer, XIcon, Clock, AlertCircle } from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockRequisitions = [
  {
    id: "RI-2025-001",
    createdAt: "2025-01-15",
    requester: "João Silva",
    department: "Cozinha",
    neededDate: "2025-01-20",
    itemsCount: 5,
    priority: "Normal",
    status: "Aprovada",
  },
  {
    id: "RI-2025-002",
    createdAt: "2025-01-14",
    requester: "Maria Santos",
    department: "Bar",
    neededDate: "2025-01-16",
    itemsCount: 3,
    priority: "Urgente",
    status: "Em Compras",
  },
  {
    id: "RI-2025-003",
    createdAt: "2025-01-14",
    requester: "Pedro Costa",
    department: "Limpeza",
    neededDate: "2025-01-25",
    itemsCount: 8,
    priority: "Baixa",
    status: "Submetida",
  },
  {
    id: "RI-2025-004",
    createdAt: "2025-01-13",
    requester: "Ana Oliveira",
    department: "Cozinha",
    neededDate: "2025-01-15",
    itemsCount: 2,
    priority: "Alta",
    status: "Rejeitada",
  },
  {
    id: "RI-2025-005",
    createdAt: "2025-01-13",
    requester: "João Silva",
    department: "Cozinha",
    neededDate: "2025-01-30",
    itemsCount: 4,
    priority: "Normal",
    status: "Rascunho",
  },
]

const statusColors: Record<string, string> = {
  Rascunho: "bg-gray-100 text-gray-800",
  Submetida: "bg-blue-100 text-blue-800",
  Aprovada: "bg-twilight text-imperial",
  "Em Compras": "bg-orange-100 text-orange-800",
  Concluída: "bg-twilight text-imperial",
  Rejeitada: "bg-red-100 text-red-800",
}

const priorityColors: Record<string, string> = {
  Baixa: "bg-gray-100 text-gray-800",
  Normal: "bg-blue-100 text-blue-800",
  Alta: "bg-orange-100 text-orange-800",
  Urgente: "bg-red-100 text-red-800",
}

export function RequisitionsListContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todas")
  const [priorityFilter, setPriorityFilter] = useState("Todas")
  const [activeTab, setActiveTab] = useState("Todas")

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffInDays
  }

  const getRowClassName = (neededDate: string, status: string) => {
    if (status === "Concluída" || status === "Rejeitada") return ""
    const daysUntil = getDaysUntil(neededDate)
    if (daysUntil < 0) return "bg-red-50"
    if (daysUntil <= 3) return "bg-yellow-50"
    return ""
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <span>Requisições</span>
        {" / "}
        <span className="text-foreground">Minhas Requisições</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">Requisições Internas</h1>
        <Link href="/requisicoes/nova">
          <Button className="bg-imperial hover:bg-imperial">
            <Plus className="w-4 h-4 mr-2" />
            Nova Requisição
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Requisições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockRequisitions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {mockRequisitions.filter((r) => r.status === "Submetida").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aprovadas Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">
              {mockRequisitions.filter((r) => r.status === "Aprovada").length}
            </div>
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
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[300px]">
            <label className="text-sm font-medium mb-2 block">Busca</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número RI, produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-[180px]">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Rascunho">Rascunho</SelectItem>
                <SelectItem value="Submetida">Submetida</SelectItem>
                <SelectItem value="Aprovada">Aprovada</SelectItem>
                <SelectItem value="Em Compras">Em Compras</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Rejeitada">Rejeitada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[150px]">
            <label className="text-sm font-medium mb-2 block">Prioridade</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline">Limpar Filtros</Button>
          <Button variant="outline" className="text-imperial border-imperial bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="Todas">Todas</TabsTrigger>
          <TabsTrigger value="Rascunho">Rascunho</TabsTrigger>
          <TabsTrigger value="Submetida">Submetida</TabsTrigger>
          <TabsTrigger value="Aprovada">Aprovada</TabsTrigger>
          <TabsTrigger value="Em Compras">Em Compras</TabsTrigger>
          <TabsTrigger value="Concluída">Concluída</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nº RI</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Criação</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Solicitante</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Departamento</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Necessária</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qtd Itens</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Prioridade</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockRequisitions.map((req) => (
                <tr key={req.id} className={`hover:bg-gray-50 ${getRowClassName(req.neededDate, req.status)}`}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/requisicoes/${req.id}`}
                      className="font-mono text-sm text-imperial hover:text-imperial hover:underline flex items-center gap-2"
                    >
                      {req.id}
                      {req.status === "Rejeitada" && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(req.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-sm">{req.requester}</td>
                  <td className="px-4 py-3 text-sm">{req.department}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {new Date(req.neededDate).toLocaleDateString("pt-BR")}
                      {getDaysUntil(req.neededDate) <= 7 && req.status !== "Concluída" && (
                        <Clock className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">{req.itemsCount}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={priorityColors[req.priority]}>{req.priority}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={statusColors[req.status]}>{req.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/requisicoes/${req.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Button>
                      </Link>
                      {(req.status === "Rascunho" || req.status === "Submetida") && (
                        <Link href={`/requisicoes/${req.id}/editar`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </Button>
                        </Link>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="w-4 h-4 mr-2" />
                            Ver Histórico
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <XIcon className="w-4 h-4 mr-2" />
                            Cancelar RI
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}




