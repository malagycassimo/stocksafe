"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat,
  PlusCircle,
  MinusCircle,
  Trash2,
  CornerUpLeft,
  Package,
  Upload,
  X,
  Check,
  AlertTriangle,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Mock data
const mockProducts = [
  {
    id: "1",
    sku: "FRS-045",
    description: "Filé de Frango Congelado - 1kg",
    category: "Congelado",
    unit: "kg",
    hasLotControl: true,
    shelfLife: 90,
    currentStock: 500,
  },
  {
    id: "2",
    sku: "ALM-001",
    description: "Arroz Branco Tipo 1 - Pacote 5kg",
    category: "Seco",
    unit: "kg",
    hasLotControl: true,
    shelfLife: 365,
    currentStock: 1200,
  },
  {
    id: "3",
    sku: "BEB-120",
    description: "Suco de Laranja Natural - 1L",
    category: "Bebidas",
    unit: "L",
    hasLotControl: true,
    shelfLife: 30,
    currentStock: 300,
  },
]

const mockLots = [
  { lot: "LOT2025-001", expiryDate: "2025-02-05", quantity: 500, location: "ARM01 > ZF > CA > P01" },
  { lot: "LOT2025-023", expiryDate: "2025-04-15", quantity: 1200, location: "ARM01 > ZS > CB > P05" },
]

const mockSuppliers = [
  { id: "1", name: "Frigorífico Premium" },
  { id: "2", name: "Distribuidora Alimentos" },
  { id: "3", name: "Laticínios Premium" },
]

const movementTypes = [
  {
    value: "entry",
    label: "Entrada Manual",
    icon: ArrowDownToLine,
    emoji: "📥",
    description: "Adicionar produtos ao estoque (compra direta, doação, etc.)",
    useCases: "Compra sem PO, doação, encontrado, produção interna",
    color: "border-imperial hover:bg-twilight",
  },
  {
    value: "exit",
    label: "Saída Manual",
    icon: ArrowUpFromLine,
    emoji: "📤",
    description: "Remover produtos do estoque (venda direta, uso interno, etc.)",
    useCases: "Venda sem ordem, uso interno, amostra grátis, consumo",
    color: "border-red-500 hover:bg-red-50",
  },
  {
    value: "transfer",
    label: "Transferência Interna",
    icon: Repeat,
    emoji: "🔄",
    description: "Mover produtos entre locais (sem entrada/saída do estoque)",
    useCases: "Reorganização, reposição entre zonas",
    color: "border-blue-500 hover:bg-blue-50",
  },
  {
    value: "adjustment_positive",
    label: "Ajuste Positivo",
    icon: PlusCircle,
    emoji: "➕",
    description: "Correção de estoque para mais (inventário encontrou mais)",
    useCases: "Inventário, erro de lançamento anterior",
    color: "border-imperial hover:bg-twilight",
  },
  {
    value: "adjustment_negative",
    label: "Ajuste Negativo",
    icon: MinusCircle,
    emoji: "➖",
    description: "Correção de estoque para menos (perda, quebra, roubo)",
    useCases: "Inventário, perda, quebra, vencimento, avaria",
    color: "border-orange-500 hover:bg-orange-50",
  },
  {
    value: "disposal",
    label: "Descarte",
    icon: Trash2,
    emoji: "🗑️",
    description: "Descarte de produtos (vencimento, avaria, contaminação)",
    useCases: "Vencido, avariado, contaminado, recall",
    note: "Requer aprovação e laudo",
    color: "border-gray-500 hover:bg-gray-50",
  },
  {
    value: "return_supplier",
    label: "Devolução ao Fornecedor",
    icon: CornerUpLeft,
    emoji: "↩️",
    description: "Devolução de produtos já recebidos",
    useCases: "NC, recall, acordo comercial",
    color: "border-purple-500 hover:bg-purple-50",
  },
]

const entryReasons = [
  "Compra Direta (sem PO)",
  "Doação",
  "Produção Interna",
  "Transferência de Outra Unidade",
  "Devolução de Cliente",
  "Outro",
]

