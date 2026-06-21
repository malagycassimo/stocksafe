"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Loader2, Plus, Trash2, ShoppingBag, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { recebimentoService } from "@/app/services/recebimentoService"
import { fornecedorService, type FornecedorData } from "@/app/services/fornecedorService"
import { comprasService } from "@/app/services/comprasService"
import { produtoService, type ProdutoData } from "@/app/services/produtoService"

interface POItem {
  produtoId: string
  sku: string
  description: string
  quantity: number
  price: number
  unit: string
}

export function NewPoContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suppliers, setSuppliers] = useState<FornecedorData[]>([])
  const [products, setProducts] = useState<ProdutoData[]>([])
  const [proposals, setProposals] = useState<any[]>([])

  // Form Fields
  const [codigo, setCodigo] = useState("")
  const [creationMode, setCreationMode] = useState<"proposal" | "manual">("proposal")
  const [selectedProposalId, setSelectedProposalId] = useState("")
  const [fornecedorId, setFornecedorId] = useState("")
  const [totalValue, setTotalValue] = useState(0)
  const [expectedDelivery, setExpectedDelivery] = useState("")

  // Manual Item Adding State
  const [selectedProductId, setSelectedProductId] = useState("")
  const [itemQuantity, setItemQuantity] = useState("1")
  const [itemPrice, setItemPrice] = useState("")
  const [manualItems, setManualItems] = useState<POItem[]>([])

  // Auto-generate code on mount
  useEffect(() => {
    const year = new Date().getFullYear()
    const rand = Math.floor(1000 + Math.random() * 9000)
    setCodigo(`PO-${year}-${rand}`)
  }, [])

  // Load initial data (suppliers, products, and proposals)
  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        const [sups, prods, rfqs] = await Promise.all([
          fornecedorService.listarTodos(),
          produtoService.listarTodos(),
          comprasService.listarRFQs()
        ])

        if (!active) return

        setSuppliers(sups || [])
        setProducts(prods || [])

        // Extract all proposals from RFQs
        const extractedProposals: any[] = []
        rfqs.forEach((rfq: any) => {
          if (rfq.propostas && rfq.propostas.length > 0) {
            rfq.propostas.forEach((prop: any) => {
              const valTotal = prop.itens?.reduce((sum: number, it: any) => sum + (it.precoUnitario * it.quantidade), 0) || 0
              extractedProposals.push({
                id: prop.id,
                codigoRfq: rfq.codigo,
                fornecedorId: prop.fornecedorId,
                fornecedorNome: prop.fornecedor?.razao_social || "Fornecedor",
                prazoEntrega: prop.prazoEntrega || 5,
                valorTotal: valTotal,
                itens: prop.itens?.map((it: any) => ({
                  produtoId: it.produtoId,
                  sku: it.produtoSku || "SKU",
                  description: it.produtoDescricao || "Produto",
                  quantity: it.quantidade,
                  price: it.precoUnitario,
                  unit: "UN" // Fallback default
                })) || []
              })
            })
          }
        })
        setProposals(extractedProposals)
        setLoadingInitial(false)
      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err)
        if (!active) return
        setLoadingInitial(false)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível buscar a lista de fornecedores, produtos e propostas.",
          variant: "destructive"
        })
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [toast])

  // Handle proposal selection
  const handleProposalChange = (proposalId: string) => {
    setSelectedProposalId(proposalId)
    const proposal = proposals.find((p) => p.id === proposalId)
    if (proposal) {
      setFornecedorId(proposal.fornecedorId)
      setTotalValue(proposal.valorTotal)
      
      // Calculate expected delivery date
      const deliveryDate = new Date()
      deliveryDate.setDate(deliveryDate.getDate() + proposal.prazoEntrega)
      setExpectedDelivery(deliveryDate.toISOString().split("T")[0])
    } else {
      setFornecedorId("")
      setTotalValue(0)
      setExpectedDelivery("")
    }
  }

  // Handle manual item addition
  const handleAddManualItem = () => {
    if (!selectedProductId) {
      toast({
        title: "Selecione o produto",
        description: "Por favor, selecione um produto para adicionar.",
        variant: "destructive"
      })
      return
    }

    const prod = products.find((p) => p.id === selectedProductId)
    if (!prod) return

    const qty = parseInt(itemQuantity)
    const price = parseFloat(itemPrice)

    if (isNaN(qty) || qty <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "Insira uma quantidade maior que zero.",
        variant: "destructive"
      })
      return
    }

    if (isNaN(price) || price < 0) {
      toast({
        title: "Preço inválido",
        description: "Insira um preço válido.",
        variant: "destructive"
      })
      return
    }

    // Check if product already added
    const existingIndex = manualItems.findIndex((it) => it.produtoId === selectedProductId)
    let updatedItems = [...manualItems]

    if (existingIndex > -1) {
      // Add quantity
      updatedItems[existingIndex].quantity += qty
      updatedItems[existingIndex].price = price // Override price
    } else {
      updatedItems.push({
        produtoId: prod.id!,
        sku: prod.sku,
        description: prod.descricao,
        quantity: qty,
        price: price,
        unit: prod.unidade_medida || "UN"
      })
    }

    setManualItems(updatedItems)
    setSelectedProductId("")
    setItemQuantity("1")
    setItemPrice("")

    // Calculate total value
    const sum = updatedItems.reduce((acc, it) => acc + (it.quantity * it.price), 0)
    setTotalValue(sum)
  }

  const handleRemoveManualItem = (productId: string) => {
    const updated = manualItems.filter((it) => it.produtoId !== productId)
    setManualItems(updated)
    const sum = updated.reduce((acc, it) => acc + (it.quantity * it.price), 0)
    setTotalValue(sum)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, preencha o código do Pedido de Compra.",
        variant: "destructive"
      })
      return
    }

    if (!fornecedorId) {
      toast({
        title: "Fornecedor obrigatório",
        description: "Por favor, selecione o fornecedor correspondente.",
        variant: "destructive"
      })
      return
    }

    if (totalValue <= 0) {
      toast({
        title: "Valor total inválido",
        description: "O valor total do pedido deve ser maior que zero. Adicione itens ou selecione uma proposta.",
        variant: "destructive"
      })
      return
    }

    if (!expectedDelivery) {
      toast({
        title: "Data de entrega obrigatória",
        description: "Por favor, selecione a data estimada de entrega.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      await recebimentoService.createPurchaseOrder({
        codigo,
        fornecedorId,
        totalValue: totalValue,
        expectedDelivery,
        propostaId: creationMode === "proposal" ? selectedProposalId : undefined,
        itens: creationMode === "manual" ? manualItems.map(it => ({
          produtoId: it.produtoId,
          quantidade: it.quantity,
          precoUnitario: it.price
        })) : undefined
      })

      toast({
        title: "PO Criada com Sucesso!",
        description: `Pedido ${codigo} foi emitido e registrado.`
      })

      router.push("/compras/pos")
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Erro ao criar PO",
        description: err.response?.data?.message || err.message || "Erro desconhecido.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeProposal = proposals.find(p => p.id === selectedProposalId)
  const displayedItems = creationMode === "proposal" ? (activeProposal?.itens || []) : manualItems

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/compras/pos" className="hover:text-foreground">Compras</Link>
            <span>/</span>
            <span className="text-foreground">Novo PO</span>
          </div>
          <h1 className="text-3xl font-bold text-imperial">Novo Pedido de Compra</h1>
        </div>
        <Button variant="outline" asChild className="bg-transparent border-gray-200">
          <Link href="/compras/pos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados Gerais do Pedido</CardTitle>
            <CardDescription>Configure a origem, o código e as datas da Ordem de Compra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Modo de Criação</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={creationMode === "proposal" ? "default" : "outline"}
                    className={creationMode === "proposal" ? "bg-imperial hover:bg-imperial/90" : ""}
                    onClick={() => {
                      setCreationMode("proposal")
                      setSelectedProposalId("")
                      setFornecedorId("")
                      setTotalValue(0)
                      setExpectedDelivery("")
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Proposta RFQ
                  </Button>
                  <Button
                    type="button"
                    variant={creationMode === "manual" ? "default" : "outline"}
                    className={creationMode === "manual" ? "bg-imperial hover:bg-imperial/90" : ""}
                    onClick={() => {
                      setCreationMode("manual")
                      setSelectedProposalId("")
                      setFornecedorId("")
                      setTotalValue(0)
                      setExpectedDelivery("")
                      setManualItems([])
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Inserção Manual
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código do PO *</Label>
                <Input
                  id="codigo"
                  placeholder="PO-2026-XXXX"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {creationMode === "proposal" ? (
                <div className="space-y-2">
                  <Label htmlFor="propostaSelect">Selecionar Proposta Comercial *</Label>
                  <Select value={selectedProposalId} onValueChange={handleProposalChange}>
                    <SelectTrigger id="propostaSelect" disabled={loadingInitial}>
                      <SelectValue placeholder={loadingInitial ? "Carregando..." : "Selecione a proposta ganhadora"} />
                    </SelectTrigger>
                    <SelectContent>
                      {proposals.map((prop) => (
                        <SelectItem key={prop.id} value={prop.id}>
                          {prop.codigoRfq} - {prop.fornecedorNome} ({prop.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="fornecedor">Fornecedor *</Label>
                  <Select value={fornecedorId} onValueChange={setFornecedorId}>
                    <SelectTrigger id="fornecedor" disabled={loadingInitial}>
                      <SelectValue placeholder={loadingInitial ? "Carregando..." : "Selecione o fornecedor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id!}>
                          {sup.razao_social} {sup.nome_fantasia ? `(${sup.nome_fantasia})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="expectedDelivery">Previsão de Entrega *</Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Items Form Section (visible only in manual mode) */}
        {creationMode === "manual" && (
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Produtos ao Pedido</CardTitle>
              <CardDescription>Selecione um produto cadastrado, defina a quantidade e o preço unitário acordado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4 items-end">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="productSelect">Produto</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger id="productSelect">
                      <SelectValue placeholder="Selecione o produto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id!}>
                          {prod.sku} - {prod.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qtyInput">Quantidade</Label>
                  <Input
                    id="qtyInput"
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceInput">Preço Unitário (MT)</Label>
                  <Input
                    id="priceInput"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="button" onClick={handleAddManualItem} className="bg-imperial hover:bg-imperial/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Items List Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Itens do Pedido de Compra</CardTitle>
              <CardDescription>Produtos vinculados a esta ordem de compra</CardDescription>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground block font-medium">Valor Total</span>
              <span className="text-xl font-bold text-imperial">
                {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {displayedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-lg border border-dashed border-gray-200">
                Nenhum produto adicionado ainda.
                {creationMode === "proposal" ? " Selecione uma proposta para carregar os itens." : " Use o painel acima para adicionar itens."}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Produto</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Qtd</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Preço Unitário</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Subtotal</th>
                      {creationMode === "manual" && (
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 w-[60px]">Remover</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {displayedItems.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <div className="font-mono font-medium">{item.sku}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-3 text-right text-sm">{item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-imperial">
                          {(item.quantity * item.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT
                        </td>
                        {creationMode === "manual" && (
                          <td className="px-4 py-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 p-1"
                              onClick={() => handleRemoveManualItem(item.produtoId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" type="button" asChild className="bg-transparent border-gray-200">
            <Link href="/compras/pos">Cancelar</Link>
          </Button>
          <Button className="bg-imperial hover:bg-imperial" type="submit" disabled={isSubmitting || displayedItems.length === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando PO...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar e Emitir PO
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
