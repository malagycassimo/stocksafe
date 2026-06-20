"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { comprasService } from "@/app/services/comprasService"
import { fornecedorService } from "@/app/services/fornecedorService"
import { produtoService } from "@/app/services/produtoService"
import { requisicaoService } from "@/app/services/requisicaoService"
import { Save, Send, Plus, Trash2, Upload, AlertCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const mockApprovedRIs = [
  {
    id: "RI-2025-003",
    requester: "Pedro Costa",
    neededDate: "2025-01-25",
    itemsCount: 2,
  },
  {
    id: "RI-2025-001",
    requester: "João Silva",
    neededDate: "2025-01-20",
    itemsCount: 5,
  },
]

const mockSuppliers = [
  { id: "1", name: "Fornecedor A", score: 92, lastQuote: "2025-01-10", responseRate: 95 },
  { id: "2", name: "Fornecedor B", score: 88, lastQuote: "2025-01-08", responseRate: 90 },
  { id: "3", name: "Fornecedor C", score: 85, lastQuote: "2025-01-12", responseRate: 88 },
  { id: "4", name: "Fornecedor D", score: 78, lastQuote: "2024-12-20", responseRate: 75 },
]

interface RfqItem {
  id: string
  sku: string
  description: string
  quantity: number
  unit: string
  minValidity: string
  specifications: string
  visibleToSupplier: boolean
}

export function NewRfqContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedRI, setSelectedRI] = useState("")
  const [deadline, setDeadline] = useState("")
  const [instructions, setInstructions] = useState("")
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [sendEmail, setSendEmail] = useState(true)
  const [sendSMS, setSendSMS] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])

  // Dynamic products and RIs
  const [approvedRIs, setApprovedRIs] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [selectedProductToAdd, setSelectedProductToAdd] = useState("")
  const [quantityToAdd, setQuantityToAdd] = useState(1)

  useEffect(() => {
    // Load suppliers
    fornecedorService.listarTodos()
      .then((data) => {
        setSuppliers(data.map((f) => ({
          id: f.id,
          name: f.razao_social,
          score: 90,
          lastQuote: "2026-06-18",
          responseRate: 95
        })))
      })
      .catch((err) => {
        console.error("Erro ao carregar fornecedores:", err)
        setSuppliers(mockSuppliers)
      })

    // Load products
    produtoService.listarTodos()
      .then((data) => {
        setProducts(data || [])
      })
      .catch((err) => {
        console.error("Erro ao carregar produtos:", err)
      })

    // Load RIs
    requisicaoService.listarTodas()
      .then((data: any[]) => {
        // Show all RIs with PENDING, APPROVED, or FULFILLED status
        setApprovedRIs(data.filter((r: any) => r.status === "APPROVED" || r.status === "PENDING" || r.status === "FULFILLED") || [])
      })
      .catch((err: any) => {
        console.error("Erro ao carregar RIs:", err)
        setApprovedRIs(mockApprovedRIs)
      })
  }, [])

  const [items, setItems] = useState<RfqItem[]>([])

  // Automatically load items when RI is selected
  useEffect(() => {
    if (!selectedRI || selectedRI === "") {
      setItems([])
      return
    }

    const foundRi = approvedRIs.find(r => r.id === selectedRI || r.codigo === selectedRI)
    if (foundRi) {
      // If we already have the items preloaded in list
      if (foundRi.itens && foundRi.itens.length > 0) {
        setItems(foundRi.itens.map((it: any) => ({
          id: it.produto_id || it.id,
          sku: it.produto?.sku || "PROD",
          description: it.produto?.descricao || it.produto?.nome || "Item da RI",
          quantity: it.quantidade,
          unit: it.produto?.unidade_medida || "UN",
          minValidity: it.validade_min_proposta ? `${it.validade_min_proposta}%` : "80%",
          specifications: it.observacoes || "",
          visibleToSupplier: true
        })))
      } else {
        // Fetch full details
        requisicaoService.buscarPorId(foundRi.id)
          .then((data: any) => {
            if (data?.itens) {
              setItems(data.itens.map((it: any) => ({
                id: it.produto_id || it.id,
                sku: it.produto?.sku || "PROD",
                description: it.produto?.descricao || it.produto?.nome || "Item da RI",
                quantity: it.quantidade,
                unit: it.produto?.unidade_medida || "UN",
                minValidity: it.validade_min_proposta ? `${it.validade_min_proposta}%` : "80%",
                specifications: it.observacoes || "",
                visibleToSupplier: true
              })))
            }
          })
          .catch((err: any) => {
            console.error("Erro ao buscar itens da RI:", err)
          })
      }
    }
  }, [selectedRI, approvedRIs])

  const [criteria, setCriteria] = useState({
    price: 40,
    deliveryTime: 30,
    compliance: 20,
    supplierScore: 10,
  })

  const totalCriteria = criteria.price + criteria.deliveryTime + criteria.compliance + criteria.supplierScore

  const handleSupplierToggle = (supplierId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId) ? prev.filter((id) => id !== supplierId) : [...prev, supplierId],
    )
  }

  const handleSaveDraft = () => {
    toast({
      title: "RFQ salva como rascunho",
      description: "A cotação foi salva e pode ser editada posteriormente.",
    })
  }

  const handleAddExtraItem = () => {
    const prod = products.find(p => p.id === selectedProductToAdd)
    if (!prod) {
      toast({
        title: "Selecione um produto",
        description: "Selecione um produto da lista.",
        variant: "destructive"
      })
      return
    }

    const isDuplicate = items.some(it => it.id === prod.id)
    if (isDuplicate) {
      toast({
        title: "Produto Duplicado",
        description: "Este produto já está na lista de cotação.",
        variant: "destructive"
      })
      return
    }

    const newItem: RfqItem = {
      id: prod.id || Math.random().toString(),
      sku: prod.sku,
      description: prod.descricao || "Item Extra",
      quantity: Number(quantityToAdd),
      unit: prod.unidade_medida || "UN",
      minValidity: "80%",
      specifications: "",
      visibleToSupplier: true
    }

    setItems(prev => [...prev, newItem])
    setShowAddProductModal(false)
    setSelectedProductToAdd("")
    setQuantityToAdd(1)

    toast({
      title: "Item Adicionado",
      description: `${prod.sku} foi adicionado à lista.`
    })
  }

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(it => it.id !== itemId))
    toast({
      title: "Item Removido",
      description: "O item foi removido da cotação."
    })
  }

  const handleSendToSuppliers = () => {
    if (!selectedRI || !deadline || selectedSuppliers.length < 1) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios e selecione pelo menos 1 fornecedor.",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Lista Vazia",
        description: "Por favor, adicione pelo menos 1 item na cotação.",
        variant: "destructive",
      })
      return
    }

    if (totalCriteria !== 100) {
      toast({
        title: "Critérios de avaliação inválidos",
        description: "A soma dos critérios deve ser 100%.",
        variant: "destructive",
      })
      return
    }

    const payloadItems = items.map((item) => ({
      produtoId: item.id,
      quantidade: Number(item.quantity)
    }))

    comprasService.createRFQ({
      dataLimite: new Date(deadline).toISOString(),
      items: payloadItems
    })
    .then((res) => {
      toast({
        title: "RFQ enviada com sucesso!",
        description: `A cotação foi gerada com o código ${res.codigo || res.id}.`,
      })
      router.push("/compras/rfqs")
    })
    .catch((err) => {
      console.error(err)
      toast({
        title: "Erro ao criar RFQ",
        description: err.response?.data?.error || "Ocorreu um erro ao registrar a cotação no servidor.",
        variant: "destructive",
      })
    })
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
        <Link href="/compras/rfqs" className="hover:text-imperial">
          RFQs
        </Link>
        {" / "}
        <span className="text-foreground">Nova RFQ</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">Nova Cotação (RFQ)</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/compras/rfqs")}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button className="bg-imperial hover:bg-imperial" onClick={handleSendToSuppliers}>
            <Send className="w-4 h-4 mr-2" />
            Enviar aos Fornecedores
          </Button>
        </div>
      </div>

      {/* General Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nº RFQ</Label>
              <Input value="RFQ-2025-XXX" readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>RI Origem *</Label>
              <Select value={selectedRI} onValueChange={setSelectedRI}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma RI aprovada..." />
                </SelectTrigger>
                <SelectContent>
                  {approvedRIs.map((ri) => (
                    <SelectItem key={ri.id} value={ri.id}>
                      {ri.codigo} | {ri.solicitante_nome} | {ri.date_necessaria ? new Date(ri.date_necessaria).toLocaleDateString("pt-BR") : "-"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Criação</Label>
              <Input value={new Date().toLocaleDateString("pt-BR")} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Prazo de Resposta *</Label>
              <div className="flex gap-2">
                <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const date = new Date()
                    date.setHours(date.getHours() + 48)
                    setDeadline(date.toISOString().slice(0, 16))
                  }}
                >
                  +48h
                </Button>
              </div>
            </div>
          </div>
          <div>
            <Label>Instruções aos Fornecedores</Label>
            <Textarea
              placeholder="Informações adicionais sobre a cotação, requisitos específicos, etc."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fornecedores Convidados</CardTitle>
            <Button onClick={() => setShowSupplierModal(true)} size="sm" variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Selecionar Fornecedores
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedSuppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum fornecedor selecionado</p>
              <p className="text-sm">Selecione pelo menos 1 fornecedor *</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {suppliers
                .filter((s) => selectedSuppliers.includes(s.id))
                .map((supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-twilight text-imperial">
                          {supplier.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Score: {supplier.score}% | Taxa resposta: {supplier.responseRate}%
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSupplierToggle(supplier.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
          <div className="flex gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Checkbox id="email" checked={sendEmail} onCheckedChange={(checked) => setSendEmail(!!checked)} />
              <label htmlFor="email" className="text-sm cursor-pointer">
                Enviar notificação por email
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sms" checked={sendSMS} onCheckedChange={(checked) => setSendSMS(!!checked)} />
              <label htmlFor="sms" className="text-sm cursor-pointer">
                Enviar notificação por SMS
              </label>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Produto</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Qtd *</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Unidade</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Validade Mín.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Especificações Adicionais</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Visível</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold w-[80px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm text-imperial">{item.sku}</div>
                      <div className="text-sm">{item.description}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setItems(prev => prev.map(it => it.id === item.id ? { ...it, quantity: val } : it))
                        }}
                        className="w-20 text-center"
                      />
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{item.unit}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.minValidity}</td>
                    <td className="px-4 py-3">
                      <Input
                        placeholder="Requisitos específicos..."
                        value={item.specifications}
                        onChange={(e) => {
                          const val = e.target.value
                          setItems(prev => prev.map(it => it.id === item.id ? { ...it, specifications: val } : it))
                        }}
                        className="text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Checkbox
                        checked={item.visibleToSupplier}
                        onCheckedChange={(checked) => {
                          setItems(prev => prev.map(it => it.id === item.id ? { ...it, visibleToSupplier: !!checked } : it))
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 bg-transparent"
            onClick={() => setShowAddProductModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item Extra
          </Button>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Documentos e Especificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">Arraste arquivos aqui ou clique para selecionar</p>
            <p className="text-xs text-muted-foreground">Especificações técnicas, desenhos, requisitos de qualidade</p>
            <Button variant="outline" size="sm" className="mt-4 bg-transparent">
              Selecionar Arquivos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Criteria */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Critérios de Avaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Preço</Label>
              <span className="text-sm font-medium">{criteria.price}%</span>
            </div>
            <Slider
              value={[criteria.price]}
              onValueChange={([value]) => setCriteria({ ...criteria, price: value })}
              max={100}
              step={5}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Prazo de Entrega</Label>
              <span className="text-sm font-medium">{criteria.deliveryTime}%</span>
            </div>
            <Slider
              value={[criteria.deliveryTime]}
              onValueChange={([value]) => setCriteria({ ...criteria, deliveryTime: value })}
              max={100}
              step={5}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Conformidade Lote/Validade</Label>
              <span className="text-sm font-medium">{criteria.compliance}%</span>
            </div>
            <Slider
              value={[criteria.compliance]}
              onValueChange={([value]) => setCriteria({ ...criteria, compliance: value })}
              max={100}
              step={5}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Score do Fornecedor</Label>
              <span className="text-sm font-medium">{criteria.supplierScore}%</span>
            </div>
            <Slider
              value={[criteria.supplierScore]}
              onValueChange={([value]) => setCriteria({ ...criteria, supplierScore: value })}
              max={100}
              step={5}
            />
          </div>
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total:</span>
              <Badge className={totalCriteria === 100 ? "bg-twilight text-imperial" : "bg-red-100 text-red-800"}>
                {totalCriteria}%
              </Badge>
            </div>
            {totalCriteria !== 100 && <p className="text-sm text-red-600 mt-2">A soma dos critérios deve ser 100%</p>}
          </div>
        </CardContent>
      </Card>

      {/* Supplier Selection Modal */}
      <Dialog open={showSupplierModal} onOpenChange={setShowSupplierModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecionar Fornecedores</DialogTitle>
            <DialogDescription>Selecione pelo menos 2 fornecedores para enviar a cotação.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 max-h-[400px] overflow-y-auto">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedSuppliers.includes(supplier.id) ? "border-imperial bg-twilight" : ""
                }`}
                onClick={() => handleSupplierToggle(supplier.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={selectedSuppliers.includes(supplier.id)} />
                  <Avatar>
                    <AvatarFallback className="bg-twilight text-imperial">
                      {supplier.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Última cotação: {new Date(supplier.lastQuote).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Score: {supplier.score}%</div>
                  <div className="text-sm text-muted-foreground">Taxa resposta: {supplier.responseRate}%</div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowSupplierModal(false)} className="bg-imperial hover:bg-imperial">
              Confirmar Seleção ({selectedSuppliers.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Extra Item Dialog */}
      <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item Extra</DialogTitle>
            <DialogDescription>
              Selecione um produto cadastrado e defina a quantidade para cotação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product-select">Produto *</Label>
              <Select value={selectedProductToAdd} onValueChange={setSelectedProductToAdd}>
                <SelectTrigger id="product-select">
                  <SelectValue placeholder="Selecione um produto..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id}>
                      {prod.sku} - {prod.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-qty">Quantidade *</Label>
              <Input
                id="product-qty"
                type="number"
                min={1}
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProductModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddExtraItem} className="bg-imperial hover:bg-imperial">
              Adicionar Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




