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
  ChevronDown,
  X,
  Eye,
  Plus,
  Check,
  Package,
  Repeat,
  AlertCircle,
  TrendingUp,
  XCircle,
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const mockTransfers = [
  {
    id: "TRANS-00045",
    dateTimeRequest: "2025-01-21T14:30:00",
    product: {
      sku: "FRS-045",
      description: "Filé de Frango Congelado - 1kg",
      category: "Congelado",
    },
    lot: "LOT2025-001",
    quantity: 100,
    unit: "kg",
    originLocation: "ARM01 > ZF > CA > P01",
    destinationLocation: "ARM02 > ZF > CA > P01",
    requester: { name: "Carlos Silva", avatar: "CS" },
    status: "pending",
    priority: "normal",
  },
  {
    id: "TRANS-00044",
    dateTimeRequest: "2025-01-21T13:00:00",
    dateTimeTransit: "2025-01-21T13:30:00",
    product: {
      sku: "ALM-001",
      description: "Arroz Branco Tipo 1 - Pacote 5kg",
      category: "Seco",
    },
    lot: "LOT2025-023",
    quantity: 200,
    unit: "kg",
    originLocation: "ARM01 > ZS > CB > P05",
    destinationLocation: "ARM02 > ZS > CA > P03",
    requester: { name: "Ana Santos", avatar: "AS" },
    status: "in_transit",
    priority: "high",
  },
  {
    id: "TRANS-00043",
    dateTimeRequest: "2025-01-21T10:00:00",
    dateTimeTransit: "2025-01-21T10:30:00",
    dateTimeCompleted: "2025-01-21T11:00:00",
    product: {
      sku: "BEB-120",
      description: "Suco de Laranja Natural - 1L",
      category: "Bebidas",
    },
    lot: "LOT2025-087",
    quantity: 50,
    unit: "L",
    originLocation: "ARM01 > ZF > CC > P02",
    destinationLocation: "ARM02 > ZF > CA > P01",
    requester: { name: "Pedro Costa", avatar: "PC" },
    receiver: { name: "Maria Oliveira", avatar: "MO" },
    status: "completed",
    priority: "normal",
  },
  {
    id: "TRANS-00042",
    dateTimeRequest: "2025-01-20T16:00:00",
    product: {
      sku: "LMP-089",
      description: "Detergente Líquido Neutro - 500ml",
      category: "Limpeza",
    },
    lot: "LOT2025-045",
    quantity: 150,
    unit: "un",
    originLocation: "ARM02 > ZS > CA > P10",
    destinationLocation: "ARM01 > ZS > CB > P08",
    requester: { name: "João Souza", avatar: "JS" },
    status: "cancelled",
    priority: "normal",
    cancelReason: "Produto não necessário no destino",
  },
]

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  in_transit: { label: "Em Trânsito", color: "bg-blue-100 text-blue-800", icon: "🔄" },
  completed: { label: "Concluída", color: "bg-twilight text-imperial", icon: "✅" },
  cancelled: { label: "Cancelada", color: "bg-gray-100 text-gray-800", icon: "❌" },
}

