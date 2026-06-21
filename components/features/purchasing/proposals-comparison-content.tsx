"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { comprasService } from "@/app/services/comprasService"
import {
  RefreshCw,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Award,
  FileText,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SupplierProposal {
  supplierId: string
  proposalId: string
  supplierName: string
  supplierInitials: string
  supplierScore: number
  lot: string
  expiryDate: string
  daysUntilExpiry: number
  datasheet: string
  unitPrice: number
  currency: string
  deliveryTime: number
  deliveryUnit: string
  observations: string
  conformity: "conforme" | "parcial" | "nao-conforme"
}

interface ItemComparison {
  itemId: string
  sku: string
  description: string
  quantity: number
  unit: string
  minValidity: number
  proposals: SupplierProposal[]
  selectedSupplier?: string
}

export function ProposalsComparisonContent() {
  const router = useRouter()
  const params = useParams()
  const rfqId = params?.id as string
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<"by-item" | "by-supplier">("by-item")
  const [filterMode, setFilterMode] = useState("all")
  const [highlightBest, setHighlightBest] = useState(true)
  const [showSelectionModal, setShowSelectionModal] = useState(false)
  const [justification, setJustification] = useState("")
  const [confirmations, setConfirmations] = useState({
    analyzed: false,
    confirmed: false,
    approved: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState<ItemComparison[]>([])
  const [rfqDetails, setRfqDetails] = useState<any>(null)

  const loadComparativo = () => {
    if (!rfqId) return
    setIsLoading(true)
    
    // Fetch RFQ details for general info
    comprasService.obterRFQ(rfqId)
      .then(setRfqDetails)
      .catch(err => console.error("Erro ao obter detalhes da RFQ:", err))

    comprasService.getComparativoPropostas(rfqId)
      .then((data) => {
        if (!data || !data.propostas || data.propostas.length === 0) {
          setItems([])
          setIsLoading(false)
          return
        }

        const itemMap = new Map<string, any>()
        data.propostas.forEach((prop: any) => {
          prop.itens.forEach((item: any) => {
            if (!itemMap.has(item.produtoSku)) {
              itemMap.set(item.produtoSku, {
                itemId: item.produtoSku,
                sku: item.produtoSku,
                description: item.produtoDescricao,
                quantity: item.quantidade,
                unit: "UN",
                minValidity: 180,
                proposals: []
              })
            }
            const currentItem = itemMap.get(item.produtoSku)
            currentItem.proposals.push({
              supplierId: prop.fornecedorId || prop.propostaId,
              proposalId: prop.propostaId,
              supplierName: prop.fornecedorNome,
              supplierInitials: prop.fornecedorNome.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
              supplierScore: 90,
              lot: "L-PADRAO",
              expiryDate: new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0],
              daysUntilExpiry: 180,
              datasheet: "DS-PADRAO.pdf",
              unitPrice: item.precoUnitario,
              currency: "MT",
              deliveryTime: prop.prazoEntrega,
              deliveryUnit: "dias",
              observations: "",
              conformity: "conforme"
            })
          })
        })
        setItems(Array.from(itemMap.values()))
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Erro ao obter comparativo de propostas:", err)
        setItems([])
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadComparativo()
  }, [rfqId])

  const getBestPrice = (proposals: SupplierProposal[]) => {
    return Math.min(...proposals.map((p) => p.unitPrice))
  }

  const getBestDelivery = (proposals: SupplierProposal[]) => {
    return Math.min(...proposals.map((p) => p.deliveryTime))
  }

  const getBestValidity = (proposals: SupplierProposal[]) => {
    return Math.max(...proposals.map((p) => p.daysUntilExpiry))
  }

  const getConformityIcon = (conformity: string) => {
    switch (conformity) {
      case "conforme":
        return <CheckCircle className="w-5 h-5 text-imperial" />
      case "parcial":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "nao-conforme":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getValidityBadge = (daysUntilExpiry: number, minValidity: number) => {
    if (daysUntilExpiry >= minValidity) {
      return <Badge className="bg-twilight text-imperial">Conforme</Badge>
    } else if (daysUntilExpiry >= minValidity * 0.5) {
      return <Badge className="bg-yellow-100 text-yellow-800">Abaixo do Mínimo</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Muito Abaixo</Badge>
    }
  }

  const selectSupplierForItem = (itemId: string, supplierId: string) => {
    setItems((prev) => prev.map((item) => (item.itemId === itemId ? { ...item, selectedSupplier: supplierId } : item)))
  }

  const handleGeneratePO = () => {
    const unselectedItems = items.filter((item) => !item.selectedSupplier)
    if (unselectedItems.length > 0) {
      toast({
        title: "Seleção incompleta",
        description: `Selecione fornecedores para todos os ${unselectedItems.length} item(ns) restante(s).`,
        variant: "destructive",
      })
      return
    }

    if (!justification || !confirmations.analyzed || !confirmations.confirmed) {
      toast({
        title: "Confirmação incompleta",
        description: "Preencha a justificativa e marque todas as confirmações obrigatórias.",
        variant: "destructive",
      })
      return
    }

    setShowSelectionModal(true)
  }

  const confirmGeneratePO = async () => {
    try {
      const selectedSuppliers = Array.from(new Set(items.map(item => item.selectedSupplier).filter(Boolean)));
      
      for (const supplierId of selectedSuppliers) {
        const firstItem = items.find(item => item.selectedSupplier === supplierId);
        const proposal = firstItem?.proposals.find(p => p.supplierId === supplierId);
        if (!proposal) continue;

        const proposalId = proposal.proposalId;

        const supplierItems = items.filter(item => item.selectedSupplier === supplierId);
        const totalVal = supplierItems.reduce((sum, item) => {
          const itemProp = item.proposals.find(p => p.supplierId === supplierId);
          return sum + (itemProp?.unitPrice || 0) * item.quantity;
        }, 0);

        const year = new Date().getFullYear();
        const rand = Math.floor(100 + Math.random() * 900);
        const poCode = `PO-${year}-${rand}`;

        await comprasService.createPO({
          codigo: poCode,
          fornecedorId: supplierId!,
          propostaId: proposalId,
          totalValue: totalVal,
          expectedDelivery: new Date(Date.now() + (proposal.deliveryTime || 5) * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      toast({
        title: "PO(s) gerado(s) com sucesso!",
        description: "Os fornecedores selecionados foram notificados.",
      })
      router.push("/compras/pos")
    } catch (err: any) {
      console.error("Erro ao gerar PO:", err);
      toast({
        title: "Erro ao gerar PO",
        description: err.response?.data?.error || "Não foi possível gerar a ordem de compra.",
        variant: "destructive"
      });
    }
  }

  // Get unique list of responding suppliers
  const allSuppliers = items.length > 0 ? items[0].proposals : []

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
        <Link href="/compras/rfqs" className="hover:text-imperial">
          RFQs
        </Link>
        {" / "}
        <span className="text-foreground">Comparativo</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Comparativo de Propostas - RFQ #{rfqDetails?.codigo || rfqId}</h1>
          <Badge className="mt-2 bg-twilight text-imperial">{allSuppliers.length} fornecedor(es) responderam</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadComparativo}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Comparativo
          </Button>
          <Button
            className="bg-imperial hover:bg-imperial"
            onClick={handleGeneratePO}
            disabled={items.some((item) => !item.selectedSupplier)}
          >
            <Send className="w-4 h-4 mr-2" />
            Selecionar Fornecedor
          </Button>
        </div>
      </div>

      {/* RFQ Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumo da RFQ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="text-muted-foreground">Nº RFQ</Label>
              <div className="font-mono font-medium">{rfqDetails?.codigo || rfqId}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Prazo de Resposta</Label>
              <div className="text-imperial font-medium">{rfqDetails ? new Date(rfqDetails.dataLimite).toLocaleString("pt-BR") : "Carregando..."}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Data de Criação</Label>
              <div className="font-medium">{rfqDetails ? new Date(rfqDetails.createdAt).toLocaleDateString("pt-BR") : "Carregando..."}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Fornecedores</Label>
              <div className="font-medium">{allSuppliers.length} responderam</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>Visualização</Label>
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="by-item">Por Item</TabsTrigger>
                  <TabsTrigger value="by-supplier">Por Fornecedor</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="w-[200px]">
              <Label>Mostrar apenas</Label>
              <Select value={filterMode} onValueChange={setFilterMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="conforme">Propostas Conformes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="highlight"
                checked={highlightBest}
                onCheckedChange={(checked) => setHighlightBest(!!checked)}
              />
              <label htmlFor="highlight" className="text-sm cursor-pointer">
                Destacar melhor proposta por critério
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison by Item */}
      {viewMode === "by-item" && items.length > 0 && (
        <div className="space-y-6">
          {items.map((item) => {
            const bestPrice = getBestPrice(item.proposals)
            const bestDelivery = getBestDelivery(item.proposals)
            const bestValidity = getBestValidity(item.proposals)

            return (
              <Card key={item.itemId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {item.sku} - {item.description}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Quantidade: {item.quantity} {item.unit} | Validade Mínima: {item.minValidity} dias
                      </p>
                    </div>
                    {item.selectedSupplier && (
                      <Badge className="bg-twilight text-imperial">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Fornecedor Selecionado
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Critério</th>
                          {item.proposals.map((proposal) => (
                            <th key={proposal.supplierId} className="px-4 py-3 text-center text-sm font-semibold">
                              <div className="flex flex-col items-center gap-2">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-twilight text-imperial">
                                    {proposal.supplierInitials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>{proposal.supplierName}</div>
                                <div className="text-xs text-muted-foreground">Score: {proposal.supplierScore}%</div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-4 py-3 font-medium">Lote Proposto</td>
                          {item.proposals.map((proposal) => (
                            <td key={proposal.supplierId} className="px-4 py-3 text-center">
                              <div className="font-mono text-sm">{proposal.lot}</div>
                              <Badge className="mt-1 bg-twilight text-imperial">Conforme</Badge>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-medium">Validade Proposta</td>
                          {item.proposals.map((proposal) => (
                            <td key={proposal.supplierId} className="px-4 py-3 text-center">
                              <div className="text-sm">{new Date(proposal.expiryDate).toLocaleDateString("pt-BR")}</div>
                              <div className="text-xs text-muted-foreground">{proposal.daysUntilExpiry} dias</div>
                              {getValidityBadge(proposal.daysUntilExpiry, item.minValidity)}
                              {highlightBest && proposal.daysUntilExpiry === bestValidity && (
                                <Badge className="mt-1 bg-blue-100 text-blue-800">
                                  <Award className="w-3 h-3 mr-1" />
                                  Melhor Validade
                                </Badge>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-medium">Datasheet/CoA</td>
                          {item.proposals.map((proposal) => (
                            <td key={proposal.supplierId} className="px-4 py-3 text-center">
                              <Button variant="link" size="sm" className="text-blue-600">
                                <FileText className="w-4 h-4 mr-1" />
                                {proposal.datasheet}
                              </Button>
                              <div className="mt-1">
                                <CheckCircle className="w-4 h-4 text-imperial inline" />
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-medium">Preço Unitário</td>
                          {item.proposals.map((proposal) => (
                            <td key={proposal.supplierId} className="px-4 py-3 text-center">
                              <div className="text-lg font-bold">
                                {proposal.unitPrice.toFixed(2)} {proposal.currency}
                              </div>
                              {highlightBest && proposal.unitPrice === bestPrice && (
                                <Badge className="mt-1 bg-twilight text-imperial">
                                  <Award className="w-3 h-3 mr-1" />
                                  Melhor Preço
                                </Badge>
                              )}
                              {proposal.unitPrice !== bestPrice && (
                                <div className="text-xs text-red-600 mt-1">
                                  +{(((proposal.unitPrice - bestPrice) / bestPrice) * 100).toFixed(1)}%
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-medium">Subtotal</td>
                          {item.proposals.map((proposal) => (
                            <td key={proposal.supplierId} className="px-4 py-3 text-center">
                              <div className="text-lg font-bold text-imperial">
                                {(proposal.unitPrice * item.quantity).toFixed(2)} {proposal.currency}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-medium">Prazo de Entrega</td>
                          {item.proposals.map((proposal) => (
                            <td key={proposal.supplierId} className="px-4 py-3 text-center">
                              <div className="text-sm">
                                {proposal.deliveryTime} {proposal.deliveryUnit}
                              </div>
                              {highlightBest && proposal.deliveryTime === bestDelivery && (
                                <Badge className="mt-1 bg-purple-100 text-purple-800">
                                  <Award className="w-3 h-3 mr-1" />
                                  Mais Rápido
                                </Badge>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-medium">Conformidade Geral</td>
                          {item.proposals.map((proposal) => (
                            <td key={proposal.supplierId} className="px-4 py-3 text-center">
                              {getConformityIcon(proposal.conformity)}
                              <div className="text-sm mt-1 capitalize">{proposal.conformity.replace("-", " ")}</div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 font-medium">Ação</td>
                          {item.proposals.map((proposal) => (
                            <td key={proposal.supplierId} className="px-4 py-3 text-center">
                              {item.selectedSupplier === proposal.supplierId ? (
                                <div className="flex flex-col items-center gap-2">
                                  <CheckCircle className="w-8 h-8 text-imperial" />
                                  <span className="text-sm font-medium text-imperial">Selecionado</span>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => selectSupplierForItem(item.itemId, proposal.supplierId)}
                                  className="bg-transparent"
                                >
                                  Selecionar
                                </Button>
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Consolidated Analysis */}
      {items.length > 0 && (
        <Card className="mb-6 mt-6">
          <CardHeader>
            <CardTitle>Análise Consolidada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Fornecedor</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Valor Total</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Prazo Médio</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Conformidade</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allSuppliers.map((supplier) => {
                    // Compute total and delivery dynamically
                    const supplierProps = items.map(item => {
                      const prop = item.proposals.find(p => p.supplierId === supplier.supplierId)
                      return {
                        price: (prop?.unitPrice || 0) * item.quantity,
                        deliveryTime: prop?.deliveryTime || 0
                      }
                    })
                    const totalVal = supplierProps.reduce((sum, p) => sum + p.price, 0)
                    const avgDelivery = supplierProps.reduce((sum, p) => sum + p.deliveryTime, 0) / items.length

                    return (
                      <tr key={supplier.supplierId}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-twilight text-imperial">{supplier.supplierInitials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{supplier.supplierName}</div>
                              <div className="text-sm text-muted-foreground">Score: {supplier.supplierScore}%</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-bold text-imperial">{totalVal.toFixed(2)} MT</div>
                        </td>
                        <td className="px-4 py-3 text-center">{avgDelivery.toFixed(1)} dias</td>
                        <td className="px-4 py-3 text-center">
                          <Progress value={100} className="h-2" />
                          <div className="text-sm mt-1">100%</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-lg font-bold text-imperial">{supplier.supplierScore}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision and Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Decisão e Seleção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length > 0 && items.every((item) => item.selectedSupplier) ? (
            <>
              <div className="bg-twilight p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-imperial" />
                  Fornecedores Selecionados
                </h4>
                <div className="space-y-2 text-sm">
                  {items.map((item) => {
                    const selectedProposal = item.proposals.find((p) => p.supplierId === item.selectedSupplier)
                    return (
                      <div key={item.itemId} className="flex justify-between">
                        <span>
                          {item.sku} - {item.description}:
                        </span>
                        <span className="font-medium">{selectedProposal?.supplierName}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label>
                  Justificativa da Escolha <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Por que escolheu este(s) fornecedor(es)?..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="analyzed"
                    checked={confirmations.analyzed}
                    onCheckedChange={(checked) => setConfirmations({ ...confirmations, analyzed: !!checked })}
                  />
                  <label htmlFor="analyzed" className="text-sm cursor-pointer">
                    Confirmo que analisei todas as propostas <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="confirmed"
                    checked={confirmations.confirmed}
                    onCheckedChange={(checked) => setConfirmations({ ...confirmations, confirmed: !!checked })}
                  />
                  <label htmlFor="confirmed" className="text-sm cursor-pointer">
                    Confirmo a seleção do(s) fornecedor(es) <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              <Button className="w-full bg-imperial hover:bg-imperial" onClick={handleGeneratePO}>
                <Send className="w-4 h-4 mr-2" />
                Confirmar Seleção e Gerar PO
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
              <p className="font-medium">Análise em Andamento</p>
              <p className="text-sm">Analise as propostas e selecione o(s) fornecedor(es) para cada item</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={showSelectionModal} onOpenChange={setShowSelectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Pedido de Compra?</DialogTitle>
            <DialogDescription>
              Isso criará automaticamente o(s) PO(s) no sistema com os fornecedores selecionados.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              {items.map((item) => {
                const selectedProposal = item.proposals.find((p) => p.supplierId === item.selectedSupplier)
                return (
                  <div key={item.itemId} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>
                      {item.sku} - {item.description}
                    </span>
                    <span className="font-medium">{selectedProposal?.supplierName}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSelectionModal(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmGeneratePO} className="bg-imperial hover:bg-imperial">
              Confirmar e Gerar PO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
