"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  Download,
  Filter,
  MoreVertical,
  Calendar,
  ArrowUpDown,
  ArrowRight,
  ChevronDown,
  X,
  FileText,
  Printer,
  RotateCcw,
  MessageSquare,
  Trash2,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat,
  MinusCircle,
  PlusCircle,
  AlertTriangle,
  CornerUpLeft,
  CornerDownRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Mock data
const mockMovements = [
  {
    id: "MOV-00123",
    dateTime: "2025-01-21T14:30:00",
    type: "entry",
    product: {
      sku: "FRS-045",
      description: "Filé de Frango Congelado - 1kg",
      category: "Congelado",
    },
    lot: "LOT2025-001",
    expiryDate: "2025-02-05",
    quantity: 500,
    unit: "kg",
    origin: "Frigorífico Premium",
    destination: "ARM01 > ZF > CA > P01",
    reason: "Recebimento",
    user: { name: "Carlos Silva", avatar: "CS" },
    document: { type: "PO", number: "#12345" },
    unitValue: 18.5,
    totalValue: 9250,
    status: "completed",
  },
  {
    id: "MOV-00122",
    dateTime: "2025-01-21T13:15:00",
    type: "exit",
    product: {
      sku: "ALM-001",
      description: "Arroz Branco Tipo 1 - Pacote 5kg",
      category: "Seco",
    },
    lot: "LOT2025-023",
    expiryDate: "2025-04-15",
    quantity: -150,
    unit: "kg",
    origin: "ARM01 > ZS > CB > P05",
    destination: "Cozinha Central",
    reason: "Requisição Interna",
    user: { name: "Ana Santos", avatar: "AS" },
    document: { type: "REQ", number: "#456" },
    unitValue: 6.8,
    totalValue: 1020,
    status: "completed",
  },
  {
    id: "MOV-00121",
    dateTime: "2025-01-21T11:45:00",
    type: "transfer",
    product: {
      sku: "BEB-120",
      description: "Suco de Laranja Natural - 1L",
      category: "Bebidas",
    },
    lot: "LOT2025-087",
    expiryDate: "2025-01-24",
    quantity: 50,
    unit: "L",
    origin: "ARM01 > ZF > CC > P02",
    destination: "ARM02 > ZF > CA > P01",
    reason: "Transferência Interna",
    user: { name: "Pedro Costa", avatar: "PC" },
    document: { type: "TRANS", number: "#789" },
    unitValue: 8.9,
    totalValue: 445,
    status: "completed",
  },
  {
    id: "MOV-00120",
    dateTime: "2025-01-21T10:20:00",
    type: "adjustment_positive",
    product: {
      sku: "LMP-089",
      description: "Detergente Líquido Neutro - 500ml",
      category: "Limpeza",
    },
    lot: "LOT2025-045",
    expiryDate: "2026-06-30",
    quantity: 25,
    unit: "un",
    origin: "-",
    destination: "ARM02 > ZS > CA > P10",
    reason: "Ajuste por Inventário",
    user: { name: "Maria Oliveira", avatar: "MO" },
    document: { type: "INV", number: "#101" },
    unitValue: 3.5,
    totalValue: 87.5,
    status: "completed",
  },
  {
    id: "MOV-00119",
    dateTime: "2025-01-21T09:00:00",
    type: "adjustment_negative",
    product: {
      sku: "FRS-012",
      description: "Alface Americana Orgânica - Unidade",
      category: "Fresco",
    },
    lot: "LOT2025-099",
    expiryDate: "2025-01-22",
    quantity: -10,
    unit: "un",
    origin: "ARM01 > ZF > CD > P01",
    destination: "-",
    reason: "Quebra/Perda",
    user: { name: "João Souza", avatar: "JS" },
    document: { type: "Manual", number: "-" },
    unitValue: 2.5,
    totalValue: 25,
    status: "completed",
  },
  {
    id: "MOV-00118",
    dateTime: "2025-01-20T16:45:00",
    type: "disposal",
    product: {
      sku: "FRS-046",
      description: "Carne Bovina Moída - 1kg",
      category: "Congelado",
    },
    lot: "LOT2025-034",
    expiryDate: "2025-01-20",
    quantity: -80,
    unit: "kg",
    origin: "ARM01 > ZC > CA > P03",
    destination: "Descarte",
    reason: "Vencimento",
    user: { name: "Carlos Silva", avatar: "CS" },
    document: { type: "Manual", number: "-" },
    unitValue: 25.0,
    totalValue: 2000,
    status: "completed",
  },
  {
    id: "MOV-00117",
    dateTime: "2025-01-20T14:30:00",
    type: "return_supplier",
    product: {
      sku: "BEB-135",
      description: "Leite Integral UHT - 1L",
      category: "Bebidas",
    },
    lot: "LOT2025-111",
    expiryDate: "2025-03-10",
    quantity: -100,
    unit: "L",
    origin: "ARM01 > ZF > CE > P04",
    destination: "Laticínios Premium",
    reason: "Não Conformidade",
    user: { name: "Ana Santos", avatar: "AS" },
    document: { type: "RMA", number: "#555" },
    unitValue: 4.2,
    totalValue: 420,
    status: "completed",
  },
  {
    id: "MOV-00116",
    dateTime: "2025-01-20T11:00:00",
    type: "customer_return",
    product: {
      sku: "SEC-078",
      description: "Macarrão Espaguete Integral - 500g",
      category: "Seco",
    },
    lot: "LOT2025-067",
    expiryDate: "2025-07-20",
    quantity: 50,
    unit: "kg",
    origin: "Cliente ABC",
    destination: "ARM01 > ZS > CC > P08",
    reason: "Devolução de Cliente",
    user: { name: "Pedro Costa", avatar: "PC" },
    document: { type: "DEV", number: "#321" },
    unitValue: 5.5,
    totalValue: 275,
    status: "completed",
  },
]

