"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  X,
  Ban,
  Pause,
  Keyboard,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  Download,
  Eye,
  Send,
  Thermometer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { recebimentoService } from "@/app/services/recebimentoService"

// Mock data
const mockPO = {
  id: "PO-2025-001",
  supplier: "Fornecedor A",
  checkinDate: "2025-01-30 14:30",
  vehicleTemp: 5.2,
  items: [
    {
      id: 1,
      sku: "ALM-001",
      description: "Leite Integral UHT 1L",
      category: "Laticínios",
      image: "/glass-of-milk.png",
      qtyExpected: 100,
      unit: "UN",
      lotProposed: "L20250115A",
      expiryProposed: "2025-07-15",
      shelfLife: 180,
      minValidityDays: 90,
      minValidityPercent: 50,
      datasheet: "CoA_Leite_L20250115A.pdf",
      status: "pending",
    },
    {
      id: 2,
      sku: "ALM-002",
      description: "Iogurte Natural 170g",
      category: "Laticínios",
      image: "/creamy-yogurt-bowl.png",
      qtyExpected: 50,
      unit: "UN",
      lotProposed: "Y20250120B",
      expiryProposed: "2025-02-20",
      shelfLife: 30,
      minValidityDays: 15,
      minValidityPercent: 50,
      datasheet: "CoA_Iogurte_Y20250120B.pdf",
      status: "pending",
    },
  ],
}

interface PhysicalInspectionContentProps {
  poId: string | null
  labelCode: string | null
}

