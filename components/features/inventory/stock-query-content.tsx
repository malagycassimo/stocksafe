"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  Download,
  Filter,
  MoreVertical,
  Package,
  AlertCircle,
  TrendingUp,
  Printer,
  Lock,
  Unlock,
  Eye,
  FileText,
  Trash2,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  X,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Mock data
const mockStockItems = [
  {
    id: "1",
    sku: "FRS-045",
    description: "Filé de Frango Congelado - 1kg",
    category: "Congelado",
    lot: "LOT2025-001",
    expiryDate: "2025-02-05",
    daysToExpiry: 15,
    shelfLifePercent: 8,
    quantity: 500,
    unit: "kg",
    location: "ARM01 > ZF > CA > P01",
    unitPrice: 18.5,
    totalValue: 9250,
    status: "available",
    entryDate: "2025-01-18",
    supplier: "Frigorífico Premium",
    supplierScore: 88,
  },
  {
    id: "2",
    sku: "ALM-001",
    description: "Arroz Branco Tipo 1 - Pacote 5kg",
    category: "Seco",
    lot: "LOT2025-023",
    expiryDate: "2025-04-15",
    daysToExpiry: 84,
    shelfLifePercent: 65,
    quantity: 1200,
    unit: "kg",
    location: "ARM01 > ZS > CB > P05",
    unitPrice: 6.8,
    totalValue: 8160,
    status: "available",
    entryDate: "2025-01-10",
    supplier: "Distribuidora Alimentos",
    supplierScore: 92,
  },
  {
    id: "3",
    sku: "BEB-120",
    description: "Suco de Laranja Natural - 1L",
    category: "Bebidas",
    lot: "LOT2025-087",
    expiryDate: "2025-01-24",
    daysToExpiry: 3,
    shelfLifePercent: 15,
    quantity: 300,
    unit: "L",
    location: "ARM01 > ZF > CC > P02",
    unitPrice: 8.9,
    totalValue: 2670,
    status: "available",
    entryDate: "2025-01-17",
    supplier: "Hortifruti Verde Vida",
    supplierScore: 75,
  },
  {
    id: "4",
    sku: "LMP-089",
    description: "Detergente Líquido Neutro - 500ml",
    category: "Limpeza",
    lot: "LOT2025-045",
    expiryDate: "2026-06-30",
    daysToExpiry: 525,
    shelfLifePercent: 85,
    quantity: 800,
    unit: "un",
    location: "ARM02 > ZS > CA > P10",
    unitPrice: 3.5,
    totalValue: 2800,
    status: "available",
    entryDate: "2024-12-05",
    supplier: "Produtos Limpeza Pro",
    supplierScore: 65,
  },
  {
    id: "5",
    sku: "FRS-012",
    description: "Alface Americana Orgânica - Unidade",
    category: "Fresco",
    lot: "LOT2025-099",
    expiryDate: "2025-01-22",
    daysToExpiry: 1,
    shelfLifePercent: 20,
    quantity: 150,
    unit: "un",
    location: "ARM01 > ZF > CD > P01",
    unitPrice: 2.5,
    totalValue: 375,
    status: "available",
    entryDate: "2025-01-20",
    supplier: "Hortifruti Verde Vida",
    supplierScore: 75,
  },
  {
    id: "6",
    sku: "FRS-046",
    description: "Carne Bovina Moída - 1kg",
    category: "Congelado",
    lot: "LOT2025-034",
    expiryDate: "2025-01-20",
    daysToExpiry: -1,
    shelfLifePercent: 0,
    quantity: 80,
    unit: "kg",
    location: "ARM01 > ZC > CA > P03",
    unitPrice: 25.0,
    totalValue: 2000,
    status: "expired",
    entryDate: "2024-12-20",
    supplier: "Frigorífico Premium",
    supplierScore: 88,
  },
  {
    id: "7",
    sku: "BEB-135",
    description: "Leite Integral UHT - 1L",
    category: "Bebidas",
    lot: "LOT2025-111",
    expiryDate: "2025-03-10",
    daysToExpiry: 48,
    shelfLifePercent: 45,
    quantity: 600,
    unit: "L",
    location: "ARM01 > ZF > CE > P04",
    unitPrice: 4.2,
    totalValue: 2520,
    status: "blocked",
    entryDate: "2025-01-05",
    supplier: "Laticínios Premium",
    supplierScore: 82,
  },
  {
    id: "8",
    sku: "SEC-078",
    description: "Macarrão Espaguete Integral - 500g",
    category: "Seco",
    lot: "LOT2025-067",
    expiryDate: "2025-07-20",
    daysToExpiry: 180,
    shelfLifePercent: 75,
    quantity: 950,
    unit: "kg",
    location: "ARM01 > ZS > CC > P08",
    unitPrice: 5.5,
    totalValue: 5225,
    status: "available",
    entryDate: "2025-01-02",
    supplier: "Distribuidora Alimentos",
    supplierScore: 92,
  },
]