const movementTypeConfig = {
  entry: {
    label: "Entrada",
    icon: ArrowDownToLine,
    color: "bg-twilight text-imperial border-twilight",
    emoji: "📥",
  },
  exit: {
    label: "Saída",
    icon: ArrowUpFromLine,
    color: "bg-red-100 text-red-800 border-red-200",
    emoji: "📤",
  },
  transfer: {
    label: "Transferência",
    icon: Repeat,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    emoji: "🔄",
  },
  adjustment_positive: {
    label: "Ajuste +",
    icon: PlusCircle,
    color: "bg-twilight text-imperial border-twilight",
    emoji: "➕",
  },
  adjustment_negative: {
    label: "Ajuste -",
    icon: MinusCircle,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    emoji: "➖",
  },
  disposal: {
    label: "Descarte",
    icon: Trash2,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    emoji: "🗑️",
  },
  return_supplier: {
    label: "Devolução Fornecedor",
    icon: CornerUpLeft,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    emoji: "↩️",
  },
  customer_return: {
    label: "Devolução Cliente",
    icon: CornerDownRight,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    emoji: "🔙",
  },
}

const statusConfig = {
  completed: { label: "Concluída", color: "bg-twilight text-imperial", icon: "✅" },
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  in_progress: { label: "Em Andamento", color: "bg-blue-100 text-blue-800", icon: "🔄" },
  cancelled: { label: "Cancelada", color: "bg-gray-100 text-gray-800", icon: "❌" },
}