const exitReasons = [
  "Venda Direta",
  "Uso Interno/Consumo",
  "Amostra Grátis",
  "Bonificação",
  "Transferência para Outra Unidade",
  "Outro",
]

const adjustmentReasons = [
  "Inventário (sobra/falta)",
  "Correção de Erro de Lançamento",
  "Perda/Quebra",
  "Roubo/Furto",
  "Vencimento",
  "Avaria/Dano",
  "Outro",
]

const disposalReasons = ["Vencimento", "Avaria/Contaminação", "Recall", "Qualidade Comprometida", "Regulatório", "Outro"]

const transferReasons = ["Reposição", "Reorganização", "Otimização de Espaço", "Consolidação", "Outro"]

const returnReasons = ["Não Conformidade", "Recall", "Acordo Comercial", "Produto Errado", "Outro"]

export function NewManualMovementContent() {
  const router = useRouter()
  const [movementType, setMovementType] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null)
  const [quantity, setQuantity] = useState("")
  const [lot, setLot] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [originType, setOriginType] = useState("supplier")
  const [originSupplier, setOriginSupplier] = useState("")
  const [originOther, setOriginOther] = useState("")
  const [destinationLocation, setDestinationLocation] = useState("")
  const [originLocation, setOriginLocation] = useState("")
  const [destinationType, setDestinationType] = useState("customer")
  const [destinationCustomer, setDestinationCustomer] = useState("")
  const [destinationInternal, setDestinationInternal] = useState("")
  const [destinationOther, setDestinationOther] = useState("")
  const [transferOriginLocation, setTransferOriginLocation] = useState("")
  const [transferDestinationLocation, setTransferDestinationLocation] = useState("")
  const [adjustmentLocation, setAdjustmentLocation] = useState("")
  const [returnSupplier, setReturnSupplier] = useState("")
  const [reason, setReason] = useState("")
  const [justification, setJustification] = useState("")
  const [referenceDocument, setReferenceDocument] = useState("")
  const [observations, setObservations] = useState("")
  const [unitValue, setUnitValue] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const getReasonOptions = () => {
    switch (movementType) {
      case "entry":
        return entryReasons
      case "exit":
        return exitReasons
      case "adjustment_positive":
      case "adjustment_negative":
        return adjustmentReasons
      case "disposal":
        return disposalReasons
      case "transfer":
        return transferReasons
      case "return_supplier":
        return returnReasons
      default:
        return []
    }
  }

  const calculateTotalValue = () => {
    const qty = parseFloat(quantity) || 0
    const unit = parseFloat(unitValue) || 0
    return qty * unit
  }

  const handleSubmit = () => {
    // Validate form
    if (!movementType || !selectedProduct || !quantity || !reason || justification.length < 20) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirm = () => {
    // Here would be the API call to save the movement
    console.log("Movement confirmed")
    setShowConfirmModal(false)
    router.push("/estoque/movimentacoes")
  }

  const requiresApproval = () => {
    if (movementType === "disposal") return true
    if (movementType === "return_supplier") return true
    if ((movementType === "adjustment_positive" || movementType === "adjustment_negative") && calculateTotalValue() > 1000)
      return true
    return false
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/estoque/movimentacoes" className="hover:text-imperial">
          Estoque
        </Link>
        {" / "}
        <Link href="/estoque/movimentacoes" className="hover:text-imperial">
          Movimentações
        </Link>
        {" / "}
        <span className="text-foreground">Nova Movimentação</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-imperial">Registrar Movimentação Manual</h1>
        <p className="text-muted-foreground mt-1">Use esta tela para ajustes, correções e movimentações não automáticas</p>
      </div>

      {/* Movement Type Selection */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Tipo de Movimentação *</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movementTypes.map((type) => {
              const IconComponent = type.icon
              const isSelected = movementType === type.value
              return (
                <button
                  key={type.value}
                  onClick={() => setMovementType(type.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected ? "border-imperial bg-twilight" : type.color
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{type.emoji}</span>
                    <IconComponent className="w-5 h-5" />
                    <span className="font-semibold">{type.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                  <p className="text-xs text-muted-foreground italic">Casos: {type.useCases}</p>
                  {type.note && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {type.note}
                      </Badge>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {movementType && (
        <>
          {/* Product Data */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Dados do Produto</h3>
              <div className="space-y-4">
                {/* Product Selection */}
                <div>
                  <Label>Produto *</Label>
                  <Select
                    value={selectedProduct?.id || ""}
                    onValueChange={(value) => {
                      const product = mockProducts.find((p) => p.id === value)
                      setSelectedProduct(product || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Buscar por SKU ou descrição" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span className="font-mono">{product.sku}</span>
                            <span>-</span>
                            <span>{product.description}</span>
                            <Badge variant="outline" className="ml-2">
                              {product.category}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs">Categoria</Label>
                        <div className="font-medium">{selectedProduct.category}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Unidade</Label>
                        <div className="font-medium">{selectedProduct.unit}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Controle de Lote</Label>
                        <div className="font-medium">{selectedProduct.hasLotControl ? "Sim" : "Não"}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Estoque Atual</Label>
                        <div className="font-medium">
                          {selectedProduct.currentStock} {selectedProduct.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <Label>Quantidade *</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Ex: 100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="0.01"
                      step="0.01"
                    />
                    {selectedProduct && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {selectedProduct.unit}
                      </div>
                    )}
                  </div>
                  {selectedProduct && (movementType === "exit" || movementType === "adjustment_negative") && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Estoque disponível: {selectedProduct.currentStock} {selectedProduct.unit}
                    </p>
                  )}
                </div>

                {/* Lot and Expiry (conditional) */}
                {selectedProduct?.hasLotControl && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Lote {selectedProduct.hasLotControl && "*"}</Label>
                      {movementType === "entry" || movementType === "adjustment_positive" ? (
                        <Input placeholder="Ex: L2025-001" value={lot} onChange={(e) => setLot(e.target.value)} />
                      ) : (
                        <Select value={lot} onValueChange={setLot}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar lote disponível" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockLots.map((lotItem) => (
                              <SelectItem key={lotItem.lot} value={lotItem.lot}>
                                <div className="flex flex-col">
                                  <span className="font-mono">{lotItem.lot}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Val: {new Date(lotItem.expiryDate).toLocaleDateString("pt-BR")} | Qtd:{" "}
                                    {lotItem.quantity} | {lotItem.location}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div>
                      <Label>Validade {selectedProduct.hasLotControl && "*"}</Label>
                      {movementType === "entry" || movementType === "adjustment_positive" ? (
                        <Input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      ) : (
                        <Input value={expiryDate} disabled className="bg-gray-100" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Origin and Destination */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Origem e Destino</h3>
              <div className="space-y-4">
                {/* ENTRY */}
                {movementType === "entry" && (
                  <>
                    <div>
                      <Label>Origem *</Label>
                      <RadioGroup value={originType} onValueChange={setOriginType}>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="supplier" id="supplier" />
                            <label htmlFor="supplier" className="cursor-pointer">
                              Fornecedor
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other-origin" />
                            <label htmlFor="other-origin" className="cursor-pointer">
                              Outro (especificar)
                            </label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {originType === "supplier" && (
                      <div>
                        <Label>Fornecedor *</Label>
                        <Select value={originSupplier} onValueChange={setOriginSupplier}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar fornecedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockSuppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {originType === "other" && (
                      <div>
                        <Label>Descrever Origem *</Label>
                        <Input
                          placeholder="Descrever origem"
                          value={originOther}
                          onChange={(e) => setOriginOther(e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <Label>Local de Destino *</Label>
                      <Select value={destinationLocation} onValueChange={setDestinationLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar local" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="loc1">ARM01 &gt; ZF &gt; CA &gt; P01</SelectItem>
                          <SelectItem value="loc2">ARM01 &gt; ZS &gt; CB &gt; P05</SelectItem>
                          <SelectItem value="loc3">ARM02 &gt; ZF &gt; CA &gt; P01</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* EXIT */}
                {movementType === "exit" && (
                  <>
                    <div>
                      <Label>Local de Origem *</Label>
                      <Select value={originLocation} onValueChange={setOriginLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar local" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="loc1">ARM01 &gt; ZF &gt; CA &gt; P01</SelectItem>
                          <SelectItem value="loc2">ARM01 &gt; ZS &gt; CB &gt; P05</SelectItem>
                          <SelectItem value="loc3">ARM02 &gt; ZF &gt; CA &gt; P01</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Destino *</Label>
                      <RadioGroup value={destinationType} onValueChange={setDestinationType}>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="customer" id="customer" />
                            <label htmlFor="customer" className="cursor-pointer">
                              Cliente
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="internal" id="internal" />
                            <label htmlFor="internal" className="cursor-pointer">
                              Uso Interno
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other-dest" id="other-dest" />
                            <label htmlFor="other-dest" className="cursor-pointer">
                              Outro (especificar)
                            </label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {destinationType === "customer" && (
                      <div>
                        <Label>Nome do Cliente *</Label>
                        <Input
                          placeholder="Nome do cliente"
                          value={destinationCustomer}
                          onChange={(e) => setDestinationCustomer(e.target.value)}
                        />
                      </div>
                    )}

                    {destinationType === "internal" && (
                      <div>
                        <Label>Departamento/Área *</Label>
                        <Select value={destinationInternal} onValueChange={setDestinationInternal}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kitchen">Cozinha</SelectItem>
                            <SelectItem value="maintenance">Manutenção</SelectItem>
                            <SelectItem value="admin">Administrativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {destinationType === "other-dest" && (
                      <div>
                        <Label>Descrever Destino *</Label>
                        <Input
                          placeholder="Descrever destino"
                          value={destinationOther}
                          onChange={(e) => setDestinationOther(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* TRANSFER */}
                {movementType === "transfer" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Local de Origem *</Label>
                      <Select value={transferOriginLocation} onValueChange={setTransferOriginLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar local" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="loc1">ARM01 &gt; ZF &gt; CA &gt; P01</SelectItem>
                          <SelectItem value="loc2">ARM01 &gt; ZS &gt; CB &gt; P05</SelectItem>
                          <SelectItem value="loc3">ARM02 &gt; ZF &gt; CA &gt; P01</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Local de Destino *</Label>
                      <Select value={transferDestinationLocation} onValueChange={setTransferDestinationLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar local" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="loc1">ARM01 &gt; ZF &gt; CA &gt; P01</SelectItem>
                          <SelectItem value="loc2">ARM01 &gt; ZS &gt; CB &gt; P05</SelectItem>
                          <SelectItem value="loc3">ARM02 &gt; ZF &gt; CA &gt; P01</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* ADJUSTMENT or DISPOSAL */}
                {(movementType === "adjustment_positive" ||
                  movementType === "adjustment_negative" ||
                  movementType === "disposal") && (
                  <div>
                    <Label>Local *</Label>
                    <Select value={adjustmentLocation} onValueChange={setAdjustmentLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar local" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loc1">ARM01 &gt; ZF &gt; CA &gt; P01</SelectItem>
                        <SelectItem value="loc2">ARM01 &gt; ZS &gt; CB &gt; P05</SelectItem>
                        <SelectItem value="loc3">ARM02 &gt; ZF &gt; CA &gt; P01</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* RETURN SUPPLIER */}
                {movementType === "return_supplier" && (
                  <>
                    <div>
                      <Label>Local de Origem *</Label>
                      <Select value={originLocation} onValueChange={setOriginLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar local" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="loc1">ARM01 &gt; ZF &gt; CA &gt; P01</SelectItem>
                          <SelectItem value="loc2">ARM01 &gt; ZS &gt; CB &gt; P05</SelectItem>
                          <SelectItem value="loc3">ARM02 &gt; ZF &gt; CA &gt; P01</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Fornecedor Destino *</Label>
                      <Select value={returnSupplier} onValueChange={setReturnSupplier}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar fornecedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockSuppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reason and Justification */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Motivo e Justificativa</h3>
              <div className="space-y-4">
                <div>
                  <Label>Motivo *</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getReasonOptions().map((reasonOption) => (
                        <SelectItem key={reasonOption} value={reasonOption}>
                          {reasonOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Justificativa Detalhada *</Label>
                  <Textarea
                    placeholder="Descreva em detalhes o motivo desta movimentação..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">
                      Esta informação será auditada. Seja claro e preciso.
                    </p>
                    <p className="text-xs text-muted-foreground">{justification.length} caracteres (mínimo: 20)</p>
                  </div>
                </div>

                <div>
                  <Label>Documento de Referência</Label>
                  <Input
                    placeholder="Ex: NF 12345, Email, Ordem Interna, etc."
                    value={referenceDocument}
                    onChange={(e) => setReferenceDocument(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Observações Adicionais</Label>
                  <Textarea
                    placeholder="Informações complementares..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Values */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">
                Valores {movementType === "entry" ? "*" : "(opcional mas recomendado)"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Valor Unitário {movementType === "entry" && "*"}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={unitValue}
                      onChange={(e) => setUnitValue(e.target.value)}
                      className="pl-10"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>Valor Total</Label>
                  <div className="h-10 flex items-center px-3 bg-gray-100 rounded-md font-semibold text-imperial">
                    R$ {calculateTotalValue().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval (if required) */}
          {requiresApproval() && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2 text-orange-900">Esta movimentação requer aprovação</h3>
                    <p className="text-sm text-orange-800 mb-3">
                      Devido ao tipo de movimentação ou valor envolvido, esta operação precisa ser aprovada por um gestor.
                    </p>
                    <div>
                      <Label>Aprovador</Label>
                      <Select>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecionar aprovador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager1">João Silva - Gerente de Estoque</SelectItem>
                          <SelectItem value="manager2">Maria Santos - Diretora de Operações</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Anexos</h3>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste arquivos para cá ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">Fotos, documentos, laudos, etc.</p>
                <Button variant="outline" className="mt-4">
                  Selecionar Arquivos
                </Button>
              </div>
              {(movementType === "disposal" ||
                movementType === "adjustment_negative" ||
                movementType === "return_supplier") && (
                <p className="text-xs text-orange-600 mt-2">
                  Recomendado anexar fotos ou documentos para este tipo de movimentação
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => router.push("/estoque/movimentacoes")}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button className="bg-imperial hover:bg-imperial" onClick={handleSubmit}>
              <Check className="w-4 h-4 mr-2" />
              {requiresApproval() ? "Enviar para Aprovação" : "Registrar Movimentação"}
            </Button>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Movimentação?</DialogTitle>
            <DialogDescription>
              {requiresApproval()
                ? "Esta movimentação será enviada para aprovação."
                : "Esta ação afetará o estoque imediatamente."}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-3 my-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="ml-2 font-medium">
                      {movementTypes.find((t) => t.value === movementType)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Produto:</span>
                    <span className="ml-2 font-medium">{selectedProduct.sku}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantidade:</span>
                    <span className="ml-2 font-medium">
                      {quantity} {selectedProduct.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lote:</span>
                    <span className="ml-2 font-medium">{lot || "N/A"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Motivo:</span>
                    <span className="ml-2 font-medium">{reason}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="confirm-review" checked={confirmed} onCheckedChange={(checked) => setConfirmed(checked as boolean)} />
                <label htmlFor="confirm-review" className="text-sm cursor-pointer leading-tight">
                  Confirmo que revisei todos os dados e as informações estão corretas
                </label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
            <Button className="bg-imperial hover:bg-imperial" onClick={handleConfirm} disabled={!confirmed}>
              <Check className="w-4 h-4 mr-2" />
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