const priorityConfig = {
  normal: { label: "Normal", color: "bg-gray-100 text-gray-800" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-800" },
}

// Mock products and lots
const mockProducts = [
  {
    id: "1",
    sku: "FRS-045",
    description: "Filé de Frango Congelado - 1kg",
    category: "Congelado",
    unit: "kg",
  },
  {
    id: "2",
    sku: "ALM-001",
    description: "Arroz Branco Tipo 1 - Pacote 5kg",
    category: "Seco",
    unit: "kg",
  },
]

const mockLots = [
  { lot: "LOT2025-001", expiryDate: "2025-02-05", quantity: 500, location: "ARM01 > ZF > CA > P01" },
  { lot: "LOT2025-023", expiryDate: "2025-04-15", quantity: 1200, location: "ARM01 > ZS > CB > P05" },
]

export function TransfersContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("last30days")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTransfer, setSelectedTransfer] = useState<typeof mockTransfers[0] | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showNewTransfer, setShowNewTransfer] = useState(false)
  const [showConfirmReceipt, setShowConfirmReceipt] = useState(false)
  const [activeTab, setActiveTab] = useState("simple")
  const [showFilters, setShowFilters] = useState(true)

  // New transfer form state
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedLot, setSelectedLot] = useState("")
  const [quantity, setQuantity] = useState("")
  const [originLocation, setOriginLocation] = useState("")
  const [destinationLocation, setDestinationLocation] = useState("")
  const [reason, setReason] = useState("")
  const [observations, setObservations] = useState("")
  const [priority, setPriority] = useState("normal")

  // Confirm receipt state
  const [receivedQuantity, setReceivedQuantity] = useState("")
  const [condition, setCondition] = useState("conform")
  const [damageDescription, setDamageDescription] = useState("")
  const [receiptObservations, setReceiptObservations] = useState("")

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    let filtered = mockTransfers

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (transfer) =>
          transfer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transfer.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transfer.product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transfer.lot.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status
    if (statusFilter !== "all") {
      filtered = filtered.filter((transfer) => transfer.status === statusFilter)
    }

    return filtered
  }, [searchQuery, statusFilter])

  // Calculate KPIs
  const pendingCount = filteredTransfers.filter((t) => t.status === "pending").length
  const inTransitCount = filteredTransfers.filter((t) => t.status === "in_transit").length
  const completedTodayCount = filteredTransfers.filter(
    (t) =>
      t.status === "completed" &&
      t.dateTimeCompleted &&
      new Date(t.dateTimeCompleted).toDateString() === new Date().toDateString(),
  ).length
  const totalValue = 15420 // Mock value

  const viewDetails = (transfer: typeof mockTransfers[0]) => {
    setSelectedTransfer(transfer)
    setShowDetails(true)
  }

  const openConfirmReceipt = (transfer: typeof mockTransfers[0]) => {
    setSelectedTransfer(transfer)
    setReceivedQuantity(transfer.quantity.toString())
    setShowConfirmReceipt(true)
  }

  const handleNewTransfer = () => {
    // Here would be the API call
    console.log("New transfer created")
    setShowNewTransfer(false)
    // Reset form
    setSelectedProduct("")
    setSelectedLot("")
    setQuantity("")
    setOriginLocation("")
    setDestinationLocation("")
    setReason("")
    setObservations("")
    setPriority("normal")
  }

  const handleConfirmReceipt = () => {
    // Here would be the API call
    console.log("Receipt confirmed")
    setShowConfirmReceipt(false)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setDateFilter("last30days")
    setStatusFilter("all")
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
        <span className="text-foreground">Transferências</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Transferências de Estoque</h1>
          <p className="text-muted-foreground mt-1">Movimentação de produtos entre locais</p>
        </div>
        <Button className="bg-imperial hover:bg-imperial" onClick={() => setShowNewTransfer(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Transferência
        </Button>
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
              {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_transit">Em Trânsito</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
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
              <p className="text-sm text-muted-foreground">Transferências Pendentes</p>
              <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Aguardando processamento</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Em Trânsito</p>
              <p className="text-2xl font-bold text-blue-700">{inTransitCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Em movimentação</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Concluídas Hoje</p>
              <p className="text-2xl font-bold text-imperial">{completedTodayCount}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-imperial" />
                <span className="text-xs text-imperial">+12% vs ontem</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Valor em Trânsito</p>
              <p className="text-2xl font-bold text-imperial">
                MZN {totalValue.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Custo médio dos produtos</p>
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
                    Código
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data/Hora Solicitação</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lote</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantidade</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">De (Origem)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Para (Destino)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Solicitante</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransfers.map((transfer) => {
                const statConfig = statusConfig[transfer.status as keyof typeof statusConfig]
                const prioConfig = priorityConfig[transfer.priority as keyof typeof priorityConfig]

                const rowClass =
                  transfer.status === "pending" && transfer.priority === "urgent"
                    ? "bg-red-50"
                    : transfer.status === "pending" && transfer.priority === "high"
                      ? "bg-yellow-50"
                      : transfer.status === "cancelled"
                        ? "bg-gray-50"
                        : ""

                return (
                  <tr key={transfer.id} className={`${rowClass} hover:bg-gray-100 transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-sm">{transfer.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {new Date(transfer.dateTimeRequest).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transfer.dateTimeRequest).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="min-w-[180px]">
                        <div className="font-mono text-sm font-medium">{transfer.product.sku}</div>
                        <div className="text-xs text-muted-foreground truncate" title={transfer.product.description}>
                          {transfer.product.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm">{transfer.lot}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold">{transfer.quantity}</div>
                      <div className="text-xs text-muted-foreground">{transfer.unit}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs max-w-[150px] truncate" title={transfer.originLocation}>
                        {transfer.originLocation}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs max-w-[150px] truncate" title={transfer.destinationLocation}>
                        {transfer.destinationLocation}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-twilight text-imperial flex items-center justify-center text-xs font-semibold">
                          {transfer.requester.avatar}
                        </div>
                        <div className="text-xs">{transfer.requester.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <Badge className={`${statConfig.color} border-0`}>
                          {statConfig.icon} {statConfig.label}
                        </Badge>
                        {transfer.priority !== "normal" && (
                          <Badge className={`${prioConfig.color} border-0 text-xs`}>{prioConfig.label}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {transfer.status === "in_transit" && (
                          <Button size="sm" variant="outline" onClick={() => openConfirmReceipt(transfer)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewDetails(transfer)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {transfer.status === "in_transit" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openConfirmReceipt(transfer)}>
                                  <Check className="w-4 h-4 mr-2" />
                                  Confirmar Recebimento
                                </DropdownMenuItem>
                              </>
                            )}
                            {transfer.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancelar
                                </DropdownMenuItem>
                              </>
                            )}
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
      </Card>

      {/* Transfer Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Transferência</DialogTitle>
            <DialogDescription>Informações completas da transferência</DialogDescription>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Informações Gerais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Código</Label>
                      <div className="font-mono font-semibold text-lg">{selectedTransfer.id}</div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge className={statusConfig[selectedTransfer.status as keyof typeof statusConfig].color}>
                        {statusConfig[selectedTransfer.status as keyof typeof statusConfig].icon}{" "}
                        {statusConfig[selectedTransfer.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                    <div>
                      <Label>Data/Hora Solicitação</Label>
                      <div>{new Date(selectedTransfer.dateTimeRequest).toLocaleString("pt-BR")}</div>
                    </div>
                    <div>
                      <Label>Solicitante</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-8 rounded-full bg-twilight text-imperial flex items-center justify-center text-sm font-semibold">
                          {selectedTransfer.requester.avatar}
                        </div>
                        <div className="text-sm">{selectedTransfer.requester.name}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Produto</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>SKU + Descrição</Label>
                      <div className="font-mono font-semibold">{selectedTransfer.product.sku}</div>
                      <div className="text-sm text-muted-foreground">{selectedTransfer.product.description}</div>
                    </div>
                    <div>
                      <Label>Lote</Label>
                      <div className="font-mono font-semibold">{selectedTransfer.lot}</div>
                    </div>
                    <div>
                      <Label>Quantidade</Label>
                      <div className="text-xl font-bold">
                        {selectedTransfer.quantity} {selectedTransfer.unit}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Locais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Origem</Label>
                      <div className="text-sm font-mono">{selectedTransfer.originLocation}</div>
                    </div>
                    <div>
                      <Label>Destino</Label>
                      <div className="text-sm font-mono">{selectedTransfer.destinationLocation}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Transfer Modal */}
      <Dialog open={showNewTransfer} onOpenChange={setShowNewTransfer}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Transferência</DialogTitle>
            <DialogDescription>Solicitar transferência de produtos entre locais</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="simple" className="flex-1">
                Transferência Simples
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex-1">
                Transferência em Lote
              </TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="space-y-4 mt-4">
              <div>
                <Label>Produto *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.sku} - {product.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Lote *</Label>
                <Select value={selectedLot} onValueChange={setSelectedLot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar lote disponível" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLots.map((lot) => (
                      <SelectItem key={lot.lot} value={lot.lot}>
                        <div className="flex flex-col">
                          <span className="font-mono">{lot.lot}</span>
                          <span className="text-xs text-muted-foreground">
                            Val: {new Date(lot.expiryDate).toLocaleDateString("pt-BR")} | Qtd: {lot.quantity} | {lot.location}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  placeholder="Digite a quantidade"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Local Origem *</Label>
                  <Select value={originLocation} onValueChange={setOriginLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar local" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loc1">ARM01 &gt; ZF &gt; CA &gt; P01</SelectItem>
                      <SelectItem value="loc2">ARM01 &gt; ZS &gt; CB &gt; P05</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Local Destino *</Label>
                  <Select value={destinationLocation} onValueChange={setDestinationLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar local" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loc3">ARM02 &gt; ZF &gt; CA &gt; P01</SelectItem>
                      <SelectItem value="loc4">ARM02 &gt; ZS &gt; CA &gt; P03</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Motivo *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restock">Reposição</SelectItem>
                    <SelectItem value="reorganization">Reorganização</SelectItem>
                    <SelectItem value="optimization">Otimização</SelectItem>
                    <SelectItem value="consolidation">Consolidação</SelectItem>
                    <SelectItem value="internal_request">Pedido Interno</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  placeholder="Informações adicionais..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Prioridade</Label>
                <RadioGroup value={priority} onValueChange={setPriority}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="normal" />
                      <label htmlFor="normal" className="cursor-pointer">
                        Normal
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <label htmlFor="high" className="cursor-pointer">
                        Alta
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urgent" id="urgent" />
                      <label htmlFor="urgent" className="cursor-pointer">
                        Urgente
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>

            <TabsContent value="batch" className="mt-4">
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Transferência em Lote</h3>
                <p className="text-muted-foreground">
                  Funcionalidade para adicionar múltiplos itens em desenvolvimento
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTransfer(false)}>
              Cancelar
            </Button>
            <Button variant="outline">Salvar Rascunho</Button>
            <Button className="bg-imperial hover:bg-imperial" onClick={handleNewTransfer}>
              Solicitar Transferência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Receipt Modal */}
      <Dialog open={showConfirmReceipt} onOpenChange={setShowConfirmReceipt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Recebimento de Transferência</DialogTitle>
            <DialogDescription>Confirme a quantidade recebida e as condições do produto</DialogDescription>
          </DialogHeader>

          {selectedTransfer && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Transferência:</span>
                    <span className="ml-2 font-mono font-semibold">{selectedTransfer.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Produto:</span>
                    <span className="ml-2 font-medium">{selectedTransfer.product.sku}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lote:</span>
                    <span className="ml-2 font-mono">{selectedTransfer.lot}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Qtd Esperada:</span>
                    <span className="ml-2 font-semibold">
                      {selectedTransfer.quantity} {selectedTransfer.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Quantidade Recebida *</Label>
                <Input
                  type="number"
                  value={receivedQuantity}
                  onChange={(e) => setReceivedQuantity(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label>Condições do Recebimento *</Label>
                <RadioGroup value={condition} onValueChange={setCondition}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conform" id="conform" />
                      <label htmlFor="conform" className="cursor-pointer">
                        Conforme (sem avarias)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="minor_damage" id="minor_damage" />
                      <label htmlFor="minor_damage" className="cursor-pointer">
                        Com Avarias Leves
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="major_damage" id="major_damage" />
                      <label htmlFor="major_damage" className="cursor-pointer">
                        Com Avarias Graves
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {condition !== "conform" && (
                <div>
                  <Label>Descrever Avarias *</Label>
                  <Textarea
                    placeholder="Detalhe as avarias encontradas..."
                    value={damageDescription}
                    onChange={(e) => setDamageDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div>
                <Label>Observações do Recebimento</Label>
                <Textarea
                  placeholder="Informações adicionais..."
                  value={receiptObservations}
                  onChange={(e) => setReceiptObservations(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmReceipt(false)}>
              Cancelar
            </Button>
            <Button className="bg-imperial hover:bg-imperial" onClick={handleConfirmReceipt}>
              <Check className="w-4 h-4 mr-2" />
              Confirmar Recebimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




