"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Camera,
  Search,
  Check,
  X,
  Clock,
  Package,
  AlertTriangle,
  Pause,
  CheckCircle,
  Upload,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
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
  type: "location",
  scope: "ARM01 - Armazém Principal",
  responsible: { name: "Carlos Silva", avatar: "CS" },
  startedAt: "2025-01-25T08:15:00",
  totalItems: 450,
}

const mockItems = [
  {
    id: "1",
    product: {
      sku: "FRS-045",
      description: "Filé de Frango Congelado - 1kg",
      category: "Congelado",
      image: null,
    },
    lot: "LOT2025-001",
    expiryDate: "2025-02-05",
    daysToExpiry: 15,
    location: "ARM01 > ZF > CA > P01",
    systemQty: 500,
    unit: "kg",
    unitValue: 18.5,
    status: "pending",
    countedQty: null as number | null,
  },
  {
    id: "2",
    product: {
      sku: "ALM-001",
      description: "Arroz Branco Tipo 1 - Pacote 5kg",
      category: "Seco",
      image: null,
    },
    lot: "LOT2025-023",
    expiryDate: "2025-04-15",
    daysToExpiry: 84,
    location: "ARM01 > ZS > CB > P05",
    systemQty: 1200,
    unit: "kg",
    unitValue: 6.8,
    status: "pending",
    countedQty: null,
  },
  {
    id: "3",
    product: {
      sku: "BEB-120",
      description: "Suco de Laranja Natural - 1L",
      category: "Bebidas",
      image: null,
    },
    lot: "LOT2025-087",
    expiryDate: "2025-01-24",
    daysToExpiry: 3,
    location: "ARM01 > ZF > CC > P02",
    systemQty: 300,
    unit: "L",
    unitValue: 8.9,
    status: "pending",
    countedQty: null,
  },
]

const statusBadges = {
  pending: { label: "Pendente", color: "bg-gray-100 text-gray-800", icon: "⚪" },
  counted: { label: "Contado", color: "bg-twilight text-imperial", icon: "✅" },
  divergence: { label: "Divergência", color: "bg-orange-100 text-orange-800", icon: "⚠️" },
  awaiting_photo: { label: "Aguardando Foto", color: "bg-yellow-100 text-yellow-800", icon: "📸" },
}

