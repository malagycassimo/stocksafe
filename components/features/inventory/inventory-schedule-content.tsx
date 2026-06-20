"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  Filter,
  Download,
  ChevronDown,
  X,
  Search,
  Play,
  Eye,
  Edit,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { inventarioService } from "@/app/services/inventarioService"

// Mock data
const mockInventories = [
  {
    id: "INV-00045",
    scheduledDate: "2025-01-25T08:00:00",
    type: "location",
    typeLabel: "Por Local",
    scope: "ARM01 - Armazém Principal",
    responsible: { name: "Carlos Silva", avatar: "CS" },
    status: "scheduled",
    estimatedItems: 450,
    estimatedDuration: 6,
  },
  {
    id: "INV-00044",
    scheduledDate: "2025-01-23T14:00:00",
    startedDate: "2025-01-23T14:15:00",
    type: "category",
    typeLabel: "Por Categoria",
    scope: "Perecíveis, Congelados",
    responsible: { name: "Ana Santos", avatar: "AS" },
    status: "in_progress",
    estimatedItems: 280,
    countedItems: 168,
    divergences: 5,
    estimatedDuration: 4,
  },
  {
    id: "INV-00043",
    scheduledDate: "2025-01-20T09:00:00",
    startedDate: "2025-01-20T09:10:00",
    completedDate: "2025-01-20T14:30:00",
    type: "lot",
    typeLabel: "Por Lote/Validade",
    scope: "Produtos vencendo em 15 dias",
    responsible: { name: "Pedro Costa", avatar: "PC" },
    status: "completed",
    estimatedItems: 120,
    countedItems: 120,
    divergences: 8,
    accuracy: 93.3,
    estimatedDuration: 3,
  },
  {
    id: "INV-00042",
    scheduledDate: "2025-01-18T07:00:00",
    type: "general",
    typeLabel: "Geral",
    scope: "Inventário Completo",
    responsible: { name: "João Souza", avatar: "JS" },
    status: "cancelled",
    estimatedItems: 1200,
    estimatedDuration: 16,
    cancelReason: "Falta de pessoal",
  },
]

const mockDivergences = [
  {
    id: "DIV-001",
    inventoryCode: "INV-00043",
    date: "2025-01-20",
    product: {
      sku: "FRS-045",
      description: "Filé de Frango Congelado - 1kg",
    },
    lot: "LOT2025-001",
    location: "ARM01 > ZF > CA > P01",
    systemQty: 500,
    countedQty: 485,
    divergence: -15,
    divergencePercent: -3.0,
    unitValue: 18.5,
    totalValue: -277.5,
    reason: "Perda não registrada",
    adjustmentStatus: "pending",
  },
  {
    id: "DIV-002",
    inventoryCode: "INV-00043",
    date: "2025-01-20",
    product: {
      sku: "BEB-120",
      description: "Suco de Laranja Natural - 1L",
    },
    lot: "LOT2025-087",
    location: "ARM01 > ZF > CC > P02",
    systemQty: 300,
    countedQty: 325,
    divergence: 25,
    divergencePercent: 8.3,
    unitValue: 8.9,
    totalValue: 222.5,
    reason: "Recebimento não lançado",
    adjustmentStatus: "approved",
  },
]

const statusConfig = {
  scheduled: { label: "Agendado", color: "bg-blue-100 text-blue-800", icon: "📅" },
  in_progress: { label: "Em Andamento", color: "bg-orange-100 text-orange-800", icon: "🔄" },
  pending_approval: { label: "Aguardando Ajuste", color: "bg-yellow-100 text-yellow-800", icon: "⚖️" },
  completed: { label: "Concluído", color: "bg-twilight text-imperial", icon: "✅" },
  overdue: { label: "Atrasado", color: "bg-red-100 text-red-800", icon: "⏰" },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-800", icon: "❌" },
}

const typeConfig = {
  general: { label: "Geral", icon: "🏢" },
  location: { label: "Por Local", icon: "📍" },
  category: { label: "Por Categoria", icon: "📦" },
  lot: { label: "Por Lote/Validade", icon: "🏷️" },
  focused: { label: "Focado", icon: "🎯" },
}

const adjustmentStatusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Aprovado", color: "bg-twilight text-imperial" },
  applied: { label: "Aplicado", color: "bg-blue-100 text-blue-800" },
  rejected: { label: "Rejeitado", color: "bg-red-100 text-red-800" },
}

