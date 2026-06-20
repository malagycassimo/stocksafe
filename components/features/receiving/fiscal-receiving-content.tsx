"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Upload,
  Save,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Download,
  Loader2,
  Calculator,
  X,
  File,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { recebimentoService } from "@/app/services/recebimentoService"

// Mock data
const mockReceiving = {
  id: "REC-2025-001",
  po: "PO-2025-123",
  supplier: "Frigorífico Premium S.A.",
  receiptDate: "2025-01-18",
  physicalStatus: "Concluída",
  poValue: 25000.0,
  itemsCount: 5,
  receivedItems: 5,
  divergences: 0,
  fiscalStatus: "Aguardando Conferência",
}

const mockPoItems = [
  {
    sku: "FRS-045",
    description: "Filé de Frango Congelado - 1kg",
    qtyPo: 500,
    qtyNf: 500,
    qtyReceived: 500,
    unitPricePo: 18.5,
    unitPriceNf: 18.5,
    subtotalNf: 9250,
  },
  {
    sku: "FRS-046",
    description: "Carne Bovina Moída - 1kg",
    qtyPo: 300,
    qtyNf: 300,
    qtyReceived: 300,
    unitPricePo: 25.0,
    unitPriceNf: 25.0,
    subtotalNf: 7500,
  },
  {
    sku: "FRS-050",
    description: "Peito de Frango - 1kg",
    qtyPo: 400,
    qtyNf: 400,
    qtyReceived: 400,
    unitPricePo: 15.0,
    unitPriceNf: 15.0,
    subtotalNf: 6000,
  },
]

