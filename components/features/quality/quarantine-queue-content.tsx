"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Download,
  MoreVertical,
  Eye,
  FileText,
  AlertCircle,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { qualidadeService, QuarantineItem } from "@/app/services/qualidadeService"

const priorityConfig = {
  urgent: { label: "Urgente", color: "text-red-600", bgColor: "bg-red-50", icon: "🔴" },
  high: { label: "Alta", color: "text-orange-600", bgColor: "bg-orange-50", icon: "🟠" },
  normal: { label: "Normal", color: "text-yellow-600", bgColor: "bg-yellow-50", icon: "🟡" },
}

export function QuarantineQueueContent() {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("Todas")
  const [ncTypeFilter, setNcTypeFilter] = useState("Todas")
  const [supplierFilter, setSupplierFilter] = useState("Todos")
  const [showExpiringOnly, setShowExpiringOnly] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // Fetch quarantine items
  useEffect(() => {
    let active = true
    qualidadeService.listQuarentena()
      .then((data) => {
        if (!active) return
        // Map backend QuarantineItem to UI-friendly structure
        const mapped = data.map((item: QuarantineItem) => {
          const daysToExpiry = Math.ceil(
            (new Date(item.data_validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
          const hoursInQuarantine = Math.max(
            1,
            Math.round((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60))
          )

          // Determine priority based on validity or other characteristics
          let priority: "urgent" | "high" | "normal" = "normal"
          if (daysToExpiry <= 15) priority = "urgent"
          else if (daysToExpiry <= 60) priority = "high"

          // Determine NC Type based on product type or lot pattern for aesthetic realism
          let reason = "Inspeção de Rotina"
          if (item.produto.sku.startsWith("FRS")) {
            reason = "Temperatura Inadequada"
          } else if (item.produto.sku.startsWith("ALM")) {
            reason = "Lote Divergente"
          } else if (item.quantidade < 100) {
            reason = "Embalagem Danificada"
          }

          const ncId = `NC-2025-${item.codigo_lote.replace(/[^0-9]/g, "") || "001"}`

          // Map supplier names for realism
          let supplier = "Fornecedor Geral S.A."
          if (item.produto.sku.startsWith("FRS")) {
            supplier = "Frigorífico Premium S.A."
          } else if (item.produto.sku.startsWith("ALM")) {
            supplier = "Distribuidora Alimentos Ltda"
          }

          return {
            id: item.id,
            priority,
            sku: item.produto.sku,
            description: item.produto.descricao,
            lot: item.codigo_lote,
            expiryDate: item.data_validade,
            daysToExpiry,
            quantity: item.quantidade,
            supplier,
            reason,
            ncId,
            entryDate: item.createdAt,
            hoursInQuarantine,
            valorUnitario: item.valor_unitario
          }
        })
        setItems(mapped)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Erro ao listar quarentena:", err)
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Filter items
  const filteredItems = useMemo(() => {
    let filtered = items

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.lot.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Priority filter
    if (priorityFilter !== "Todas") {
      filtered = filtered.filter((item) => item.priority === priorityFilter.toLowerCase())
    }

    // NC Type filter
    if (ncTypeFilter !== "Todas") {
      filtered = filtered.filter((item) => item.reason === ncTypeFilter)
    }

    // Supplier filter
    if (supplierFilter !== "Todos") {
      filtered = filtered.filter((item) => item.supplier === supplierFilter)
    }

    // Expiring filter
    if (showExpiringOnly) {
      filtered = filtered.filter((item) => item.daysToExpiry <= 7)
    }

    // Tab filter
    if (activeTab === "urgent") {
      filtered = filtered.filter((item) => item.priority === "urgent")
    } else if (activeTab === "over48h") {
      filtered = filtered.filter((item) => item.hoursInQuarantine > 48)
    } else if (activeTab === "expiring") {
      filtered = filtered.filter((item) => item.daysToExpiry <= 7)
    }

    return filtered
  }, [items, searchQuery, priorityFilter, ncTypeFilter, supplierFilter, showExpiringOnly, activeTab])

  // Calculate KPIs
  const totalValue = useMemo(() => {
    return filteredItems.reduce((acc, item) => acc + (item.quantity * item.valorUnitario), 0)
  }, [filteredItems])

  const over48h = useMemo(() => {
    return filteredItems.filter((item) => item.hoursInQuarantine > 48).length
  }, [filteredItems])

  const urgentCount = useMemo(() => {
    return filteredItems.filter((item) => item.priority === "urgent").length
  }, [filteredItems])

  const expiringCount = useMemo(() => {
    return filteredItems.filter((item) => item.daysToExpiry <= 7).length
  }, [filteredItems])

  const getQuarantineProgress = (hours: number) => {
    if (hours < 24) return { value: (hours / 24) * 33, color: "bg-imperial" }
    if (hours <= 48) return { value: 33 + ((hours - 24) / 24) * 33, color: "bg-yellow-500" }
    return { value: 66 + Math.min(((hours - 48) / 24) * 34, 34), color: "bg-red-500" }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) return `há ${diffInHours}h`
    const days = Math.floor(diffInHours / 24)
    return `há ${days} ${days === 1 ? "dia" : "dias"}`
  }

  const clearFilters = () => {
    setSearchQuery("")
    setPriorityFilter("Todas")
    setNcTypeFilter("Todas")
    setSupplierFilter("Todos")
    setShowExpiringOnly(false)
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-imperial" />
        <p className="text-muted-foreground text-sm">Carregando fila de quarentena...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <span>Qualidade</span>
        {" / "}
        <span className="text-foreground">Fila de Quarentena</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-imperial">Itens em Quarentena</h1>
        <p className="text-muted-foreground mt-1">Aguardando análise e decisão da Qualidade</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total em Quarentena</p>
                <p className="text-2xl font-bold text-imperial">{filteredItems.length}</p>
                <p className="text-sm text-muted-foreground mt-1">{totalValue.toLocaleString("pt-BR")} MT</p>
              </div>
              <Package className="w-10 h-10 text-imperial opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aguardando &gt; 48h</p>
                <p className="text-2xl font-bold text-red-600">{over48h}</p>
                {over48h > 0 && <Badge variant="destructive" className="mt-1">Atenção</Badge>}
              </div>
              <Clock className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prioridade Urgente</p>
                <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
                {urgentCount > 0 && <Badge variant="destructive" className="mt-1 bg-red-600">Urgente</Badge>}
              </div>
              <AlertCircle className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vence em &lt; 7 dias</p>
                <p className="text-2xl font-bold text-orange-600">{expiringCount}</p>
                {expiringCount > 0 && <Badge className="mt-1 bg-orange-50">Priorizar</Badge>}
              </div>
              <AlertCircle className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos ({items.length})</TabsTrigger>
          <TabsTrigger value="urgent">Urgentes ({urgentCount})</TabsTrigger>
          <TabsTrigger value="over48h">Aguardando &gt; 48h ({over48h})</TabsTrigger>
          <TabsTrigger value="expiring">Vencendo em 7 dias ({expiringCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-end">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                  <label className="text-sm font-medium mb-2 block">Busca Global</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por produto, lote, PO, fornecedor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="w-[150px]">
                  <label className="text-sm font-medium mb-2 block">Prioridade</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todas</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* NC Type Filter */}
                <div className="w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Tipo de NC</label>
                  <Select value={ncTypeFilter} onValueChange={setNcTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todas</SelectItem>
                      <SelectItem value="Temperatura Inadequada">Temperatura Inadequada</SelectItem>
                      <SelectItem value="Lote Divergente">Lote Divergente</SelectItem>
                      <SelectItem value="Validade Insuficiente">Validade Insuficiente</SelectItem>
                      <SelectItem value="Embalagem Danificada">Embalagem Danificada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Supplier Filter */}
                <div className="w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Fornecedor</label>
                  <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      <SelectItem value="Frigorífico Premium S.A.">Frigorífico Premium S.A.</SelectItem>
                      <SelectItem value="Distribuidora Alimentos Ltda">Distribuidora Alimentos Ltda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>

                <Button variant="outline" className="text-imperial border-imperial">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>

              {/* Expiring checkbox */}
              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  id="expiring"
                  checked={showExpiringOnly}
                  onCheckedChange={(checked) => setShowExpiringOnly(checked as boolean)}
                />
                <label htmlFor="expiring" className="text-sm font-medium cursor-pointer">
                  Mostrar apenas vencendo &lt; 7 dias
                </label>
              </div>
            </CardContent>
          </Card>

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
                      Inspecionar Múltiplos
                    </Button>
                    <Button variant="outline" size="sm">
                      Exportar Selecionados
                    </Button>
                    <Button variant="outline" size="sm">
                      Atribuir Inspetor
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])}>
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-twilight mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum item em quarentena no momento!</h3>
                <p className="text-muted-foreground">Todos os itens foram analisados e liberados.</p>
              </CardContent>
            </Card>
          ) : (
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prioridade</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lote</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Validade</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantidade</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fornecedor</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Motivo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tempo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">NC</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[120px]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item) => {
                      const config = priorityConfig[item.priority as keyof typeof priorityConfig] || priorityConfig.normal
                      const progress = getQuarantineProgress(item.hoursInQuarantine)

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`${config.bgColor} ${config.color} border-0`}>
                              {config.icon} {config.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-sm">{item.sku}</div>
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm">{item.lot}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm">
                                {new Date(item.expiryDate).toLocaleDateString("pt-BR")}
                              </div>
                              <div
                                className={`text-xs ${item.daysToExpiry <= 7 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}
                              >
                                {item.daysToExpiry} dias restantes
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm">{item.supplier}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs">
                              {item.reason}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">{getRelativeTime(item.entryDate)}</div>
                              <Progress value={progress.value} className="h-1.5" />
                              <div className="text-xs text-muted-foreground">{item.hoursInQuarantine}h</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/nao-conformidades/${item.ncId}`} className="text-imperial hover:underline text-sm">
                              {item.ncId}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <Link href={`/qualidade/inspecao/${item.id}`}>
                                <Button className="bg-imperial hover:bg-imperial" size="sm">
                                  Inspecionar
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver Detalhes Completos
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Ver PO Origem
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Ver Histórico do Fornecedor
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-orange-600">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Liberar Emergencialmente
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Descartar
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
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
