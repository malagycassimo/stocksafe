"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Copy, Save, Send, Upload, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface RequisitionItem {
  id: string
  productId: string
  productSku: string
  productName: string
  quantity: number
  unit: string
  minValidity: string
  validityType: "percentage" | "days"
  currentStock: number
  notes: string
}

export function RequisitionFormContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [hasChanges, setHasChanges] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [items, setItems] = useState<RequisitionItem[]>([])

  const [formData, setFormData] = useState({
    requester: "João Silva",
    department: "Cozinha",
    neededDate: "",
    priority: "Normal",
    justification: "",
    costCenter: "",
  })

  const handleAddItem = () => {
    const newItem: RequisitionItem = {
      id: Date.now().toString(),
      productId: "1",
      productSku: "ALM-001",
      productName: "Arroz Branco Tipo 1 - Pacote 5kg",
      quantity: 10,
      unit: "UN",
      minValidity: "80",
      validityType: "percentage",
      currentStock: 25,
      notes: "",
    }
    setItems([...items, newItem])
    setShowAddItemModal(false)
    setHasChanges(true)
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
    setHasChanges(true)
  }

  const handleSaveDraft = () => {
    toast({
      title: "Rascunho salvo",
      description: "A requisição foi salva como rascunho.",
    })
    setHasChanges(false)
  }

  const handleSubmit = () => {
    if (!formData.neededDate || items.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios e adicione pelo menos um item.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "RI submetida com sucesso!",
      description: "A requisição foi enviada para aprovação.",
    })
    router.push("/requisicoes")
  }

  const handleCancel = () => {
    if (hasChanges) {
      setShowUnsavedModal(true)
    } else {
      router.push("/requisicoes")
    }
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/requisicoes" className="hover:text-imperial">
          Requisições
        </Link>
        {" / "}
        <span className="text-foreground">Nova Requisição</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">Nova Requisição Interna</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button className="bg-imperial hover:bg-imperial" onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" />
            Submeter para Aprovação
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cabeçalho da RI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Nº RI</Label>
              <Input value="RI-2025-XXX" readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Solicitante *</Label>
              <Input value={formData.requester} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Departamento *</Label>
              <Input
                value={formData.department}
                onChange={(e) => {
                  setFormData({ ...formData, department: e.target.value })
                  setHasChanges(true)
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Data de Criação</Label>
              <Input value={new Date().toLocaleDateString("pt-BR")} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Data Necessária *</Label>
              <Input
                type="date"
                value={formData.neededDate}
                onChange={(e) => {
                  setFormData({ ...formData, neededDate: e.target.value })
                  setHasChanges(true)
                }}
              />
            </div>
            <div>
              <Label>Centro de Custo</Label>
              <Select
                value={formData.costCenter}
                onValueChange={(value) => {
                  setFormData({ ...formData, costCenter: value })
                  setHasChanges(true)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cc-001">CC-001 - Cozinha</SelectItem>
                  <SelectItem value="cc-002">CC-002 - Bar</SelectItem>
                  <SelectItem value="cc-003">CC-003 - Limpeza</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Prioridade *</Label>
            <RadioGroup
              value={formData.priority}
              onValueChange={(value) => {
                setFormData({ ...formData, priority: value })
                setHasChanges(true)
              }}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Baixa" id="baixa" />
                <label htmlFor="baixa" className="text-sm">
                  Baixa <span className="text-muted-foreground">({">"} 15 dias)</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Normal" id="normal" />
                <label htmlFor="normal" className="text-sm">
                  Normal <span className="text-muted-foreground">({"<"} 15 dias)</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Alta" id="alta" />
                <label htmlFor="alta" className="text-sm">
                  Alta <span className="text-muted-foreground">({"<"} 7 dias)</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Urgente" id="urgente" />
                <label htmlFor="urgente" className="text-sm">
                  Urgente <span className="text-muted-foreground">({"<"} 3 dias)</span>
                </label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Justificativa</Label>
            <Textarea
              placeholder="Descreva o motivo da requisição..."
              value={formData.justification}
              onChange={(e) => {
                setFormData({ ...formData, justification: e.target.value })
                setHasChanges(true)
              }}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens da Requisição</CardTitle>
            <Button onClick={() => setShowAddItemModal(true)} size="sm" className="bg-imperial hover:bg-imperial">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum item adicionado</p>
              <p className="text-sm">Clique em "Adicionar Item" para começar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Produto</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Qtd</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Unidade</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Validade Mín.</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Estoque Atual</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Observações</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold w-[100px]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id} className={item.quantity > item.currentStock ? "bg-yellow-50" : ""}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-mono text-sm text-imperial">{item.productSku}</div>
                          <div className="text-sm">{item.productName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Input type="number" value={item.quantity} className="w-20 text-center" />
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{item.unit}</td>
                      <td className="px-4 py-3 text-center text-sm">
                        {item.minValidity}
                        {item.validityType === "percentage" ? "%" : " dias"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={item.currentStock === 0 ? "text-red-600 font-medium" : ""}>
                          {item.currentStock === 0 ? "Sem estoque" : item.currentStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Input placeholder="Observações..." value={item.notes} className="text-sm" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {items.length > 0 && (
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <span className="font-medium">Total de Itens:</span> {items.length} produtos
              </div>
              <div>
                <span className="font-medium">Quantidade Total:</span>{" "}
                {items.reduce((sum, item) => sum + item.quantity, 0)} unidades
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Anexos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">Arraste arquivos aqui ou clique para selecionar</p>
            <p className="text-xs text-muted-foreground">PDF, XLSX, DOCX, imagens - Máximo 10MB por arquivo</p>
            <Button variant="outline" size="sm" className="mt-4 bg-transparent">
              Selecionar Arquivos
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Sugestão: Anexe previsões de demanda, justificativas ou orçamentos
          </p>
        </CardContent>
      </Card>

      {/* Add Item Modal */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Produto *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Buscar produto..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ALM-001 - Arroz Branco Tipo 1 - Pacote 5kg</SelectItem>
                  <SelectItem value="2">FRS-045 - Filé de Frango Congelado - 1kg</SelectItem>
                  <SelectItem value="3">BEB-120 - Suco de Laranja Natural - 1L</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantidade *</Label>
                <Input type="number" defaultValue={1} min={1} />
              </div>
              <div>
                <Label>Validade Mínima</Label>
                <div className="flex gap-2">
                  <Input type="number" defaultValue={80} />
                  <Select defaultValue="percentage">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="days">dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea placeholder="Observações sobre este item..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem} className="bg-imperial hover:bg-imperial">
              Adicionar
            </Button>
            <Button variant="outline" onClick={handleAddItem} className="text-imperial bg-transparent">
              Adicionar e Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Modal */}
      <Dialog open={showUnsavedModal} onOpenChange={setShowUnsavedModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterações não salvas</DialogTitle>
            <DialogDescription>Você tem alterações não salvas. Deseja salvar antes de sair?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push("/requisicoes")}>
              Sair sem Salvar
            </Button>
            <Button
              onClick={() => {
                handleSaveDraft()
                setShowUnsavedModal(false)
                router.push("/requisicoes")
              }}
              className="bg-imperial hover:bg-imperial"
            >
              Salvar e Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




