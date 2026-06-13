"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Download,
  FileText,
  AlertCircle,
  Thermometer,
  Plus,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

// Mock data
const mockItem = {
  id: "1",
  sku: "FRS-045",
  description: "Filé de Frango Congelado - 1kg",
  category: "Congelado",
  lot: "LOT2025-001",
  proposedLot: "LOT2025-001",
  expiryDate: "2025-02-05",
  proposedExpiryDate: "2025-02-05",
  daysToExpiry: 15,
  quantity: 500,
  currentLocation: "Quarentena - Zona A",
  entryDate: "2025-01-18T08:30:00",
  hoursInQuarantine: 72,
  ncId: "NC-2025-045",
  ncType: "Temperatura Inadequada",
  ncSeverity: "Grave",
  ncDescription: "Temperatura registrada de 15°C durante o recebimento, acima da faixa permitida de 2-8°C.",
  po: "PO-2025-123",
  supplier: "Frigorífico Premium S.A.",
  supplierScore: 88,
  receivedDate: "2025-01-18",
  receivedTemp: "15°C",
  shelfLife: 180,
  minAcceptableValidity: "90 dias ou 50%",
  storageTemp: "2-8°C",
}

export function QualityInspectionContent() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Form state
  const [visualChecks, setVisualChecks] = useState({
    intactPackage: false,
    legibleLabel: false,
    lotIdentified: false,
    expiryIdentified: false,
    noContamination: false,
    noLeaks: false,
    noDamage: false,
    normalAppearance: false,
  })

  const [documentalChecks, setDocumentalChecks] = useState({
    coaPresent: false,
    lotMatches: false,
    expiryMatches: false,
    certificationsValid: false,
    microbiological: false,
    physicochemical: false,
  })

  const [visualObservations, setVisualObservations] = useState("")
  const [documentalObservations, setDocumentalObservations] = useState("")
  const [tempTest, setTempTest] = useState("")
  const [phTest, setPhTest] = useState("")
  const [weightTest, setWeightTest] = useState("")
  const [validityAssessment, setValidityAssessment] = useState("")
  const [lotOnLabel, setLotOnLabel] = useState("")
  const [lotOnCoa, setLotOnCoa] = useState("")
  const [safetyRisk, setSafetyRisk] = useState([5])
  const [qualityRisk, setQualityRisk] = useState([5])
  const [financialRisk, setFinancialRisk] = useState([5])
  const [technicalOpinion, setTechnicalOpinion] = useState("")
  const [recommendations, setRecommendations] = useState("")
  const [decision, setDecision] = useState("")
  const [restrictions, setRestrictions] = useState({
    internalOnly: false,
    discountSale: false,
    secondary: false,
    immediate: false,
    other: false,
  })
  const [restrictionsJustification, setRestrictionsJustification] = useState("")
  const [rejectionAction, setRejectionAction] = useState("")
  const [rejectionJustification, setRejectionJustification] = useState("")
  const [notifySupplier, setNotifySupplier] = useState(false)

  const overallRisk = Math.round((safetyRisk[0] + qualityRisk[0] + financialRisk[0]) / 3)

  const getRiskLevel = (risk: number) => {
    if (risk <= 3) return { label: "Baixo", color: "text-imperial", icon: "🟢" }
    if (risk <= 6) return { label: "Médio", color: "text-yellow-600", icon: "🟡" }
    if (risk <= 8) return { label: "Alto", color: "text-orange-600", icon: "🟠" }
    return { label: "Crítico", color: "text-red-600", icon: "🔴" }
  }

  const riskInfo = getRiskLevel(overallRisk)

  const handleSaveProgress = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Progresso salvo",
        description: "Você pode retomar a inspeção mais tarde.",
      })
    }, 1000)
  }

  const handleFinalize = () => {
    // Validate
    if (!technicalOpinion || technicalOpinion.length < 100) {
      toast({
        title: "Erro de validação",
        description: "O parecer técnico deve ter pelo menos 100 caracteres.",
        variant: "destructive",
      })
      return
    }

    if (!decision) {
      toast({
        title: "Erro de validação",
        description: "Selecione uma decisão final.",
        variant: "destructive",
      })
      return
    }

    if (decision === "approve-restriction" && !restrictionsJustification) {
      toast({
        title: "Erro de validação",
        description: "Justifique as restrições de uso.",
        variant: "destructive",
      })
      return
    }

    if (decision === "reject" && !rejectionJustification) {
      toast({
        title: "Erro de validação",
        description: "Justifique a reprovação.",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmFinalize = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowConfirmDialog(false)
      toast({
        title: "Inspeção finalizada!",
        description: "Laudo gerado com sucesso.",
      })
      // Redirect would happen here
    }, 1500)
  }

  const visualChecksCount = Object.values(visualChecks).filter(Boolean).length
  const documentalChecksCount = Object.values(documentalChecks).filter(Boolean).length
  const totalChecksCount = visualChecksCount + documentalChecksCount
  const totalChecks = Object.keys(visualChecks).length + Object.keys(documentalChecks).length
  const checklistPercentage = Math.round((totalChecksCount / totalChecks) * 100)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/qualidade/quarentena" className="hover:text-imperial">
          Qualidade
        </Link>
        {" / "}
        <span className="text-foreground">Inspeção QA</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Inspeção de Qualidade</h1>
          <p className="text-muted-foreground mt-1">Código: INSP-{mockItem.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveProgress} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Progresso
          </Button>
          <Button className="bg-imperial hover:bg-imperial" onClick={handleFinalize} disabled={isSaving}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalizar Inspeção
          </Button>
        </div>
      </div>

      {/* 2-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT PANEL - 40% */}
        <div className="lg:col-span-2 space-y-4">
          {/* Item Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-semibold">{mockItem.sku}</div>
                <div className="text-sm text-muted-foreground">{mockItem.description}</div>
                <Badge variant="outline" className="mt-1">{mockItem.category}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Lote:</span>
                  <div className="font-mono font-medium">{mockItem.lot}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Validade:</span>
                  <div className="font-medium">{new Date(mockItem.expiryDate).toLocaleDateString("pt-BR")}</div>
                  <div className={`text-xs ${mockItem.daysToExpiry <= 7 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                    {mockItem.daysToExpiry} dias restantes
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Quantidade:</span>
                  <div className="font-medium">{mockItem.quantity}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Local Atual:</span>
                  <div className="font-medium text-xs">{mockItem.currentLocation}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quarantine History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico da Quarentena</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data/Hora Entrada:</span>
                <span className="font-medium">{new Date(mockItem.entryDate).toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tempo em Quarentena:</span>
                <span className="font-medium text-orange-600">{mockItem.hoursInQuarantine}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Motivo:</span>
                <Badge variant="outline">{mockItem.ncType}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* NC Associated */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Não Conformidade Associada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Código NC:</span>
                <Link href={`/nao-conformidades/${mockItem.ncId}`} className="text-imperial hover:underline text-sm font-medium">
                  {mockItem.ncId}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <Badge variant="outline" className="text-xs">{mockItem.ncType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Severidade:</span>
                <Badge className="bg-orange-500 text-xs">{mockItem.ncSeverity}</Badge>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">{mockItem.ncDescription}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                <Eye className="w-4 h-4 mr-2" />
                Ver NC Completa
              </Button>
            </CardContent>
          </Card>

          {/* Receiving Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Recebimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PO:</span>
                <Link href={`/compras/pos/${mockItem.po}`} className="text-imperial hover:underline font-medium">
                  #{mockItem.po}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fornecedor:</span>
                <span className="font-medium">{mockItem.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score:</span>
                <Badge className="bg-blue-100 text-blue-800">{mockItem.supplierScore}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperatura:</span>
                <span className="font-medium text-red-600">{mockItem.receivedTemp}</span>
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Especificações do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vida Útil Total:</span>
                <span className="font-medium">{mockItem.shelfLife} dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Validade Mín. Aceitável:</span>
                <span className="font-medium">{mockItem.minAcceptableValidity}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Condições de Armazenagem:</span>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-3 h-3" />
                    <span className="text-xs">Temperatura: {mockItem.storageTemp}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL - 60% */}
        <div className="lg:col-span-3 space-y-4">
          {/* Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identificação da Inspeção</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código da Inspeção</Label>
                <Input value={`INSP-${mockItem.id}`} readOnly />
              </div>
              <div>
                <Label>Inspetor</Label>
                <Input value="QA User" readOnly />
              </div>
              <div>
                <Label>Data/Hora Início</Label>
                <Input value={new Date().toLocaleString("pt-BR")} readOnly />
              </div>
              <div>
                <Label>Prioridade</Label>
                <Badge className="bg-red-500">🔴 Urgente</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Inspection Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Checklist de Inspeção
                <span className="text-sm font-normal text-muted-foreground">
                  {checklistPercentage}% completo
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visual Analysis */}
              <div>
                <h3 className="font-semibold mb-3">Análise Visual</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="intactPackage"
                      checked={visualChecks.intactPackage}
                      onCheckedChange={(checked) =>
                        setVisualChecks({ ...visualChecks, intactPackage: checked as boolean })
                      }
                    />
                    <label htmlFor="intactPackage" className="text-sm cursor-pointer">
                      Embalagem íntegra
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="legibleLabel"
                      checked={visualChecks.legibleLabel}
                      onCheckedChange={(checked) =>
                        setVisualChecks({ ...visualChecks, legibleLabel: checked as boolean })
                      }
                    />
                    <label htmlFor="legibleLabel" className="text-sm cursor-pointer">
                      Rótulo legível
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="lotIdentified"
                      checked={visualChecks.lotIdentified}
                      onCheckedChange={(checked) =>
                        setVisualChecks({ ...visualChecks, lotIdentified: checked as boolean })
                      }
                    />
                    <label htmlFor="lotIdentified" className="text-sm cursor-pointer">
                      Lote claramente identificado
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="expiryIdentified"
                      checked={visualChecks.expiryIdentified}
                      onCheckedChange={(checked) =>
                        setVisualChecks({ ...visualChecks, expiryIdentified: checked as boolean })
                      }
                    />
                    <label htmlFor="expiryIdentified" className="text-sm cursor-pointer">
                      Validade claramente identificada
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="noContamination"
                      checked={visualChecks.noContamination}
                      onCheckedChange={(checked) =>
                        setVisualChecks({ ...visualChecks, noContamination: checked as boolean })
                      }
                    />
                    <label htmlFor="noContamination" className="text-sm cursor-pointer">
                      Ausência de sinais de contaminação
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="noLeaks"
                      checked={visualChecks.noLeaks}
                      onCheckedChange={(checked) =>
                        setVisualChecks({ ...visualChecks, noLeaks: checked as boolean })
                      }
                    />
                    <label htmlFor="noLeaks" className="text-sm cursor-pointer">
                      Ausência de vazamentos
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="noDamage"
                      checked={visualChecks.noDamage}
                      onCheckedChange={(checked) =>
                        setVisualChecks({ ...visualChecks, noDamage: checked as boolean })
                      }
                    />
                    <label htmlFor="noDamage" className="text-sm cursor-pointer">
                      Ausência de amassados/perfurações
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="normalAppearance"
                      checked={visualChecks.normalAppearance}
                      onCheckedChange={(checked) =>
                        setVisualChecks({ ...visualChecks, normalAppearance: checked as boolean })
                      }
                    />
                    <label htmlFor="normalAppearance" className="text-sm cursor-pointer">
                      Cor/aspecto dentro do esperado
                    </label>
                  </div>
                </div>
                <div className="mt-3">
                  <Label htmlFor="visualObs">Observações Visuais</Label>
                  <Textarea
                    id="visualObs"
                    placeholder="Descreva suas observações visuais..."
                    value={visualObservations}
                    onChange={(e) => setVisualObservations(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Documental Analysis */}
              <div>
                <h3 className="font-semibold mb-3">Análise Documental</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="coaPresent"
                      checked={documentalChecks.coaPresent}
                      onCheckedChange={(checked) =>
                        setDocumentalChecks({ ...documentalChecks, coaPresent: checked as boolean })
                      }
                    />
                    <label htmlFor="coaPresent" className="text-sm cursor-pointer">
                      Datasheet/CoA presente e válido
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="lotMatches"
                      checked={documentalChecks.lotMatches}
                      onCheckedChange={(checked) =>
                        setDocumentalChecks({ ...documentalChecks, lotMatches: checked as boolean })
                      }
                    />
                    <label htmlFor="lotMatches" className="text-sm cursor-pointer">
                      Lote no CoA coincide com embalagem
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="expiryMatches"
                      checked={documentalChecks.expiryMatches}
                      onCheckedChange={(checked) =>
                        setDocumentalChecks({ ...documentalChecks, expiryMatches: checked as boolean })
                      }
                    />
                    <label htmlFor="expiryMatches" className="text-sm cursor-pointer">
                      Validade no CoA coincide com embalagem
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="certificationsValid"
                      checked={documentalChecks.certificationsValid}
                      onCheckedChange={(checked) =>
                        setDocumentalChecks({ ...documentalChecks, certificationsValid: checked as boolean })
                      }
                    />
                    <label htmlFor="certificationsValid" className="text-sm cursor-pointer">
                      Certificações em dia
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="microbiological"
                      checked={documentalChecks.microbiological}
                      onCheckedChange={(checked) =>
                        setDocumentalChecks({ ...documentalChecks, microbiological: checked as boolean })
                      }
                    />
                    <label htmlFor="microbiological" className="text-sm cursor-pointer">
                      Laudos microbiológicos (se aplicável)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="physicochemical"
                      checked={documentalChecks.physicochemical}
                      onCheckedChange={(checked) =>
                        setDocumentalChecks({ ...documentalChecks, physicochemical: checked as boolean })
                      }
                    />
                    <label htmlFor="physicochemical" className="text-sm cursor-pointer">
                      Análises físico-químicas (se aplicável)
                    </label>
                  </div>
                </div>
                <div className="mt-3">
                  <Label htmlFor="docObs">Observações Documentais</Label>
                  <Textarea
                    id="docObs"
                    placeholder="Descreva suas observações documentais..."
                    value={documentalObservations}
                    onChange={(e) => setDocumentalObservations(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tests Performed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Testes Realizados
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Teste
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Temperatura Interna (°C)</Label>
                  <div className="text-xs text-muted-foreground mb-1">Esperado: 2-8°C</div>
                  <Input
                    type="number"
                    placeholder="Medido"
                    value={tempTest}
                    onChange={(e) => setTempTest(e.target.value)}
                  />
                </div>
                <div>
                  <Label>pH</Label>
                  <div className="text-xs text-muted-foreground mb-1">Esperado: 4.0-6.0</div>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Medido"
                    value={phTest}
                    onChange={(e) => setPhTest(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Peso (g)</Label>
                  <div className="text-xs text-muted-foreground mb-1">Esperado: 1000g ±5%</div>
                  <Input
                    type="number"
                    placeholder="Medido"
                    value={weightTest}
                    onChange={(e) => setWeightTest(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validity Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Análise de Validade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Validade Real:</span>
                  <div className="font-medium">{new Date(mockItem.expiryDate).toLocaleDateString("pt-BR")}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Dias até Vencer:</span>
                  <div className="font-medium">{mockItem.daysToExpiry} dias</div>
                </div>
                <div>
                  <span className="text-muted-foreground">% Vida Útil Restante:</span>
                  <div className="font-medium">{Math.round((mockItem.daysToExpiry / mockItem.shelfLife) * 100)}%</div>
                </div>
              </div>
              <div>
                <Label htmlFor="validityAssessment">Avaliação da Validade *</Label>
                <Textarea
                  id="validityAssessment"
                  placeholder="A validade é adequada para comercialização/uso?"
                  value={validityAssessment}
                  onChange={(e) => setValidityAssessment(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Traceability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rastreabilidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lotLabel">Lote no Rótulo</Label>
                  <Input
                    id="lotLabel"
                    placeholder="Digite o lote conforme rótulo"
                    value={lotOnLabel}
                    onChange={(e) => setLotOnLabel(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lotCoa">Lote no CoA</Label>
                  <Input
                    id="lotCoa"
                    placeholder="Digite o lote conforme CoA"
                    value={lotOnCoa}
                    onChange={(e) => setLotOnCoa(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Lote no Sistema</Label>
                <Input value={mockItem.lot} readOnly />
              </div>
              {lotOnLabel && lotOnCoa && (
                <div className="flex items-center gap-2">
                  {lotOnLabel === lotOnCoa && lotOnLabel === mockItem.lot ? (
                    <Badge className="bg-twilight text-imperial">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Todos os lotes coincidem
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Divergência de lotes detectada
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Análise de Risco</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Risco à Segurança Alimentar</Label>
                  <span className="text-sm font-semibold">{safetyRisk[0]}</span>
                </div>
                <Slider value={safetyRisk} onValueChange={setSafetyRisk} max={10} step={1} />
                <p className="text-xs text-muted-foreground mt-1">
                  0 = Nenhum risco | 10 = Risco crítico
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label>Risco à Qualidade do Produto</Label>
                  <span className="text-sm font-semibold">{qualityRisk[0]}</span>
                </div>
                <Slider value={qualityRisk} onValueChange={setQualityRisk} max={10} step={1} />
                <p className="text-xs text-muted-foreground mt-1">
                  0 = Qualidade total | 10 = Qualidade comprometida
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label>Risco de Perda Financeira</Label>
                  <span className="text-sm font-semibold">{financialRisk[0]}</span>
                </div>
                <Slider value={financialRisk} onValueChange={setFinancialRisk} max={10} step={1} />
                <p className="text-xs text-muted-foreground mt-1">
                  0 = Nenhuma perda | 10 = Perda total
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Classificação de Risco Geral:</span>
                  <Badge className={`${riskInfo.color} bg-transparent border text-lg`}>
                    {riskInfo.icon} {riskInfo.label} ({overallRisk})
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conclusion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conclusão da Inspeção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="technicalOpinion">Parecer Técnico *</Label>
                <Textarea
                  id="technicalOpinion"
                  placeholder="Descreva sua conclusão técnica sobre o item inspecionado... (mínimo 100 caracteres)"
                  value={technicalOpinion}
                  onChange={(e) => setTechnicalOpinion(e.target.value)}
                  rows={5}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {technicalOpinion.length}/100 caracteres mínimos
                </div>
              </div>

              <div>
                <Label htmlFor="recommendations">Recomendações</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Recomendações para o fornecedor, processo, etc..."
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Final Decision */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Decisão Final *</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={decision} onValueChange={setDecision}>
                <div className="space-y-4">
                  {/* Approve */}
                  <div className="border-2 border-twilight rounded-lg p-4 hover:border-twilight transition-colors">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="approve" id="approve" className="mt-1" />
                      <label htmlFor="approve" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-imperial" />
                          <span className="font-semibold text-imperial">APROVAR</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aprovar e Liberar para Estoque - Item está conforme e pode ser usado/comercializado normalmente
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Approve with Restriction */}
                  <div className="border-2 border-yellow-200 rounded-lg p-4 hover:border-yellow-400 transition-colors">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="approve-restriction" id="approve-restriction" className="mt-1" />
                      <label htmlFor="approve-restriction" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <span className="font-semibold text-yellow-700">APROVAR COM RESTRIÇÃO</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aprovar com Restrições de Uso - Item pode ser usado mas com limitações específicas
                        </p>
                      </label>
                    </div>

                    {decision === "approve-restriction" && (
                      <div className="mt-4 pl-8 space-y-3">
                        <div>
                          <Label>Restrições de Uso *</Label>
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="internal"
                                checked={restrictions.internalOnly}
                                onCheckedChange={(checked) =>
                                  setRestrictions({ ...restrictions, internalOnly: checked as boolean })
                                }
                              />
                              <label htmlFor="internal" className="text-sm cursor-pointer">
                                Uso apenas interno (não comercializar)
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="discount"
                                checked={restrictions.discountSale}
                                onCheckedChange={(checked) =>
                                  setRestrictions({ ...restrictions, discountSale: checked as boolean })
                                }
                              />
                              <label htmlFor="discount" className="text-sm cursor-pointer">
                                Venda com desconto
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="secondary"
                                checked={restrictions.secondary}
                                onCheckedChange={(checked) =>
                                  setRestrictions({ ...restrictions, secondary: checked as boolean })
                                }
                              />
                              <label htmlFor="secondary" className="text-sm cursor-pointer">
                                Uso em produtos secundários
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="immediate"
                                checked={restrictions.immediate}
                                onCheckedChange={(checked) =>
                                  setRestrictions({ ...restrictions, immediate: checked as boolean })
                                }
                              />
                              <label htmlFor="immediate" className="text-sm cursor-pointer">
                                Distribuição imediata (prazo curto)
                              </label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="restrictionsJustification">Justificativa das Restrições *</Label>
                          <Textarea
                            id="restrictionsJustification"
                            placeholder="Justifique as restrições impostas..."
                            value={restrictionsJustification}
                            onChange={(e) => setRestrictionsJustification(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reject */}
                  <div className="border-2 border-red-200 rounded-lg p-4 hover:border-red-400 transition-colors">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="reject" id="reject" className="mt-1" />
                      <label htmlFor="reject" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-700">REPROVAR</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reprovar e Iniciar Descarte/Devolução - Item NÃO está conforme e deve ser descartado ou devolvido
                        </p>
                      </label>
                    </div>

                    {decision === "reject" && (
                      <div className="mt-4 pl-8 space-y-3">
                        <div>
                          <Label>Ação a tomar *</Label>
                          <RadioGroup value={rejectionAction} onValueChange={setRejectionAction}>
                            <div className="flex items-center gap-2 mt-2">
                              <RadioGroupItem value="return" id="return" />
                              <label htmlFor="return" className="text-sm cursor-pointer">
                                Devolução ao Fornecedor
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="discard" id="discard" />
                              <label htmlFor="discard" className="text-sm cursor-pointer">
                                Descarte
                              </label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div>
                          <Label htmlFor="rejectionJustification">Justificativa da Reprovação *</Label>
                          <Textarea
                            id="rejectionJustification"
                            placeholder="Justifique a reprovação... (mínimo 100 caracteres)"
                            value={rejectionJustification}
                            onChange={(e) => setRejectionJustification(e.target.value)}
                            rows={4}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notificações e Ações Subsequentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="notifySupplier"
                    checked={notifySupplier}
                    onCheckedChange={(checked) => setNotifySupplier(checked as boolean)}
                  />
                  <label htmlFor="notifySupplier" className="text-sm cursor-pointer">
                    Notificar Fornecedor sobre resultado da inspeção
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="notifyPurchasing" />
                  <label htmlFor="notifyPurchasing" className="text-sm cursor-pointer">
                    Notificar Compras
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="notifyReceiving" />
                  <label htmlFor="notifyReceiving" className="text-sm cursor-pointer">
                    Notificar Recebimento
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="updateNc" defaultChecked />
                  <label htmlFor="updateNc" className="text-sm cursor-pointer">
                    Atualizar NC original com resultado
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Inspeção e Aplicar Decisão?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Tem certeza que deseja finalizar a inspeção?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Decisão:</span>
                <span className="font-semibold">
                  {decision === "approve" && "Aprovar"}
                  {decision === "approve-restriction" && "Aprovar com Restrição"}
                  {decision === "reject" && "Reprovar"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risco Geral:</span>
                <Badge className={`${riskInfo.color} bg-transparent border`}>
                  {riskInfo.icon} {riskInfo.label}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="confirmReview" required />
              <label htmlFor="confirmReview" className="text-sm cursor-pointer">
                Confirmo que revisei todas as informações *
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-imperial hover:bg-imperial"
              onClick={confirmFinalize}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : (
                "Confirmar e Finalizar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




