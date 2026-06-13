"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Package,
  Play,
  Pause,
  Navigation,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PickingExecutionContentProps {
  orderId: string
}

interface PickingItem {
  id: string
  productSku: string
  productName: string
  category: string
  imageUrl: string | null
  lotCode: string
  expiryDate: string
  daysUntilExpiry: number
  location: string
  locationHierarchy: string
  requestedQty: number
  unit: string
  scannedLot: string
  pickedQty: number
  expiryConfirmed: boolean
  condition: "intact" | "minor_damage" | "major_damage"
  damageNotes: string
  divergenceReason: string
  photoUrl: string | null
  status: "pending" | "picked" | "skipped"
  distanceFromPrevious: number
}

export function PickingExecutionContent({ orderId }: PickingExecutionContentProps) {
  const router = useRouter()

  // Order data
  const [orderNumber] = useState("ORD-" + orderId.padStart(5, "0"))
  const [customerName] = useState("Supermercado Central")
  const [expectedShipDate] = useState("2025-01-22")
  const [isUrgent] = useState(true)

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(true)

  // Items
  const [items, setItems] = useState<PickingItem[]>([
    {
      id: "1",
      productSku: "FRS-045",
      productName: "Filé de Frango Congelado - 1kg",
      category: "Congelado",
      imageUrl: null,
      lotCode: "LOT2025-001",
      expiryDate: "2025-02-15",
      daysUntilExpiry: 24,
      location: "ARM01 > ZF > CA > P01",
      locationHierarchy: "Armazém 01 > Zona Fria > Corredor A > Prateleira 01",
      requestedQty: 50,
      unit: "kg",
      scannedLot: "",
      pickedQty: 0,
      expiryConfirmed: false,
      condition: "intact",
      damageNotes: "",
      divergenceReason: "",
      photoUrl: null,
      status: "pending",
      distanceFromPrevious: 0,
    },
    {
      id: "2",
      productSku: "BEB-120",
      productName: "Suco de Laranja Natural - 1L",
      category: "Bebidas",
      imageUrl: null,
      lotCode: "LOT2025-087",
      expiryDate: "2025-01-24",
      daysUntilExpiry: 2,
      location: "ARM01 > ZF > CC > P02",
      locationHierarchy: "Armazém 01 > Zona Fria > Corredor C > Prateleira 02",
      requestedQty: 30,
      unit: "L",
      scannedLot: "",
      pickedQty: 0,
      expiryConfirmed: false,
      condition: "intact",
      damageNotes: "",
      divergenceReason: "",
      photoUrl: null,
      status: "pending",
      distanceFromPrevious: 15,
    },
    {
      id: "3",
      productSku: "ALM-001",
      productName: "Arroz Branco Tipo 1 - Pacote 5kg",
      category: "Seco",
      imageUrl: null,
      lotCode: "LOT2025-023",
      expiryDate: "2025-04-15",
      daysUntilExpiry: 83,
      location: "ARM01 > ZS > CB > P05",
      locationHierarchy: "Armazém 01 > Zona Seca > Corredor B > Prateleira 05",
      requestedQty: 100,
      unit: "kg",
      scannedLot: "",
      pickedQty: 0,
      expiryConfirmed: false,
      condition: "intact",
      damageNotes: "",
      divergenceReason: "",
      photoUrl: null,
      status: "pending",
      distanceFromPrevious: 25,
    },
  ])

  // Current item index
  const [currentIndex, setCurrentIndex] = useState(0)
  const [routeCollapsed, setRouteCollapsed] = useState(false)
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning])

  // Format timer
  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  // Calculate progress
  const progress = useMemo(() => {
    const picked = items.filter((i) => i.status === "picked").length
    const total = items.length
    return {
      picked,
      total,
      percent: total > 0 ? (picked / total) * 100 : 0,
    }
  }, [items])

  // Current item
  const currentItem = items[currentIndex]

  // Update current item
  const updateCurrentItem = (updates: Partial<PickingItem>) => {
    setItems((prev) => prev.map((item, index) => (index === currentIndex ? { ...item, ...updates } : item)))
  }

  // Confirm picking
  const confirmPicking = () => {
    if (!currentItem) return

    // Validation
    if (!currentItem.scannedLot) {
      alert("Escaneie ou digite o código do lote")
      return
    }

    if (currentItem.scannedLot !== currentItem.lotCode) {
      if (!currentItem.divergenceReason) {
        alert("Lote divergente. Informe o motivo da divergência.")
        return
      }
    }

    if (currentItem.pickedQty <= 0) {
      alert("Informe a quantidade separada")
      return
    }

    if (currentItem.pickedQty !== currentItem.requestedQty && !currentItem.divergenceReason) {
      alert("Quantidade divergente. Informe o motivo da divergência.")
      return
    }

    if (!currentItem.expiryConfirmed) {
      alert("Confirme a validade do produto")
      return
    }

    if (currentItem.condition !== "intact" && !currentItem.damageNotes) {
      alert("Descreva a avaria encontrada")
      return
    }

    // Mark as picked
    updateCurrentItem({ status: "picked" })

    // Move to next item
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // Skip item
  const skipItem = () => {
    updateCurrentItem({ status: "skipped" })
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // Navigate
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // Finalize
  const handleFinalize = () => {
    const pendingItems = items.filter((i) => i.status === "pending")
    if (pendingItems.length > 0) {
      setFinalizeModalOpen(true)
    } else {
      finalizePicking()
    }
  }

  const finalizePicking = () => {
    setTimerRunning(false)
    setFinalizeModalOpen(false)
    alert("Separação concluída com sucesso!")
    router.push("/expedicao/ordens")
  }

  // Get days color
  const getDaysColor = (days: number) => {
    if (days < 7) return "text-red-600"
    if (days < 15) return "text-orange-600"
    if (days < 30) return "text-yellow-600"
    return "text-imperial"
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Fixed Header */}
      <Card className="sticky top-0 z-10 shadow-md">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ordem: {orderNumber}</p>
                <p className="font-medium">{customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Data Expedição</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{new Date(expectedShipDate).toLocaleDateString("pt-BR")}</p>
                  {isUrgent && (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      URGENTE
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tempo: {formatTimer(timerSeconds)}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTimerRunning(!timerRunning)}
              >
                {timerRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {timerRunning ? "Pausar" : "Retomar"}
              </Button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {progress.picked} de {progress.total} itens separados
                </span>
                <span className="font-medium">{progress.percent.toFixed(0)}%</span>
              </div>
              <Progress value={progress.percent} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Picking Route */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setRouteCollapsed(!routeCollapsed)}>
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Rota de Picking
            </CardTitle>
            {routeCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </div>
        </CardHeader>
        {!routeCollapsed && (
          <CardContent>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3 rounded border ${index === currentIndex ? "bg-twilight border-imperial" : item.status === "picked" ? "bg-gray-50 opacity-60" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.status === "picked" ? (
                        <CheckCircle className="h-5 w-5 text-imperial" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.location} - {item.requestedQty} {item.unit}
                        </p>
                      </div>
                    </div>
                    {index === currentIndex && (
                      <Badge variant="outline" className="bg-twilight text-imperial">
                        Atual
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Current Item */}
      {currentItem && (
        <Card className="border-2 border-imperial">
          <CardHeader className="bg-twilight">
            <CardTitle>Item {currentIndex + 1} de {items.length}</CardTitle>
            <CardDescription>Separe este item conforme as informações abaixo</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Product Info */}
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                {currentItem.imageUrl ? (
                  <img src={currentItem.imageUrl} alt={currentItem.productName} className="w-full h-full object-cover rounded" />
                ) : (
                  <Package className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-mono">{currentItem.productSku}</p>
                <p className="text-lg font-bold">{currentItem.productName}</p>
                <Badge variant="outline" className="mt-1">
                  {currentItem.category}
                </Badge>
              </div>
            </div>

            {/* Lot Info */}
            <Card className="bg-blue-50">
              <CardContent className="pt-4 space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Lote</p>
                  <p className="text-2xl font-bold font-mono">{currentItem.lotCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Validade</p>
                  <p className="text-lg font-bold">
                    {new Date(currentItem.expiryDate).toLocaleDateString("pt-BR")} -{" "}
                    <span className={getDaysColor(currentItem.daysUntilExpiry)}>{currentItem.daysUntilExpiry} dias</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Local</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-imperial" />
                    <p className="font-medium">{currentItem.location}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{currentItem.locationHierarchy}</p>
                  {currentItem.distanceFromPrevious > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Distância do local anterior: ~{currentItem.distanceFromPrevious}m
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantidade a Separar</p>
                  <p className="text-3xl font-bold text-imperial">
                    {currentItem.requestedQty} {currentItem.unit}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Scanning & Confirmation */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scan-lot">
                  Scan do Lote <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-shrink-0">
                    <Camera className="h-4 w-4 mr-2" />
                    Escanear
                  </Button>
                  <Input
                    id="scan-lot"
                    placeholder="ou digite o código do lote"
                    value={currentItem.scannedLot}
                    onChange={(e) => updateCurrentItem({ scannedLot: e.target.value })}
                    className={
                      currentItem.scannedLot && currentItem.scannedLot !== currentItem.lotCode
                        ? "border-orange-500 bg-orange-50"
                        : ""
                    }
                  />
                </div>
                {currentItem.scannedLot && currentItem.scannedLot !== currentItem.lotCode && (
                  <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">⚠️ Lote diferente do esperado!</p>
                      <p className="text-xs text-orange-800">
                        Esperado: {currentItem.lotCode} | Escaneado: {currentItem.scannedLot}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="picked-qty">
                  Quantidade Separada <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="picked-qty"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={currentItem.pickedQty || ""}
                    onChange={(e) => updateCurrentItem({ pickedQty: Number(e.target.value) })}
                    className="text-2xl font-bold text-center"
                  />
                  <span className="text-lg font-medium">{currentItem.unit}</span>
                </div>
                {currentItem.pickedQty !== currentItem.requestedQty && currentItem.pickedQty > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-orange-600">⚠️ Quantidade divergente</p>
                    <Textarea
                      placeholder="Motivo da divergência *"
                      value={currentItem.divergenceReason}
                      onChange={(e) => updateCurrentItem({ divergenceReason: e.target.value })}
                      rows={2}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="expiry-confirm"
                    checked={currentItem.expiryConfirmed}
                    onCheckedChange={(checked) => updateCurrentItem({ expiryConfirmed: checked as boolean })}
                  />
                  <Label htmlFor="expiry-confirm" className="font-normal">
                    Confirmo validade do rótulo: {new Date(currentItem.expiryDate).toLocaleDateString("pt-BR")} <span className="text-red-500">*</span>
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Condições do Produto</Label>
                <RadioGroup
                  value={currentItem.condition}
                  onValueChange={(value) => updateCurrentItem({ condition: value as "intact" | "minor_damage" | "major_damage" })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intact" id="intact" />
                    <Label htmlFor="intact" className="font-normal">
                      Íntegro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minor_damage" id="minor_damage" />
                    <Label htmlFor="minor_damage" className="font-normal">
                      Avaria Leve
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="major_damage" id="major_damage" />
                    <Label htmlFor="major_damage" className="font-normal">
                      Avaria Grave
                    </Label>
                  </div>
                </RadioGroup>
                {currentItem.condition !== "intact" && (
                  <Textarea
                    placeholder="Descreva a avaria encontrada *"
                    value={currentItem.damageNotes}
                    onChange={(e) => updateCurrentItem({ damageNotes: e.target.value })}
                    rows={2}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Foto (Opcional)</Label>
                <Button variant="outline" className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Tirar Foto
                </Button>
              </div>
            </div>

            {/* Conformity Indicator */}
            <Card
              className={
                currentItem.scannedLot === currentItem.lotCode &&
                currentItem.pickedQty === currentItem.requestedQty &&
                currentItem.expiryConfirmed &&
                currentItem.condition === "intact"
                  ? "bg-twilight border-twilight"
                  : "bg-yellow-50 border-yellow-300"
              }
            >
              <CardContent className="pt-4">
                {currentItem.scannedLot === currentItem.lotCode &&
                currentItem.pickedQty === currentItem.requestedQty &&
                currentItem.expiryConfirmed &&
                currentItem.condition === "intact" ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-imperial" />
                    <p className="font-medium text-imperial">✅ Tudo conforme</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <p className="font-medium text-yellow-900">⚠️ Divergências encontradas:</p>
                    </div>
                    <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                      {currentItem.scannedLot !== currentItem.lotCode && <li>Lote divergente</li>}
                      {currentItem.pickedQty !== currentItem.requestedQty && <li>Quantidade divergente</li>}
                      {!currentItem.expiryConfirmed && <li>Validade não confirmada</li>}
                      {currentItem.condition !== "intact" && <li>Produto com avaria</li>}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              <Button variant="outline" onClick={skipItem}>
                Pular Item
              </Button>
              <Button variant="outline" className="text-red-600 border-red-600">
                Problema/NC
              </Button>
              <Button className="bg-imperial hover:bg-imperial" onClick={confirmPicking}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goToPrevious} disabled={currentIndex === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <span className="text-sm font-medium">
              {currentIndex + 1} de {items.length}
            </span>
            <Button variant="outline" onClick={goToNext} disabled={currentIndex === items.length - 1}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Finalize Button */}
      <Card className="fixed bottom-0 left-0 right-0 border-t-2 border-imperial z-20">
        <CardContent className="py-4">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setTimerRunning(false)}>
              <Pause className="h-4 w-4 mr-2" />
              Pausar Separação
            </Button>
            <Button
              className="flex-1 bg-imperial hover:bg-imperial"
              onClick={handleFinalize}
              disabled={progress.picked === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Separação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Finalize Modal */}
      <Dialog open={finalizeModalOpen} onOpenChange={setFinalizeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Separação</DialogTitle>
            <DialogDescription>Revise o resumo da separação</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Itens Separados:</span>
                  <span className="font-bold">
                    {progress.picked} de {progress.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Divergências:</span>
                  <span className="font-bold">
                    {items.filter((i) => i.pickedQty !== i.requestedQty || i.scannedLot !== i.lotCode).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tempo Total:</span>
                  <span className="font-bold">{formatTimer(timerSeconds)}</span>
                </div>
              </CardContent>
            </Card>

            {items.filter((i) => i.status === "pending").length > 0 && (
              <Card className="border-orange-300 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-base text-orange-900">Itens Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    {items
                      .filter((i) => i.status === "pending")
                      .map((item) => (
                        <li key={item.id} className="text-orange-800">
                          • {item.productName}
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="flex items-start gap-3">
              <Checkbox id="finalize-confirm" />
              <Label htmlFor="finalize-confirm" className="font-normal text-sm">
                Confirmo que todos os itens foram coletados <span className="text-red-500">*</span>
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFinalizeModalOpen(false)}>
              Voltar
            </Button>
            <Button className="bg-imperial hover:bg-imperial" onClick={finalizePicking}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




