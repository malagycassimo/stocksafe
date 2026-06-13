"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Save, Printer, X, Upload, FileText, AlertTriangle, Lock, CheckCircle2, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export function PoInvoicingContent() {
  const params = useParams()
  const router = useRouter()
  const poId = params.id as string

  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [documentType, setDocumentType] = useState("Fatura")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState("")
  const [invoiceValue, setInvoiceValue] = useState("775.00")
  const [ivaPercent, setIvaPercent] = useState("17")
  const [irpsPercent, setIrpsPercent] = useState("0")
  const [otherTaxes, setOtherTaxes] = useState("0")
  const [paymentMethod, setPaymentMethod] = useState("Transferência Bancária")
  const [observations, setObservations] = useState("")
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [boletoFile, setBoletoFile] = useState<File | null>(null)
  const [autoPrint, setAutoPrint] = useState(true)
  const [generatePdf, setGeneratePdf] = useState(true)
  const [copies, setCopies] = useState("2")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmChecked, setConfirmChecked] = useState(false)

  // Mock PO data
  const poData = {
    number: poId,
    supplier: "Fornecedor A",
    totalValue: 775.0,
    issueDate: "2025-01-16",
    itemsCount: 2,
    items: [
      {
        id: 1,
        product: "PRD-001 - Produto Teste A",
        quantity: 100,
        unit: "UN",
        lotProposed: "L2025-001",
        expiryProposed: "2025-12-30",
        datasheet: "datasheet-001.pdf",
      },
      {
        id: 2,
        product: "PRD-002 - Produto Teste B",
        quantity: 50,
        unit: "KG",
        lotProposed: "L2025-002",
        expiryProposed: "2026-06-15",
        datasheet: "datasheet-002.pdf",
      },
    ],
  }

  const calculateTaxes = () => {
    const value = Number.parseFloat(invoiceValue) || 0
    const iva = (value * Number.parseFloat(ivaPercent)) / 100
    const irps = (value * Number.parseFloat(irpsPercent)) / 100
    const other = Number.parseFloat(otherTaxes) || 0
    return {
      iva: iva.toFixed(2),
      irps: irps.toFixed(2),
      other: other.toFixed(2),
      total: (iva + irps + other).toFixed(2),
    }
  }

  const taxes = calculateTaxes()
  const valueDifference = (Number.parseFloat(invoiceValue) - poData.totalValue).toFixed(2)

  const handleSave = () => {
    toast.success("Dados de faturação salvos")
  }

  const handleInvoiceAndPrint = () => {
    if (!invoiceNumber || !invoiceFile) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmInvoicing = () => {
    if (!confirmChecked) {
      toast.error("Você precisa confirmar para prosseguir")
      return
    }

    // Simulate API call
    toast.success(`PO faturado com sucesso! ${poData.itemsCount} etiquetas geradas`)
    setShowConfirmModal(false)
    router.push(`/compras/pos/${poId}/etiquetas-provisorias`)
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/compras" className="hover:text-imperial">
          Compras
        </Link>
        {" / "}
        <Link href="/compras/pos" className="hover:text-imperial">
          POs
        </Link>
        {" / "}
        <Link href={`/compras/pos/${poId}`} className="hover:text-imperial">
          PO #{poId}
        </Link>
        {" / "}
        <span className="text-foreground">Faturação</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">Faturação do PO #{poId}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
          <Button className="bg-imperial hover:bg-imperial" onClick={handleInvoiceAndPrint}>
            <Printer className="w-4 h-4 mr-2" />
            Faturar e Emitir Etiquetas
          </Button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800">
          Após a faturação, as etiquetas provisórias serão geradas automaticamente e os dados de lote/validade propostos
          ficarão bloqueados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* PO Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do PO (Resumo)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Nº PO</div>
                  <div className="font-mono font-medium">{poData.number}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Fornecedor</div>
                  <div className="font-medium">{poData.supplier}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Valor Total</div>
                  <div className="font-medium text-imperial">{poData.totalValue.toFixed(2)} MZN</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Data de Emissão</div>
                  <div className="font-medium">{new Date(poData.issueDate).toLocaleDateString("pt-BR")}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Qtd de Itens</div>
                  <div className="font-medium">{poData.itemsCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Fatura/Proforma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">
                    Número da Fatura/Proforma <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="Ex: NF-2025-001"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>

                <div>
                  <Label>
                    Tipo de Documento <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup value={documentType} onValueChange={setDocumentType} className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Fatura" id="fatura" />
                      <Label htmlFor="fatura" className="font-normal cursor-pointer">
                        Fatura
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Proforma" id="proforma" />
                      <Label htmlFor="proforma" className="font-normal cursor-pointer">
                        Proforma
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Nota Fiscal" id="nota" />
                      <Label htmlFor="nota" className="font-normal cursor-pointer">
                        Nota Fiscal
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">
                    Data de Emissão da Fatura <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="invoiceValue">
                  Valor da Fatura <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="invoiceValue"
                    type="number"
                    step="0.01"
                    value={invoiceValue}
                    onChange={(e) => setInvoiceValue(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {Number.parseFloat(valueDifference) !== 0 && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    Valor divergente do PO ({Number.parseFloat(valueDifference) > 0 ? "+" : ""}
                    {valueDifference} MZN)
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="font-medium mb-3">Impostos Detalhados</div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="iva">IVA (%)</Label>
                      <Input
                        id="iva"
                        type="number"
                        step="0.01"
                        value={ivaPercent}
                        onChange={(e) => setIvaPercent(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Valor IVA</Label>
                      <Input value={`${taxes.iva} MZN`} disabled />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="irps">IRPS (%)</Label>
                      <Input
                        id="irps"
                        type="number"
                        step="0.01"
                        value={irpsPercent}
                        onChange={(e) => setIrpsPercent(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Valor IRPS</Label>
                      <Input value={`${taxes.irps} MZN`} disabled />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="other">Outros Impostos (Valor)</Label>
                      <Input
                        id="other"
                        type="number"
                        step="0.01"
                        value={otherTaxes}
                        onChange={(e) => setOtherTaxes(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Total de Impostos</Label>
                      <Input value={`${taxes.total} MZN`} disabled className="font-medium" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="paymentMethod">Forma de Pagamento Confirmada</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observations">Observações da Faturação</Label>
                <Textarea
                  id="observations"
                  placeholder="Observações sobre a fatura, condições especiais, etc."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload de Documentos Fiscais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="invoiceFile">
                  Upload da Fatura (PDF) <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-imperial transition-colors cursor-pointer">
                  <input
                    id="invoiceFile"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="invoiceFile" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {invoiceFile ? invoiceFile.name : "Clique ou arraste o arquivo PDF aqui"}
                    </p>
                  </label>
                </div>
              </div>

              {paymentMethod === "Boleto" && (
                <div>
                  <Label htmlFor="boletoFile">Upload de Boleto</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-imperial transition-colors cursor-pointer">
                    <input
                      id="boletoFile"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => setBoletoFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="boletoFile" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {boletoFile ? boletoFile.name : "Clique ou arraste o arquivo PDF aqui"}
                      </p>
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle>Confirmação de Itens e Lotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Após faturação, os dados de Lote Proposto e Validade Proposta não poderão ser alterados
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Produto</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Qtd</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Lote Proposto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Validade Proposta</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Datasheet</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {poData.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm">{item.product}</td>
                        <td className="px-4 py-3 text-center text-sm">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">{item.lotProposed}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(item.expiryProposed).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="link" size="sm" className="text-imperial">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className="bg-twilight text-imperial">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Confirmado
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Label Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview das Etiquetas Provisórias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Serão geradas {poData.itemsCount} etiquetas provisórias (uma por item)
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                <div className="text-center space-y-2">
                  <div className="text-xs font-bold text-imperial">STOCKSAFE - Etiqueta Provisória</div>
                  <div className="border-t border-b py-2 space-y-1">
                    <div className="text-xs">
                      <span className="font-medium">PO:</span> #{poId} | <span className="font-medium">Linha:</span> 1
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Produto:</span> PRD-001
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Fornecedor:</span> {poData.supplier}
                    </div>
                  </div>
                  <div className="py-2 space-y-1">
                    <div className="text-xs">
                      <span className="font-medium">Lote Proposto:</span> L2025-001
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Validade:</span> 30/12/2025
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Quantidade:</span> 100 UN
                    </div>
                  </div>
                  <div className="bg-gray-800 h-12 flex items-center justify-center text-white text-xs font-mono">
                    |||||| |||| ||||||
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Data Emissão: {new Date().toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <div>
                  <span className="font-medium">Formato:</span> GS1-128
                </div>
                <div>
                  <span className="font-medium">Tamanho:</span> 50×25 mm
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Print Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Impressão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="printer">
                  Impressora <span className="text-red-500">*</span>
                </Label>
                <Select defaultValue="zebra-zd420">
                  <SelectTrigger id="printer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zebra-zd420">Zebra ZD420 (Padrão)</SelectItem>
                    <SelectItem value="brother-ql">Brother QL-820NWB</SelectItem>
                    <SelectItem value="dymo-450">Dymo LabelWriter 450</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="copies">Quantidade de cópias por etiqueta</Label>
                <Input id="copies" type="number" min="1" value={copies} onChange={(e) => setCopies(e.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoPrint" checked={autoPrint} onCheckedChange={(checked) => setAutoPrint(!!checked)} />
                  <Label htmlFor="autoPrint" className="font-normal cursor-pointer">
                    Imprimir automaticamente após faturação
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generatePdf"
                    checked={generatePdf}
                    onCheckedChange={(checked) => setGeneratePdf(!!checked)}
                  />
                  <Label htmlFor="generatePdf" className="font-normal cursor-pointer">
                    Gerar também em PDF para envio por email
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Faturação do PO #{poId}?</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>Serão geradas {poData.itemsCount} etiquetas provisórias</p>
              <p>Os dados de lote/validade propostos serão bloqueados</p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="confirm"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(!!checked)}
            />
            <Label htmlFor="confirm" className="font-normal cursor-pointer">
              Li e confirmo <span className="text-red-500">*</span>
            </Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-imperial hover:bg-imperial"
              onClick={handleConfirmInvoicing}
              disabled={!confirmChecked}
            >
              Confirmar Faturação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