const statusConfig = {
  available: { label: "Disponível", color: "bg-twilight text-imperial", icon: "🟢" },
  blocked: { label: "Bloqueado", color: "bg-red-100 text-red-800", icon: "🔴" },
  quarantine: { label: "Quarentena", color: "bg-orange-100 text-orange-800", icon: "🟠" },
  restricted: { label: "Restrito", color: "bg-yellow-100 text-yellow-800", icon: "🟡" },
  expired: { label: "Vencido", color: "bg-gray-100 text-gray-800", icon: "⚫" },
}

export function StockQueryContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todas")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [validityFilter, setValidityFilter] = useState("all")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(true)
  const [activeTab, setActiveTab] = useState("by-lot")
  const [selectedLot, setSelectedLot] = useState<typeof mockStockItems[0] | null>(null)
  const [showLotDetails, setShowLotDetails] = useState(false)

  // Filter items
  const filteredItems = useMemo(() => {
    let filtered = mockStockItems

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.lot.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category
    if (categoryFilter !== "Todas") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    // Status
    if (statusFilter !== "Todos") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    // Validity
    if (validityFilter === "expired") {
      filtered = filtered.filter((item) => item.daysToExpiry < 0)
    } else if (validityFilter === "7days") {
      filtered = filtered.filter((item) => item.daysToExpiry >= 0 && item.daysToExpiry <= 7)
    } else if (validityFilter === "15days") {
      filtered = filtered.filter((item) => item.daysToExpiry > 7 && item.daysToExpiry <= 15)
    } else if (validityFilter === "30days") {
      filtered = filtered.filter((item) => item.daysToExpiry > 15 && item.daysToExpiry <= 30)
    } else if (validityFilter === "60days") {
      filtered = filtered.filter((item) => item.daysToExpiry > 30 && item.daysToExpiry <= 60)
    } else if (validityFilter === "more60days") {
      filtered = filtered.filter((item) => item.daysToExpiry > 60)
    }

    return filtered
  }, [searchQuery, categoryFilter, statusFilter, validityFilter])

  // Calculate KPIs
  const totalValue = filteredItems.reduce((sum, item) => sum + item.totalValue, 0)
  const totalItems = filteredItems.length
  const uniqueLots = new Set(filteredItems.map((item) => item.lot)).size
  const expiredLots = filteredItems.filter((item) => item.daysToExpiry < 0).length
  const expiringSoon = filteredItems.filter((item) => item.daysToExpiry >= 0 && item.daysToExpiry <= 7).length
  const occupationPercent = 68 // Mock calculation

  const getValidityColor = (days: number) => {
    if (days < 0) return "text-red-600 font-semibold"
    if (days <= 7) return "text-red-600 font-semibold"
    if (days <= 15) return "text-orange-600"
    if (days <= 30) return "text-yellow-600"
    return "text-imperial"
  }

  const getShelfLifeColor = (percent: number) => {
    if (percent < 20) return "bg-red-500"
    if (percent < 50) return "bg-yellow-500"
    return "bg-imperial"
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("Todas")
    setStatusFilter("Todos")
    setValidityFilter("all")
  }

  const viewLotDetails = (item: typeof mockStockItems[0]) => {
    setSelectedLot(item)
    setShowLotDetails(true)
  }

  // Group by product for consolidated view
  const groupedByProduct = useMemo(() => {
    const grouped = filteredItems.reduce((acc, item) => {
      const existing = acc.find((g) => g.sku === item.sku)
      if (existing) {
        existing.totalQty += item.quantity
        existing.availableQty += item.status === "available" ? item.quantity : 0
        existing.blockedQty += item.status === "blocked" ? item.quantity : 0
        existing.lotsCount += 1
        if (item.daysToExpiry < existing.nearestExpiry) {
          existing.nearestExpiry = item.daysToExpiry
          existing.nearestExpiryDate = item.expiryDate
        }
        existing.totalValue += item.totalValue
      } else {
        acc.push({
          sku: item.sku,
          description: item.description,
          category: item.category,
          totalQty: item.quantity,
          availableQty: item.status === "available" ? item.quantity : 0,
          blockedQty: item.status === "blocked" ? item.quantity : 0,
          lotsCount: 1,
          nearestExpiry: item.daysToExpiry,
          nearestExpiryDate: item.expiryDate,
          totalValue: item.totalValue,
          unit: item.unit,
          lots: [item],
        })
      }
      return acc
    }, [] as any[])
    return grouped
  }, [filteredItems])

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
        <span className="text-foreground">Consultar Estoque</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-imperial">Consulta de Estoque</h1>
        <p className="text-muted-foreground mt-1">Visualização em tempo real do estoque por lote e validade</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              {/* Line 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label>Busca Rápida</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por SKU, descrição, lote..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Categoria</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todas as categorias</SelectItem>
                      <SelectItem value="Fresco">Fresco</SelectItem>
                      <SelectItem value="Seco">Seco</SelectItem>
                      <SelectItem value="Congelado">Congelado</SelectItem>
                      <SelectItem value="Bebidas">Bebidas</SelectItem>
                      <SelectItem value="Limpeza">Limpeza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status do Lote</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      <SelectItem value="available">Disponível</SelectItem>
                      <SelectItem value="blocked">Bloqueado</SelectItem>
                      <SelectItem value="quarantine">Quarentena</SelectItem>
                      <SelectItem value="restricted">Restrito</SelectItem>
                      <SelectItem value="expired">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Line 2 - Validity */}
              <div>
                <Label>Faixa de Validade</Label>
                <RadioGroup value={validityFilter} onValueChange={setValidityFilter} className="mt-2">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="all" id="all" />
                      <label htmlFor="all" className="text-sm cursor-pointer">Todos</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="expired" id="expired" />
                      <label htmlFor="expired" className="text-sm cursor-pointer">Vencidos</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="7days" id="7days" />
                      <label htmlFor="7days" className="text-sm cursor-pointer">Vence em ≤ 7 dias</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="15days" id="15days" />
                      <label htmlFor="15days" className="text-sm cursor-pointer">Vence em ≤ 15 dias</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="30days" id="30days" />
                      <label htmlFor="30days" className="text-sm cursor-pointer">Vence em ≤ 30 dias</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="60days" id="60days" />
                      <label htmlFor="60days" className="text-sm cursor-pointer">Vence em ≤ 60 dias</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="more60days" id="more60days" />
                      <label htmlFor="more60days" className="text-sm cursor-pointer">Vence em &gt; 60 dias</label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Filtro
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total em Estoque</p>
                <p className="text-2xl font-bold text-imperial">
                  MZN {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-imperial" />
                  <span className="text-xs text-imperial">+5.2% vs mês anterior</span>
                </div>
              </div>
              <Package className="w-10 h-10 text-imperial opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total de Itens</p>
              <p className="text-2xl font-bold text-imperial">{totalItems}</p>
              <p className="text-xs text-muted-foreground mt-1">{uniqueLots} lotes distintos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Alertas Críticos</p>
              <div className="flex items-center gap-3 mt-2">
                <div>
                  <Badge variant="destructive" className="text-xs">
                    🔴 {expiredLots} vencidos
                  </Badge>
                </div>
                <div>
                  <Badge className="bg-orange-500 text-xs">
                    🟠 {expiringSoon} &lt; 7 dias
                  </Badge>
                </div>
              </div>
              <Link href="#" className="text-xs text-imperial hover:underline mt-2 inline-block">
                Ver detalhes
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Ocupação</p>
              <p className="text-2xl font-bold text-imperial">{occupationPercent}%</p>
              <Progress value={occupationPercent} className="mt-2 h-2" />
              <Link href="#" className="text-xs text-imperial hover:underline mt-2 inline-block">
                Ver por local
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card className="border-twilight bg-twilight">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedItems.length} {selectedItems.length === 1 ? "item selecionado" : "itens selecionados"}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Etiquetas
                </Button>
                <Button variant="outline" size="sm">
                  <Package className="w-4 h-4 mr-2" />
                  Transferir em Lote
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])}>
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="by-lot">Visão por Lote</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidada por Produto</TabsTrigger>
          <TabsTrigger value="by-location">Por Local</TabsTrigger>
          <TabsTrigger value="alerts">Alertas e Validades</TabsTrigger>
        </TabsList>

        {/* Tab 1: By Lot */}
        <TabsContent value="by-lot" className="mt-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-1 cursor-pointer">
                        Produto
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lote</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Validade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">% Vida Útil</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantidade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Local</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor Unit.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const config = statusConfig[item.status as keyof typeof statusConfig]
                    const rowClass =
                      item.daysToExpiry < 0
                        ? "bg-red-50"
                        : item.daysToExpiry <= 7
                          ? "bg-yellow-50"
                          : item.status === "blocked"
                            ? "bg-gray-50"
                            : ""

                    return (
                      <tr key={item.id} className={`${rowClass} hover:bg-gray-100 transition-colors`}>
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-[200px]">
                            <div className="font-mono text-sm font-medium">{item.sku}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={item.description}>
                              {item.description}
                            </div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => viewLotDetails(item)}
                            className="font-mono text-sm text-imperial hover:underline"
                          >
                            {item.lot}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm">{new Date(item.expiryDate).toLocaleDateString("pt-BR")}</div>
                            <div className={`text-xs ${getValidityColor(item.daysToExpiry)}`}>
                              {item.daysToExpiry < 0
                                ? `Vencido há ${Math.abs(item.daysToExpiry)} dias`
                                : `${item.daysToExpiry} dias restantes`}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <Progress value={item.shelfLifePercent} className="h-2" />
                            <div className="text-xs text-center">{item.shelfLifePercent}%</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold">{item.quantity}</div>
                            <div className="text-xs text-muted-foreground">{item.unit}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-mono max-w-[150px] truncate" title={item.location}>
                            {item.location}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">MZN {item.unitPrice.toFixed(2)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold">
                            MZN {item.totalValue.toLocaleString("pt-BR")}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${config.color} border-0`}>
                            {config.icon} {config.label}
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
                              <DropdownMenuItem onClick={() => viewLotDetails(item)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimir Etiqueta
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Package className="w-4 h-4 mr-2" />
                                Transferir
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                {item.status === "blocked" ? (
                                  <>
                                    <Unlock className="w-4 h-4 mr-2" />
                                    Desbloquear
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Bloquear
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="w-4 h-4 mr-2" />
                                Ver Movimentações
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Descartar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm">
                      Total de Linhas: {filteredItems.length}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {filteredItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td colSpan={2}></td>
                    <td className="px-4 py-3 text-sm">
                      MZN {totalValue.toLocaleString("pt-BR")}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Consolidated */}
        <TabsContent value="consolidated" className="mt-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qtd Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qtd Disponível</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qtd Bloqueada</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qtd de Lotes</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Próximo Vencimento</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groupedByProduct.map((group) => (
                    <tr key={group.sku} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm font-medium">{group.sku}</div>
                        <div className="text-xs text-muted-foreground">{group.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold">{group.totalQty} {group.unit}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-imperial">{group.availableQty} {group.unit}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-red-600">{group.blockedQty} {group.unit}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{group.lotsCount} lotes</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm">{new Date(group.nearestExpiryDate).toLocaleDateString("pt-BR")}</div>
                          <div className={`text-xs ${getValidityColor(group.nearestExpiry)}`}>
                            {group.nearestExpiry} dias
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold">
                          MZN {group.totalValue.toLocaleString("pt-BR")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: By Location - Simplified */}
        <TabsContent value="by-location" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Visualização por Local</h3>
                <p className="text-muted-foreground">
                  Estrutura hierárquica de locais em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Alerts */}
        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-4">
            {/* Expired */}
            {expiredLots > 0 && (
              <Card className="border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      🔴 Vencidos ({expiredLots} lotes)
                    </h3>
                    <Button variant="outline" size="sm" className="text-red-600">
                      Iniciar Descarte de Todos
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {filteredItems
                      .filter((item) => item.daysToExpiry < 0)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-red-50 rounded p-3">
                          <div>
                            <div className="font-medium text-sm">{item.sku} - {item.description}</div>
                            <div className="text-xs text-muted-foreground">
                              Lote: {item.lot} | Vencido há {Math.abs(item.daysToExpiry)} dias
                            </div>
                          </div>
                          <Badge variant="destructive">Vencido</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expiring Soon */}
            {expiringSoon > 0 && (
              <Card className="border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      🟠 Vence em ≤ 7 dias ({expiringSoon} lotes)
                    </h3>
                    <Button variant="outline" size="sm" className="text-orange-600">
                      Criar Campanha de Escoamento
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {filteredItems
                      .filter((item) => item.daysToExpiry >= 0 && item.daysToExpiry <= 7)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-orange-50 rounded p-3">
                          <div>
                            <div className="font-medium text-sm">{item.sku} - {item.description}</div>
                            <div className="text-xs text-muted-foreground">
                              Lote: {item.lot} | Vence em {item.daysToExpiry} dias
                            </div>
                          </div>
                          <Badge className="bg-orange-500">Urgente</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Lot Details Modal */}
      <Dialog open={showLotDetails} onOpenChange={setShowLotDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Lote</DialogTitle>
            <DialogDescription>
              Informações completas e rastreabilidade do lote
            </DialogDescription>
          </DialogHeader>
          {selectedLot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Produto</Label>
                  <div className="font-medium">{selectedLot.sku} - {selectedLot.description}</div>
                </div>
                <div>
                  <Label>Lote</Label>
                  <div className="font-mono font-medium">{selectedLot.lot}</div>
                </div>
                <div>
                  <Label>Validade</Label>
                  <div>{new Date(selectedLot.expiryDate).toLocaleDateString("pt-BR")}</div>
                  <div className={`text-xs ${getValidityColor(selectedLot.daysToExpiry)}`}>
                    {selectedLot.daysToExpiry} dias restantes
                  </div>
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <div className="font-semibold">{selectedLot.quantity} {selectedLot.unit}</div>
                </div>
                <div>
                  <Label>Local</Label>
                  <div className="font-mono text-sm">{selectedLot.location}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={statusConfig[selectedLot.status as keyof typeof statusConfig].color}>
                    {statusConfig[selectedLot.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <div>
                  <Label>Fornecedor</Label>
                  <div>{selectedLot.supplier}</div>
                  <Badge variant="outline" className="mt-1">Score: {selectedLot.supplierScore}</Badge>
                </div>
                <div>
                  <Label>Valor Total</Label>
                  <div className="font-semibold">MZN {selectedLot.totalValue.toLocaleString("pt-BR")}</div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Etiqueta
                </Button>
                <Button size="sm" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Transferir
                </Button>
                <Button size="sm" variant="outline">
                  {selectedLot.status === "blocked" ? (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Desbloquear
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Bloquear
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}




