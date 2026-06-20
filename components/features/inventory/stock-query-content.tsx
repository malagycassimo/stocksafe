"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
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
import { useEstoque } from "@/hooks/useEstoque"

const statusConfig = {
  DISPONIVEL: { label: "Disponível", color: "bg-green-100 text-green-800", icon: "🟢" },
  BLOQUEADO: { label: "Bloqueado", color: "bg-red-100 text-red-800", icon: "🔴" },
  QUARENTENA: { label: "Quarentena", color: "bg-orange-100 text-orange-800", icon: "🟠" },
  RESTREITO: { label: "Restrito", color: "bg-yellow-100 text-yellow-800", icon: "🟡" },
  VENCIDO: { label: "Vencido", color: "bg-gray-100 text-gray-800", icon: "⚫" },
  available: { label: "Disponível", color: "bg-green-100 text-green-800", icon: "🟢" },
  blocked: { label: "Bloqueado", color: "bg-red-100 text-red-800", icon: "🔴" },
  quarantine: { label: "Quarentena", color: "bg-orange-100 text-orange-800", icon: "🟠" },
  restricted: { label: "Restrito", color: "bg-yellow-100 text-yellow-800", icon: "🟡" },
  expired: { label: "Vencido", color: "bg-gray-100 text-gray-800", icon: "⚫" },
}


