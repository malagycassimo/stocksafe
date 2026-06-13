"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Download,
  Filter,
  MoreVertical,
  Check,
  X,
  Eye,
  AlertTriangle,
  Camera,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

// Mock data
const mockInventory = {
  id: "INV-00045",
  date: "2025-01-25",
  responsible: "Carlos Silva",
  status: "awaiting_approval",
  totalCounted: 450,
  conformCount: 442,
  divergenceCount: 8,
  accuracy: 98.2,
}

const mockDivergences = [
  {
    id: "ADJ-001",
    status: "pending",
    product: {
      sku: "FRS-045",
      description: "Filé de Frango Congelado - 1kg",
      category: "Congelado",
      image: null,
    },
    lot: "LOT2025-001",
    lotDivergent: false,
    expiryDate: "2025-02-05",
    expiryDivergent: false,
    location: "ARM01 > ZF > CA > P01",
    displaced: false,
    systemQty: 500,
    countedQty: 485,
    divergence: -15,
    divergencePercent: -3.0,
    unit: "kg",
    unitValue: 18.5,
    impact: -277.5,
    declaredReason: "Não encontrado na contagem",
    hasPhotos: true,
    photoCount: 2,
    counter: { name: "Ana Santos", avatar: "AS" },
    pendingSince: "2025-01-25T16:00:00",
  },
  {
    id: "ADJ-002",
    status: "pending",
    product: {
      sku: "BEB-120",
      description: "Suco de Laranja Natural - 1L",
      category: "Bebidas",
      image: null,
    },
    lot: "LOT2025-087",
    lotDivergent: false,
    expiryDate: "2025-01-24",
    expiryDivergent: false,
    location: "ARM01 > ZF > CC > P02",
    displaced: false,
    systemQty: 300,
    countedQty: 325,
    divergence: 25,
    divergencePercent: 8.3,
    unit: "L",
    unitValue: 8.9,
    impact: 222.5,
    declaredReason: "Recebimento não lançado",
    hasPhotos: true,
    photoCount: 1,
    counter: { name: "Pedro Costa", avatar: "PC" },
    pendingSince: "2025-01-25T16:05:00",
  },
  {
    id: "ADJ-003",
    status: "approved",
    product: {
      sku: "ALM-001",
      description: "Arroz Branco Tipo 1 - Pacote 5kg",
      category: "Seco",
      image: null,
    },
    lot: "LOT2025-023",
    lotDivergent: false,
    expiryDate: "2025-04-15",
    expiryDivergent: false,
    location: "ARM01 > ZS > CB > P05",
    displaced: false,
    systemQty: 1200,
    countedQty: 1205,
    divergence: 5,
    divergencePercent: 0.4,
    unit: "kg",
    unitValue: 6.8,
    impact: 34.0,
    declaredReason: "Sobra pequena",
    hasPhotos: false,
    photoCount: 0,
    counter: { name: "João Souza", avatar: "JS" },
    pendingSince: null,
    approvedBy: "Supervisor Geral",
    approvedAt: "2025-01-25T17:00:00",
  },
]

const statusBadges = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  approved: { label: "Aprovado", color: "bg-twilight text-imperial", icon: "✅" },
  rejected: { label: "Rejeitado", color: "bg-red-100 text-red-800", icon: "❌" },
  applied: { label: "Aplicado", color: "bg-blue-100 text-blue-800", icon: "🔄" },
}

const rootCauses = [
  "Erro de lançamento anterior",
  "Perda/quebra/vencimento",
  "Roubo/furto",
  "Devolução não lançada",
  "Venda não lançada",
  "Deslocamento interno",
  "Erro de contagem",
  "Produção/consumo interno",
  "Outro (especificar)",
]

const rejectionReasons = [
  "Evidências insuficientes (sem foto)",
  "Divergência muito alta (suspeita)",
  "Contagem parece incorreta",
  "Lote/validade não conferem",
  "Produto não deveria estar no inventário",
  "Possível fraude",
  "Erro de lançamento da contagem",
  "Necessita recontagem",
  "Outro (especificar)",
]

