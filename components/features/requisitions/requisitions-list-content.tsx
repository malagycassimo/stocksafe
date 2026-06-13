"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Download, Plus, MoreVertical, Eye, Edit, Copy, Printer, XIcon, Clock, AlertCircle, Loader2 } from "lucide-react"
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
import { requisicaoService, RequisicaoData } from "@/app/services/requisicaoService"

const statusMap: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING: "Submetida",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
  FULFILLED: "Concluída",
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  FULFILLED: "bg-emerald-100 text-emerald-800",
}

const priorityMap: Record<string, string> = {
  BAIXA: "Baixa",
  NORMAL: "Normal",
  ALTA: "Alta",
  URGENTE: "Urgente",
}

const priorityColors: Record<string, string> = {
  BAIXA: "bg-gray-100 text-gray-800",
  NORMAL: "bg-blue-100 text-blue-800",
  ALTA: "bg-orange-100 text-orange-800",
  URGENTE: "bg-red-100 text-red-800",
}

export function RequisitionsListContent() {
  const [requisitions, setRequisitions] = useState<RequisicaoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todas")
  const [priorityFilter, setPriorityFilter] = useState("Todas")
  const [activeTab, setActiveTab] = useState("Todas")

  const fetchRequisitions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await requisicaoService.listarTodas()
      setRequisitions(data)
    } catch (err: any) {
      console.error("Erro ao buscar requisições:", err)
      setError("Falha ao carregar a lista de requisições do servidor.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequisitions()
  }, [])

  const getDaysUntil = (dateString?: string) => {
    if (!dateString) return 999
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffInDays
  }

  const getRowClassName = (neededDate?: string, status?: string) => {
    if (status === "FULFILLED" || status === "REJECTED") return ""
    if (!neededDate) return ""
    const daysUntil = getDaysUntil(neededDate)
    if (daysUntil < 0) return "bg-red-50"
    if (daysUntil <= 3) return "bg-yellow-50"
    return ""
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("Todas")
    setPriorityFilter("Todas")
    setActiveTab("Todas")
  }

  // Reactive filters
  const filteredRequisitions = requisitions.filter((req) => {
    // Tab Filter
    if (activeTab !== "Todas") {
      const mappedStatus = statusMap[req.status || ""] || req.status
      if (mappedStatus !== activeTab) return false
    }

    // Status Dropdown Filter
    if (statusFilter !== "Todas") {
      const mappedStatus = statusMap[req.status || ""] || req.status
      if (mappedStatus !== statusFilter) return false
    }

    // Priority Dropdown Filter
    if (priorityFilter !== "Todas") {
      const mappedPriority = priorityMap[req.prioridade || ""] || req.prioridade
      if (mappedPriority !== priorityFilter) return false
    }

    // Search Query (Code, requester, department)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesCode = req.codigo?.toLowerCase().includes(query) || false
      const matchesRequester = req.solicitante_nome?.toLowerCase().includes(query) || false
      const matchesDept = req.departamento?.toLowerCase().includes(query) || false
      return matchesCode || matchesRequester || matchesDept
    }

    return true
  })

  // Dynamic KPIs
  const totalCount = requisitions.length
  const pendingCount = requisitions.filter((r) => r.status === "PENDING").length
  
  const approvedThisMonth = requisitions.filter((r) => {
    if (r.status !== "APPROVED") return false
    if (!r.createdAt) return false
    const date = new Date(r.createdAt)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  const approvedCount = requisitions.filter((r) => r.status === "APPROVED").length
  const rejectedCount = requisitions.filter((r) => r.status === "REJECTED").length
  const totalEvaluated = approvedCount + rejectedCount
  const approvalRate = totalEvaluated > 0 ? Math.round((approvedCount / totalEvaluated) * 100) : 0

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-emerald-600">
          Home
        </Link>
        {" / "}
        <span>Requisições</span>
        {" / "}
        <span className="text-foreground">Minhas Requisições</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-emerald-700">Requisições Internas</h1>
        <Link href="/requisicoes/nova">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
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
            <div className="text-3xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aprovadas Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {approvedThisMonth}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{approvalRate}%</div>
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
                placeholder="Buscar por número RI, solicitante..."
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

          <Button variant="outline" onClick={handleClearFilters}>Limpar Filtros</Button>
          <Button variant="outline" className="text-emerald-600 border-emerald-600 bg-transparent">
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
          <TabsTrigger value="Concluída">Concluída</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content State */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-150 flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="text-sm text-muted-foreground">Carregando requisições...</span>
          </div>
        ) : filteredRequisitions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">Nenhuma requisição encontrada</p>
            <p className="text-sm">Tente ajustar seus filtros de busca ou crie uma nova requisição.</p>
          </div>
        ) : (
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
                {filteredRequisitions.map((req) => {
                  const displayStatus = statusMap[req.status || ""] || req.status || "Rascunho"
                  const displayPriority = priorityMap[req.prioridade || ""] || req.prioridade || "Normal"
                  
                  return (
                    <tr key={req.id} className={`hover:bg-gray-50 ${getRowClassName(req.date_necessaria, req.status)}`}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/requisicoes/${req.id}`}
                          className="font-mono text-sm text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-2"
                        >
                          {req.codigo}
                          {req.status === "REJECTED" && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString("pt-BR") : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">{req.solicitante_nome}</td>
                      <td className="px-4 py-3 text-sm">{req.departamento}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {req.date_necessaria ? new Date(req.date_necessaria).toLocaleDateString("pt-BR") : "-"}
                          {req.date_necessaria && getDaysUntil(req.date_necessaria) <= 7 && req.status !== "FULFILLED" && (
                            <Clock className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {(req as any)._count?.itens || req.itens?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={priorityColors[req.prioridade || "NORMAL"]}>
                          {displayPriority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={statusColors[req.status || "DRAFT"]}>
                          {displayStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/requisicoes/${req.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Button>
                          </Link>
                          {(req.status === "DRAFT" || req.status === "PENDING") && (
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
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