export function InventoryCountingContent({ inventoryId }: { inventoryId: string }) {
  const router = useRouter()
  const [items, setItems] = useState(mockItems)
  const [scanCode, setScanCode] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItem, setSelectedItem] = useState<typeof mockItems[0] | null>(null)
  const [showCountingCard, setShowCountingCard] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [finalizeConfirm, setFinalizeConfirm] = useState(false)
  const [finalObservations, setFinalObservations] = useState("")

  // Counting form state
  const [countedQty, setCountedQty] = useState("")
  const [confirmedLot, setConfirmedLot] = useState("")
  const [confirmedExpiry, setConfirmedExpiry] = useState("")
  const [packageCondition, setPackageCondition] = useState("intact")
  const [conditionDescription, setConditionDescription] = useState("")
  const [actualLocation, setActualLocation] = useState("")
  const [observations, setObservations] = useState("")

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Filter items
  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return items
    return items.filter((item) => item.status === statusFilter)
  }, [items, statusFilter])

  // Calculate progress
  const countedItems = items.filter((i) => i.status === "counted" || i.status === "divergence").length
  const progress = (countedItems / items.length) * 100

  const handleScan = () => {
    // Simulate barcode scan
    const foundItem = items.find((item) => item.product.sku === scanCode || item.lot === scanCode)
    if (foundItem) {
      openCountingCard(foundItem)
      setScanCode("")
    } else {
      alert("Item não encontrado no escopo deste inventário")
    }
  }

  const openCountingCard = (item: typeof mockItems[0]) => {
    setSelectedItem(item)
    setCountedQty("")
    setConfirmedLot(item.lot)
    setConfirmedExpiry(item.expiryDate)
    setActualLocation(item.location)
    setPackageCondition("intact")
    setConditionDescription("")
    setObservations("")
    setShowCountingCard(true)
  }

  const calculateDivergence = () => {
    if (!selectedItem || !countedQty) return { value: 0, percent: 0 }
    const counted = parseFloat(countedQty)
    const divergence = counted - selectedItem.systemQty
    const percent = (divergence / selectedItem.systemQty) * 100
    return { value: divergence, percent }
  }

  const divergence = calculateDivergence()
  const isDivergent = Math.abs(divergence.percent) > 0.1
  const isSignificantDivergence = Math.abs(divergence.percent) >= 10

  const handleSaveCount = () => {
    if (!selectedItem || !countedQty) return

    const newStatus = isDivergent ? "divergence" : "counted"
    const updatedItems = items.map((item) =>
      item.id === selectedItem.id
        ? { ...item, countedQty: parseFloat(countedQty), status: newStatus }
        : item,
    )
    setItems(updatedItems)
    setShowCountingCard(false)
    setSelectedItem(null)
  }

  const handleSaveAndNext = () => {
    handleSaveCount()
    // Find next pending item
    const currentIndex = items.findIndex((i) => i.id === selectedItem?.id)
    const nextPending = items.slice(currentIndex + 1).find((i) => i.status === "pending")
    if (nextPending) {
      setTimeout(() => openCountingCard(nextPending), 100)
    }
  }

  const handleFinalize = () => {
    setShowFinalizeModal(true)
  }

  const confirmFinalize = () => {
    // Here would be the API call
    console.log("Inventory finalized")
    router.push("/estoque/inventario")
  }

  const pendingCount = items.filter((i) => i.status === "pending").length
  const divergenceCount = items.filter((i) => i.status === "divergence").length

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/estoque/inventario" className="hover:text-imperial">
          Inventário
        </Link>
        {" / "}
        <span className="text-foreground">Contagem</span>
      </div>

      {/* Fixed Header */}
      <Card className="sticky top-0 z-10 shadow-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Código</Label>
              <div className="font-mono font-bold text-lg">{mockInventory.id}</div>
              <div className="text-xs text-muted-foreground">{mockInventory.scope}</div>
            </div>
            <div>
              <Label className="text-xs">Responsável</Label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-twilight text-imperial flex items-center justify-center text-xs font-semibold">
                  {mockInventory.responsible.avatar}
                </div>
                <span className="text-sm">{mockInventory.responsible.name}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs">Tempo Decorrido</Label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-imperial" />
                <span className="font-mono font-semibold">{formatTime(elapsedTime)}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs">Progresso</Label>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold">
                    {countedItems} de {mockInventory.totalItems}
                  </span>
                  <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Scan Card */}
      <Card className="border-twilight bg-twilight">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-imperial">Ação Rápida de Scan</h3>
          <div className="flex gap-2">
            <Button className="bg-imperial hover:bg-imperial">
              <Camera className="w-5 h-5 mr-2" />
              Ativar Câmera
            </Button>
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Digite código do produto/lote"
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleScan()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleScan}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filtros Rápidos</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="counted">Contados</SelectItem>
                    <SelectItem value="divergence">Com Divergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const status = statusBadges[item.status as keyof typeof statusBadges]
          const itemDivergence =
            item.countedQty !== null ? ((item.countedQty - item.systemQty) / item.systemQty) * 100 : 0

          return (
            <Card
              key={item.id}
              className={`cursor-pointer hover:border-twilight transition-colors ${
                item.status === "divergence" ? "border-orange-300 bg-orange-50/30" : ""
              }`}
              onClick={() => item.status === "pending" && openCountingCard(item)}
            >
              <CardContent className="pt-6">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Product Info - 60% */}
                  <div className="col-span-7">
                    <div className="font-mono text-sm font-semibold">{item.product.sku}</div>
                    <div className="text-sm text-muted-foreground">{item.product.description}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.product.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Lote: {item.lot} | Val: {new Date(item.expiryDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {/* System Qty & Status - 25% */}
                  <div className="col-span-3">
                    <div className="text-xs text-muted-foreground">Qtd Sistema</div>
                    <div className="font-semibold">
                      {item.systemQty} {item.unit}
                    </div>
                    <Badge className={`${status.color} border-0 mt-1`}>
                      {status.icon} {status.label}
                    </Badge>
                    {item.status === "divergence" && (
                      <div className="text-xs text-orange-600 font-semibold mt-1">
                        {itemDivergence > 0 ? "+" : ""}
                        {itemDivergence.toFixed(1)}%
                      </div>
                    )}
                  </div>

                  {/* Action - 15% */}
                  <div className="col-span-2 text-right">
                    {item.status === "pending" ? (
                      <Button size="sm" className="bg-imperial hover:bg-imperial">
                        Contar
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={(e) => {
                        e.stopPropagation()
                        openCountingCard(item)
                      }}>
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <Button variant="outline" size="lg" className="shadow-lg">
          <Pause className="w-5 h-5 mr-2" />
          Pausar
        </Button>
        <Button
          size="lg"
          className="bg-imperial hover:bg-imperial shadow-lg"
          onClick={handleFinalize}
          disabled={pendingCount > 0}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Finalizar
        </Button>
      </div>

      {/* Counting Card Modal */}
      <Dialog open={showCountingCard} onOpenChange={setShowCountingCard}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contagem de Item</DialogTitle>
            <DialogDescription>Registre a quantidade contada e as informações do item</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Product Info */}
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="font-mono text-lg font-bold">{selectedItem.product.sku}</div>
                  <div className="text-sm text-muted-foreground mb-2">{selectedItem.product.description}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Categoria:</span> {selectedItem.product.category}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lote:</span>{" "}
                      <span className="font-mono font-semibold">{selectedItem.lot}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Validade:</span>{" "}
                      {new Date(selectedItem.expiryDate).toLocaleDateString("pt-BR")}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Local:</span> {selectedItem.location}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Data */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Qtd no Sistema</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {selectedItem.systemQty} {selectedItem.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Valor Unitário</div>
                      <div className="text-xl font-semibold">MZN {selectedItem.unitValue.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Valor Total</div>
                      <div className="text-xl font-semibold">
                        MZN {(selectedItem.systemQty * selectedItem.unitValue).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Counting Form */}
              <div className="space-y-4">
                <div>
                  <Label>Quantidade Contada *</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Ex: 100"
                      value={countedQty}
                      onChange={(e) => setCountedQty(e.target.value)}
                      className="text-xl font-bold pr-16"
                      step="0.01"
                      min="0"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {selectedItem.unit}
                    </div>
                  </div>
                  {countedQty && (
                    <div className="mt-2 p-3 rounded-lg bg-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Divergência:</span>
                        <span
                          className={`font-bold ${divergence.value > 0 ? "text-imperial" : divergence.value < 0 ? "text-red-700" : "text-gray-700"}`}
                        >
                          {divergence.value > 0 ? "+" : ""}
                          {divergence.value.toFixed(2)} ({divergence.percent > 0 ? "+" : ""}
                          {divergence.percent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {isDivergent && isSignificantDivergence && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-semibold">Divergência Significativa - Foto Obrigatória</span>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Condições da Embalagem</Label>
                  <RadioGroup value={packageCondition} onValueChange={setPackageCondition}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="intact" id="intact" />
                        <label htmlFor="intact" className="cursor-pointer">
                          Íntegra
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="minor_damage" id="minor_damage" />
                        <label htmlFor="minor_damage" className="cursor-pointer">
                          Avariada (descrever)
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="major_damage" id="major_damage" />
                        <label htmlFor="major_damage" className="cursor-pointer">
                          Danificada (descrever)
                        </label>
                      </div>
                    </div>
                  </RadioGroup>
                  {packageCondition !== "intact" && (
                    <Textarea
                      placeholder="Descreva as avarias..."
                      value={conditionDescription}
                      onChange={(e) => setConditionDescription(e.target.value)}
                      className="mt-2"
                      rows={2}
                    />
                  )}
                </div>

                <div>
                  <Label>Observações da Contagem</Label>
                  <Textarea
                    placeholder="Ex: produto parcialmente aberto, embalagem rasgada..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={3}
                  />
                </div>

                {(isSignificantDivergence || packageCondition !== "intact") && (
                  <div>
                    <Label>Foto Comprobatória {isSignificantDivergence && "*"}</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Clique para tirar foto ou fazer upload</p>
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Tirar Foto
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Divergence Indicator */}
              {countedQty && (
                <Card
                  className={`${
                    !isDivergent
                      ? "bg-twilight border-twilight"
                      : isSignificantDivergence
                        ? "bg-red-50 border-red-200"
                        : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <CardContent className="pt-4 text-center">
                    {!isDivergent ? (
                      <div className="flex items-center justify-center gap-2 text-imperial">
                        <CheckCircle className="w-8 h-8" />
                        <span className="text-xl font-bold">CONFORME</span>
                      </div>
                    ) : isSignificantDivergence ? (
                      <div className="text-red-700">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-xl font-bold">DIVERGÊNCIA SIGNIFICATIVA</div>
                        <div className="text-sm mt-1">
                          {divergence.value > 0 ? "+" : ""}
                          {divergence.value.toFixed(2)} {selectedItem.unit} ({divergence.percent > 0 ? "+" : ""}
                          {divergence.percent.toFixed(2)}%)
                        </div>
                      </div>
                    ) : (
                      <div className="text-orange-700">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-xl font-bold">DIVERGÊNCIA PEQUENA</div>
                        <div className="text-sm mt-1">
                          {divergence.value > 0 ? "+" : ""}
                          {divergence.value.toFixed(2)} {selectedItem.unit} ({divergence.percent > 0 ? "+" : ""}
                          {divergence.percent.toFixed(2)}%)
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCountingCard(false)}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={handleSaveCount} disabled={!countedQty}>
              <Check className="w-4 h-4 mr-2" />
              Salvar Contagem
            </Button>
            <Button className="bg-imperial hover:bg-imperial" onClick={handleSaveAndNext} disabled={!countedQty}>
              Salvar e Próximo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finalize Modal */}
      <Dialog open={showFinalizeModal} onOpenChange={setShowFinalizeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Finalizar Inventário</DialogTitle>
            <DialogDescription>Revise o resumo antes de finalizar</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {pendingCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Há {pendingCount} itens não contados</span>
                </div>
              </div>
            )}

            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-3">Resumo do Inventário</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total de Itens:</span>{" "}
                    <span className="font-semibold">{mockInventory.totalItems}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Itens Contados:</span>{" "}
                    <span className="font-semibold">{countedItems}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Itens Não Encontrados:</span>{" "}
                    <span className="font-semibold">{pendingCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Divergências:</span>{" "}
                    <span className="font-semibold text-orange-600">{divergenceCount}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Tempo Decorrido:</span>{" "}
                    <span className="font-semibold font-mono">{formatTime(elapsedTime)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <Label>Observações Finais do Responsável</Label>
              <Textarea
                placeholder="Observações gerais sobre a realização do inventário..."
                value={finalObservations}
                onChange={(e) => setFinalObservations(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="confirmFinalize"
                checked={finalizeConfirm}
                onCheckedChange={(checked) => setFinalizeConfirm(checked as boolean)}
              />
              <label htmlFor="confirmFinalize" className="cursor-pointer text-sm font-medium">
                Confirmo que revisei todas as contagens e estou pronto para finalizar *
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalizeModal(false)}>
              Voltar
            </Button>
            <Button
              className="bg-imperial hover:bg-imperial"
              onClick={confirmFinalize}
              disabled={!finalizeConfirm}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar Inventário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




