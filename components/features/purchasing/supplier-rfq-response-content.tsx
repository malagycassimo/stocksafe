"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Save, Send, AlertTriangle, CheckCircle, Clock, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { comprasService } from "@/app/services/comprasService"
import { api } from "@/app/services/api"

interface RfqItemResponse {
  id: string
  sku: string
  description: string
  quantity: number
  unit: string
  minValidity: number
  specifications: string
  proposedLot: string
  proposedExpiry: string
  datasheet: string
  unitPrice: string
  currency: string
  deliveryTime: string
  deliveryUnit: string
  observations: string
  isComplete: boolean
  validityWarning: boolean
}

export function SupplierRfqResponseContent() {
  const router = useRouter()
  const params = useParams()
  const rfqId = params?.id as string
  const { toast } = useToast()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rfq, setRfq] = useState<any>(null)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("")

  const [items, setItems] = useState<RfqItemResponse[]>([])

  const [generalConditions, setGeneralConditions] = useState({
    paymentTerms: "",
    incoterm: "",
    freight: "Incluso",
    freightValue: "",
    proposalValidity: "30",
    generalObservations: "",
  })

  const [confirmation, setConfirmation] = useState({
    dataCorrect: false,
    lotsAvailable: false,
    termsAccepted: false,
    signerName: "",
    signerPosition: "",
    digitalSignature: false,
  })

  useEffect(() => {
    if (!rfqId) return
    setLoading(true)

    // Load RFQ details
    comprasService.obterRFQ(rfqId)
      .then((data) => {
        setRfq(data)
        if (data.items) {
          setItems(data.items.map((item: any) => ({
            id: item.produto?.id || item.produtoId,
            sku: item.produto?.sku || "PROD",
            description: item.produto?.descricao || "Produto",
            quantity: item.quantidade,
            unit: item.produto?.unidade_medida || "UN",
            minValidity: item.produto?.vida_util_dias || 180,
            specifications: item.observacoes || "",
            proposedLot: "",
            proposedExpiry: "",
            datasheet: "DS-2024-001",
            unitPrice: "",
            currency: "MT",
            deliveryTime: "",
            deliveryUnit: "dias",
            observations: "",
            isComplete: false,
            validityWarning: false
          })))
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar RFQ:", err)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da RFQ.",
          variant: "destructive"
        })
      })

    // Load suppliers
    api.get("/fornecedores")
      .then((res) => {
        setSuppliers(res.data || [])
        if (res.data && res.data.length > 0) {
          setSelectedSupplierId(res.data[0].id)
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar fornecedores:", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [rfqId])

  const calculateDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return 0
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const updateItem = (id: string, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item

        const updated = { ...item, [field]: value }

        // Check if item is complete
        const isComplete =
          updated.proposedLot &&
          updated.proposedExpiry &&
          updated.datasheet &&
          updated.unitPrice &&
          updated.deliveryTime

        // Check validity warning
        const daysUntilExpiry = calculateDaysUntilExpiry(updated.proposedExpiry)
        const validityWarning = daysUntilExpiry < item.minValidity

        return { ...updated, isComplete: !!isComplete, validityWarning }
      }),
    )
  }

  const getItemStatus = (item: RfqItemResponse) => {
    if (item.isComplete && item.validityWarning) {
      return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" }
    }
    if (item.isComplete) {
      return { icon: CheckCircle, color: "text-imperial", bg: "bg-twilight" }
    }
    return { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" }
  }

  const handleSaveProgress = () => {
    toast({
      title: "Progresso salvo",
      description: "Você pode continuar a resposta mais tarde.",
    })
  }

  const handleSubmitResponse = () => {
    // Validate all items are complete
    const incompleteItems = items.filter((item) => !item.isComplete)
    if (incompleteItems.length > 0) {
      toast({
        title: "Resposta incompleta",
        description: `${incompleteItems.length} item(ns) ainda não foi(ram) preenchido(s) completamente.`,
        variant: "destructive",
      })
      return
    }

    // Validate confirmation checklist
    if (
      !confirmation.dataCorrect ||
      !confirmation.lotsAvailable ||
      !confirmation.signerName ||
      !confirmation.signerPosition
    ) {
      toast({
        title: "Confirmação incompleta",
        description: "Complete todos os campos de confirmação e assinatura digital.",
        variant: "destructive",
      })
      return
    }

    setShowConfirmModal(true)
  }

  const confirmSubmit = () => {
    if (!selectedSupplierId) {
      toast({
        title: "Fornecedor não selecionado",
        description: "Selecione o fornecedor que está a responder.",
        variant: "destructive"
      })
      return
    }

    const payload = {
      rfqId,
      fornecedorId: selectedSupplierId,
      prazoEntrega: parseInt(items[0]?.deliveryTime || "0", 10),
      itens: items.map(item => ({
        produtoId: item.id,
        precoUnitario: parseFloat(item.unitPrice),
        quantidade: item.quantity
      }))
    }

    comprasService.submitProposta(payload)
      .then(() => {
        toast({
          title: "Resposta enviada com sucesso!",
          description: "O comprador foi notificado da sua proposta.",
        })
        setShowConfirmModal(false)
        router.push("/compras/rfqs")
      })
      .catch((err: any) => {
        console.error("Erro ao enviar proposta:", err)
        toast({
          title: "Erro ao enviar proposta",
          description: err.response?.data?.error || "Ocorreu um erro ao enviar a proposta.",
          variant: "destructive"
        })
      })
  }

  const completeItems = items.filter((item) => item.isComplete).length
  const totalValue = items.reduce((sum, item) => sum + (Number.parseFloat(item.unitPrice) || 0) * item.quantity, 0)
  const avgDeliveryTime =
    items.reduce((sum, item) => sum + (Number.parseInt(item.deliveryTime) || 0), 0) / items.length || 0
  const conformingItems = items.filter((item) => item.isComplete && !item.validityWarning).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        <RefreshCw className="w-8 h-8 animate-spin mr-3 text-imperial" />
        Carregando cotação e dados do fornecedor...
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/compras/rfqs" className="hover:text-imperial">
          RFQs
        </Link>
        {" / "}
        <span className="text-foreground">Responder RFQ #{rfq?.codigo || rfqId}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-imperial mb-2">Responder Cotação RFQ #{rfq?.codigo || rfqId}</h1>
          <div className="flex items-center gap-4">
            <Badge className="bg-orange-100 text-orange-800">
              <Clock className="w-3 h-3 mr-1" />
              Prazo de Resposta: {new Date(rfq?.dataLimite).toLocaleString("pt-BR")}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/compras/rfqs")}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleSaveProgress}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Progresso
          </Button>
          <Button className="bg-imperial hover:bg-imperial" onClick={handleSubmitResponse}>
            <Send className="w-4 h-4 mr-2" />
            Enviar Resposta
          </Button>
        </div>
      </div>

      {/* Fornecedor Selection (Demo Simulation mode) */}
      <Card className="mb-6 border-imperial bg-twilight">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-imperial font-bold">Simulação de Fornecedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 max-w-[400px]">
            <Label className="font-semibold text-gray-700">Selecione qual Fornecedor está a responder:</Label>
            <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o Fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.razao_social} {s.nome_fantasia ? `(${s.nome_fantasia})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* RFQ Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações da Cotação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Nº RFQ</Label>
              <div className="font-mono font-medium">{rfq?.codigo || rfqId}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Cliente/Comprador</Label>
              <div className="font-medium">StockSafe Lda</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Data de Criação</Label>
              <div>{new Date(rfq?.createdAt).toLocaleDateString("pt-BR")}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Prazo de Resposta</Label>
              <div className="font-medium text-orange-600">{new Date(rfq?.dataLimite).toLocaleString("pt-BR")}</div>
            </div>
            <div className="col-span-2">
              <Label className="text-muted-foreground">Instruções do Comprador</Label>
              <div className="text-sm">Favor incluir datasheets e lotes válidos para todos os produtos selecionados.</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Itens da Cotação</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((item, index) => {
              const status = getItemStatus(item)
              const StatusIcon = status.icon
              const daysUntilExpiry = calculateDaysUntilExpiry(item.proposedExpiry)

              return (
                <AccordionItem key={item.id} value={item.id} className={`border rounded-lg ${status.bg}`}>
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      <StatusIcon className={`w-5 h-5 ${status.color}`} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">
                          Item {index + 1}: {item.sku} - {item.description}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Quantidade: {item.quantity} {item.unit} | Validade Mínima: {item.minValidity} dias
                        </div>
                      </div>
                      {item.isComplete && (
                        <Badge className="bg-twilight text-imperial">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completo
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 pt-4 border-t">
                      {/* Item Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Informações do Item</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-muted-foreground">Produto</Label>
                            <div>
                              {item.sku} - {item.description}
                            </div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Quantidade Solicitada</Label>
                            <div>
                              {item.quantity} {item.unit}
                            </div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Validade Mínima Requerida</Label>
                            <div>{item.minValidity} dias</div>
                          </div>
                          {item.specifications && (
                            <div>
                              <Label className="text-muted-foreground">Observações/Especificações</Label>
                              <div>{item.specifications}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Response Form */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>
                            Lote Proposto <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            placeholder="Ex: L2026-099"
                            value={item.proposedLot}
                            onChange={(e) => updateItem(item.id, "proposedLot", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>
                            Data de Validade Proposta <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="date"
                            value={item.proposedExpiry}
                            onChange={(e) => updateItem(item.id, "proposedExpiry", e.target.value)}
                          />
                          {item.proposedExpiry && (
                            <div className="mt-1">
                              {daysUntilExpiry < item.minValidity ? (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Atenção: Validade proposta ({daysUntilExpiry} dias) é inferior ao mínimo requerido ({item.minValidity} dias)
                                </p>
                              ) : (
                                <p className="text-xs text-imperial">
                                  Validade de {daysUntilExpiry} dias a partir de hoje
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label>
                            Datasheet/CoA <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={item.datasheet}
                            onValueChange={(value) => updateItem(item.id, "datasheet", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar datasheet..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DS-2024-001">DS-2026-001 - Ficha Técnica Atualizada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>
                            Preço Unitário <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                              className="flex-1"
                            />
                            <Select
                              value={item.currency}
                              onValueChange={(value) => updateItem(item.id, "currency", value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MT">MT</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {item.unitPrice && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Subtotal: {(Number.parseFloat(item.unitPrice) * item.quantity).toFixed(2)} {item.currency}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>
                            Prazo de Entrega <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="5"
                              value={item.deliveryTime}
                              onChange={(e) => updateItem(item.id, "deliveryTime", e.target.value)}
                              className="flex-1"
                            />
                            <Select
                              value={item.deliveryUnit}
                              onValueChange={(value) => updateItem(item.id, "deliveryUnit", value)}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dias">Dias</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <Label>Observações do Item</Label>
                          <Textarea
                            placeholder="Especificações, variações do lote, etc."
                            value={item.observations}
                            onChange={(e) => updateItem(item.id, "observations", e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumo da Proposta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="text-muted-foreground">Total de Itens</Label>
              <div className="text-2xl font-bold">{items.length}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Valor Total</Label>
              <div className="text-2xl font-bold text-imperial">{totalValue.toFixed(2)} MT</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Prazo Médio</Label>
              <div className="text-2xl font-bold">{avgDeliveryTime.toFixed(0)} dias</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Conformidade</Label>
              <div className="text-2xl font-bold">
                {conformingItems} / {items.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Conditions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Condições Gerais da Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Condições de Pagamento</Label>
              <Textarea
                placeholder="Ex: 30 dias após entrega"
                value={generalConditions.paymentTerms}
                onChange={(e) => setGeneralConditions({ ...generalConditions, paymentTerms: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label>Incoterm</Label>
              <Select
                value={generalConditions.incoterm}
                onValueChange={(value) => setGeneralConditions({ ...generalConditions, incoterm: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                  <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                  <SelectItem value="CIF">CIF - Cost, Insurance and Freight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frete</Label>
              <Select
                value={generalConditions.freight}
                onValueChange={(value) => setGeneralConditions({ ...generalConditions, freight: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Incluso">Incluso</SelectItem>
                  <SelectItem value="FOB">FOB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Validade da Proposta (dias)</Label>
              <Input
                type="number"
                value={generalConditions.proposalValidity}
                onChange={(e) => setGeneralConditions({ ...generalConditions, proposalValidity: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Confirmação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="dataCorrect"
                checked={confirmation.dataCorrect}
                onCheckedChange={(checked) => setConfirmation({ ...confirmation, dataCorrect: !!checked })}
              />
              <label htmlFor="dataCorrect" className="text-sm cursor-pointer">
                Confirmo que todos os dados informados estão corretos <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="lotsAvailable"
                checked={confirmation.lotsAvailable}
                onCheckedChange={(checked) => setConfirmation({ ...confirmation, lotsAvailable: !!checked })}
              />
              <label htmlFor="lotsAvailable" className="text-sm cursor-pointer">
                Confirmo disponibilidade dos lotes propostos <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="termsAccepted"
                checked={confirmation.termsAccepted}
                onCheckedChange={(checked) => setConfirmation({ ...confirmation, termsAccepted: !!checked })}
              />
              <label htmlFor="termsAccepted" className="text-sm cursor-pointer">
                Aceito os termos e condições de fornecimento <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-4">Assinatura Digital</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  Nome do Responsável <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={confirmation.signerName}
                  onChange={(e) => setConfirmation({ ...confirmation, signerName: e.target.value })}
                />
              </div>
              <div>
                <Label>
                  Cargo <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={confirmation.signerPosition}
                  onChange={(e) => setConfirmation({ ...confirmation, signerPosition: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar resposta para RFQ #{rfq?.codigo || rfqId}?</DialogTitle>
            <DialogDescription>
              Após o envio, você não poderá mais editar esta resposta. Certifique-se de que todos os dados estão corretos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de Itens:</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Total:</span>
                <span className="font-medium text-imperial">{totalValue.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Itens Completos:</span>
                <span className="font-medium">{completeItems}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmSubmit} className="bg-imperial hover:bg-imperial">
              Confirmar Envio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
