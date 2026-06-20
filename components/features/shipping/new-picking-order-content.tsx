"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  MapPin,
  Clock,
  Package,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { expedicaoService } from "@/app/services/expedicaoService"

type DestinationType = "customer" | "store" | "internal" | "other"
type OrderPriority = "normal" | "high" | "urgent"

interface OrderItem {
  id: string
  productId: string
  productSku: string
  productName: string
  category: string
  availableStock: number
  unit: string
  requestedQty: number
  minShelfLifeDays: number | null
  minShelfLifePercent: number | null
  observations: string
  selectedLots: SelectedLot[]
  fefoStatus: "pending" | "ok" | "warning"
}

interface SelectedLot {
  lotCode: string
  expiryDate: string
  daysUntilExpiry: number
  shelfLifePercent: number
  availableQty: number
  location: string
  supplier: string
  qty: number
  compliance: "conform" | "fair" | "insufficient"
}

interface AvailableLot {
  lotCode: string
  expiryDate: string
  daysUntilExpiry: number
  shelfLifePercent: number
  availableQty: number
  location: string
  supplier: string
  receivedDate: string
  compliance: "conform" | "fair" | "insufficient"
  blocked: boolean
}

export function NewPickingOrderContent() {
  const router = useRouter()

  // General Information
  const [orderNumber] = useState("ORD-" + String(Math.floor(Math.random() * 10000)).padStart(5, "0"))
  const [destinationType, setDestinationType] = useState<DestinationType>("customer")
  const [destination, setDestination] = useState("")
  const [expectedShipDate, setExpectedShipDate] = useState("")
  const [priority, setPriority] = useState<OrderPriority>("normal")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [carrier, setCarrier] = useState("")
  const [generalObservations, setGeneralObservations] = useState("")

  // Order Items
  const [items, setItems] = useState<OrderItem[]>([])

  const handleCreateOrder = () => {
    if (!destination) {
      alert("Por favor, preencha o destino da ordem.")
      return
    }
    if (items.length === 0) {
      alert("Adicione pelo menos um item à ordem.")
      return
    }

    const payloadItens = items.map((item) => ({
      produtoId: item.productSku || "PROD-UUID-PLACEHOLDER",
      quantidade: item.requestedQty || 0
    }))

    expedicaoService.createPickingOrder({
      solicitante: destination || "Solicitante Padrão",
      itens: payloadItens
    })
    .then((res) => {
      console.log("Picking Order created", res)
      router.push("/expedicao/ordens")
    })
    .catch((err) => {
      console.error(err)
      router.push("/expedicao/ordens")
    })
  }

  // FEFO Modal State
  const [fefoModalOpen, setFefoModalOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<OrderItem | null>(null)
  const [currentItemIndex, setCurrentItemIndex] = useState(-1)
  const [showConformOnly, setShowConformOnly] = useState(false)
  const [hideBlocked, setHideBlocked] = useState(true)

  // Mock available lots for FEFO modal
  const [availableLots] = useState<AvailableLot[]>([
    {
      lotCode: "LOT2025-001",
      expiryDate: "2025-02-15",
      daysUntilExpiry: 24,
      shelfLifePercent: 20,
      availableQty: 50,
      location: "ARM01 > ZF > CA > P01",
      supplier: "Fornecedor A",
      receivedDate: "2024-10-15",
      compliance: "fair",
      blocked: false,
    },
    {
      lotCode: "LOT2025-002",
      expiryDate: "2025-03-10",
      daysUntilExpiry: 47,
      shelfLifePercent: 45,
      availableQty: 100,
      location: "ARM01 > ZF > CA > P02",
      supplier: "Fornecedor A",
      receivedDate: "2024-12-01",
      compliance: "conform",
      blocked: false,
    },
    {
      lotCode: "LOT2025-003",
      expiryDate: "2025-04-20",
      daysUntilExpiry: 88,
      shelfLifePercent: 75,
      availableQty: 150,
      location: "ARM01 > ZF > CB > P01",
      supplier: "Fornecedor B",
      receivedDate: "2025-01-10",
      compliance: "conform",
      blocked: false,
    },
    {
      lotCode: "LOT2024-099",
      expiryDate: "2025-01-25",
      daysUntilExpiry: 3,
      shelfLifePercent: 5,
      availableQty: 25,
      location: "ARM01 > ZF > CA > P03",
      supplier: "Fornecedor A",
      receivedDate: "2024-08-01",
      compliance: "insufficient",
      blocked: false,
    },
  ])

  // Selected lots for current FEFO modal
  const [tempSelectedLots, setTempSelectedLots] = useState<Map<string, number>>(new Map())

  // Add item
  const addItem = () => {
    const newItem: OrderItem = {
      id: String(Date.now()),
      productId: "",
      productSku: "",
      productName: "",
      category: "",
      availableStock: 0,
      unit: "un",
      requestedQty: 0,
      minShelfLifeDays: null,
      minShelfLifePercent: null,
      observations: "",
      selectedLots: [],
      fefoStatus: "pending",
    }
    setItems([...items, newItem])
  }

  // Remove item
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  // Update item
  const updateItem = (id: string, updates: Partial<OrderItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  // Open FEFO modal
  const openFefoModal = (itemIndex: number) => {
    const item = items[itemIndex]
    setCurrentItem(item)
    setCurrentItemIndex(itemIndex)
    setTempSelectedLots(new Map())
    setFefoModalOpen(true)
  }

  // Calculate selected total
  const selectedTotal = useMemo(() => {
    let total = 0
    tempSelectedLots.forEach((qty) => {
      total += qty
    })
    return total
  }, [tempSelectedLots])

  // Filter available lots
  const filteredLots = useMemo(() => {
    let filtered = availableLots

    if (showConformOnly) {
      filtered = filtered.filter((lot) => lot.compliance === "conform" || lot.compliance === "fair")
    }

    if (hideBlocked) {
      filtered = filtered.filter((lot) => !lot.blocked)
    }

    // Always sort by FEFO (expiry date ascending)
    return filtered.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
  }, [availableLots, showConformOnly, hideBlocked])

  // Auto-select lots (FEFO algorithm)
  const autoSelectLots = () => {
    if (!currentItem) return

    const newSelection = new Map<string, number>()
    let remaining = currentItem.requestedQty

    // Filter only conform lots
    const conformLots = filteredLots.filter((lot) => lot.compliance === "conform" || lot.compliance === "fair")

    for (const lot of conformLots) {
      if (remaining <= 0) break

      const qtyToTake = Math.min(lot.availableQty, remaining)
      newSelection.set(lot.lotCode, qtyToTake)
      remaining -= qtyToTake
    }

    setTempSelectedLots(newSelection)
  }

  // Confirm lot selection
  const confirmLotSelection = () => {
    if (!currentItem || currentItemIndex === -1) return

    const selectedLots: SelectedLot[] = []
    tempSelectedLots.forEach((qty, lotCode) => {
      const lot = availableLots.find((l) => l.lotCode === lotCode)
      if (lot && qty > 0) {
        selectedLots.push({
          lotCode: lot.lotCode,
          expiryDate: lot.expiryDate,
          daysUntilExpiry: lot.daysUntilExpiry,
          shelfLifePercent: lot.shelfLifePercent,
          availableQty: lot.availableQty,
          location: lot.location,
          supplier: lot.supplier,
          qty: qty,
          compliance: lot.compliance,
        })
      }
    })

    const fefoStatus: "pending" | "ok" | "warning" =
      selectedTotal === currentItem.requestedQty
        ? selectedLots.some((l) => l.daysUntilExpiry < 7)
          ? "warning"
          : "ok"
        : "pending"

    updateItem(currentItem.id, {
      selectedLots,
      fefoStatus,
    })

    setFefoModalOpen(false)
    setCurrentItem(null)
    setCurrentItemIndex(-1)
    setTempSelectedLots(new Map())
  }

  // Get compliance badge
  const getComplianceBadge = (compliance: "conform" | "fair" | "insufficient") => {
    switch (compliance) {
      case "conform":
        return (
          <Badge variant="outline" className="bg-twilight text-imperial border-twilight">
            ✅ Conforme
          </Badge>
        )
      case "fair":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            ⚠️ Validade Justa
          </Badge>
        )
      case "insufficient":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            ❌ Validade Insuficiente
          </Badge>
        )
    }
  }

  // Get days color
  const getDaysColor = (days: number) => {
    if (days < 7) return "text-red-600"
    if (days < 15) return "text-orange-600"
    if (days < 30) return "text-yellow-600"
    return "text-imperial"
  }

  // Calculate summary
  const orderSummary = useMemo(() => {
    const totalItems = items.length
    const totalLots = items.reduce((sum, item) => sum + item.selectedLots.length, 0)
    const uniqueLocations = new Set(items.flatMap((item) => item.selectedLots.map((lot) => lot.location)))
    const minExpiry = items
      .flatMap((item) => item.selectedLots)
      .reduce((min, lot) => (lot.daysUntilExpiry < min ? lot.daysUntilExpiry : min), Infinity)

    return {
      totalItems,
      totalLots,
      locationsCount: uniqueLocations.size,
      minExpiry: minExpiry === Infinity ? null : minExpiry,
    }
  }, [items])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/expedicao" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link href="/expedicao/ordens" className="hover:text-foreground">
              Expedição
            </Link>
            <span>/</span>
            <Link href="/expedicao/ordens" className="hover:text-foreground">
              Ordens
            </Link>
            <span>/</span>
            <span className="text-foreground">Nova Ordem</span>
          </div>
          <h1 className="text-3xl font-bold text-imperial">Nova Ordem de Separação</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/expedicao/ordens")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button variant="outline">Salvar Rascunho</Button>
          <Button className="bg-imperial hover:bg-imperial" onClick={handleCreateOrder}>Criar Ordem</Button>
        </div>
      </div>

      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nº Ordem</Label>
              <Input value={orderNumber} disabled />
            </div>

            <div className="space-y-2">
              <Label>Data de Criação</Label>
              <Input value={new Date().toLocaleDateString("pt-BR")} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Tipo de Destino <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={destinationType} onValueChange={(value) => setDestinationType(value as DestinationType)}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="customer" className="font-normal">
                    Cliente (venda)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="store" id="store" />
                  <Label htmlFor="store" className="font-normal">
                    Loja/Filial (transferência)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internal" id="internal" />
                  <Label htmlFor="internal" className="font-normal">
                    Uso Interno (consumo)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="font-normal">
                    Outro (especificar)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="destination">
                Destino/Cliente <span className="text-red-500">*</span>
              </Label>
              {destinationType === "customer" && (
                <Input
                  id="destination"
                  placeholder="Buscar cliente... (Nome, Cidade, NUIT)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              )}
              {destinationType === "store" && (
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger id="destination">
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loja-matola">Loja Matola</SelectItem>
                    <SelectItem value="loja-beira">Loja Beira</SelectItem>
                    <SelectItem value="loja-nampula">Loja Nampula</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {destinationType === "internal" && (
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger id="destination">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="producao">Produção</SelectItem>
                    <SelectItem value="qualidade">Qualidade</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {destinationType === "other" && (
                <Input
                  id="destination"
                  placeholder="Especifique o destino"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shipDate">
                Data Prevista de Expedição <span className="text-red-500">*</span>
              </Label>
              <Input
                id="shipDate"
                type="date"
                value={expectedShipDate}
                onChange={(e) => setExpectedShipDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Prioridade <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={priority} onValueChange={(value) => setPriority(value as OrderPriority)}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal" className="font-normal">
                    Normal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="font-normal">
                    Alta
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="urgent" id="urgent" />
                  <Label htmlFor="urgent" className="font-normal">
                    Urgente
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço de Entrega</Label>
            <Textarea
              id="address"
              placeholder="Rua, Número, Bairro, Cidade, Província..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carrier">Transportadora</Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger id="carrier">
                <SelectValue placeholder="Selecione a transportadora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transportadora-a">Transportadora A</SelectItem>
                <SelectItem value="transportadora-b">Transportadora B</SelectItem>
                <SelectItem value="transportadora-c">Transportadora C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações Gerais</Label>
            <Textarea
              id="observations"
              placeholder="Ex: Produto frágil, entregar até 18h, ligar antes..."
              value={generalObservations}
              onChange={(e) => setGeneralObservations(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens da Ordem</CardTitle>
            <Button onClick={addItem} className="bg-imperial hover:bg-imperial">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum item adicionado. Clique em "Adicionar Item" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={item.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2 md:col-span-2">
                          <Label>
                            Produto <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            placeholder="Buscar por SKU ou descrição"
                            value={item.productName}
                            onChange={(e) =>
                              updateItem(item.id, {
                                productName: e.target.value,
                                productSku: "SKU-" + String(Math.floor(Math.random() * 1000)).padStart(3, "0"),
                                availableStock: Math.floor(Math.random() * 500) + 100,
                              })
                            }
                          />
                          {item.productSku && (
                            <p className="text-xs text-muted-foreground">
                              SKU: {item.productSku} | Estoque Disponível: {item.availableStock} un
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Qtd Solicitada <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={item.requestedQty || ""}
                            onChange={(e) => updateItem(item.id, { requestedQty: Number(e.target.value) })}
                          />
                          {item.requestedQty > item.availableStock && (
                            <p className="text-xs text-orange-600">⚠️ Quantidade maior que estoque disponível</p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Validade Mínima Requerida</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="0"
                              placeholder="Dias"
                              value={item.minShelfLifeDays || ""}
                              onChange={(e) => updateItem(item.id, { minShelfLifeDays: Number(e.target.value) || null })}
                            />
                            <span className="flex items-center text-sm text-muted-foreground">ou</span>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="%"
                              value={item.minShelfLifePercent || ""}
                              onChange={(e) => updateItem(item.id, { minShelfLifePercent: Number(e.target.value) || null })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Lotes Sugeridos (FEFO)</Label>
                          <div className="flex gap-2">
                            {item.fefoStatus === "pending" && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                ⚠️ Pendente
                              </Badge>
                            )}
                            {item.fefoStatus === "ok" && (
                              <Badge variant="outline" className="bg-twilight text-imperial">
                                ✅ FEFO OK
                              </Badge>
                            )}
                            {item.fefoStatus === "warning" && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                ⚠️ Ver Sugestões
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openFefoModal(index)}
                              disabled={!item.productName || item.requestedQty <= 0}
                            >
                              Sugerir Lotes
                            </Button>
                          </div>
                          {item.selectedLots.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.selectedLots.map((lot, i) => (
                                <span key={i}>
                                  {lot.lotCode}: {lot.qty}un
                                  {i < item.selectedLots.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Observações do Item</Label>
                        <Input
                          placeholder="Observações específicas deste item"
                          value={item.observations}
                          onChange={(e) => updateItem(item.id, { observations: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2 border-t">
                        <Button variant="outline" size="sm" onClick={() => addItem()}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => removeItem(item.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Ordem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{orderSummary.totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Lotes Distintos</p>
                <p className="text-2xl font-bold">{orderSummary.totalLots}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Locais Envolvidos</p>
                <p className="text-2xl font-bold">{orderSummary.locationsCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Validade Mais Próxima</p>
                <p className={`text-2xl font-bold ${orderSummary.minExpiry ? getDaysColor(orderSummary.minExpiry) : ""}`}>
                  {orderSummary.minExpiry ? `${orderSummary.minExpiry} dias` : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FEFO Modal */}
      <Dialog open={fefoModalOpen} onOpenChange={setFefoModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seleção de Lotes - FEFO</DialogTitle>
            <DialogDescription>
              {currentItem && (
                <div className="space-y-1">
                  <p>
                    Produto: {currentItem.productSku} - {currentItem.productName}
                  </p>
                  <p>
                    Quantidade Solicitada: <span className="font-bold">{currentItem.requestedQty}</span> {currentItem.unit}
                  </p>
                  <Badge variant="outline" className="bg-twilight text-imperial">
                    FEFO Ativo
                  </Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {currentItem && (
            <div className="space-y-4">
              {/* Criteria */}
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-base">Critérios de Seleção</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Validade Mínima Requerida:</span>{" "}
                    {currentItem.minShelfLifeDays
                      ? `${currentItem.minShelfLifeDays} dias`
                      : currentItem.minShelfLifePercent
                        ? `${currentItem.minShelfLifePercent}%`
                        : "Não definida"}
                  </p>
                  <p>
                    <span className="font-medium">Data Prevista de Expedição:</span>{" "}
                    {expectedShipDate ? new Date(expectedShipDate).toLocaleDateString("pt-BR") : "Não definida"}
                  </p>
                </CardContent>
              </Card>

              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="conform-only"
                    checked={showConformOnly}
                    onCheckedChange={(checked) => setShowConformOnly(checked as boolean)}
                  />
                  <Label htmlFor="conform-only" className="font-normal text-sm">
                    Mostrar apenas conformes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hide-blocked"
                    checked={hideBlocked}
                    onCheckedChange={(checked) => setHideBlocked(checked as boolean)}
                  />
                  <Label htmlFor="hide-blocked" className="font-normal text-sm">
                    Ocultar lotes bloqueados
                  </Label>
                </div>
              </div>

              {/* Auto-select Button */}
              <Button onClick={autoSelectLots} variant="outline" className="w-full border-imperial text-imperial">
                <Sparkles className="h-4 w-4 mr-2" />
                🤖 Selecionar Automaticamente (FEFO)
              </Button>

              {/* Available Lots Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lotes Disponíveis (ordenado por FEFO)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 w-16">Ordem</th>
                          <th className="text-left p-2 w-32">Lote</th>
                          <th className="text-left p-2 w-28">Validade</th>
                          <th className="text-left p-2 w-24">% Vida</th>
                          <th className="text-right p-2 w-24">Qtd Disp.</th>
                          <th className="text-left p-2 min-w-[150px]">Local</th>
                          <th className="text-left p-2 w-32">Conformidade</th>
                          <th className="text-left p-2 w-32">Fornecedor</th>
                          <th className="text-right p-2 w-32">Qtd a Separar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLots.map((lot, index) => {
                          const currentQty = tempSelectedLots.get(lot.lotCode) || 0
                          const isDisabled = lot.compliance === "insufficient" || lot.blocked

                          return (
                            <tr key={lot.lotCode} className={`border-b ${isDisabled ? "opacity-50" : ""}`}>
                              <td className="p-2">
                                {index === 0 ? (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                    🥇 1º
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">{index + 1}</Badge>
                                )}
                              </td>
                              <td className="p-2 font-mono text-xs">{lot.lotCode}</td>
                              <td className="p-2">
                                <div className="space-y-1">
                                  <p className="text-xs">{new Date(lot.expiryDate).toLocaleDateString("pt-BR")}</p>
                                  <p className={`font-bold ${getDaysColor(lot.daysUntilExpiry)}`}>
                                    {lot.daysUntilExpiry} dias
                                  </p>
                                </div>
                              </td>
                              <td className="p-2">
                                <div className="space-y-1">
                                  <Progress value={lot.shelfLifePercent} className="h-2" />
                                  <p className="text-xs">{lot.shelfLifePercent}%</p>
                                </div>
                              </td>
                              <td className="p-2 text-right font-medium">
                                {lot.availableQty} {currentItem.unit}
                              </td>
                              <td className="p-2 text-xs" title={lot.location}>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {lot.location.split(" > ").slice(-2).join(" > ")}
                                </div>
                              </td>
                              <td className="p-2">{getComplianceBadge(lot.compliance)}</td>
                              <td className="p-2 text-xs">
                                <p>{lot.supplier}</p>
                                <p className="text-muted-foreground">{new Date(lot.receivedDate).toLocaleDateString("pt-BR")}</p>
                              </td>
                              <td className="p-2">
                                {!isDisabled ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    max={lot.availableQty}
                                    value={currentQty || ""}
                                    onChange={(e) => {
                                      const newQty = Number(e.target.value) || 0
                                      const updated = new Map(tempSelectedLots)
                                      if (newQty > 0) {
                                        updated.set(lot.lotCode, Math.min(newQty, lot.availableQty))
                                      } else {
                                        updated.delete(lot.lotCode)
                                      }
                                      setTempSelectedLots(updated)
                                    }}
                                    className="w-20 text-right"
                                  />
                                ) : (
                                  <span className="text-xs text-muted-foreground">🚫 Bloqueado</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Selection Summary */}
              <Card className={selectedTotal === currentItem.requestedQty ? "border-imperial bg-twilight" : "border-yellow-500 bg-yellow-50"}>
                <CardHeader>
                  <CardTitle className="text-base">Seleção Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Qtd Solicitada:</p>
                      <p className="text-lg font-bold">
                        {currentItem.requestedQty} {currentItem.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Qtd Selecionada:</p>
                      <p className="text-lg font-bold">
                        {selectedTotal} {currentItem.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Falta Selecionar:</p>
                      <p className={`text-lg font-bold ${currentItem.requestedQty - selectedTotal === 0 ? "text-imperial" : "text-orange-600"}`}>
                        {currentItem.requestedQty - selectedTotal} {currentItem.unit}
                      </p>
                    </div>
                  </div>

                  {selectedTotal === currentItem.requestedQty && (
                    <div className="flex items-center gap-2 p-3 bg-twilight border border-twilight rounded">
                      <CheckCircle className="h-5 w-5 text-imperial" />
                      <p className="font-bold text-imperial">✅ SELEÇÃO COMPLETA</p>
                    </div>
                  )}

                  {selectedTotal < currentItem.requestedQty && selectedTotal > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-100 border border-yellow-300 rounded">
                      <AlertTriangle className="h-5 w-5 text-yellow-700" />
                      <p className="font-bold text-yellow-900">⚠️ FALTAM {currentItem.requestedQty - selectedTotal} UNIDADES</p>
                    </div>
                  )}

                  {selectedTotal > currentItem.requestedQty && (
                    <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded">
                      <X className="h-5 w-5 text-red-700" />
                      <p className="font-bold text-red-900">❌ EXCESSO DE {selectedTotal - currentItem.requestedQty} UNIDADES</p>
                    </div>
                  )}

                  {/* Selected Lots List */}
                  {tempSelectedLots.size > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Lotes Selecionados:</p>
                      <div className="space-y-1">
                        {Array.from(tempSelectedLots.entries()).map(([lotCode, qty]) => {
                          const lot = availableLots.find((l) => l.lotCode === lotCode)
                          if (!lot) return null
                          return (
                            <div key={lotCode} className="flex items-center justify-between text-xs p-2 bg-white rounded border">
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{lotCode}</span>
                                <span className={getDaysColor(lot.daysUntilExpiry)}>({lot.daysUntilExpiry} dias)</span>
                                <span className="text-muted-foreground">
                                  {qty} {currentItem.unit}
                                </span>
                                <span className="text-muted-foreground">{lot.location.split(" > ").slice(-1)}</span>
                                {getComplianceBadge(lot.compliance)}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const updated = new Map(tempSelectedLots)
                                  updated.delete(lotCode)
                                  setTempSelectedLots(updated)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Alerts */}
              {Array.from(tempSelectedLots.entries()).some(([lotCode]) => {
                const lot = availableLots.find((l) => l.lotCode === lotCode)
                return lot && lot.daysUntilExpiry < 3
              }) && (
                <Card className="border-red-300 bg-red-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-900">⚠️ Validade Crítica</p>
                        <p className="text-sm text-red-800">O lote mais antigo vence em menos de 3 dias. Recomendamos expedição URGENTE.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setFefoModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-imperial hover:bg-imperial"
              onClick={confirmLotSelection}
              disabled={selectedTotal === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Seleção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




