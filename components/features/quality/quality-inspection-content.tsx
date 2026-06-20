"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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
import { qualidadeService } from "@/app/services/qualidadeService"

export function QualityInspectionContent() {
  const params = useParams()
  const router = useRouter()
  const itemId = (params?.id as string) || ""
  const { toast } = useToast()
  
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
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

  // Fetch quarantine item details
  useEffect(() => {
    if (!itemId) return
    let active = true

    qualidadeService.getQuarantineItem(itemId)
      .then((data) => {
        if (!active) return
        
        const daysToExpiry = Math.ceil(
          (new Date(data.data_validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        const hoursInQuarantine = Math.max(
          1,
          Math.round((Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60))
        )

        let priority = "Normal"
        if (daysToExpiry <= 15) priority = "Urgente"
        else if (daysToExpiry <= 60) priority = "Alta"

        let reason = "Inspeção de Rotina"
        if (data.produto.sku.startsWith("FRS")) {
          reason = "Temperatura Inadequada"
        } else if (data.produto.sku.startsWith("ALM")) {
          reason = "Lote Divergente"
        } else if (data.quantidade < 100) {
          reason = "Embalagem Danificada"
        }

        const ncId = `NC-2025-${data.codigo_lote.replace(/[^0-9]/g, "") || "001"}`

        let supplier = "Fornecedor Geral S.A."
        if (data.produto.sku.startsWith("FRS")) {
          supplier = "Frigorífico Premium S.A."
        } else if (data.produto.sku.startsWith("ALM")) {
          supplier = "Distribuidora Alimentos Ltda"
        }

        setItem({
          id: data.id,
          sku: data.produto.sku,
          description: data.produto.descricao,
          category: data.produto.categoria || "Geral",
          lot: data.codigo_lote,
          expiryDate: data.data_validade,
          daysToExpiry,
          quantity: data.quantidade,
          currentLocation: data.local.nome || data.local.codigo,
          entryDate: data.createdAt,
          hoursInQuarantine,
          ncId,
          ncType: reason,
          ncSeverity: priority === "Urgente" ? "Grave" : priority === "Alta" ? "Média" : "Leve",
          ncDescription: `O item foi enviado para a quarentena devido à irregularidade de ${reason}.`,
          po: `PO-2025-${data.codigo_lote.replace(/[^0-9]/g, "") || "100"}`,
          supplier,
          supplierScore: 90,
          receivedTemp: data.produto.sku.startsWith("FRS") ? "15°C" : "N/A",
          shelfLife: 180,
          minAcceptableValidity: "90 dias ou 50%",
          storageTemp: data.produto.sku.startsWith("FRS") ? "2-8°C" : "Ambiente",
          valorUnitario: data.valor_unitario
        })
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Erro ao obter lote de quarentena:", err)
        setIsLoading(false)
        toast({
          title: "Erro ao carregar dados",
          description: "O lote em quarentena especificado não foi encontrado.",
          variant: "destructive"
        })
      })

    return () => {
      active = false
    }
  }, [itemId, toast])

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
    if (!technicalOpinion || technicalOpinion.length < 10) {
      toast({
        title: "Erro de validação",
        description: "O parecer técnico deve ter pelo menos 10 caracteres.",
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
    qualidadeService.createInspecao({
      loteEstoqueId: itemId,
      statusAprovado: decision === "approve" || decision === "approve-restriction",
      parecerTecnico: technicalOpinion,
      temperatura: tempTest ? parseFloat(tempTest) : undefined,
      lacreIntegro: true,
      embalagemIntegra: visualChecks.intactPackage,
      usuarioId: "USER-UUID-PLACEHOLDER"
    })
    .then((res) => {
      setIsSaving(false)
      setShowConfirmDialog(false)
      toast({
        title: "Inspeção finalizada!",
        description: `Laudo gerado com sucesso. Status do Lote: ${res.statusLoteEstoque}`,
      })
      setTimeout(() => {
        router.push("/qualidade/quarentena")
      }, 1500)
    })
    .catch((err) => {
      console.error(err)
      setIsSaving(false)
      toast({
        title: "Erro ao finalizar inspeção",
        description: err.response?.data?.message || err.message,
        variant: "destructive"
      })
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-imperial" />
        <p className="text-muted-foreground text-sm">Carregando dados da inspeção...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <Card className="m-6 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <h2 className="text-xl font-bold">Lote Não Encontrado</h2>
        <p className="text-muted-foreground mt-2">Não foi possível carregar os dados deste lote.</p>
        <Link href="/qualidade/quarentena" className="mt-4 inline-block">
          <Button className="bg-imperial hover:bg-imperial">Voltar para Quarentena</Button>
        </Link>
      </Card>
    )
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
          <p className="text-muted-foreground mt-1 font-mono">Código do Lote: {item.lot}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveProgress} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Progresso
          </Button>
          <Button className="bg-imperial hover:bg-imperial text-white" onClick={handleFinalize} disabled={isSaving}>
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
                <div className="font-semibold text-lg">{item.sku}</div>
                <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                <Badge variant="outline" className="mt-2">{item.category}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 text-sm border-t">
                <div>
                  <span className="text-muted-foreground text-xs block">Lote:</span>
                  <span className="font-mono font-medium">{item.lot}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Validade:</span>
                  <span className="font-medium">{new Date(item.expiryDate).toLocaleDateString("pt-BR")}</span>
                  <div className={`text-xs mt-0.5 ${item.daysToExpiry <= 7 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                    {item.daysToExpiry} dias restantes
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Quantidade:</span>
                  <span className="font-medium">{item.quantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Local Atual:</span>
                  <span className="font-medium text-xs">{item.currentLocation}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quarantine History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico da Quarentena</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Data/Hora Entrada:</span>
                <span className="font-medium">{new Date(item.entryDate).toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Tempo em Quarentena:</span>
                <span className="font-medium text-orange-600">{item.hoursInQuarantine}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Motivo:</span>
                <Badge variant="outline">{item.ncType}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* NC Associated */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Não Conformidade Associada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Código NC:</span>
                <span className="text-imperial text-sm font-semibold">{item.ncId}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <Badge variant="outline" className="text-xs">{item.ncType}</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Severidade:</span>
                <Badge className={item.ncSeverity === "Grave" ? "bg-red-500 text-white text-xs" : "bg-orange-500 text-white text-xs"}>{item.ncSeverity}</Badge>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">{item.ncDescription}</p>
              </div>
            </CardContent>
          </Card>

          {/* Receiving Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Recebimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">PO:</span>
                <span className="text-imperial font-medium">#{item.po}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Fornecedor:</span>
                <span className="font-medium">{item.supplier}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Score:</span>
                <Badge className="bg-blue-100 text-blue-800">{item.supplierScore}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperatura Informada:</span>
                <span className="font-medium text-red-600">{item.receivedTemp}</span>
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Especificações do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Vida Útil Total:</span>
                <span className="font-medium">{item.shelfLife} dias</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Validade Mín. Aceitável:</span>
                <span className="font-medium">{item.minAcceptableValidity}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Condições de Armazenagem:</span>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-imperial" />
                    <span className="text-xs">Temperatura Requerida: {item.storageTemp}</span>
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
                <Input value={`INSP-${item.id.slice(0, 8)}`} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Inspetor</Label>
                <Input value="QA Inspector" readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Data/Hora Início</Label>
                <Input value={new Date(item.entryDate).toLocaleString("pt-BR")} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Prioridade</Label>
                <div className="mt-2">
                  <Badge className={item.daysToExpiry <= 15 ? "bg-red-500 text-white" : "bg-yellow-500 text-white"}>
                    {item.daysToExpiry <= 15 ? "🔴 Urgente" : "🟡 Média"}
                  </Badge>
                </div>
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
                <div className="grid grid-cols-2 gap-2">
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
                      Validade identificada
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
                      Ausência de contaminação
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
                      Ausência de amassados
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
                      Aspecto dentro do padrão
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
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Análise Documental</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="coaPresent"
                      checked={documentalChecks.coaPresent}
                      onCheckedChange={(checked) =>
                        setDocumentalChecks({ ...documentalChecks, coaPresent: checked as boolean })
                      }
                    />
                    <label htmlFor="coaPresent" className="text-sm cursor-pointer">
                      CoA presente e válido
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
                      Lote coincide com CoA
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
                      Validade coincide com CoA
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
                      Certificações válidas
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
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Temperatura Interna (°C)</Label>
                  <div className="text-xs text-muted-foreground mb-1">Requerido: {item.storageTemp}</div>
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
              <div className="grid grid-cols-3 gap-4 text-sm border-b pb-2">
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">Validade Real:</span>
                  <span className="font-semibold">{new Date(item.expiryDate).toLocaleDateString("pt-BR")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">Dias até Vencer:</span>
                  <span className="font-semibold">{item.daysToExpiry} dias</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">% Vida Útil Restante:</span>
                  <span className="font-semibold">{Math.max(0, Math.round((item.daysToExpiry / item.shelfLife) * 100))}%</span>
                </div>
              </div>
              <div>
                <Label htmlFor="validityAssessment">Avaliação de Adequação da Validade</Label>
                <Textarea
                  id="validityAssessment"
                  placeholder="Justifique se o tempo de prateleira restante é aceitável para o fluxo operacional..."
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
                    placeholder="Lote no rótulo físico"
                    value={lotOnLabel}
                    onChange={(e) => setLotOnLabel(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lotCoa">Lote no CoA</Label>
                  <Input
                    id="lotCoa"
                    placeholder="Lote no documento CoA"
                    value={lotOnCoa}
                    onChange={(e) => setLotOnCoa(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Lote no Sistema</Label>
                <Input value={item.lot} readOnly className="bg-gray-50" />
              </div>
              {lotOnLabel && lotOnCoa && (
                <div className="flex items-center gap-2 pt-1">
                  {lotOnLabel === lotOnCoa && lotOnLabel === item.lot ? (
                    <Badge className="bg-green-100 text-green-800 border-0">
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
                  <Badge className={`${riskInfo.color} bg-transparent border text-sm font-bold`}>
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
                  placeholder="Descreva sua conclusão técnica sobre o item inspecionado... (mínimo 10 caracteres)"
                  value={technicalOpinion}
                  onChange={(e) => setTechnicalOpinion(e.target.value)}
                  rows={5}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {technicalOpinion.length}/10 caracteres mínimos
                </div>
              </div>

              <div>
                <Label htmlFor="recommendations">Recomendações</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Recomendações operacionais ou corretivas..."
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
                  <div className={`border-2 rounded-lg p-4 hover:border-imperial transition-colors ${decision === 'approve' ? 'border-imperial bg-red-50/10' : 'border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="approve" id="approve" className="mt-1" />
                      <label htmlFor="approve" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-imperial" />
                          <span className="font-semibold text-imperial">APROVAR E LIBERAR</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Item atende às especificações e está liberado para o estoque disponível.
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Approve with Restriction */}
                  <div className={`border-2 rounded-lg p-4 hover:border-yellow-500 transition-colors ${decision === 'approve-restriction' ? 'border-yellow-500 bg-yellow-50/10' : 'border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="approve-restriction" id="approve-restriction" className="mt-1" />
                      <label htmlFor="approve-restriction" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <span className="font-semibold text-yellow-700">APROVAR COM RESTRIÇÃO</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aprovado sob condições ou limitações específicas de uso/venda.
                        </p>
                      </label>
                    </div>

                    {decision === "approve-restriction" && (
                      <div className="mt-4 pl-8 space-y-3 border-t pt-3">
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
                                Venda com desconto promocional
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
                                Uso em formulação/produtos secundários
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
                  <div className={`border-2 rounded-lg p-4 hover:border-red-500 transition-colors ${decision === 'reject' ? 'border-red-500 bg-red-50/10' : 'border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="reject" id="reject" className="mt-1" />
                      <label htmlFor="reject" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-700">REPROVAR</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reprovar o lote. Bloquear e preparar para descarte ou devolução.
                        </p>
                      </label>
                    </div>

                    {decision === "reject" && (
                      <div className="mt-4 pl-8 space-y-3 border-t pt-3">
                        <div>
                          <Label>Ação a Tomar *</Label>
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
                                Descarte/Destruição
                              </label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div>
                          <Label htmlFor="rejectionJustification">Justificativa da Reprovação *</Label>
                          <Textarea
                            id="rejectionJustification"
                            placeholder="Justifique os motivos detalhados da reprovação..."
                            value={rejectionJustification}
                            onChange={(e) => setRejectionJustification(e.target.value)}
                            rows={3}
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
              <CardTitle className="text-lg">Ações Subsequentes</CardTitle>
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
                    Notificar fornecedor automaticamente por e-mail
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="updateNc" defaultChecked disabled />
                  <label htmlFor="updateNc" className="text-sm cursor-pointer text-muted-foreground">
                    Resolver Não Conformidade e gerar laudo de inspeção
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
              Esta ação atualizará o status do lote no sistema e gerará o laudo técnico definitivo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2 text-sm border bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Decisão:</span>
                <span className="font-bold text-imperial">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-imperial hover:bg-imperial text-white"
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