export function FiscalReceivingContent({ id }: { id?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const poIdFromQuery = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('po') : null
  const poId = id || poIdFromQuery || "PO-2025-123"

  const [po, setPo] = useState<any>(null)
  const [poItems, setPoItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [nfNumber, setNfNumber] = useState("")
  const [nfSeries, setNfSeries] = useState("")
  const [nfKey, setNfKey] = useState("")
  const [nfType, setNfType] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [entryDate, setEntryDate] = useState(mockReceiving.receiptDate)
  const [cfop, setCfop] = useState("")
  const [operationNature, setOperationNature] = useState("")
  const [uploadedNf, setUploadedNf] = useState<string | null>(null)
  const [uploadedDanfe, setUploadedDanfe] = useState<string | null>(null)

  // Values
  const [subtotalNf, setSubtotalNf] = useState("22750")
  const [discountNf, setDiscountNf] = useState("0")
  const [freightNf, setFreightNf] = useState("500")
  const [insuranceNf, setInsuranceNf] = useState("100")
  const [otherExpensesNf, setOtherExpensesNf] = useState("50")
  const [icmsNf, setIcmsNf] = useState("1650")
  const [ipiNf, setIpiNf] = useState("0")
  const [pisNf, setPisNf] = useState("0")
  const [cofinsNf, setCofinsNf] = useState("0")
  const [otherTaxesNf, setOtherTaxesNf] = useState("0")

  // Divergence handling
  const [divergenceAction, setDivergenceAction] = useState("")
  const [approver, setApprover] = useState("")
  const [approvalJustification, setApprovalJustification] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  // GRN
  const [grnObservations, setGrnObservations] = useState("")
  const [linkToPayable, setLinkToPayable] = useState(true)
  const [paymentTerms, setPaymentTerms] = useState("30 dias")

  useEffect(() => {
    if (!poId) return
    setLoading(true)
    recebimentoService.getPurchaseOrder(poId)
      .then((data) => {
        setPo(data)
        if (data.itens && data.itens.length > 0) {
          const mapped = data.itens.map((item: any) => ({
            produtoId: item.produtoId,
            sku: item.sku,
            description: item.description,
            qtyPo: item.qtyExpected,
            qtyNf: item.qtyExpected,
            qtyReceived: item.qtyExpected,
            unitPricePo: item.price,
            unitPriceNf: item.price,
            subtotalNf: item.qtyExpected * item.price,
          }))
          setPoItems(mapped)
          const subTotal = mapped.reduce((acc, curr) => acc + curr.subtotalNf, 0)
          setSubtotalNf(subTotal.toString())
        } else {
          setPoItems(mockPoItems)
        }
      })
      .catch((err) => {
        console.error(err)
        setPoItems(mockPoItems)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [poId])

  const subtotalPo = poItems.reduce((acc, item) => acc + (item.qtyPo * item.unitPricePo), 0)
  const totalPo = subtotalPo
  const totalNf =
    parseFloat(subtotalNf || "0") -
    parseFloat(discountNf || "0") +
    parseFloat(freightNf || "0") +
    parseFloat(insuranceNf || "0") +
    parseFloat(otherExpensesNf || "0") +
    parseFloat(icmsNf || "0") +
    parseFloat(ipiNf || "0") +
    parseFloat(pisNf || "0") +
    parseFloat(cofinsNf || "0") +
    parseFloat(otherTaxesNf || "0")

  const divergence = totalNf - totalPo
  const divergencePercent = totalPo > 0 ? (Math.abs(divergence) / totalPo) * 100 : 0

  const getDivergenceStatus = () => {
    if (Math.abs(divergence) < 0.01) {
      return { icon: <CheckCircle className="w-5 h-5 text-imperial" />, text: "Valores Conferem", color: "text-imperial bg-twilight" }
    }
    if (divergencePercent < 5) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
        text: "Divergência Pequena - Análise Necessária",
        color: "text-yellow-600 bg-yellow-50",
      }
    }
    return {
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      text: "Divergência Significativa - Ação Obrigatória",
      color: "text-red-600 bg-red-50",
    }
  }

  const status = getDivergenceStatus()

  const handleNfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedNf(file.name)
      // If XML, would parse and auto-fill fields
      toast({
        title: "NF enviada",
        description: `Arquivo ${file.name} carregado com sucesso.`,
      })
    }
  }

  const handleDanfeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedDanfe(file.name)
    }
  }

  const handleSaveDraft = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Rascunho salvo",
        description: "Você pode retomar a conferência mais tarde.",
      })
    }, 1000)
  }

  const handleApproveGRN = () => {
    // Validation
    if (!nfNumber) {
      toast({
        title: "Erro de validação",
        description: "Número da NF é obrigatório.",
        variant: "destructive",
      })
      return
    }

    if (!issueDate) {
      toast({
        title: "Erro de validação",
        description: "Data de emissão é obrigatória.",
        variant: "destructive",
      })
      return
    }

    if (!uploadedNf) {
      toast({
        title: "Erro de validação",
        description: "Upload da NF é obrigatório.",
        variant: "destructive",
      })
      return
    }

    if (divergencePercent >= 5 && !approver) {
      toast({
        title: "Erro de validação",
        description: "Divergências significativas requerem aprovador.",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmApprove = () => {
    setIsSaving(true)

    recebimentoService.submitConferencia({
      poId: poId,
      numeroNotaFiscal: nfNumber || "NF-99999",
      valorTotalNf: totalNf,
      itens: poItems.map(item => ({
        produtoId: item.produtoId || "PROD-UUID-PLACEHOLDER",
        quantidadePedido: item.qtyPo,
        quantidadeNota: item.qtyNf,
        quantidadeFisica: item.qtyReceived,
        divergente: item.qtyNf !== item.qtyReceived
      }))
    })
    .then((res) => {
      setIsSaving(false)
      setShowConfirmDialog(false)
      toast({
        title: "Conferência Fiscal Concluída!",
        description: `Status: ${res.status}. Divergência Total: ${res.divergenciaTotal} MT`,
      })
      setTimeout(() => {
        router.push("/recebimento/aguardando")
      }, 1500)
    })
    .catch((err) => {
      console.error(err)
      setIsSaving(false)
      toast({
        title: "Erro ao submeter conferência",
        description: err.response?.data?.message || err.message,
        variant: "destructive"
      })
    })
  }

  const handleReject = () => {
    if (!rejectionReason || rejectionReason.length < 100) {
      toast({
        title: "Erro de validação",
        description: "O motivo da rejeição deve ter pelo menos 100 caracteres.",
        variant: "destructive",
      })
      return
    }
    setShowRejectDialog(true)
  }

  const confirmReject = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowRejectDialog(false)
      toast({
        title: "NF rejeitada",
        description: "Fornecedor será notificado.",
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
        <Link href="/recebimento/fiscal" className="hover:text-imperial">
          Recebimento
        </Link>
        {" / "}
        <span>Conferência Fiscal</span>
        {" / "}
        <span className="text-foreground">Recebimento #{mockReceiving.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">
            Conferência Fiscal - Recebimento #{mockReceiving.id}
          </h1>
          <Badge className="mt-2 bg-yellow-500">Aguardando Conferência</Badge>
        </div>
      </div>

      {/* Receiving Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados do Recebimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label>Nº Recebimento</Label>
              <div className="font-medium">{mockReceiving.id}</div>
            </div>
            <div>
              <Label>PO Origem</Label>
              <Link href={`/compras/pos/${mockReceiving.po}`} className="text-imperial hover:underline font-medium">
                #{mockReceiving.po}
              </Link>
            </div>
            <div>
              <Label>Fornecedor</Label>
              <div className="font-medium">{mockReceiving.supplier}</div>
            </div>
            <div>
              <Label>Data Recebimento</Label>
              <div className="font-medium">{new Date(mockReceiving.receiptDate).toLocaleDateString("pt-BR")}</div>
            </div>
            <div>
              <Label>Status Conferência Física</Label>
              <Badge className="bg-imperial">Concluída</Badge>
            </div>
            <div>
              <Label>Valor do PO</Label>
              <div className="font-medium">{totalPo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT</div>
            </div>
            <div>
              <Label>Qtd de Itens</Label>
              <div className="font-medium">{mockReceiving.itemsCount}</div>
            </div>
            <div>
              <Label>Recebidos</Label>
              <div className="font-medium text-imperial">{mockReceiving.receivedItems} itens</div>
            </div>
            <div>
              <Label>Divergências</Label>
              <div className="font-medium">{mockReceiving.divergences} itens</div>
            </div>
            <div>
              <Label>Status Fiscal</Label>
              <Badge variant="outline">{mockReceiving.fiscalStatus}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NF Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados da Nota Fiscal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nfNumber">Número da Nota Fiscal *</Label>
              <Input
                id="nfNumber"
                placeholder="Ex: 12345"
                value={nfNumber}
                onChange={(e) => setNfNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nfSeries">Série da NF</Label>
              <Input
                id="nfSeries"
                placeholder="Ex: 1"
                value={nfSeries}
                onChange={(e) => setNfSeries(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nfKey">Chave de Acesso NF-e</Label>
              <Input
                id="nfKey"
                placeholder="44 dígitos"
                value={nfKey}
                onChange={(e) => setNfKey(e.target.value)}
                maxLength={44}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="nfType">Tipo de NF *</Label>
              <Select value={nfType} onValueChange={setNfType}>
                <SelectTrigger id="nfType">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nfe">NF-e (Nota Fiscal Eletrônica)</SelectItem>
                  <SelectItem value="nfse">NFS-e (Nota Fiscal de Serviço)</SelectItem>
                  <SelectItem value="manual">Nota Fiscal Manual</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="issueDate">Data de Emissão *</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="entryDate">Data de Entrada</Label>
              <Input
                id="entryDate"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cfop">CFOP *</Label>
              <Input
                id="cfop"
                placeholder="Ex: 5102"
                value={cfop}
                onChange={(e) => setCfop(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="operationNature">Natureza da Operação</Label>
            <Input
              id="operationNature"
              placeholder="Ex: Venda de mercadoria"
              value={operationNature}
              onChange={(e) => setOperationNature(e.target.value)}
            />
          </div>

          {/* Upload NF */}
          <div>
            <Label>Upload da NF * (PDF ou XML)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-imperial transition-colors mt-2">
              <input
                type="file"
                id="nfUpload"
                accept=".pdf,.xml"
                onChange={handleNfUpload}
                className="hidden"
              />
              <label htmlFor="nfUpload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Clique para fazer upload</p>
                <p className="text-xs text-muted-foreground mt-1">PDF ou XML (máx. 10MB)</p>
              </label>
            </div>
            {uploadedNf && (
              <div className="flex items-center justify-between bg-gray-50 rounded p-2 mt-2">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-imperial" />
                  <span className="text-sm">{uploadedNf}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setUploadedNf(null)} className="h-6 w-6 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Upload DANFE */}
          <div>
            <Label>Upload do DANFE (opcional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-imperial transition-colors mt-2">
              <input
                type="file"
                id="danfeUpload"
                accept=".pdf"
                onChange={handleDanfeUpload}
                className="hidden"
              />
              <label htmlFor="danfeUpload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">PDF (máx. 10MB)</p>
              </label>
            </div>
            {uploadedDanfe && (
              <div className="flex items-center justify-between bg-gray-50 rounded p-2 mt-2">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-imperial" />
                  <span className="text-sm">{uploadedDanfe}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setUploadedDanfe(null)} className="h-6 w-6 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison PO vs NF */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparação PO vs NF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2 text-left text-sm font-semibold">Item</th>
                  <th className="border px-4 py-2 text-right text-sm font-semibold">Valor PO</th>
                  <th className="border px-4 py-2 text-right text-sm font-semibold">Valor NF</th>
                  <th className="border px-4 py-2 text-center text-sm font-semibold">Divergência</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 text-sm">Subtotal Produtos</td>
                  <td className="border px-4 py-2 text-right text-sm">{subtotalPo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT</td>
                  <td className="border px-4 py-2 text-right">
                    <Input
                      type="number"
                      value={subtotalNf}
                      onChange={(e) => setSubtotalNf(e.target.value)}
                      className="text-right"
                      step="0.01"
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {parseFloat(subtotalNf) === subtotalPo ? (
                      <CheckCircle className="w-5 h-5 text-imperial mx-auto" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mx-auto" />
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 text-sm">Desconto</td>
                  <td className="border px-4 py-2 text-right text-sm">0,00 MT</td>
                  <td className="border px-4 py-2 text-right">
                    <Input
                      type="number"
                      value={discountNf}
                      onChange={(e) => setDiscountNf(e.target.value)}
                      className="text-right"
                      step="0.01"
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <CheckCircle className="w-5 h-5 text-imperial mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 text-sm">Frete</td>
                  <td className="border px-4 py-2 text-right text-sm">500,00 MT</td>
                  <td className="border px-4 py-2 text-right">
                    <Input
                      type="number"
                      value={freightNf}
                      onChange={(e) => setFreightNf(e.target.value)}
                      className="text-right"
                      step="0.01"
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <CheckCircle className="w-5 h-5 text-imperial mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 text-sm">Seguro</td>
                  <td className="border px-4 py-2 text-right text-sm">100,00 MT</td>
                  <td className="border px-4 py-2 text-right">
                    <Input
                      type="number"
                      value={insuranceNf}
                      onChange={(e) => setInsuranceNf(e.target.value)}
                      className="text-right"
                      step="0.01"
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <CheckCircle className="w-5 h-5 text-imperial mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 text-sm">Outras Despesas</td>
                  <td className="border px-4 py-2 text-right text-sm">50,00 MT</td>
                  <td className="border px-4 py-2 text-right">
                    <Input
                      type="number"
                      value={otherExpensesNf}
                      onChange={(e) => setOtherExpensesNf(e.target.value)}
                      className="text-right"
                      step="0.01"
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <CheckCircle className="w-5 h-5 text-imperial mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 text-sm">IVA/ICMS</td>
                  <td className="border px-4 py-2 text-right text-sm">1.650,00 MT</td>
                  <td className="border px-4 py-2 text-right">
                    <Input
                      type="number"
                      value={icmsNf}
                      onChange={(e) => setIcmsNf(e.target.value)}
                      className="text-right"
                      step="0.01"
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <CheckCircle className="w-5 h-5 text-imperial mx-auto" />
                  </td>
                </tr>
                <tr className="bg-twilight font-semibold">
                  <td className="border px-4 py-3 text-sm">TOTAL GERAL</td>
                  <td className="border px-4 py-3 text-right text-lg">
                    {totalPo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT
                  </td>
                  <td className="border px-4 py-3 text-right text-lg">
                    {totalNf.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT
                  </td>
                  <td className="border px-4 py-3 text-center">
                    <div className="text-lg font-bold">
                      {Math.abs(divergence).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT
                    </div>
                    <div className="text-xs">{divergencePercent.toFixed(2)}%</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Visual Indicator */}
          <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${status.color}`}>
            {status.icon}
            <div>
              <div className="font-semibold">{status.text}</div>
              {divergence !== 0 && (
                <div className="text-sm mt-1">
                  Diferença de {Math.abs(divergence).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT (
                  {divergencePercent.toFixed(2)}%)
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items NF vs Receiving */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Itens da NF vs Recebimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Produto</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold">Qtd PO</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold">Qtd NF</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold">Qtd Recebida</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Preço Unit. PO</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Preço Unit. NF</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Subtotal NF</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-imperial" />
                      Carregando itens do pedido...
                    </td>
                  </tr>
                ) : poItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-muted-foreground">
                      Nenhum item encontrado.
                    </td>
                  </tr>
                ) : (
                  poItems.map((item) => (
                    <tr key={item.sku} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="font-mono text-sm font-medium">{item.sku}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </td>
                      <td className="px-4 py-2 text-center text-sm">{item.qtyPo}</td>
                      <td className="px-4 py-2 text-center">
                        <Input type="number" value={item.qtyNf} className="w-20 text-center" readOnly />
                      </td>
                      <td className="px-4 py-2 text-center text-sm font-medium">{item.qtyReceived}</td>
                      <td className="px-4 py-2 text-right text-sm">
                        {item.unitPricePo.toFixed(2)} MT
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Input
                          type="number"
                          value={item.unitPriceNf}
                          className="w-24 text-right"
                          step="0.01"
                          readOnly
                        />
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium">
                        {item.subtotalNf.toLocaleString("pt-BR")} MT
                      </td>
                      <td className="px-4 py-2 text-center">
                        {item.qtyNf === item.qtyReceived && item.unitPricePo === item.unitPriceNf ? (
                          <Badge className="bg-twilight text-imperial">✅ Conforme</Badge>
                        ) : (
                          <Badge variant="destructive">❌ Divergente</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Divergence Handling */}
      {divergencePercent >= 5 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Tratamento de Divergências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={divergenceAction} onValueChange={setDivergenceAction}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="approve-divergence" id="approve-divergence" />
                  <label htmlFor="approve-divergence" className="text-sm cursor-pointer">
                    Aprovar NF com Divergências (requer aprovação superior)
                  </label>
                </div>
                {divergenceAction === "approve-divergence" && (
                  <div className="ml-6 space-y-3 border-l-2 border-yellow-200 pl-4">
                    <div>
                      <Label htmlFor="approver">Aprovador *</Label>
                      <Select value={approver} onValueChange={setApprover}>
                        <SelectTrigger id="approver">
                          <SelectValue placeholder="Selecione o aprovador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Gerente Financeiro</SelectItem>
                          <SelectItem value="director">Diretor Financeiro</SelectItem>
                          <SelectItem value="cfo">CFO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="approvalJustification">Justificativa da Aprovação *</Label>
                      <Textarea
                        id="approvalJustification"
                        placeholder="Justifique por que a divergência deve ser aprovada..."
                        value={approvalJustification}
                        onChange={(e) => setApprovalJustification(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="complementary-nf" id="complementary-nf" />
                  <label htmlFor="complementary-nf" className="text-sm cursor-pointer">
                    Solicitar Nota Fiscal Complementar ao Fornecedor
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="adjustment-nf" id="adjustment-nf" />
                  <label htmlFor="adjustment-nf" className="text-sm cursor-pointer">
                    Solicitar Nota Fiscal de Ajuste/Correção
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="reject-nf" id="reject-nf" />
                  <label htmlFor="reject-nf" className="text-sm cursor-pointer text-red-600">
                    Rejeitar NF e Bloquear Pagamento
                  </label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* GRN */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">GRN (Goods Receipt Note)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
            <div>
              <Label>Código GRN</Label>
              <div className="font-mono font-medium">GRN-2025-001 (auto-gerado)</div>
            </div>
            <div>
              <Label>Data de Geração</Label>
              <div className="font-medium">{new Date().toLocaleDateString("pt-BR")}</div>
            </div>
            <div>
              <Label>Responsável</Label>
              <div className="font-medium">Finance User</div>
            </div>
            <div>
              <Label>Status</Label>
              <Badge className="bg-yellow-500">Pendente</Badge>
            </div>
          </div>

          <div>
            <Label htmlFor="grnObservations">Observações do GRN</Label>
            <Textarea
              id="grnObservations"
              placeholder="Notas gerais sobre o recebimento fiscal..."
              value={grnObservations}
              onChange={(e) => setGrnObservations(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Vincular ao processo de Contas a Pagar</Label>
              <p className="text-sm text-muted-foreground">Cria título automaticamente no financeiro</p>
            </div>
            <Checkbox checked={linkToPayable} onCheckedChange={(checked) => setLinkToPayable(checked as boolean)} />
          </div>

          {linkToPayable && (
            <div className="ml-6 space-y-3 border-l-2 border-twilight pl-4">
              <div>
                <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger id="paymentTerms">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7 dias">7 dias</SelectItem>
                    <SelectItem value="15 dias">15 dias</SelectItem>
                    <SelectItem value="30 dias">30 dias</SelectItem>
                    <SelectItem value="45 dias">45 dias</SelectItem>
                    <SelectItem value="60 dias">60 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
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
        <Button variant="destructive" onClick={handleReject}>
          <XCircle className="w-4 h-4 mr-2" />
          Rejeitar NF
        </Button>
        <Button className="bg-imperial hover:bg-imperial" onClick={handleApproveGRN} disabled={isSaving}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Aprovar e Gerar GRN
        </Button>
      </div>

      {/* Confirm Approve Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Conferência Fiscal?</DialogTitle>
            <DialogDescription>
              Revise todas as informações antes de gerar o GRN.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total NF:</span>
                <span className="font-semibold">{totalNf.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total PO:</span>
                <span className="font-semibold">{totalPo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Divergência:</span>
                <span className={`font-semibold ${divergence === 0 ? "text-imperial" : "text-orange-600"}`}>
                  {Math.abs(divergence).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold">{status.text}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="confirmReview" required />
              <label htmlFor="confirmReview" className="text-sm cursor-pointer">
                Confirmo que revisei todos os valores *
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Revisar
            </Button>
            <Button
              className="bg-imperial hover:bg-imperial"
              onClick={confirmApprove}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando GRN...
                </>
              ) : (
                "Confirmar e Gerar GRN"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Rejeitar Nota Fiscal?</DialogTitle>
            <DialogDescription className="text-red-600">
              O pagamento será bloqueado e o fornecedor notificado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejectionReason">Motivo Detalhado da Rejeição * (mínimo 100 caracteres)</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Descreva detalhadamente o motivo da rejeição..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
              />
              <p className={`text-xs mt-1 ${rejectionReason.length < 100 ? "text-red-600" : "text-imperial"}`}>
                {rejectionReason.length}/100 caracteres mínimos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="notifySupplierReject" defaultChecked />
              <label htmlFor="notifySupplierReject" className="text-sm cursor-pointer">
                Notificar fornecedor imediatamente *
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="blockFutureNf" />
              <label htmlFor="blockFutureNf" className="text-sm cursor-pointer">
                Bloquear futuras NFs deste fornecedor até regularização
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejeitando...
                </>
              ) : (
                "Confirmar Rejeição"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