export function InventoryAdjustmentsContent({ inventoryId }: { inventoryId: string }) {
  const router = useRouter()
  const [divergences, setDivergences] = useState(mockDivergences)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedDivergence, setSelectedDivergence] = useState<typeof mockDivergences[0] | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)

  // Approve form state
  const [photoAnalyzed, setPhotoAnalyzed] = useState(false)
  const [reasonPlausible, setReasonPlausible] = useState(false)
  const [countCorrect, setCountCorrect] = useState(false)
  const [noFraud, setNoFraud] = useState(false)
  const [rootCause, setRootCause] = useState("")
  const [supervisorOpinion, setSupervisorOpinion] = useState("")
  const [correctiveAction, setCorrectiveAction] = useState("")
  const [approveConfirm, setApproveConfirm] = useState(false)

  // Reject form state
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectionJustification, setRejectionJustification] = useState("")
  const [requiredAction, setRequiredAction] = useState("")
  const [rejectConfirm, setRejectConfirm] = useState(false)

  // Apply adjustments state
  const [applyImmediate, setApplyImmediate] = useState(true)
  const [generateDetailed, setGenerateDetailed] = useState(true)
  const [notifyDepartments, setNotifyDepartments] = useState(true)
  const [applyConfirm, setApplyConfirm] = useState(false)
  const [supervisorPassword, setSupervisorPassword] = useState("")

  // Filter divergences
  const filteredDivergences = useMemo(() => {
    let filtered = divergences

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (div) =>
          div.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          div.product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          div.lot.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status
    if (statusFilter !== "all") {
      filtered = filtered.filter((div) => div.status === statusFilter)
    }

    // Type
    if (typeFilter === "surplus") {
      filtered = filtered.filter((div) => div.divergence > 0)
    } else if (typeFilter === "shortage") {
      filtered = filtered.filter((div) => div.divergence < 0)
    }

    return filtered
  }, [divergences, searchQuery, statusFilter, typeFilter])

  // Calculate KPIs
  const surplusQty = divergences.filter((d) => d.divergence > 0).reduce((sum, d) => sum + d.divergence, 0)
  const shortageQty = divergences.filter((d) => d.divergence < 0).reduce((sum, d) => sum + Math.abs(d.divergence), 0)
  const netBalance = surplusQty - shortageQty

  const surplusValue = divergences.filter((d) => d.impact > 0).reduce((sum, d) => sum + d.impact, 0)
  const shortageValue = divergences.filter((d) => d.impact < 0).reduce((sum, d) => sum + Math.abs(d.impact), 0)
  const netImpact = surplusValue - shortageValue

  const approvedCount = divergences.filter((d) => d.status === "approved").length
  const pendingCount = divergences.filter((d) => d.status === "pending").length
  const rejectedCount = divergences.filter((d) => d.status === "rejected").length

  const handleApprove = (divergence: typeof mockDivergences[0]) => {
    setSelectedDivergence(divergence)
    setPhotoAnalyzed(false)
    setReasonPlausible(false)
    setCountCorrect(false)
    setNoFraud(false)
    setRootCause("")
    setSupervisorOpinion("")
    setCorrectiveAction("")
    setApproveConfirm(false)
    setShowApproveModal(true)
  }

  const confirmApprove = () => {
    if (!selectedDivergence) return

    const updatedDivergences = divergences.map((div) =>
      div.id === selectedDivergence.id
        ? { ...div, status: "approved" as const, approvedBy: "Supervisor Atual", approvedAt: new Date().toISOString(), pendingSince: null as null }
        : div,
    )
    setDivergences(updatedDivergences)
    setShowApproveModal(false)
    setSelectedDivergence(null)
  }

  const handleReject = (divergence: typeof mockDivergences[0]) => {
    setSelectedDivergence(divergence)
    setRejectionReason("")
    setRejectionJustification("")
    setRequiredAction("")
    setRejectConfirm(false)
    setShowRejectModal(true)
  }

  const confirmReject = () => {
    if (!selectedDivergence) return

    const updatedDivergences = divergences.map((div) =>
      div.id === selectedDivergence.id ? { ...div, status: "rejected" } : div,
    )
    setDivergences(updatedDivergences)
    setShowRejectModal(false)
    setSelectedDivergence(null)
  }

  const handleApplyAdjustments = () => {
    setApplyImmediate(true)
    setGenerateDetailed(true)
    setNotifyDepartments(true)
    setApplyConfirm(false)
    setSupervisorPassword("")
    setShowApplyModal(true)
  }

  const confirmApplyAdjustments = () => {
    // Here would be the API call
    console.log("Adjustments applied")
    setShowApplyModal(false)
    router.push("/estoque/inventario")
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredDivergences.map((d) => d.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id])
    } else {
      setSelectedItems(selectedItems.filter((i) => i !== id))
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/estoque/inventario" className="hover:text-imperial">
          Estoque
        </Link>
        {" / "}
        <Link href="/estoque/inventario" className="hover:text-imperial">
          Inventário
        </Link>
        {" / "}
        <Link href={`/estoque/inventario/${inventoryId}`} className="hover:text-imperial">
          {mockInventory.id}
        </Link>
        {" / "}
        <span className="text-foreground">Ajustes</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Ajustes de Inventário - {mockInventory.id}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className="bg-yellow-100 text-yellow-800">Aguardando Aprovação</Badge>
            <span className="text-sm text-muted-foreground">
              Data: {new Date(mockInventory.date).toLocaleDateString("pt-BR")}
            </span>
            <span className="text-sm text-muted-foreground">Responsável: {mockInventory.responsible}</span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Contados</p>
              <p className="text-2xl font-bold">{mockInventory.totalCounted}</p>
              <p className="text-sm text-imperial">Conformes: {mockInventory.conformCount}</p>
              <p className="text-sm text-red-600">Com Divergência: {mockInventory.divergenceCount}</p>
              <p className="text-sm font-semibold mt-2">Acuracidade: {mockInventory.accuracy}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Quantidade</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-imperial" />
                <p className="text-lg font-semibold text-imperial">+{surplusQty.toFixed(0)} un</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <p className="text-lg font-semibold text-red-600">-{shortageQty.toFixed(0)} un</p>
              </div>
              <p className={`text-sm font-semibold mt-2 ${netBalance >= 0 ? "text-imperial" : "text-red-600"}`}>
                Saldo: {netBalance >= 0 ? "+" : ""}{netBalance.toFixed(0)} un
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Valor</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-imperial" />
                <p className="text-lg font-semibold text-imperial">+R$ {surplusValue.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <p className="text-lg font-semibold text-red-600">-R$ {shortageValue.toFixed(2)}</p>
              </div>
              <p className={`text-xl font-bold mt-2 ${netImpact >= 0 ? "text-imperial" : "text-red-700"}`}>
                R$ {netImpact >= 0 ? "+" : ""}{netImpact.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status dos Ajustes</p>
              <p className="text-sm">
                Aprovados: <span className="font-semibold">{approvedCount}</span> de {divergences.length}
              </p>
              <p className="text-sm">Pendentes: <span className="font-semibold text-yellow-600">{pendingCount}</span></p>
              <p className="text-sm">Rejeitados: <span className="font-semibold text-red-600">{rejectedCount}</span></p>
              <Progress value={(approvedCount / divergences.length) * 100} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Busca Rápida</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por SKU, produto, lote..."
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
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                      <SelectItem value="applied">Aplicado</SelectItem>
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
                      <SelectItem value="surplus">Sobra</SelectItem>
                      <SelectItem value="shortage">Falta</SelectItem>
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

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <Card className="border-twilight bg-twilight">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-imperial">{selectedItems.length} itens selecionados</span>
                <div className="text-sm text-imperial mt-1">
                  Impacto Total: R${" "}
                  {selectedItems
                    .reduce((sum, id) => {
                      const div = divergences.find((d) => d.id === id)
                      return sum + (div?.impact || 0)
                    }, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar Selecionados
                </Button>
                <Button variant="outline" size="sm">
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar Selecionados
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Divergences Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={selectedItems.length === filteredDivergences.length && filteredDivergences.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lote</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Local</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-1 cursor-pointer">
                    Qtd Sistema
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qtd Contada</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Divergência</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Impacto (R$)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Motivo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Evidências</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[120px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDivergences.map((div) => {
                const statConfig = statusBadges[div.status as keyof typeof statusBadges]
                const rowClass =
                  div.divergence > 0 && Math.abs(div.divergencePercent) < 5
                    ? "bg-twilight/30"
                    : div.divergence < 0 && Math.abs(div.divergencePercent) < 5
                      ? "bg-red-50/30"
                      : div.divergence < 0 && Math.abs(div.divergencePercent) >= 20
                        ? "bg-red-100"
                        : ""

                return (
                  <tr key={div.id} className={`${rowClass} hover:bg-gray-100 transition-colors`}>
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedItems.includes(div.id)}
                        onCheckedChange={(checked) => handleSelectItem(div.id, checked as boolean)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${statConfig.color} border-0`}>
                        {statConfig.icon} {statConfig.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="min-w-[200px]">
                        <div className="font-mono text-sm font-medium">{div.product.sku}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={div.product.description}>
                          {div.product.description}
                        </div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {div.product.category}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm">{div.lot}</div>
                      {div.lotDivergent && (
                        <Badge variant="outline" className="mt-1 text-xs text-orange-600">
                          ⚠️ Divergente
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs max-w-[120px] truncate" title={div.location}>
                        {div.location}
                      </div>
                      {div.displaced && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          📍 Deslocado
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {div.systemQty} {div.unit}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold">
                        {div.countedQty} {div.unit}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-bold ${div.divergence > 0 ? "text-imperial" : "text-red-700"}`}>
                        {div.divergence > 0 ? "+" : ""}
                        {div.divergence} ({div.divergencePercent > 0 ? "+" : ""}
                        {div.divergencePercent.toFixed(1)}%)
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-semibold ${div.impact > 0 ? "text-imperial" : "text-red-700"}`}>
                        R$ {div.impact > 0 ? "+" : ""}
                        {div.impact.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs max-w-[150px] truncate" title={div.declaredReason}>
                        {div.declaredReason}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {div.hasPhotos ? (
                        <div className="flex items-center justify-center gap-1">
                          <Camera className="w-4 h-4 text-imperial" />
                          <span className="text-xs">({div.photoCount})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {div.status === "pending" && (
                          <>
                            <Button size="sm" className="bg-imperial hover:bg-imperial" onClick={() => handleApprove(div)}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleReject(div)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {div.status === "approved" && (
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
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

      {/* Apply Adjustments Card */}
      {approvedCount > 0 && (
        <Card className="border-twilight bg-twilight">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-imperial mb-2">Aplicar Ajustes ao Estoque</h3>
                <div className="text-sm text-imperial">
                  <p>{approvedCount} ajustes aprovados prontos para aplicação</p>
                  <p className="font-semibold mt-1">Impacto Líquido: R$ {netImpact >= 0 ? "+" : ""}{netImpact.toFixed(2)}</p>
                </div>
              </div>
              <Button className="bg-imperial hover:bg-imperial" onClick={handleApplyAdjustments}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Aplicar {approvedCount} Ajustes ao Estoque
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aprovar Divergência</DialogTitle>
            <DialogDescription>Analise as evidências e forneça seu parecer</DialogDescription>
          </DialogHeader>

          {selectedDivergence && (
            <div className="space-y-4">
              {/* Divergence Data */}
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Produto:</span>{" "}
                      <span className="font-semibold">{selectedDivergence.product.sku}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lote:</span>{" "}
                      <span className="font-mono">{selectedDivergence.lot}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Qtd Sistema:</span> {selectedDivergence.systemQty} {selectedDivergence.unit}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Qtd Contada:</span>{" "}
                      <span className="font-semibold">{selectedDivergence.countedQty} {selectedDivergence.unit}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Divergência:</span>{" "}
                      <span className={`font-bold ${selectedDivergence.divergence > 0 ? "text-imperial" : "text-red-700"}`}>
                        {selectedDivergence.divergence > 0 ? "+" : ""}
                        {selectedDivergence.divergence} ({selectedDivergence.divergencePercent.toFixed(1)}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Impacto:</span>{" "}
                      <span className={`font-bold ${selectedDivergence.impact > 0 ? "text-imperial" : "text-red-700"}`}>
                        R$ {selectedDivergence.impact > 0 ? "+" : ""}
                        {selectedDivergence.impact.toFixed(2)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Motivo Declarado:</span> {selectedDivergence.declaredReason}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supervisor Analysis */}
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Validação das Evidências</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="photo" checked={photoAnalyzed} onCheckedChange={(checked) => setPhotoAnalyzed(checked as boolean)} />
                      <label htmlFor="photo" className="cursor-pointer text-sm">
                        Fotos analisadas e consistentes
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="reason" checked={reasonPlausible} onCheckedChange={(checked) => setReasonPlausible(checked as boolean)} />
                      <label htmlFor="reason" className="cursor-pointer text-sm">
                        Motivo declarado é plausível
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="count" checked={countCorrect} onCheckedChange={(checked) => setCountCorrect(checked as boolean)} />
                      <label htmlFor="count" className="cursor-pointer text-sm">
                        Contagem parece correta
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="fraud" checked={noFraud} onCheckedChange={(checked) => setNoFraud(checked as boolean)} />
                      <label htmlFor="fraud" className="cursor-pointer text-sm">
                        Sem indícios de fraude/erro
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Causa Raiz Identificada</Label>
                  <Select value={rootCause} onValueChange={setRootCause}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar causa raiz" />
                    </SelectTrigger>
                    <SelectContent>
                      {rootCauses.map((cause) => (
                        <SelectItem key={cause} value={cause}>
                          {cause}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Parecer do Supervisor *</Label>
                  <Textarea
                    placeholder="Justifique a aprovação deste ajuste..."
                    value={supervisorOpinion}
                    onChange={(e) => setSupervisorOpinion(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Este parecer será auditado. Mínimo 30 caracteres. ({supervisorOpinion.length}/30)
                  </p>
                </div>

                <div>
                  <Label>Ação Corretiva Recomendada</Label>
                  <Textarea
                    placeholder="Ex: Revisar processo de baixa, treinar equipe..."
                    value={correctiveAction}
                    onChange={(e) => setCorrectiveAction(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="approveConfirm"
                    checked={approveConfirm}
                    onCheckedChange={(checked) => setApproveConfirm(checked as boolean)}
                  />
                  <label htmlFor="approveConfirm" className="cursor-pointer text-sm font-medium">
                    Confirmo que analisei as evidências e o motivo *
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-imperial hover:bg-imperial"
              onClick={confirmApprove}
              disabled={!approveConfirm || supervisorOpinion.length < 30}
            >
              <Check className="w-4 h-4 mr-2" />
              Aprovar Ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Rejeitar Divergência</DialogTitle>
            <DialogDescription>Explique o motivo da rejeição e a ação necessária</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Motivo da Rejeição *</Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Justificativa Detalhada *</Label>
              <Textarea
                placeholder="Explique o motivo da rejeição..."
                value={rejectionJustification}
                onChange={(e) => setRejectionJustification(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 50 caracteres. ({rejectionJustification.length}/50)
              </p>
            </div>

            <div>
              <Label>Ação Necessária *</Label>
              <RadioGroup value={requiredAction} onValueChange={setRequiredAction}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="recount" id="recount" />
                    <label htmlFor="recount" className="cursor-pointer">
                      Recontar este item
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="evidence" id="evidence" />
                    <label htmlFor="evidence" className="cursor-pointer">
                      Solicitar evidências adicionais
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="correct" id="correct" />
                    <label htmlFor="correct" className="cursor-pointer">
                      Corrigir lançamento no sistema
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="discard" id="discard" />
                    <label htmlFor="discard" className="cursor-pointer">
                      Descartar ajuste (manter sistema)
                    </label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="rejectConfirm"
                checked={rejectConfirm}
                onCheckedChange={(checked) => setRejectConfirm(checked as boolean)}
              />
              <label htmlFor="rejectConfirm" className="cursor-pointer text-sm font-medium">
                Confirmo que revisei e a rejeição é justificada *
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmReject}
              disabled={!rejectConfirm || rejectionJustification.length < 50 || !requiredAction}
            >
              <X className="w-4 h-4 mr-2" />
              Rejeitar Ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Adjustments Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>⚠️ CONFIRMAR APLICAÇÃO DE AJUSTES?</DialogTitle>
            <DialogDescription className="text-orange-600 font-semibold">
              Esta ação modificará o estoque permanentemente e é irreversível
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>{approvedCount}</strong> ajustes serão aplicados
                  </p>
                  <p>
                    <strong>{new Set(divergences.filter((d) => d.status === "approved").map((d) => d.product.sku)).size}</strong> produtos
                    afetados
                  </p>
                  <p className={`text-lg font-bold ${netImpact >= 0 ? "text-imperial" : "text-red-700"}`}>
                    Impacto: R$ {netImpact >= 0 ? "+" : ""}
                    {netImpact.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="applyImmediate" checked={applyImmediate} onCheckedChange={(checked) => setApplyImmediate(checked as boolean)} />
                <label htmlFor="applyImmediate" className="cursor-pointer text-sm">
                  Aplicar ajustes imediatamente
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="generateDetailed" checked={generateDetailed} onCheckedChange={(checked) => setGenerateDetailed(checked as boolean)} />
                <label htmlFor="generateDetailed" className="cursor-pointer text-sm">
                  Gerar movimentações detalhadas
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="notifyDepts" checked={notifyDepartments} onCheckedChange={(checked) => setNotifyDepartments(checked as boolean)} />
                <label htmlFor="notifyDepts" className="cursor-pointer text-sm">
                  Notificar departamentos afetados
                </label>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <p className="text-sm text-orange-800">
                  <strong>Atenção:</strong> Esta ação é irreversível. Os ajustes aplicados modificarão permanentemente os saldos de estoque.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="applyConfirm"
                checked={applyConfirm}
                onCheckedChange={(checked) => setApplyConfirm(checked as boolean)}
              />
              <label htmlFor="applyConfirm" className="cursor-pointer text-sm font-medium">
                Li e compreendo o impacto. Confirmo aplicação. *
              </label>
            </div>

            <div>
              <Label>Senha do Supervisor *</Label>
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={supervisorPassword}
                onChange={(e) => setSupervisorPassword(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-imperial hover:bg-imperial"
              onClick={confirmApplyAdjustments}
              disabled={!applyConfirm || !supervisorPassword}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Aplicar Ajustes ao Estoque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




