"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Upload,
  X,
  Save,
  Send,
  FileText,
  AlertCircle,
  TrendingDown,
  Calendar,
  Mail,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Image as ImageIcon,
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
import { Switch } from "@/components/ui/switch"
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
const mockReceivedItem = {
  po: "PO-2025-123",
  supplier: "Frigorífico Premium S.A.",
  sku: "FRS-045",
  description: "Filé de Frango Congelado - 1kg",
  proposedLot: "LOT2025-001",
  realLot: "LOT2025-002",
  proposedExpiry: "2025-03-15",
  realExpiry: "2025-02-05",
  quantity: 500,
  supplierScore: 88,
}

const ncTypes = [
  "Lote Divergente",
  "Validade Insuficiente",
  "Validade Divergente",
  "Quantidade Divergente",
  "Embalagem Danificada",
  "Temperatura Inadequada",
  "Produto Errado",
  "Documentação Incompleta/Incorreta",
  "Contaminação Suspeita",
  "Prazo de Entrega Não Cumprido",
  "Outro (especificar)",
]

const severityLevels = [
  {
    value: "critical",
    label: "Crítica",
    description: "Rejeição obrigatória, risco à segurança/qualidade",
    color: "border-red-500 bg-red-50",
    badgeColor: "bg-red-500",
    points: -10,
  },
  {
    value: "severe",
    label: "Grave",
    description: "Quarentena obrigatória, análise necessária",
    color: "border-orange-500 bg-orange-50",
    badgeColor: "bg-orange-500",
    points: -5,
  },
  {
    value: "moderate",
    label: "Moderada",
    description: "Pode ser aceito com aprovação e registro",
    color: "border-yellow-500 bg-yellow-50",
    badgeColor: "bg-yellow-500",
    points: -2,
  },
  {
    value: "minor",
    label: "Leve",
    description: "Não impede recebimento, registro para histórico",
    color: "border-blue-500 bg-blue-50",
    badgeColor: "bg-blue-500",
    points: -0.5,
  },
]