export function StockQueryContent() {
  const { lotes, metricas, loading, carregarEstoque, carregarMetricas } = useEstoque()

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todas")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [validityFilter, setValidityFilter] = useState("all")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(true)
  const [activeTab, setActiveTab] = useState("by-lot")
  const [selectedLot, setSelectedLot] = useState<any | null>(null)
  const [showLotDetails, setShowLotDetails] = useState(false)

  // Carregar dados no mount e sempre que os filtros mudarem
  useEffect(() => {
    const status = statusFilter === "Todos" ? undefined : statusFilter
    const search = searchQuery || undefined

    let faixa_validade: string | undefined = undefined
    if (validityFilter === "all") faixa_validade = "TODOS"
    else if (validityFilter === "expired") faixa_validade = "VENCIDOS"
    else if (validityFilter === "7days") faixa_validade = "7_DIAS"
    else if (validityFilter === "15days") faixa_validade = "15_DIAS"
    else if (validityFilter === "30days") faixa_validade = "30_DIAS"
    else if (validityFilter === "60days") faixa_validade = "60_DIAS"
    else if (validityFilter === "more60days") faixa_validade = "MAIOR_60"

    carregarEstoque({
      status,
      search,
      faixa_validade,
    })
  }, [searchQuery, statusFilter, validityFilter, carregarEstoque])

  // Carregar métricas no mount
  useEffect(() => {
    carregarMetricas()
  }, [carregarMetricas])

  const filteredItems = useMemo(() => {
    if (categoryFilter === "Todas") {
      return lotes
    }
    return lotes.filter((item) => {
      const cat = (item.produto as any)?.categoria || ""
      return cat.toLowerCase() === categoryFilter.toLowerCase()
    })
  }, [lotes, categoryFilter])

  // KPIs
  const totalValue = metricas?.valor_total_estoque || 0
  const totalItems = metricas?.total_itens || 0
  const uniqueLots = lotes.length
  const expiredLots = metricas?.alertas_criticos?.vencidos || 0
  const expiringSoon = metricas?.alertas_criticos?.menos_7_dias || 0
  const occupationPercent = metricas?.ocupacao_percentagem || 0

  const getValidityColor = (days: number) => {
    if (days <= 0) return "text-red-600 font-semibold"
    if (days <= 7) return "text-red-600 font-semibold"
    if (days <= 15) return "text-orange-600"
    if (days <= 30) return "text-yellow-600"
    return "text-green-600"
  }

  const getShelfLifeColor = (percent: number) => {
    if (percent < 20) return "bg-red-500"
    if (percent < 50) return "bg-yellow-500"
    return "bg-green-500"
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

  const viewLotDetails = (item: any) => {
    setSelectedLot(item)
    setShowLotDetails(true)
  }

  // Group by product for consolidated view
  const groupedByProduct = useMemo(() => {
    const grouped = filteredItems.reduce((acc, item) => {
      const sku = item.produto?.sku || ""
      const existing = acc.find((g) => g.sku === sku)
      if (existing) {
        existing.totalQty += item.quantidade
        existing.availableQty += item.status === "DISPONIVEL" ? item.quantidade : 0
        existing.blockedQty += item.status === "BLOQUEADO" ? item.quantidade : 0
        existing.lotsCount += 1
        if (item.dias_restantes < existing.nearestExpiry) {
          existing.nearestExpiry = item.dias_restantes
          existing.nearestExpiryDate = item.validade
        }
        existing.totalValue += item.valor_total
      } else {
        acc.push({
          sku: sku,
          description: item.produto?.descricao || "",
          category: (item.produto as any)?.categoria || "Geral",
          totalQty: item.quantidade,
          availableQty: item.status === "DISPONIVEL" ? item.quantidade : 0,
          blockedQty: item.status === "BLOQUEADO" ? item.quantidade : 0,
          lotsCount: 1,
          nearestExpiry: item.dias_restantes,
          nearestExpiryDate: item.validade,
          totalValue: item.valor_total,
          unit: item.produto?.unidade_medida || "",
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
        <Link href="/dashboard" className="hover:text-emerald-600">
          Home
        </Link>
        {" / "}
        <span>Estoque</span>
        {" / "}
        <span className="text-foreground">Consultar Estoque</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-700">Consulta de Estoque</h1>
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
                <Button variant="outline" className="text-emerald-600 border-emerald-600">
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
                <p className="text-2xl font-bold text-emerald-700">
                  {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+5.2% vs mês anterior</span>
                </div>
              </div>
              <Package className="w-10 h-10 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total de Itens</p>
              <p className="text-2xl font-bold text-emerald-700">{totalItems}</p>
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
              <Link href="#" className="text-xs text-emerald-600 hover:underline mt-2 inline-block">
                Ver detalhes
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Ocupação</p>
              <p className="text-2xl font-bold text-emerald-700">{occupationPercent}%</p>
              <Progress value={occupationPercent} className="mt-2 h-2" />
              <Link href="#" className="text-xs text-emerald-600 hover:underline mt-2 inline-block">
                Ver por local
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card className="border-emerald-200 bg-emerald-50">
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
                    const config = (item.status && statusConfig[item.status as keyof typeof statusConfig]) || { label: item.status || "Desconhecido", color: "bg-gray-100 text-gray-800", icon: "📦" }
                    const rowClass =
                      item.dias_restantes <= 0
                        ? "bg-red-50"
                        : item.dias_restantes <= 7
                          ? "bg-yellow-50"
                          : item.status === "BLOQUEADO"
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
                            <div className="font-mono text-sm font-medium">{item.produto?.sku}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={item.produto?.descricao}>
                              {item.produto?.descricao}
                            </div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {(item.produto as any)?.categoria || "Geral"}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => viewLotDetails(item)}
                            className="font-mono text-sm text-emerald-600 hover:underline"
                          >
                            {item.lote}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm">{new Date(item.validade).toLocaleDateString("pt-BR")}</div>
                            <div className={`text-xs ${getValidityColor(item.dias_restantes)}`}>
                              {item.dias_restantes <= 0
                                ? `Vencido há ${Math.abs(item.dias_restantes)} dias`
                                : `${item.dias_restantes} dias restantes`}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <Progress value={item.percentagem_vida_util} className="h-2" />
                            <div className="text-xs text-center">{item.percentagem_vida_util}%</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold">{item.quantidade}</div>
                            <div className="text-xs text-muted-foreground">{item.produto?.unidade_medida}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-mono max-w-[150px] truncate" title={item.local_codigo}>
                            {item.local_codigo}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{item.valor_unitario.toFixed(2)} MT</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold">
                            {item.valor_total.toLocaleString("pt-BR")} MT
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
                                {item.status === "BLOQUEADO" ? (
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
                      {filteredItems.reduce((sum, item) => sum + item.quantidade, 0)}
                    </td>
                    <td colSpan={2}></td>
                    <td className="px-4 py-3 text-sm">
                      {totalValue.toLocaleString("pt-BR")} MT
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
                        <div className="text-sm text-green-600">{group.availableQty} {group.unit}</div>
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
                          {group.totalValue.toLocaleString("pt-BR")} MT
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
              <Card className="border-red-200 shadow-md bg-gradient-to-br from-red-50/50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4 border-b border-red-100 pb-3">
                    <h3 className="font-semibold flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
                      Lotes Vencidos ({expiredLots})
                    </h3>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      Iniciar Descarte de Todos
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {filteredItems
                      .filter((item) => item.dias_restantes <= 0)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-white border border-red-100 rounded-lg p-3.5 shadow-sm hover:border-red-300 transition-all">
                          <div>
                            <div className="font-medium text-sm text-gray-800">{item.produto?.sku} - {item.produto?.descricao}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Lote: <span className="font-mono text-emerald-600 font-semibold">{item.lote}</span> | Local: <span className="font-mono">{item.local_codigo}</span> | Vencido há <span className="text-red-600 font-semibold">{Math.abs(item.dias_restantes)}</span> dias
                            </div>
                          </div>
                          <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">Vencido</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expiring Soon */}
            {expiringSoon > 0 && (
              <Card className="border-orange-200 shadow-md bg-gradient-to-br from-orange-50/50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4 border-b border-orange-100 pb-3">
                    <h3 className="font-semibold flex items-center gap-2 text-orange-700">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      Vence em ≤ 7 dias ({expiringSoon})
                    </h3>
                    <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                      Criar Campanha de Escoamento
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {filteredItems
                      .filter((item) => item.dias_restantes > 0 && item.dias_restantes <= 7)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-white border border-orange-100 rounded-lg p-3.5 shadow-sm hover:border-orange-300 transition-all">
                          <div>
                            <div className="font-medium text-sm text-gray-800">{item.produto?.sku} - {item.produto?.descricao}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Lote: <span className="font-mono text-emerald-600 font-semibold">{item.lote}</span> | Local: <span className="font-mono">{item.local_codigo}</span> | Vence em <span className="text-orange-600 font-semibold">{item.dias_restantes}</span> dias
                            </div>
                          </div>
                          <Badge className="bg-orange-500 hover:bg-orange-600">Urgente</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {expiredLots === 0 && expiringSoon === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sem Alertas Críticos</h3>
                <p className="text-muted-foreground text-sm">
                  Todos os lotes estão em condições ideais de validade e com prazo saudável.
                </p>
              </div>
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
                  <Label className="text-muted-foreground">Produto</Label>
                  <div className="font-medium text-sm mt-0.5">{selectedLot.produto?.sku} - {selectedLot.produto?.descricao}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Lote</Label>
                  <div className="font-mono font-medium text-sm mt-0.5">{selectedLot.lote}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Validade</Label>
                  <div className="text-sm mt-0.5">{new Date(selectedLot.validade).toLocaleDateString("pt-BR")}</div>
                  <div className={`text-xs mt-0.5 ${getValidityColor(selectedLot.dias_restantes)}`}>
                    {selectedLot.dias_restantes <= 0 ? "Lote Vencido" : `${selectedLot.dias_restantes} dias restantes`}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quantidade</Label>
                  <div className="font-semibold text-sm mt-0.5">{selectedLot.quantidade} {selectedLot.produto?.unidade_medida}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Local</Label>
                  <div className="font-mono text-sm mt-0.5">{selectedLot.local_codigo}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-0.5">
                    <Badge className={(selectedLot.status && statusConfig[selectedLot.status as keyof typeof statusConfig] ? statusConfig[selectedLot.status as keyof typeof statusConfig].color : "bg-gray-100 text-gray-800")}>
                      {(selectedLot.status && statusConfig[selectedLot.status as keyof typeof statusConfig] ? statusConfig[selectedLot.status as keyof typeof statusConfig].label : selectedLot.status || "Desconhecido")}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valor Unitário</Label>
                  <div className="text-sm mt-0.5">{selectedLot.valor_unitario.toFixed(2)} MT</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valor Total</Label>
                  <div className="font-semibold text-sm mt-0.5">{selectedLot.valor_total.toLocaleString("pt-BR")} MT</div>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t mt-4">
                <Button size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Etiqueta
                </Button>
                <Button size="sm" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Transferir
                </Button>
                <Button size="sm" variant="outline">
                  {selectedLot.status === "BLOQUEADO" || selectedLot.status === "blocked" ? (
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