export function PhysicalInspectionContent({ poId, labelCode }: PhysicalInspectionContentProps) {
  const router = useRouter()
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [scannedLabel, setScannedLabel] = useState("")
  const [qtyReceived, setQtyReceived] = useState("")
  const [lotReal, setLotReal] = useState("")
  const [expiryReal, setExpiryReal] = useState("")
  const [tempReceived, setTempReceived] = useState("")
  const [packageCondition, setPackageCondition] = useState("Íntegra")
  const [damageDescription, setDamageDescription] = useState("")
  const [observations, setObservations] = useState("")
  const [showAcceptDeviationModal, setShowAcceptDeviationModal] = useState(false)
  const [showQuarantineModal, setShowQuarantineModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [deviationJustification, setDeviationJustification] = useState("")
  const [notifyQA, setNotifyQA] = useState(false)
  const [quarantineReasons, setQuarantineReasons] = useState<string[]>([])
  const [quarantineObs, setQuarantineObs] = useState("")
  const [quarantinePriority, setQuarantinePriority] = useState("Normal")
  const [rejectReasons, setRejectReasons] = useState<string[]>([])
  const [rejectJustification, setRejectJustification] = useState("")
  const [notifySupplier, setNotifySupplier] = useState(true)
  const [generateReturn, setGenerateReturn] = useState(false)
  const [finalObs, setFinalObs] = useState("")
  const [confirmReview, setConfirmReview] = useState(false)

  const [po, setPo] = useState<any>(null)
  const [poItems, setPoItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const finalPoId = poId || "PO-2025-001"

  useEffect(() => {
    if (!finalPoId) return
    setLoading(true)
    recebimentoService.getPurchaseOrder(finalPoId)
      .then((data) => {
        setPo(data)
        if (data.itens && data.itens.length > 0) {
          const mapped = data.itens.map((item: any, idx: number) => ({
            id: idx + 1,
            produtoId: item.produtoId,
            sku: item.sku,
            description: item.description,
            category: item.category || "Geral",
            image: "/glass-of-milk.png",
            qtyExpected: item.qtyExpected,
            unit: item.unit,
            lotProposed: "LOTE-PROP",
            expiryProposed: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            shelfLife: 180,
            minValidityDays: 90,
            minValidityPercent: 50,
            datasheet: "CoA.pdf",
            status: "pending"
          }))
          setPoItems(mapped)
        }
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [finalPoId])

  const activePO = po ? {
    id: po.codigo || po.id,
    supplier: po.fornecedor?.razao_social || "Fornecedor",
    checkinDate: po.checkIn ? new Date(po.checkIn.createdAt).toLocaleString("pt-BR") : "Check-in Pendente",
    vehicleTemp: po.checkIn?.temperatura || 5.2,
    items: poItems
  } : mockPO

  const activeItems = poItems.length > 0 ? poItems : mockPO.items
  const currentItem = activeItems[currentItemIndex] || mockPO.items[0]

  // Calculate days until expiry and % of shelf life
  const calculateValidityInfo = (expiryDate: string) => {
    if (!expiryDate) return { daysUntilExpiry: 0, percentShelfLife: 0 }

    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const percentShelfLife = currentItem.shelfLife ? Math.round((daysUntilExpiry / currentItem.shelfLife) * 100) : 0

    return { daysUntilExpiry, percentShelfLife }
  }

  const proposedValidityInfo = calculateValidityInfo(currentItem.expiryProposed)
  const realValidityInfo = expiryReal ? calculateValidityInfo(expiryReal) : null

  // Compliance analysis
  const getComplianceStatus = () => {
    const issues: string[] = []
    let severity: "conforme" | "parcial" | "critico" = "conforme"

    // Quantity check
    if (qtyReceived && Number.parseFloat(qtyReceived) !== currentItem.qtyExpected) {
      issues.push("quantity")
      severity = "parcial"
    }

    // Lot check
    if (lotReal && lotReal !== currentItem.lotProposed) {
      issues.push("lot")
      severity = "parcial"
    }

    // Expiry check
    if (expiryReal && realValidityInfo) {
      if (realValidityInfo.daysUntilExpiry < currentItem.minValidityDays) {
        issues.push("expiry-critical")
        severity = "critico"
      } else if (realValidityInfo.daysUntilExpiry < proposedValidityInfo.daysUntilExpiry) {
        issues.push("expiry-divergent")
        if (severity === "conforme") severity = "parcial"
      }
    }

    // Temperature check
    if (tempReceived) {
      const temp = Number.parseFloat(tempReceived)
      if (temp < 2 || temp > 8) {
        issues.push("temperature")
        if (temp < -2 || temp > 12) {
          severity = "critico"
        } else if (severity === "conforme") {
          severity = "parcial"
        }
      }
    }

    // Package condition
    if (packageCondition === "Danificada") {
      issues.push("package-damaged")
      severity = "critico"
    } else if (packageCondition === "Avariada") {
      issues.push("package-damaged-minor")
      if (severity === "conforme") severity = "parcial"
    }

    return { issues, severity }
  }

  const compliance = getComplianceStatus()

  const handleScanLabel = () => {
    toast.info("Ativando câmera para scan...")
    // Simulate scanning
    setTimeout(() => {
      setScannedLabel(currentItem.lotProposed)
      toast.success(`Etiqueta identificada: Item ${currentItemIndex + 1} - ${currentItem.description}`)
    }, 1000)
  }

  const handleReceive = () => {
    if (!qtyReceived || !lotReal || !expiryReal) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (compliance.severity === "parcial") {
      setShowAcceptDeviationModal(true)
      return
    }

    completeReceive()
  }

  const completeReceive = () => {
    toast.success("Item recebido com sucesso!")
    setShowAcceptDeviationModal(false)
    resetForm()

    if (currentItemIndex < activeItems.length - 1) {
      setTimeout(() => {
        if (confirm("Ir para o próximo item?")) {
          setCurrentItemIndex(currentItemIndex + 1)
        }
      }, 500)
    } else {
      setTimeout(() => {
        setShowFinalizeModal(true)
      }, 500)
    }
  }

  const handleAcceptWithDeviation = () => {
    if (!deviationJustification) {
      toast.error("Justificativa obrigatória")
      return
    }

    toast.success("Item aceito com desvio")
    setShowAcceptDeviationModal(false)
    resetForm()

    if (currentItemIndex < activeItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
    } else {
      setShowFinalizeModal(true)
    }
  }

  const handleQuarantine = () => {
    if (quarantineReasons.length === 0 || !quarantineObs) {
      toast.error("Selecione ao menos um motivo e preencha as observações")
      return
    }

    toast.success("Item enviado para quarentena")
    setShowQuarantineModal(false)
    resetForm()

    if (currentItemIndex < activeItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
    } else {
      setShowFinalizeModal(true)
    }
  }

  const handleReject = () => {
    if (rejectReasons.length === 0 || rejectJustification.length < 50) {
      toast.error("Selecione motivos e forneça justificativa detalhada (mínimo 50 caracteres)")
      return
    }

    if (!confirm("Confirmar rejeição do item? Esta ação não pode ser desfeita.")) {
      return
    }

    toast.success("Item rejeitado. Fornecedor será notificado.")
    setShowRejectModal(false)
    resetForm()

    if (currentItemIndex < activeItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
    } else {
      setShowFinalizeModal(true)
    }
  }

  const handleFinalize = () => {
    if (!confirmReview) {
      toast.error("Confirme que revisou todos os itens")
      return
    }

    toast.success("Conferência finalizada com sucesso!")
    router.push("/recebimento/aguardando")
  }

  const resetForm = () => {
    setQtyReceived("")
    setLotReal("")
    setExpiryReal("")
    setTempReceived("")
    setPackageCondition("Íntegra")
    setDamageDescription("")
    setObservations("")
    setScannedLabel("")
    setDeviationJustification("")
    setNotifyQA(false)
  }

  const progressPercent = ((currentItemIndex + 1) / activeItems.length) * 100

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Breadcrumb */}
      <div className="px-6 pt-4 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/recebimento" className="hover:text-imperial">
          Recebimento
        </Link>
        {" / "}
        <Link href="/recebimento/aguardando" className="hover:text-imperial">
          Aguardando
        </Link>
        {" / "}
        <span className="text-foreground">Conferência Física</span>
      </div>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 flex gap-4 p-6 overflow-hidden">
        {/* LEFT PANEL - 25% */}
        <div className="w-1/4 flex flex-col gap-4 overflow-y-auto">
          {/* PO Header */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">PO {activePO.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Fornecedor:</span>
                <div className="font-medium">{activePO.supplier}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Check-in:</span>
                <div className="font-medium">{activePO.checkinDate}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Temperatura Veículo:</span>
                <Badge className="bg-twilight text-imperial ml-2">
                  <Thermometer className="w-3 h-3 mr-1" />
                  {activePO.vehicleTemp}°C
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Progresso da Conferência</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercent} className="mb-2" />
              <div className="text-sm text-muted-foreground">
                {currentItemIndex + 1} de {activeItems.length} itens conferidos ({Math.round(progressPercent)}%)
              </div>
            </CardContent>
          </Card>

          {/* Items Navigation */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Itens do PO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    index === currentItemIndex
                      ? "border-imperial bg-twilight"
                      : "border-gray-200 hover:bg-gray-50",
                  )}
                  onClick={() => setCurrentItemIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-lg">
                      {item.status === "pending" && "⚪"}
                      {item.status === "in-progress" && "🔵"}
                      {item.status === "conforme" && "✅"}
                      {item.status === "divergent" && "⚠️"}
                      {item.status === "rejected" && "❌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.description}</div>
                      <div className="text-xs text-muted-foreground">{item.sku}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Current Item - Proposed Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Item {currentItemIndex + 1} de {activeItems.length} - Dados Propostos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <img
                  src={currentItem.image || "/placeholder.svg"}
                  alt={currentItem.description}
                  className="w-20 h-20 rounded-lg object-cover border"
                />
                <div className="flex-1">
                  <div className="font-mono text-sm font-bold">{currentItem.sku}</div>
                  <div className="text-sm font-medium">{currentItem.description}</div>
                  <Badge className="mt-1 bg-blue-100 text-blue-800">{currentItem.category}</Badge>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-1">Quantidade Prevista</div>
                <div className="font-bold text-lg">
                  {currentItem.qtyExpected} {currentItem.unit}
                </div>
              </div>

              <div className="p-3 bg-twilight rounded-lg border border-twilight">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-imperial" />
                  <div className="text-xs font-semibold text-imperial">LOTE PROPOSTO</div>
                </div>
                <div className="font-mono font-bold text-imperial">{currentItem.lotProposed}</div>
              </div>

              <div className="p-3 bg-twilight rounded-lg border border-twilight">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-imperial" />
                  <div className="text-xs font-semibold text-imperial">VALIDADE PROPOSTA</div>
                </div>
                <div className="font-bold text-imperial">
                  {new Date(currentItem.expiryProposed).toLocaleDateString("pt-BR")}
                </div>
                <div className="text-xs text-imperial mt-1">
                  {proposedValidityInfo.daysUntilExpiry} dias até vencer ({proposedValidityInfo.percentShelfLife}% da
                  vida útil)
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-1">Validade Mínima Aceitável</div>
                <div className="text-sm font-medium">
                  {currentItem.minValidityDays} dias ou {currentItem.minValidityPercent}% da vida útil
                </div>
              </div>

              {currentItem.datasheet && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-2">Datasheet/CoA Anexado</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CENTER PANEL - 50% */}
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
          {/* Scan Label */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Scan da Etiqueta Provisória</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <Button onClick={handleScanLabel} className="bg-imperial hover:bg-imperial">
                  <Camera className="w-4 h-4 mr-2" />
                  Ativar Câmera para Scan
                </Button>
                <p className="text-sm text-muted-foreground mt-3">ou</p>
                <Input
                  placeholder="Cole ou digite o código da etiqueta"
                  value={scannedLabel}
                  onChange={(e) => setScannedLabel(e.target.value)}
                  className="mt-3 max-w-md mx-auto"
                />
              </div>
              {scannedLabel && (
                <div className="flex items-center gap-2 p-3 bg-twilight border border-twilight rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-imperial" />
                  <span className="text-sm text-imperial">
                    Etiqueta identificada: Item {currentItemIndex + 1} - {currentItem.description}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real Data Entry */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Dados Recebidos (Entrada Manual)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qtyReceived" className="text-base font-semibold">
                  Quantidade Recebida <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="qtyReceived"
                    type="number"
                    placeholder="0"
                    value={qtyReceived}
                    onChange={(e) => setQtyReceived(e.target.value)}
                    className="text-lg font-bold"
                  />
                  <div className="flex items-center px-4 bg-gray-100 rounded-md text-sm font-medium">
                    {currentItem.unit}
                  </div>
                </div>
                {qtyReceived && Number.parseFloat(qtyReceived) !== currentItem.qtyExpected && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Quantidade divergente: Previsto {currentItem.qtyExpected}, Recebido {qtyReceived}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="lotReal" className="text-base font-semibold">
                  Lote Real <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lotReal"
                  placeholder="Digite o lote da embalagem"
                  value={lotReal}
                  onChange={(e) => setLotReal(e.target.value)}
                  className="mt-2 font-mono text-lg font-bold"
                />
                {lotReal && (
                  <div className="mt-2">
                    {lotReal === currentItem.lotProposed ? (
                      <Badge className="bg-twilight text-imperial">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        CONFORME
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        DIVERGENTE
                      </Badge>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Confira no rótulo da embalagem</p>
              </div>

              <div>
                <Label htmlFor="expiryReal" className="text-base font-semibold">
                  Validade Real (Data de Vencimento) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expiryReal"
                  type="date"
                  value={expiryReal}
                  onChange={(e) => setExpiryReal(e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
                {realValidityInfo && (
                  <div className="mt-2 space-y-1">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Dias até vencer:</span>{" "}
                      <span className="font-medium">{realValidityInfo.daysUntilExpiry} dias</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">% da vida útil:</span>{" "}
                      <span className="font-medium">{realValidityInfo.percentShelfLife}%</span>
                    </div>
                    <div className="mt-2">
                      {realValidityInfo.daysUntilExpiry >= currentItem.minValidityDays ? (
                        <Badge className="bg-twilight text-imperial">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          CONFORME
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          ABAIXO DO MÍNIMO
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Confira no rótulo da embalagem</p>
              </div>

              <div>
                <Label htmlFor="tempReceived">Temperatura no Recebimento (°C)</Label>
                <div className="relative mt-2">
                  <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="tempReceived"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 5.5"
                    value={tempReceived}
                    onChange={(e) => setTempReceived(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {tempReceived && (
                  <div className="mt-2">
                    {(() => {
                      const temp = Number.parseFloat(tempReceived)
                      if (temp >= 2 && temp <= 8) {
                        return (
                          <Badge className="bg-twilight text-imperial">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Conforme (2-8°C)
                          </Badge>
                        )
                      } else if (temp >= -2 && temp <= 12) {
                        return (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Fora da Faixa
                          </Badge>
                        )
                      } else {
                        return (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Crítico
                          </Badge>
                        )
                      }
                    })()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Aceitável: 2 a 8°C</p>
              </div>

              <div>
                <Label>Condições da Embalagem</Label>
                <RadioGroup value={packageCondition} onValueChange={setPackageCondition} className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Íntegra" id="integra" />
                    <Label htmlFor="integra" className="font-normal cursor-pointer">
                      Íntegra (sem avarias)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Avariada" id="avariada" />
                    <Label htmlFor="avariada" className="font-normal cursor-pointer">
                      Avariada (pequenas avarias)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Danificada" id="danificada" />
                    <Label htmlFor="danificada" className="font-normal cursor-pointer">
                      Danificada (avarias graves)
                    </Label>
                  </div>
                </RadioGroup>

                {packageCondition !== "Íntegra" && (
                  <Textarea
                    placeholder="Descreva as avarias"
                    value={damageDescription}
                    onChange={(e) => setDamageDescription(e.target.value)}
                    className="mt-3"
                    rows={2}
                  />
                )}
              </div>

              <div>
                <Label>Upload de Evidências</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-imperial transition-colors cursor-pointer">
                  <input type="file" accept="image/*,application/pdf" multiple className="hidden" id="evidences" />
                  <label htmlFor="evidences" className="cursor-pointer">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Clique ou arraste arquivos aqui</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Foto do Rótulo *, CoA Físico, Fotos da Embalagem
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="observations">Observações do Item</Label>
                <Textarea
                  id="observations"
                  placeholder="Observações sobre este item específico"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={2}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL - 25% */}
        <div className="w-1/4 flex flex-col gap-4 overflow-y-auto">
          {/* Compliance Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Análise de Conformidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Traffic Light */}
              <div className="text-center p-4 rounded-lg border-2">
                {compliance.severity === "conforme" && (
                  <div className="space-y-2">
                    <div className="text-4xl">🟢</div>
                    <div className="font-bold text-imperial">TOTALMENTE CONFORME</div>
                  </div>
                )}
                {compliance.severity === "parcial" && (
                  <div className="space-y-2">
                    <div className="text-4xl">🟡</div>
                    <div className="font-bold text-yellow-700">PARCIALMENTE CONFORME</div>
                  </div>
                )}
                {compliance.severity === "critico" && (
                  <div className="space-y-2">
                    <div className="text-4xl">🔴</div>
                    <div className="font-bold text-red-700">NÃO CONFORME</div>
                  </div>
                )}
              </div>

              {/* Detailed Analysis */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="font-semibold min-w-[100px]">1. Quantidade</div>
                  <div className="flex-1">
                    {qtyReceived && Number.parseFloat(qtyReceived) === currentItem.qtyExpected ? (
                      <Badge className="bg-twilight text-imperial">✅ Conforme</Badge>
                    ) : qtyReceived ? (
                      <Badge className="bg-yellow-100 text-yellow-800">⚠️ Divergente</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="font-semibold min-w-[100px]">2. Lote</div>
                  <div className="flex-1">
                    {lotReal && lotReal === currentItem.lotProposed ? (
                      <Badge className="bg-twilight text-imperial">✅ Conforme</Badge>
                    ) : lotReal ? (
                      <Badge className="bg-yellow-100 text-yellow-800">⚠️ Divergente</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="font-semibold min-w-[100px]">3. Validade</div>
                  <div className="flex-1">
                    {realValidityInfo ? (
                      realValidityInfo.daysUntilExpiry >= currentItem.minValidityDays ? (
                        <Badge className="bg-twilight text-imperial">✅ Conforme</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">❌ Crítico</Badge>
                      )
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="font-semibold min-w-[100px]">4. Temperatura</div>
                  <div className="flex-1">
                    {tempReceived ? (
                      (() => {
                        const temp = Number.parseFloat(tempReceived)
                        if (temp >= 2 && temp <= 8) {
                          return <Badge className="bg-twilight text-imperial">✅ Conforme</Badge>
                        } else if (temp >= -2 && temp <= 12) {
                          return <Badge className="bg-yellow-100 text-yellow-800">⚠️ Fora da Faixa</Badge>
                        } else {
                          return <Badge className="bg-red-100 text-red-800">❌ Crítico</Badge>
                        }
                      })()
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="font-semibold min-w-[100px]">5. Embalagem</div>
                  <div className="flex-1">
                    {packageCondition === "Íntegra" ? (
                      <Badge className="bg-twilight text-imperial">✅ Íntegra</Badge>
                    ) : packageCondition === "Avariada" ? (
                      <Badge className="bg-yellow-100 text-yellow-800">⚠️ Avariada</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">❌ Danificada</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="font-semibold min-w-[100px]">6. Documentação</div>
                  <div className="flex-1">
                    <Badge className="bg-yellow-100 text-yellow-800">⚠️ Pendente</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Recommendation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recomendação do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              {compliance.severity === "conforme" && (
                <div className="text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-imperial" />
                  <p className="text-sm font-medium">Item conforme. Recomendado RECEBER.</p>
                </div>
              )}
              {compliance.severity === "parcial" && (
                <div className="text-center space-y-2">
                  <AlertTriangle className="w-12 h-12 mx-auto text-yellow-600" />
                  <p className="text-sm font-medium">Item com divergências menores. Análise necessária.</p>
                </div>
              )}
              {compliance.severity === "critico" && (
                <div className="text-center space-y-2">
                  <X className="w-12 h-12 mx-auto text-red-600" />
                  <p className="text-sm font-medium">Item NÃO CONFORME. Não recomendado receber.</p>
                  <div className="text-xs text-left space-y-1 mt-3">
                    {compliance.issues.includes("expiry-critical") && (
                      <div className="text-red-600">❌ Validade abaixo do mínimo aceitável</div>
                    )}
                    {compliance.issues.includes("temperature") && (
                      <div className="text-red-600">❌ Temperatura crítica</div>
                    )}
                    {compliance.issues.includes("package-damaged") && (
                      <div className="text-red-600">❌ Embalagem danificada</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full bg-imperial hover:bg-imperial"
                size="lg"
                onClick={handleReceive}
                disabled={!qtyReceived || !lotReal || !expiryReal}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                RECEBER
              </Button>

              <Button
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                size="lg"
                onClick={() => setShowAcceptDeviationModal(true)}
                disabled={!qtyReceived || !lotReal || !expiryReal || compliance.severity === "conforme"}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                ACEITAR COM DESVIO
              </Button>

              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="lg"
                onClick={() => setShowQuarantineModal(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                ENVIAR PARA QUARENTENA
              </Button>

              <Button className="w-full bg-red-600 hover:bg-red-700" size="lg" onClick={() => setShowRejectModal(true)}>
                <Ban className="w-4 h-4 mr-2" />
                REJEITAR
              </Button>

              <div className="pt-4 border-t space-y-2">
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  Pular Item
                </Button>
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar Conferência
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shortcuts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                Atalhos
                <Button variant="ghost" size="sm" onClick={() => setShowShortcutsModal(true)}>
                  <Keyboard className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 text-muted-foreground">
              <div>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> Próximo campo
              </div>
              <div>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+S</kbd> Salvar e próximo
              </div>
              <div>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Q</kbd> Quarentena
              </div>
              <div>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+R</kbd> Rejeitar
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentItemIndex(Math.max(0, currentItemIndex - 1))}
              disabled={currentItemIndex === 0}
              className="bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Item Anterior
            </Button>
            <div className="text-sm font-medium">
              Item {currentItemIndex + 1} de {activeItems.length}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentItemIndex(Math.min(activeItems.length - 1, currentItemIndex + 1))}
              disabled={currentItemIndex === activeItems.length - 1}
              className="bg-transparent"
            >
              Próximo Item
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm space-x-4">
              <span>✅ Conformes: 0</span>
              <span>⚠️ Com Desvio: 0</span>
              <span>🔴 Quarentena: 0</span>
              <span>❌ Rejeitados: 0</span>
              <span>⚪ Pendentes: {activeItems.length}</span>
            </div>
            <Button className="bg-imperial hover:bg-imperial" onClick={() => setShowFinalizeModal(true)}>
              Finalizar Conferência
            </Button>
          </div>
        </div>
      </div>

      {/* Accept with Deviation Modal */}
      <Dialog open={showAcceptDeviationModal} onOpenChange={setShowAcceptDeviationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aceitar Item com Desvio</DialogTitle>
            <DialogDescription>
              Os seguintes desvios foram detectados. Forneça uma justificativa para aceitar o item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="font-semibold text-sm mb-2">Desvios Detectados:</div>
              <ul className="text-sm space-y-1">
                {compliance.issues.map((issue) => (
                  <li key={issue}>⚠️ {issue}</li>
                ))}
              </ul>
            </div>

            <div>
              <Label htmlFor="deviationJustification">
                Justificativa do Aceite <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="deviationJustification"
                placeholder="Explique por que está aceitando o item com desvios..."
                value={deviationJustification}
                onChange={(e) => setDeviationJustification(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="notifyQA" checked={notifyQA} onCheckedChange={(checked) => setNotifyQA(!!checked)} />
              <Label htmlFor="notifyQA" className="font-normal cursor-pointer">
                Solicitar aprovação da QA
              </Label>
            </div>

            <div>
              <Label>Responsável pelo Aceite</Label>
              <Input value="João Silva (Recebimento)" disabled className="mt-2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDeviationModal(false)}>
              Cancelar
            </Button>
            <Button className="bg-yellow-600 hover:bg-yellow-700" onClick={handleAcceptWithDeviation}>
              Aceitar e Prosseguir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quarantine Modal */}
      <Dialog open={showQuarantineModal} onOpenChange={setShowQuarantineModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Item para Quarentena</DialogTitle>
            <DialogDescription>Selecione os motivos e forneça observações para a equipe de QA.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Motivos (selecione ao menos um)</Label>
              <div className="space-y-2">
                {[
                  "Validade abaixo do mínimo",
                  "Lote divergente",
                  "Temperatura fora da faixa",
                  "Embalagem avariada",
                  "Documentação incompleta",
                  "Suspeita de contaminação",
                  "Outros",
                ].map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <Checkbox
                      id={reason}
                      checked={quarantineReasons.includes(reason)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setQuarantineReasons([...quarantineReasons, reason])
                        } else {
                          setQuarantineReasons(quarantineReasons.filter((r) => r !== reason))
                        }
                      }}
                    />
                    <Label htmlFor={reason} className="font-normal cursor-pointer">
                      {reason}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="quarantineObs">
                Observações para QA <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="quarantineObs"
                placeholder="Descreva os problemas encontrados e o que a QA deve verificar..."
                value={quarantineObs}
                onChange={(e) => setQuarantineObs(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="quarantinePriority">Prioridade</Label>
              <select
                id="quarantinePriority"
                value={quarantinePriority}
                onChange={(e) => setQuarantinePriority(e.target.value)}
                className="w-full mt-2 px-3 py-2 border rounded-md"
              >
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="notifyQAImmediate" defaultChecked />
              <Label htmlFor="notifyQAImmediate" className="font-normal cursor-pointer">
                Notificar QA imediatamente
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuarantineModal(false)}>
              Cancelar
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleQuarantine}>
              Confirmar Quarentena
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Rejeitar Item
            </DialogTitle>
            <DialogDescription className="text-red-600">
              Este item NÃO será recebido e será devolvido ao fornecedor. Esta ação impacta o scorecard do fornecedor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">
                Motivos da Rejeição <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {[
                  "Produto vencido",
                  "Validade muito abaixo do aceitável",
                  "Lote incorreto/não autorizado",
                  "Produto errado (divergente do pedido)",
                  "Embalagem danificada/contaminada",
                  "Temperatura crítica",
                  "Quantidade muito divergente",
                  "Outros",
                ].map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <Checkbox
                      id={`reject-${reason}`}
                      checked={rejectReasons.includes(reason)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRejectReasons([...rejectReasons, reason])
                        } else {
                          setRejectReasons(rejectReasons.filter((r) => r !== reason))
                        }
                      }}
                    />
                    <Label htmlFor={`reject-${reason}`} className="font-normal cursor-pointer">
                      {reason}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="rejectJustification">
                Justificativa Detalhada da Rejeição <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejectJustification"
                placeholder="Forneça uma justificativa detalhada (mínimo 50 caracteres)..."
                value={rejectJustification}
                onChange={(e) => setRejectJustification(e.target.value)}
                rows={4}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">{rejectJustification.length}/50 caracteres</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifySupplier"
                  checked={notifySupplier}
                  onCheckedChange={(checked) => setNotifySupplier(!!checked)}
                />
                <Label htmlFor="notifySupplier" className="font-normal cursor-pointer">
                  Notificar fornecedor imediatamente <span className="text-red-500">*</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generateReturn"
                  checked={generateReturn}
                  onCheckedChange={(checked) => setGenerateReturn(!!checked)}
                />
                <Label htmlFor="generateReturn" className="font-normal cursor-pointer">
                  Gerar ordem de devolução automática
                </Label>
              </div>
            </div>

            <div>
              <Label>Responsável pela Rejeição</Label>
              <Input value="João Silva (Recebimento)" disabled className="mt-2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleReject}>
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finalize Modal */}
      <Dialog open={showFinalizeModal} onOpenChange={setShowFinalizeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Finalizar Conferência do PO #{activePO.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Total de Itens</div>
                <div className="text-2xl font-bold">{activeItems.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">✅ Recebidos Conformes</div>
                <div className="text-2xl font-bold text-imperial">0</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">⚠️ Aceitos com Desvio</div>
                <div className="text-2xl font-bold text-yellow-600">0</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">🔴 Em Quarentena</div>
                <div className="text-2xl font-bold text-orange-600">0</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">❌ Rejeitados</div>
                <div className="text-2xl font-bold text-red-600">0</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">⚪ Não Conferidos</div>
                <div className="text-2xl font-bold text-gray-600">{activeItems.length}</div>
              </div>
            </div>

            {activeItems.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mb-2" />
                <p className="text-sm font-medium text-yellow-800">
                  {activeItems.length} itens ainda não foram conferidos
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="finalizeAnyway" name="finalizeOption" defaultChecked />
                    <label htmlFor="finalizeAnyway" className="text-sm cursor-pointer">
                      Finalizar mesmo assim (itens pendentes ficarão aguardando)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="goBack" name="finalizeOption" />
                    <label htmlFor="goBack" className="text-sm cursor-pointer">
                      Voltar e conferir pendentes
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="finalObs">Observações Finais da Conferência</Label>
              <Textarea
                id="finalObs"
                placeholder="Observações gerais sobre a conferência..."
                value={finalObs}
                onChange={(e) => setFinalObs(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirmReview"
                checked={confirmReview}
                onCheckedChange={(checked) => setConfirmReview(!!checked)}
              />
              <Label htmlFor="confirmReview" className="font-normal cursor-pointer">
                Confirmo que revisei todos os itens conferidos
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalizeModal(false)}>
              Cancelar
            </Button>
            <Button className="bg-imperial hover:bg-imperial" onClick={handleFinalize}>
              Finalizar Conferência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shortcuts Modal */}
      <Dialog open={showShortcutsModal} onOpenChange={setShowShortcutsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atalhos de Teclado</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Avançar para próximo campo</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Enter</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Salvar e próximo item</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+S</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Enviar para quarentena</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+Q</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Rejeitar</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+R</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cancelar ação atual</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Esc</kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}




