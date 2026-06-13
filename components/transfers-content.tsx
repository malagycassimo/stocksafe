"use client"

import { useState, useEffect, useMemo } from "react"
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
import { api } from "@/app/services/api"
import { produtoService } from "@/app/services/produtoService"
import { estoqueService } from "@/app/services/estoqueService"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  in_transit: { label: "Em Trânsito", color: "bg-blue-100 text-blue-800", icon: "🔄" },
  completed: { label: "Concluída", color: "bg-green-100 text-green-800", icon: "✅" },
  cancelled: { label: "Cancelada", color: "bg-gray-100 text-gray-800", icon: "❌" },
}

const priorityConfig = {
  normal: { label: "Normal", color: "bg-gray-100 text-gray-800" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-800" },
}

function planificarLocais(arvore: any[], prefixo = ""): any[] {
  let resultado: any[] = []
  for (const loc of arvore) {
    const nomeCompleto = prefixo ? `${prefixo} > ${loc.codigo}` : loc.codigo
    resultado.push({
      id: loc.id,
      codigo: loc.codigo,
      nomeCompleto: nomeCompleto,
    })
    if (loc.sublocais && loc.sublocais.length > 0) {
      resultado.push(...planificarLocais(loc.sublocais, nomeCompleto))
    }
  }
  return resultado
}

export function TransfersContent() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("last30days")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showNewTransfer, setShowNewTransfer] = useState(false)
  const [showConfirmReceipt, setShowConfirmReceipt] = useState(false)
  const [activeTab, setActiveTab] = useState("simple")
  const [showFilters, setShowFilters] = useState(true)

  // Dynamic Data Lists
  const [products, setProducts] = useState<any[]>([])
  const [locais, setLocais] = useState<any[]>([])
  const [lotesDisponiveis, setLotesDisponiveis] = useState<any[]>([])
  const [transfers, setTransfers] = useState<any[]>([])

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

  const [loading, setLoading] = useState(false)

  // Initialize and load data from backend/local storage
  useEffect(() => {
    async function carregarDados() {
      try {
        const [prodList, locTree] = await Promise.all([
          produtoService.listarTodos(),
          api.get("/locais"),
        ])
        setProducts(prodList)
        setLocais(planificarLocais(locTree.data))
      } catch (err: any) {
        console.error("Erro ao carregar dados do backend:", err)
      }
    }
    carregarDados()

    // Carregar transferências locais
    const savedTransfers = localStorage.getItem("stocksafe_transfers")
    if (savedTransfers) {
      setTransfers(JSON.parse(savedTransfers))
    } else {
      // Mock inicial padrão se não houver no localStorage
      const defaultTransfers = [
        {
          id: "TRANS-00045",
          dateTimeRequest: new Date(Date.now() - 3600000).toISOString(),
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
      ]
      setTransfers(defaultTransfers)
      localStorage.setItem("stocksafe_transfers", JSON.stringify(defaultTransfers))
    }
  }, [])

  // Buscar lotes de um produto específico ao alterar o produto
  useEffect(() => {
    async function carregarLotesDoProduto() {
      if (!selectedProduct) {
        setLotesDisponiveis([])
        return
      }
      try {
        const prod = products.find((p) => p.id === selectedProduct)
        if (prod) {
          const list = await estoqueService.listar({ search: prod.sku })
          setLotesDisponiveis(list)
        }
      } catch (err) {
        console.error("Erro ao carregar lotes do produto:", err)
      }
    }
    carregarLotesDoProduto()
  }, [selectedProduct, products])

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    let filtered = transfers

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
  }, [searchQuery, statusFilter, transfers])


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

  const viewDetails = (transfer: any) => {
    setSelectedTransfer(transfer)
    setShowDetails(true)
  }

  const openConfirmReceipt = (transfer: any) => {
    setSelectedTransfer(transfer)
    setReceivedQuantity(transfer.quantity.toString())
    setShowConfirmReceipt(true)
  }

  const handleNewTransfer = () => {
    if (!selectedProduct || !selectedLot || !quantity || !originLocation || !destinationLocation || !reason) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios (*).",
        variant: "destructive",
      })
      return
    }

    const prod = products.find((p) => p.id === selectedProduct)
    const lotItem = lotesDisponiveis.find((l) => l.lote === selectedLot)

    if (!prod || !lotItem) {
      toast({
        title: "Erro de dados",
        description: "Não foi possível identificar o produto ou o lote selecionado.",
        variant: "destructive",
      })
      return
    }

    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "A quantidade deve ser maior do que zero.",
        variant: "destructive",
      })
      return
    }

    if (qty > lotItem.quantidade) {
      toast({
        title: "Quantidade insuficiente",
        description: `O lote possui apenas ${lotItem.quantidade} ${prod.unidade_medida} disponíveis.`,
        variant: "destructive",
      })
      return
    }

    const originLoc = locais.find((l) => l.id === originLocation)
    const destLoc = locais.find((l) => l.id === destinationLocation)

    const newId = `TRANS-${Math.floor(10000 + Math.random() * 90000)}`
    const newTransfer = {
      id: newId,
      dateTimeRequest: new Date().toISOString(),
      product: {
        id: prod.id,
        sku: prod.sku,
        description: prod.descricao,
        category: prod.categoria,
      },
      lot: selectedLot,
      expiryDate: lotItem.validade,
      valorUnitario: lotItem.valor_unitario,
      quantity: qty,
      unit: prod.unidade_medida,
      originLocation: originLoc?.nomeCompleto || "Origem desconhecida",
      originLocationId: originLocation,
      destinationLocation: destLoc?.nomeCompleto || "Destino desconhecido",
      destinationLocationId: destinationLocation,
      requester: { name: user?.nome || "Usuário", avatar: (user?.nome || "U").substring(0, 2).toUpperCase() },
      status: "in_transit", // Deixar em trânsito para recebimento
      priority: priority,
      reason: reason,
      observations: observations,
    }

    const updatedTransfers = [newTransfer, ...transfers]
    setTransfers(updatedTransfers)
    localStorage.setItem("stocksafe_transfers", JSON.stringify(updatedTransfers))

    toast({
      title: "Transferência Solicitada",
      description: `A transferência ${newId} foi criada e está em trânsito.`,
    })

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

  const handleConfirmReceipt = async () => {
    if (!selectedTransfer) return

    const qtyReceived = parseFloat(receivedQuantity)
    if (isNaN(qtyReceived) || qtyReceived <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "Por favor insira uma quantidade recebida maior que zero.",
        variant: "destructive",
      })
      return
    }

    if (condition !== "conform" && !damageDescription) {
      toast({
        title: "Descrição obrigatória",
        description: "Por favor descreva as avarias encontradas.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // 1. Saída FEFO no produto e quantidade na origem
      await estoqueService.registarSaidaFEFO({
        produto_id: selectedTransfer.product.id,
        quantidade_solicitada: qtyReceived,
        justificativa: `Saída p/ Transferência ${selectedTransfer.id} de ${selectedTransfer.originLocation} para ${selectedTransfer.destinationLocation}`,
        usuario_id: user?.id || "",
      })

      // 2. Entrada no local de destino
      await estoqueService.registarEntrada({
        produto_id: selectedTransfer.product.id,
        codigo_lote: selectedTransfer.lot,
        data_validade: selectedTransfer.expiryDate,
        local_id: selectedTransfer.destinationLocationId,
        quantidade: qtyReceived,
        valor_unitario: selectedTransfer.valorUnitario || 0,
        usuario_id: user?.id || "",
      })

      // 3. Atualizar localmente a transferência
      const updatedTransfers = transfers.map((t) => {
        if (t.id === selectedTransfer.id) {
          return {
            ...t,
            status: "completed",
            dateTimeCompleted: new Date().toISOString(),
            receiver: { name: user?.nome || "Recebedor", avatar: (user?.nome || "R").substring(0, 2).toUpperCase() },
            receivedQuantity: qtyReceived,
            condition: condition,
            damageDescription: damageDescription,
            receiptObservations: receiptObservations,
          }
        }
        return t
      })

      setTransfers(updatedTransfers)
      localStorage.setItem("stocksafe_transfers", JSON.stringify(updatedTransfers))

      toast({
        title: "Recebimento Confirmado",
        description: `A transferência ${selectedTransfer.id} foi concluída com sucesso e o estoque foi movimentado no backend.`,
      })
      setShowConfirmReceipt(false)
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Erro ao confirmar recebimento",
        description: err.response?.data?.error || "Ocorreu um erro ao atualizar o estoque no servidor.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
        <Link href="/dashboard" className="hover:text-emerald-600">
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
          <h1 className="text-3xl font-bold text-emerald-700">Transferências de Estoque</h1>
          <p className="text-muted-foreground mt-1">Movimentação de produtos entre locais</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowNewTransfer(true)}>
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
              <p className="text-2xl font-bold text-green-700">{completedTodayCount}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+12% vs ontem</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Valor em Trânsito</p>
              <p className="text-2xl font-bold text-emerald-700">
                R$ {totalValue.toLocaleString("pt-BR")}
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
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
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
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold">
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
                <Select value={selectedProduct} onValueChange={(val) => {
                  setSelectedProduct(val)
                  setSelectedLot("")
                  setOriginLocation("")
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.sku} - {product.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Lote *</Label>
                <Select
                  value={selectedLot}
                  onValueChange={(val) => {
                    setSelectedLot(val)
                    const lotItem = lotesDisponiveis.find((l) => l.lote === val)
                    if (lotItem) {
                      setOriginLocation(lotItem.local_id)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedProduct ? "Selecionar lote disponível" : "Selecione primeiro um produto"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lotesDisponiveis.map((lotItem) => (
                      <SelectItem key={lotItem.id} value={lotItem.lote}>
                        <div className="flex flex-col text-left">
                          <span className="font-mono font-medium">{lotItem.lote}</span>
                          <span className="text-xs text-muted-foreground">
                            Val: {new Date(lotItem.validade).toLocaleDateString("pt-BR")} | Qtd: {lotItem.quantidade} | Local: {lotItem.local_codigo}
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
                  <Select value={originLocation} onValueChange={setOriginLocation} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Local de origem do lote" />
                    </SelectTrigger>
                    <SelectContent>
                      {locais.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.nomeCompleto}
                        </SelectItem>
                      ))}
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
                      {locais.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.nomeCompleto}
                        </SelectItem>
                      ))}
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
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleNewTransfer}>
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
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleConfirmReceipt}>
              <Check className="w-4 h-4 mr-2" />
              Confirmar Recebimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