export function NonConformityRegistrationContent() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Form state
  const [ncType, setNcType] = useState("")
  const [otherNcType, setOtherNcType] = useState("")
  const [severity, setSeverity] = useState("")
  const [description, setDescription] = useState("")
  const [impacts, setImpacts] = useState({
    foodSafety: false,
    consumerHealth: false,
    financialLoss: false,
    operationalDelay: false,
    reputationImpact: false,
    regulatoryViolation: false,
    other: false,
  })
  const [otherImpact, setOtherImpact] = useState("")
  const [rootCause, setRootCause] = useState("")
  const [decision, setDecision] = useState("")
  const [returnConditions, setReturnConditions] = useState("")
  const [acceptanceJustification, setAcceptanceJustification] = useState("")
  const [approver, setApprover] = useState("")
  const [usageRestrictions, setUsageRestrictions] = useState("")
  const [correctiveAction, setCorrectiveAction] = useState("")
  const [actionDeadline, setActionDeadline] = useState("")
  const [notifySupplier, setNotifySupplier] = useState(true)
  const [requestPac, setRequestPac] = useState(false)
  const [responseDeadline, setResponseDeadline] = useState("7")
  const [internalNotifications, setInternalNotifications] = useState({
    purchasing: false,
    quality: true,
    finance: false,
    management: false,
  })
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  // Calculate scorecard impact
  const selectedSeverity = severityLevels.find((s) => s.value === severity)
  const scoreImpact = selectedSeverity?.points || 0
  const newScore = mockReceivedItem.supplierScore + scoreImpact

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name)
      setUploadedFiles([...uploadedFiles, ...fileNames])
    }
  }

  const removeFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f !== fileName))
  }

  const handleSaveDraft = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Rascunho salvo",
        description: "Você pode retomar o registro mais tarde.",
      })
    }, 1000)
  }

  const handleRegisterNC = () => {
    // Validation
    if (!ncType) {
      toast({
        title: "Erro de validação",
        description: "Selecione o tipo de não conformidade.",
        variant: "destructive",
      })
      return
    }

    if (!severity) {
      toast({
        title: "Erro de validação",
        description: "Selecione a severidade.",
        variant: "destructive",
      })
      return
    }

    if (description.length < 50) {
      toast({
        title: "Erro de validação",
        description: "A descrição deve ter pelo menos 50 caracteres.",
        variant: "destructive",
      })
      return
    }

    if (uploadedFiles.length < 2) {
      toast({
        title: "Erro de validação",
        description: "Envie pelo menos 2 fotos de evidência.",
        variant: "destructive",
      })
      return
    }

    if (!decision) {
      toast({
        title: "Erro de validação",
        description: "Selecione uma decisão imediata.",
        variant: "destructive",
      })
      return
    }

    if (decision === "accept-deviation" && (!acceptanceJustification || !approver)) {
      toast({
        title: "Erro de validação",
        description: "Preencha a justificativa e selecione um aprovador.",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmRegister = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowConfirmDialog(false)
      toast({
        title: "NC registrada com sucesso!",
        description: "Código: NC-2025-048",
      })
      // Redirect would happen here
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/recebimento/conferencia" className="hover:text-imperial">
          Recebimento
        </Link>
        {" / "}
        <span>Não Conformidades</span>
        {" / "}
        <span className="text-foreground">Nova NC</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Registrar Não Conformidade</h1>
          {severity && (
            <Badge className={`${selectedSeverity?.badgeColor} text-white mt-2`}>
              {selectedSeverity?.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Context Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contexto - Informações do Item Afetado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">PO:</span>
              <div>
                <Link href={`/compras/pos/${mockReceivedItem.po}`} className="text-imperial hover:underline font-medium">
                  #{mockReceivedItem.po}
                </Link>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Fornecedor:</span>
              <div className="font-medium">{mockReceivedItem.supplier}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Produto:</span>
              <div className="font-medium">{mockReceivedItem.sku}</div>
              <div className="text-xs text-muted-foreground">{mockReceivedItem.description}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Lote Proposto:</span>
              <div className="font-mono">{mockReceivedItem.proposedLot}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Lote Real:</span>
              <div className="font-mono font-semibold text-orange-600">{mockReceivedItem.realLot}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Validade Proposta:</span>
              <div>{new Date(mockReceivedItem.proposedExpiry).toLocaleDateString("pt-BR")}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Validade Real:</span>
              <div className="font-semibold text-red-600">
                {new Date(mockReceivedItem.realExpiry).toLocaleDateString("pt-BR")}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Quantidade:</span>
              <div className="font-medium">{mockReceivedItem.quantity}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NC Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Formulário da NC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* NC Type */}
          <div>
            <Label htmlFor="ncType">Tipo de Não Conformidade *</Label>
            <Select value={ncType} onValueChange={setNcType}>
              <SelectTrigger id="ncType">
                <SelectValue placeholder="Selecione o tipo de NC" />
              </SelectTrigger>
              <SelectContent>
                {ncTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {ncType === "Outro (especificar)" && (
              <Input
                className="mt-2"
                placeholder="Especifique o tipo de NC"
                value={otherNcType}
                onChange={(e) => setOtherNcType(e.target.value)}
              />
            )}
          </div>

          {/* Severity */}
          <div>
            <Label>Severidade *</Label>
            <RadioGroup value={severity} onValueChange={setSeverity} className="mt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {severityLevels.map((level) => (
                  <div
                    key={level.value}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      severity === level.value ? level.color : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                      <label htmlFor={level.value} className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${level.badgeColor} text-white text-xs`}>{level.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descrição Detalhada da NC *</Label>
            <Textarea
              id="description"
              placeholder="Descreva em detalhes a não conformidade identificada... Seja específico: o que foi encontrado, onde, em que condições"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                Seja específico: o que foi encontrado, onde, em que condições
              </span>
              <span className={`text-xs ${description.length < 50 ? "text-red-600" : "text-imperial"}`}>
                {description.length}/50 caracteres mínimos
              </span>
            </div>
          </div>

          {/* Comparison Table */}
          <div>
            <Label>Comparação Esperado vs Encontrado</Label>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Campo</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Esperado</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Encontrado</th>
                    <th className="border px-4 py-2 text-center text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 text-sm">Lote</td>
                    <td className="border px-4 py-2 text-sm font-mono">{mockReceivedItem.proposedLot}</td>
                    <td className="border px-4 py-2 text-sm font-mono">{mockReceivedItem.realLot}</td>
                    <td className="border px-4 py-2 text-center">
                      {mockReceivedItem.proposedLot === mockReceivedItem.realLot ? (
                        <CheckCircle className="w-5 h-5 text-imperial mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 text-sm">Validade</td>
                    <td className="border px-4 py-2 text-sm">
                      {new Date(mockReceivedItem.proposedExpiry).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="border px-4 py-2 text-sm">
                      {new Date(mockReceivedItem.realExpiry).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {mockReceivedItem.proposedExpiry === mockReceivedItem.realExpiry ? (
                        <CheckCircle className="w-5 h-5 text-imperial mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 text-sm">Quantidade</td>
                    <td className="border px-4 py-2 text-sm">{mockReceivedItem.quantity}</td>
                    <td className="border px-4 py-2 text-sm">{mockReceivedItem.quantity}</td>
                    <td className="border px-4 py-2 text-center">
                      <CheckCircle className="w-5 h-5 text-imperial mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Impacts */}
          <div>
            <Label>Impacto da NC</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="foodSafety"
                  checked={impacts.foodSafety}
                  onCheckedChange={(checked) => setImpacts({ ...impacts, foodSafety: checked as boolean })}
                />
                <label htmlFor="foodSafety" className="text-sm cursor-pointer">
                  Risco à segurança alimentar
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="consumerHealth"
                  checked={impacts.consumerHealth}
                  onCheckedChange={(checked) => setImpacts({ ...impacts, consumerHealth: checked as boolean })}
                />
                <label htmlFor="consumerHealth" className="text-sm cursor-pointer">
                  Risco à saúde do consumidor
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="financialLoss"
                  checked={impacts.financialLoss}
                  onCheckedChange={(checked) => setImpacts({ ...impacts, financialLoss: checked as boolean })}
                />
                <label htmlFor="financialLoss" className="text-sm cursor-pointer">
                  Perda financeira
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="operationalDelay"
                  checked={impacts.operationalDelay}
                  onCheckedChange={(checked) => setImpacts({ ...impacts, operationalDelay: checked as boolean })}
                />
                <label htmlFor="operationalDelay" className="text-sm cursor-pointer">
                  Atraso na operação
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="reputationImpact"
                  checked={impacts.reputationImpact}
                  onCheckedChange={(checked) => setImpacts({ ...impacts, reputationImpact: checked as boolean })}
                />
                <label htmlFor="reputationImpact" className="text-sm cursor-pointer">
                  Impacto na reputação
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="regulatoryViolation"
                  checked={impacts.regulatoryViolation}
                  onCheckedChange={(checked) =>
                    setImpacts({ ...impacts, regulatoryViolation: checked as boolean })
                  }
                />
                <label htmlFor="regulatoryViolation" className="text-sm cursor-pointer">
                  Violação regulatória
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="otherImpact"
                  checked={impacts.other}
                  onCheckedChange={(checked) => setImpacts({ ...impacts, other: checked as boolean })}
                />
                <label htmlFor="otherImpact" className="text-sm cursor-pointer">
                  Outro (especificar)
                </label>
              </div>
              {impacts.other && (
                <Input
                  className="ml-6"
                  placeholder="Especifique outro impacto"
                  value={otherImpact}
                  onChange={(e) => setOtherImpact(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Evidence Upload */}
          <div>
            <Label>Evidências Obrigatórias *</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-imperial transition-colors">
              <input
                type="file"
                id="fileUpload"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="fileUpload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium">
                  Arraste e solte ou clique para fazer upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fotos do problema, rótulo com lote/validade (mínimo 2 fotos)
                </p>
                <p className="text-xs text-muted-foreground">
                  Tamanho máximo: 10MB por arquivo
                </p>
              </label>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded p-2"
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-imperial" />
                      <span className="text-sm">{file}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className={`text-xs mt-2 ${uploadedFiles.length < 2 ? "text-red-600" : "text-imperial"}`}>
              {uploadedFiles.length}/2 arquivos mínimos enviados
            </p>
          </div>

          {/* Root Cause */}
          <div>
            <Label htmlFor="rootCause">Causa Raiz Identificada</Label>
            <Textarea
              id="rootCause"
              placeholder="Se identificada, descreva a causa raiz do problema..."
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Exemplos: "Lote informado incorretamente pelo fornecedor", "Quebra da cadeia fria durante transporte"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions and Decisions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações e Decisões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decision */}
          <div>
            <Label>Decisão Imediata *</Label>
            <RadioGroup value={decision} onValueChange={setDecision} className="mt-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="reject" id="reject" />
                  <label htmlFor="reject" className="text-sm cursor-pointer">
                    Rejeitar Item (devolução ao fornecedor)
                  </label>
                </div>
                {decision === "reject" && (
                  <div className="ml-6 space-y-3 border-l-2 border-red-200 pl-4">
                    <div className="flex items-center gap-2">
                      <Checkbox id="autoReturn" />
                      <label htmlFor="autoReturn" className="text-sm cursor-pointer">
                        Gerar Ordem de Devolução automática
                      </label>
                    </div>
                    <div>
                      <Label htmlFor="returnConditions">Condições de Devolução</Label>
                      <Textarea
                        id="returnConditions"
                        placeholder="Descreva as condições da devolução..."
                        value={returnConditions}
                        onChange={(e) => setReturnConditions(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="quarantine" id="quarantine" />
                  <label htmlFor="quarantine" className="text-sm cursor-pointer">
                    Enviar para Quarentena (aguardar análise QA)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="accept-deviation" id="accept-deviation" />
                  <label htmlFor="accept-deviation" className="text-sm cursor-pointer">
                    Aceitar com Desvio (requer aprovação)
                  </label>
                </div>
                {decision === "accept-deviation" && (
                  <div className="ml-6 space-y-3 border-l-2 border-yellow-200 pl-4">
                    <div>
                      <Label htmlFor="acceptanceJustification">Justificativa do Aceite *</Label>
                      <Textarea
                        id="acceptanceJustification"
                        placeholder="Justifique por que o item pode ser aceito com desvio..."
                        value={acceptanceJustification}
                        onChange={(e) => setAcceptanceJustification(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="approver">Aprovador *</Label>
                      <Select value={approver} onValueChange={setApprover}>
                        <SelectTrigger id="approver">
                          <SelectValue placeholder="Selecione o aprovador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="qa-manager">QA Manager</SelectItem>
                          <SelectItem value="operations-manager">Operations Manager</SelectItem>
                          <SelectItem value="general-manager">General Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="usageRestrictions">Restrições de Uso</Label>
                      <Textarea
                        id="usageRestrictions"
                        placeholder="Ex: Uso apenas interno, Venda com desconto..."
                        value={usageRestrictions}
                        onChange={(e) => setUsageRestrictions(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="under-analysis" id="under-analysis" />
                  <label htmlFor="under-analysis" className="text-sm cursor-pointer">
                    Em Análise (decisão posterior)
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Corrective Action */}
          <div>
            <Label htmlFor="correctiveAction">Ação Corretiva Sugerida</Label>
            <Textarea
              id="correctiveAction"
              placeholder="Sugira ações para evitar recorrência..."
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ex: "Fornecedor deve revisar processo de etiquetagem"
            </p>
          </div>

          {/* Action Deadline */}
          <div>
            <Label htmlFor="actionDeadline">Prazo para Ação Corretiva</Label>
            <Input
              id="actionDeadline"
              type="date"
              value={actionDeadline}
              onChange={(e) => setActionDeadline(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notify Supplier */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificar Fornecedor *</Label>
              <p className="text-sm text-muted-foreground">
                {notifySupplier ? "Envia email formal com NC" : "Registro interno apenas"}
              </p>
            </div>
            <Switch checked={notifySupplier} onCheckedChange={setNotifySupplier} />
          </div>

          {notifySupplier && (
            <div className="space-y-4 border-l-2 border-twilight pl-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requestPac"
                  checked={requestPac}
                  onCheckedChange={(checked) => setRequestPac(checked as boolean)}
                />
                <label htmlFor="requestPac" className="text-sm cursor-pointer">
                  Solicitar Plano de Ação Corretiva (PAC)
                </label>
              </div>

              <div>
                <Label htmlFor="responseDeadline">Prazo para Resposta</Label>
                <Select value={responseDeadline} onValueChange={setResponseDeadline}>
                  <SelectTrigger id="responseDeadline">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="5">5 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Internal Notifications */}
          <div>
            <Label>Notificar Internamente</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="purchasing"
                  checked={internalNotifications.purchasing}
                  onCheckedChange={(checked) =>
                    setInternalNotifications({ ...internalNotifications, purchasing: checked as boolean })
                  }
                />
                <label htmlFor="purchasing" className="text-sm cursor-pointer">
                  Equipe de Compras
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="quality"
                  checked={internalNotifications.quality}
                  onCheckedChange={(checked) =>
                    setInternalNotifications({ ...internalNotifications, quality: checked as boolean })
                  }
                />
                <label htmlFor="quality" className="text-sm cursor-pointer">
                  Qualidade (QA)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="finance"
                  checked={internalNotifications.finance}
                  onCheckedChange={(checked) =>
                    setInternalNotifications({ ...internalNotifications, finance: checked as boolean })
                  }
                />
                <label htmlFor="finance" className="text-sm cursor-pointer">
                  Financeiro (para ajustes)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="management"
                  checked={internalNotifications.management}
                  onCheckedChange={(checked) =>
                    setInternalNotifications({ ...internalNotifications, management: checked as boolean })
                  }
                />
                <label htmlFor="management" className="text-sm cursor-pointer">
                  Gerência
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Scorecard Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Impacto no Scorecard do Fornecedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Severidade:</span>
              <span className="font-medium">
                {selectedSeverity?.label} = {scoreImpact} pontos
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Score Atual do Fornecedor:</span>
              <Badge className="bg-blue-100 text-blue-800">{mockReceivedItem.supplierScore}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Novo Score Projetado:</span>
              <Badge className={newScore >= 70 ? "bg-twilight text-imperial" : "bg-red-100 text-red-800"}>
                {newScore}
              </Badge>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Antes</span>
                <span className="text-xs text-muted-foreground">Depois</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${mockReceivedItem.supplierScore}%` }}
                  />
                </div>
                <span className="text-xs">→</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${newScore >= 70 ? "bg-imperial" : "bg-red-500"}`}
                    style={{ width: `${newScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          Cancelar
        </Button>
        <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Rascunho
        </Button>
        <Button className="bg-imperial hover:bg-imperial" onClick={handleRegisterNC} disabled={isSaving}>
          <Send className="w-4 h-4 mr-2" />
          Registrar NC
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Registro de NC?</DialogTitle>
            <DialogDescription>
              Revise as informações antes de finalizar o registro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-semibold">{ncType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Severidade:</span>
                <Badge className={`${selectedSeverity?.badgeColor} text-white`}>
                  {selectedSeverity?.label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Decisão:</span>
                <span className="font-semibold">
                  {decision === "reject" && "Rejeitar Item"}
                  {decision === "quarantine" && "Enviar para Quarentena"}
                  {decision === "accept-deviation" && "Aceitar com Desvio"}
                  {decision === "under-analysis" && "Em Análise"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impacto no Score:</span>
                <span className="font-semibold text-red-600">{scoreImpact} pontos</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="confirmInfo" required />
              <label htmlFor="confirmInfo" className="text-sm cursor-pointer">
                Confirmo que as informações estão corretas *
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Revisar
            </Button>
            <Button
              className="bg-imperial hover:bg-imperial"
              onClick={confirmRegister}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Confirmar Registro"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