export function InventoryMovementsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("last30days")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedMovement, setSelectedMovement] = useState<typeof mockMovements[0] | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  // Filter movements
  const filteredMovements = useMemo(() => {
    let filtered = mockMovements

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (mov) =>
          mov.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mov.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mov.product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mov.lot.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((mov) => mov.type === typeFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((mov) => mov.status === statusFilter)
    }

    return filtered
  }, [searchQuery, typeFilter, statusFilter])

  // Calculate KPIs
  const totalMovements = filteredMovements.length
  const entriesCount = filteredMovements.filter((m) => m.type === "entry" || m.type === "customer_return").length
  const exitsCount = filteredMovements.filter(
    (m) =>
      m.type === "exit" || m.type === "disposal" || m.type === "return_supplier" || m.type === "adjustment_negative",
  ).length

  const entriesQty = filteredMovements
    .filter((m) => m.type === "entry" || m.type === "customer_return")
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0)

  const exitsQty = filteredMovements
    .filter(
      (m) =>
        m.type === "exit" || m.type === "disposal" || m.type === "return_supplier" || m.type === "adjustment_negative",
    )
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0)

  const entriesValue = filteredMovements
    .filter((m) => m.type === "entry" || m.type === "customer_return")
    .reduce((sum, m) => sum + m.totalValue, 0)

  const exitsValue = filteredMovements
    .filter(
      (m) =>
        m.type === "exit" || m.type === "disposal" || m.type === "return_supplier" || m.type === "adjustment_negative",
    )
    .reduce((sum, m) => sum + m.totalValue, 0)

  const netBalance = entriesQty - exitsQty

  const viewDetails = (movement: typeof mockMovements[0]) => {
    setSelectedMovement(movement)
    setShowDetails(true)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setDateFilter("last30days")
    setTypeFilter("all")
    setStatusFilter("all")
  }

  // Group by date
  const groupedByDate = useMemo(() => {
    const grouped = new Map<string, typeof mockMovements>()
    filteredMovements.forEach((mov) => {
      const date = new Date(mov.dateTime).toLocaleDateString("pt-BR")
      if (!grouped.has(date)) {
        grouped.set(date, [])
      }
      grouped.get(date)!.push(mov)
    })
    return Array.from(grouped.entries()).sort((a, b) => {
      const dateA = new Date(a[1][0].dateTime)
      const dateB = new Date(b[1][0].dateTime)
      return dateB.getTime() - dateA.getTime()
    })
  }, [filteredMovements])

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
        <span className="text-foreground">Movimentações</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Movimentações de Estoque</h1>
          <p className="text-muted-foreground mt-1">Histórico completo de entradas, saídas e transferências</p>
        </div>
        <Link href="/estoque/movimentacoes/nova">
          <Button className="bg-imperial hover:bg-imperial">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Movimentação Manual
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? <ChevronDown className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              {/* Line 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Busca Rápida</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código, SKU, lote..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Período</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                      <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                      <SelectItem value="thismonth">Este Mês</SelectItem>
                      <SelectItem value="lastmonth">Mês Passado</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de Movimentação</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(movementTypeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.emoji} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Line 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total de Movimentações</p>
              <p className="text-2xl font-bold text-imperial">{totalMovements}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-imperial" />
                <span className="text-xs text-imperial">+15% vs período anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">📥 Entradas</p>
              <p className="text-xl font-bold text-imperial">{entriesCount} movimentações</p>
              <p className="text-sm text-muted-foreground mt-1">
                Qtd: {entriesQty} un | MZN {entriesValue.toLocaleString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">📤 Saídas</p>
              <p className="text-xl font-bold text-red-700">{exitsCount} movimentações</p>
              <p className="text-sm text-muted-foreground mt-1">
                Qtd: {exitsQty} un | MZN {exitsValue.toLocaleString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Saldo Líquido</p>
              <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-imperial" : "text-red-700"}`}>
                {netBalance >= 0 ? "+" : ""}
                {netBalance} un
              </p>
              <p className="text-xs text-muted-foreground mt-1">Entradas - Saídas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-1 cursor-pointer">
                    Data/Hora
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lote</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantidade</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">De → Para</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Motivo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuário</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Documento</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[80px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {groupedByDate.map(([date, movements]) => (
                <>
                  {/* Date Separator */}
                  <tr key={`date-${date}`} className="bg-gray-100">
                    <td colSpan={12} className="px-4 py-2">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <Calendar className="w-4 h-4" />
                        {date}
                        <span className="text-muted-foreground font-normal">
                          ({movements.length} {movements.length === 1 ? "movimentação" : "movimentações"})
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Movements for this date */}
                  {movements.map((mov) => {
                    const typeConfig = movementTypeConfig[mov.type as keyof typeof movementTypeConfig]
                    const statConfig = statusConfig[mov.status as keyof typeof statusConfig]
                    const IconComponent = typeConfig.icon

                    const rowClass =
                      mov.type === "entry" || mov.type === "adjustment_positive" || mov.type === "customer_return"
                        ? "bg-twilight/30"
                        : mov.type === "exit" || mov.type === "adjustment_negative" || mov.type === "disposal"
                          ? "bg-red-50/30"
                          : mov.type === "transfer"
                            ? "bg-blue-50/30"
                            : mov.status === "cancelled"
                              ? "bg-gray-50"
                              : ""

                    return (
                      <tr key={mov.id} className={`${rowClass} hover:bg-gray-100 transition-colors`}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">
                            {new Date(mov.dateTime).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">{mov.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${typeConfig.color} border`}>
                            <IconComponent className="w-3 h-3 mr-1" />
                            {typeConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-[180px]">
                            <div className="font-mono text-sm font-medium">{mov.product.sku}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[180px]" title={mov.product.description}>
                              {mov.product.description}
                            </div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {mov.product.category}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm">{mov.lot}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className={`text-sm font-semibold ${
                              mov.quantity > 0 ? "text-imperial" : "text-red-700"
                            }`}
                          >
                            {mov.quantity > 0 ? "+" : ""}
                            {mov.quantity}
                          </div>
                          <div className="text-xs text-muted-foreground">{mov.unit}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-xs max-w-[200px]">
                            <div className="truncate" title={mov.origin}>
                              {mov.origin}
                            </div>
                            <ArrowRight className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                            <div className="truncate" title={mov.destination}>
                              {mov.destination}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm max-w-[120px] truncate" title={mov.reason}>
                            {mov.reason}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-twilight text-imperial flex items-center justify-center text-xs font-semibold">
                              {mov.user.avatar}
                            </div>
                            <div className="text-xs">{mov.user.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-mono">
                            {mov.document.type} {mov.document.number}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold">
                            MZN {mov.totalValue.toLocaleString("pt-BR")}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${statConfig.color} border-0`}>
                            {statConfig.icon} {statConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewDetails(mov)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimir Comprovante
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Adicionar Observação
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-orange-600">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Estornar
                              </DropdownMenuItem>
                              {mov.status === "pending" && (
                                <DropdownMenuItem className="text-red-600">
                                  <X className="w-4 h-4 mr-2" />
                                  Cancelar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm">
                  Total: {filteredMovements.length} movimentações
                </td>
                <td className="px-4 py-3 text-sm">
                  Entradas: +{entriesQty} | Saídas: -{exitsQty}
                </td>
                <td colSpan={4} className="px-4 py-3 text-sm">
                  Saldo: {netBalance >= 0 ? "+" : ""}
                  {netBalance}
                </td>
                <td className="px-4 py-3 text-sm">
                  MZN {(entriesValue + exitsValue).toLocaleString("pt-BR")}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Movement Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Movimentação</DialogTitle>
            <DialogDescription>Informações completas e rastreabilidade</DialogDescription>
          </DialogHeader>
          {selectedMovement && (
            <div className="space-y-4">
              {/* General Information */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Informações Gerais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Código da Movimentação</Label>
                      <div className="font-mono font-semibold text-lg">{selectedMovement.id}</div>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <div>
                        <Badge
                          className={`${
                            movementTypeConfig[selectedMovement.type as keyof typeof movementTypeConfig].color
                          } border`}
                        >
                          {movementTypeConfig[selectedMovement.type as keyof typeof movementTypeConfig].emoji}{" "}
                          {movementTypeConfig[selectedMovement.type as keyof typeof movementTypeConfig].label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Data/Hora</Label>
                      <div>{new Date(selectedMovement.dateTime).toLocaleString("pt-BR")}</div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div>
                        <Badge className={statusConfig[selectedMovement.status as keyof typeof statusConfig].color}>
                          {statusConfig[selectedMovement.status as keyof typeof statusConfig].icon}{" "}
                          {statusConfig[selectedMovement.status as keyof typeof statusConfig].label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Usuário Responsável</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-10 h-10 rounded-full bg-twilight text-imperial flex items-center justify-center text-sm font-semibold">
                          {selectedMovement.user.avatar}
                        </div>
                        <div>
                          <div className="font-medium">{selectedMovement.user.name}</div>
                          <div className="text-xs text-muted-foreground">Operador de Estoque</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Information */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Produto</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>SKU + Descrição</Label>
                      <div className="font-mono font-semibold">{selectedMovement.product.sku}</div>
                      <div className="text-sm text-muted-foreground">{selectedMovement.product.description}</div>
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Badge variant="outline">{selectedMovement.product.category}</Badge>
                    </div>
                    <div>
                      <Label>Lote</Label>
                      <div className="font-mono font-semibold">{selectedMovement.lot}</div>
                    </div>
                    <div>
                      <Label>Validade</Label>
                      <div>{new Date(selectedMovement.expiryDate).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Movement Details */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Movimentação</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quantidade</Label>
                      <div
                        className={`text-2xl font-bold ${
                          selectedMovement.quantity > 0 ? "text-imperial" : "text-red-700"
                        }`}
                      >
                        {selectedMovement.quantity > 0 ? "+" : ""}
                        {selectedMovement.quantity} {selectedMovement.unit}
                      </div>
                    </div>
                    <div>
                      <Label>Origem</Label>
                      <div className="text-sm">{selectedMovement.origin}</div>
                    </div>
                    <div className="col-span-2">
                      <Label>Destino</Label>
                      <div className="text-sm">{selectedMovement.destination}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Values */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Valores</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Valor Unitário</Label>
                      <div className="font-semibold">MZN {selectedMovement.unitValue.toFixed(2)}</div>
                    </div>
                    <div>
                      <Label>Valor Total</Label>
                      <div className="text-xl font-bold text-imperial">
                        MZN {selectedMovement.totalValue.toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Justification */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Justificativa e Observações</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Motivo</Label>
                      <div className="text-sm">{selectedMovement.reason}</div>
                    </div>
                    <div>
                      <Label>Documento de Referência</Label>
                      <div className="font-mono text-sm">
                        {selectedMovement.document.type} {selectedMovement.document.number}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Comprovante
                </Button>
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Adicionar Observação
                </Button>
                <Button variant="outline" className="text-orange-600">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Estornar Movimentação
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}