export function InventoryScheduleContent() {
  const [activeTab, setActiveTab] = useState("calendar")
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateRangeFilter, setDateRangeFilter] = useState("last30days")
  const [showFilters, setShowFilters] = useState(true)
  const [selectedInventory, setSelectedInventory] = useState<any | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [inventories, setInventories] = useState<any[]>([])

  useEffect(() => {
    inventarioService.listar()
      .then((data) => {
        setInventories(data)
      })
      .catch((err) => {
        console.error("Erro ao listar inventários:", err)
        setInventories([])
      })
  }, [])

  const mappedInventories = useMemo<any[]>(() => {
    if (inventories.length === 0) return mockInventories
    return inventories.map(inv => {
      const type = (inv as any).type || 'general'
      const statusMap: Record<string, string> = {
        'AGENDADO': 'scheduled',
        'EM_ANDAMENTO': 'in_progress',
        'AGUARDANDO_APROVACAO': 'in_progress',
        'CONCLUIDO': 'completed',
        'CANCELADO': 'cancelled'
      }
      const typeLabelMap: Record<string, string> = {
        'general': 'Geral',
        'location': 'Por Local',
        'category': 'Por Categoria',
        'lot': 'Por Lote/Validade',
        'focused': 'Focado'
      }
      return {
        id: inv.id,
        codigo: inv.codigo,
        scheduledDate: inv.dateAgenda || inv.createdAt,
        type,
        typeLabel: typeLabelMap[type] || 'Geral',
        scope: (inv as any).scope || 'Inventário Geral',
        responsible: {
          name: inv.responsavel || 'Supervisor Padrão',
          avatar: (inv.responsavel || 'SP').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        },
        status: statusMap[inv.status] || 'scheduled',
        estimatedItems: (inv as any).estimatedItems || inv.itens?.length || 10,
        countedItems: inv.itens?.filter((i: any) => i.quantidadeContada !== null).length || 0,
        divergences: inv.itens?.filter((i: any) => i.divergencia !== 0 && i.divergencia !== null).length || 0
      }
    })
  }, [inventories])

  // Filter inventories
  const filteredInventories = useMemo(() => {
    let filtered = mappedInventories

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (inv) =>
          inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (inv.codigo && inv.codigo.toLowerCase().includes(searchQuery.toLowerCase())) ||
          inv.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.responsible.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status
    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter)
    }

    // Type
    if (typeFilter !== "all") {
      filtered = filtered.filter((inv) => inv.type === typeFilter)
    }

    return filtered
  }, [searchQuery, statusFilter, typeFilter])

  // Calculate KPIs
  const scheduledThisMonth = mockInventories.filter((i) => i.status === "scheduled").length
  const inProgress = mockInventories.filter((i) => i.status === "in_progress").length
  const completedThisMonth = mockInventories.filter((i) => i.status === "completed").length
  const averageAccuracy = 95.2 // Mock

  const viewDetails = (inventory: typeof mockInventories[0]) => {
    setSelectedInventory(inventory)
    setShowDetails(true)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
    setDateRangeFilter("last30days")
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <span>Estoque</span>
        {" / "}
        <span className="text-foreground">Inventário</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Inventário Cíclico</h1>
          <p className="text-muted-foreground mt-1">Contagem e ajustes de estoque</p>
        </div>
        <Link href="/estoque/inventario/novo">
          <Button className="bg-imperial hover:bg-imperial">
            <Plus className="w-4 h-4 mr-2" />
            Novo Inventário
          </Button>
        </Link>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="calendar">📅 Calendário/Agenda</TabsTrigger>
          <TabsTrigger value="active">🔄 Inventários Ativos</TabsTrigger>
          <TabsTrigger value="history">📋 Histórico</TabsTrigger>
          <TabsTrigger value="divergences">⚠️ Divergências</TabsTrigger>
        </TabsList>

        {/* TAB 1: Calendar/Schedule */}
        <TabsContent value="calendar" className="space-y-6 mt-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Agendados Este Mês</p>
                  <p className="text-2xl font-bold text-blue-700">{scheduledThisMonth}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                  <p className="text-2xl font-bold text-orange-700">{inProgress}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Concluídos Este Mês</p>
                  <p className="text-2xl font-bold text-imperial">{completedThisMonth}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Acuracidade Média</p>
                  <p className="text-2xl font-bold text-imperial">{averageAccuracy}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Últimos 3 meses</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              className={viewMode === "calendar" ? "bg-imperial hover:bg-imperial" : ""}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendário Mensal
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-imperial hover:bg-imperial" : ""}
            >
              <List className="w-4 h-4 mr-2" />
              Lista
            </Button>
          </div>

          {viewMode === "calendar" ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-16">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Visualização de Calendário</h3>
                  <p className="text-muted-foreground">Grid de calendário mensal em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filtros Avançados
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                      {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>

                  {showFilters && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Busca Rápida</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Buscar por código, escopo..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Status</Label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="scheduled">Agendado</SelectItem>
                              <SelectItem value="in_progress">Em Andamento</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Tipo</Label>
                          <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              {Object.entries(typeConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  {config.icon} {config.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={clearFilters}>
                          <X className="w-4 h-4 mr-2" />
                          Limpar Filtros
                        </Button>
                        <Button variant="outline" className="text-imperial border-imperial">
                          <Download className="w-4 h-4 mr-2" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* List Table */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          <div className="flex items-center gap-1 cursor-pointer">
                            Data Agendada
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Escopo</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Responsável</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Progresso</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px]">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredInventories.map((inv) => {
                        const statConfig = statusConfig[inv.status as keyof typeof statusConfig]
                        const typeConf = typeConfig[inv.type as keyof typeof typeConfig]
                        const progress = inv.countedItems ? (inv.countedItems / inv.estimatedItems) * 100 : 0

                        return (
                          <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                {new Date(inv.scheduledDate).toLocaleDateString("pt-BR")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(inv.scheduledDate).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-mono font-semibold text-sm">{inv.id}</div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">
                                {typeConf.icon} {typeConf.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm max-w-[200px] truncate" title={inv.scope}>
                                {inv.scope}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-twilight text-imperial flex items-center justify-center text-xs font-semibold">
                                  {inv.responsible.avatar}
                                </div>
                                <div className="text-xs">{inv.responsible.name}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={`${statConfig.color} border-0`}>
                                {statConfig.icon} {statConfig.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {inv.status === "in_progress" && inv.countedItems ? (
                                <div className="space-y-1 min-w-[150px]">
                                  <Progress value={progress} className="h-2" />
                                  <div className="text-xs text-muted-foreground">
                                    {inv.countedItems} de {inv.estimatedItems} itens ({Math.round(progress)}%)
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground">
                                  {inv.estimatedItems} itens
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => viewDetails(inv)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver Detalhes
                                  </DropdownMenuItem>
                                  {inv.status === "scheduled" && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/estoque/inventario/${inv.id}/contagem`} className="flex w-full items-center">
                                        <Play className="w-4 h-4 mr-2" />
                                        Iniciar Contagem
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  {inv.status === "in_progress" && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/estoque/inventario/${inv.id}/contagem`} className="flex w-full items-center">
                                        <Play className="w-4 h-4 mr-2" />
                                        Continuar Contagem
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  {inv.status === "pending_approval" && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/estoque/inventario/${inv.id}/ajustes`} className="flex w-full items-center text-imperial">
                                        <Play className="w-4 h-4 mr-2" />
                                        Revisar Ajustes
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  {inv.status === "scheduled" && (
                                    <DropdownMenuItem className="text-red-600">
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Cancelar
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        {/* TAB 2: Active Inventories */}
        <TabsContent value="active" className="space-y-6 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-16">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Inventários Ativos</h3>
                <p className="text-muted-foreground">
                  {inProgress} inventário(s) em andamento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: History */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-16">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Histórico de Inventários</h3>
                <p className="text-muted-foreground">
                  Visualização completa com gráficos e análises em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Divergences */}
        <TabsContent value="divergences" className="space-y-6 mt-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cód. INV</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lote</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Local</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qtd Sistema</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qtd Contada</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Divergência</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockDivergences.map((div) => {
                    const rowClass = div.divergence > 0 ? "bg-twilight/30" : "bg-red-50/30"
                    const adjStatus = adjustmentStatusConfig[div.adjustmentStatus as keyof typeof adjustmentStatusConfig]

                    return (
                      <tr key={div.id} className={`${rowClass} hover:bg-gray-100 transition-colors`}>
                        <td className="px-4 py-3">
                          <div className="text-sm">{new Date(div.date).toLocaleDateString("pt-BR")}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm">{div.inventoryCode}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-[180px]">
                            <div className="font-mono text-sm font-medium">{div.product.sku}</div>
                            <div className="text-xs text-muted-foreground truncate">{div.product.description}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm">{div.lot}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs max-w-[120px] truncate" title={div.location}>
                            {div.location}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{div.systemQty}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold">{div.countedQty}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`text-sm font-bold ${div.divergence > 0 ? "text-imperial" : "text-red-700"}`}>
                            {div.divergence > 0 ? "+" : ""}
                            {div.divergence}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ({div.divergencePercent > 0 ? "+" : ""}
                            {div.divergencePercent.toFixed(1)}%)
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`text-sm font-semibold ${div.totalValue > 0 ? "text-imperial" : "text-red-700"}`}>
                            {Math.abs(div.totalValue).toFixed(2)} MT
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${adjStatus.color} border-0`}>{adjStatus.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              {div.adjustmentStatus === "pending" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-imperial">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Aprovar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Rejeitar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Inventário</DialogTitle>
            <DialogDescription>Informações completas do inventário</DialogDescription>
          </DialogHeader>
          {selectedInventory && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Código</Label>
                      <div className="font-mono font-semibold text-lg">{selectedInventory.id}</div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge className={statusConfig[selectedInventory.status as keyof typeof statusConfig].color}>
                        {statusConfig[selectedInventory.status as keyof typeof statusConfig].icon}{" "}
                        {statusConfig[selectedInventory.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <div className="text-sm">{selectedInventory.typeLabel}</div>
                    </div>
                    <div>
                      <Label>Escopo</Label>
                      <div className="text-sm">{selectedInventory.scope}</div>
                    </div>
                    <div>
                      <Label>Responsável</Label>
                      <div className="text-sm">{selectedInventory.responsible.name}</div>
                    </div>
                    <div>
                      <Label>Itens Estimados</Label>
                      <div className="text-sm">{selectedInventory.estimatedItems}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}




