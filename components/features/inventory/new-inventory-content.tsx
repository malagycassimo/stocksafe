"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  MapPin,
  Package,
  Tag,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Save,
  Calendar,
  Clock,
  Users,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
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
import { inventarioService } from "@/app/services/inventarioService"

const inventoryTypes = [
  {
    value: "general",
    label: "Inventário Geral",
    icon: Building2,
    emoji: "🏢",
    description: "Contagem completa de todo o estoque",
    recommendation: "Anual ou semestral",
    impact: "Operação intensiva, requer mais tempo",
  },
  {
    value: "location",
    label: "Inventário por Local",
    icon: MapPin,
    emoji: "📍",
    description: "Contagem de um armazém, zona ou corredor específico",
    recommendation: "Mensal ou trimestral",
  },
  {
    value: "category",
    label: "Inventário por Categoria",
    icon: Package,
    emoji: "📦",
    description: "Contagem de uma ou mais categorias de produtos",
    recommendation: "Mensal para categorias críticas",
  },
  {
    value: "lot",
    label: "Inventário por Lote/Validade",
    icon: Tag,
    emoji: "🏷️",
    description: "Contagem de lotes específicos ou produtos próximos ao vencimento",
    recommendation: "Semanal para perecíveis",
  },
  {
    value: "focused",
    label: "Inventário Focado",
    icon: Target,
    emoji: "🎯",
    description: "Contagem de produtos específicos (Curva A, alto giro)",
  },
]

const mockUsers = [
  { id: "1", name: "Carlos Silva", role: "Supervisor de Estoque", inventoriesCount: 15 },
  { id: "2", name: "Ana Santos", role: "Coordenadora", inventoriesCount: 23 },
  { id: "3", name: "Pedro Costa", role: "Analista", inventoriesCount: 8 },
]

export function NewInventoryContent() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [inventoryType, setInventoryType] = useState("")

  // Step 1
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [lotOption, setLotOption] = useState("")
  const [expiringDays, setExpiringDays] = useState("")

  // Step 2
  const [inventoryDate, setInventoryDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [deadline, setDeadline] = useState("")
  const [responsible, setResponsible] = useState("")
  const [team, setTeam] = useState<string[]>([])
  const [supervisor, setSupervisor] = useState("")
  const [countingMode, setCountingMode] = useState("simple")
  const [blockMovements, setBlockMovements] = useState(false)
  const [createSnapshot, setCreateSnapshot] = useState(false)
  const [allowPartial, setAllowPartial] = useState(true)
  const [requirePhoto, setRequirePhoto] = useState(false)
  const [photoThreshold, setPhotoThreshold] = useState("10")
  const [autoNotify, setAutoNotify] = useState(true)

  // Step 3
  const [instructions, setInstructions] = useState("")
  const [materials, setMaterials] = useState({
    tags: true,
    barcodeReaders: true,
    tablets: true,
    clipboards: true,
    scale: false,
    thermometer: false,
    flashlight: true,
    ppe: false,
    seals: false,
  })
  const [preparation, setPreparation] = useState({
    organize: false,
    clean: false,
    identify: false,
    separate: false,
    blockAccess: false,
    testEquipment: false,
  })

  // Step 4
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const estimatedItems = inventoryType === "general" ? 1200 : inventoryType === "location" ? 450 : inventoryType === "category" ? 280 : 120
  const estimatedLots = Math.round(estimatedItems * 0.6)
  const locationsInvolved = inventoryType === "general" ? 8 : inventoryType === "location" ? 2 : 3
  const timeEstimate = inventoryType === "general" ? 16 : inventoryType === "location" ? 6 : 4

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    setShowConfirmModal(true)
  }

  const handleConfirm = () => {
    inventarioService.createInventario({
      dateAgenda: inventoryDate || new Date().toISOString().split("T")[0],
      responsavel: mockUsers.find(u => u.id === responsible)?.name || "Supervisor Padrão"
    })
    .then((res) => {
      console.log("Inventory created", res)
      setShowConfirmModal(false)
      router.push("/estoque/inventario")
    })
    .catch((err) => {
      console.error(err)
      setShowConfirmModal(false)
      router.push("/estoque/inventario")
    })
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/estoque/inventario" className="hover:text-imperial">
          Estoque
        </Link>
        {" / "}
        <Link href="/estoque/inventario" className="hover:text-imperial">
          Inventário
        </Link>
        {" / "}
        <span className="text-foreground">Novo Inventário</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-imperial">Novo Inventário Cíclico</h1>
        <p className="text-muted-foreground mt-1">Wizard de configuração em 4 etapas</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {[
          { num: 1, label: "Escopo" },
          { num: 2, label: "Agendamento" },
          { num: 3, label: "Instruções" },
          { num: 4, label: "Revisão" },
        ].map((step, index) => (
          <div key={step.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep > step.num
                    ? "bg-imperial text-white"
                    : currentStep === step.num
                      ? "bg-imperial text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > step.num ? <Check className="w-5 h-5" /> : step.num}
              </div>
              <span
                className={`text-xs mt-2 ${currentStep === step.num ? "font-semibold text-imperial" : "text-gray-600"}`}
              >
                {step.label}
              </span>
            </div>
            {index < 3 && (
              <div
                className={`h-1 flex-1 ${currentStep > step.num ? "bg-imperial" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: Scope Definition */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Tipo de Inventário *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventoryTypes.map((type) => {
                  const IconComponent = type.icon
                  const isSelected = inventoryType === type.value
                  return (
                    <button
                      key={type.value}
                      onClick={() => setInventoryType(type.value)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected ? "border-imperial bg-twilight" : "border-gray-200 hover:border-twilight"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{type.emoji}</span>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="font-semibold mb-1">{type.label}</div>
                      <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                      {type.recommendation && (
                        <Badge variant="outline" className="text-xs">
                          {type.recommendation}
                        </Badge>
                      )}
                      {type.impact && (
                        <p className="text-xs text-orange-600 mt-2">{type.impact}</p>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Conditional Fields based on Type */}
          {inventoryType === "location" && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Selecionar Local(is) *</h3>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loc1">ARM01 - Armazém Principal (450 itens estimados)</SelectItem>
                    <SelectItem value="loc2">ARM02 - Armazém Secundário (280 itens)</SelectItem>
                    <SelectItem value="loc3">ZF - Zona Fria (180 itens)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {inventoryType === "category" && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Selecionar Categoria(s) *</h3>
                <div className="space-y-2">
                  {["Perecíveis", "Congelados", "Secos", "Bebidas", "Limpeza"].map((cat) => (
                    <div key={cat} className="flex items-center gap-2">
                      <Checkbox id={cat} />
                      <label htmlFor={cat} className="cursor-pointer text-sm">
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {inventoryType === "lot" && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Critério de Seleção</h3>
                <RadioGroup value={lotOption} onValueChange={setLotOption}>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="specific" id="specific" />
                      <div>
                        <label htmlFor="specific" className="cursor-pointer font-medium">
                          Lotes específicos
                        </label>
                        {lotOption === "specific" && (
                          <Input placeholder="Digite os códigos de lote separados por vírgula" className="mt-2" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="expiring" id="expiring" />
                      <div>
                        <label htmlFor="expiring" className="cursor-pointer font-medium">
                          Produtos vencendo em:
                        </label>
                        {lotOption === "expiring" && (
                          <Select value={expiringDays} onValueChange={setExpiringDays}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Selecionar período" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">7 dias</SelectItem>
                              <SelectItem value="15">15 dias</SelectItem>
                              <SelectItem value="30">30 dias</SelectItem>
                              <SelectItem value="60">60 dias</SelectItem>
                              <SelectItem value="90">90 dias</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="supplier" id="supplier" />
                      <label htmlFor="supplier" className="cursor-pointer font-medium">
                        Produtos de fornecedor específico
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {inventoryType === "focused" && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Critérios Automáticos</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="curveA" />
                    <label htmlFor="curveA" className="cursor-pointer">
                      Curva A (20% mais valiosos)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="highTurnover" />
                    <label htmlFor="highTurnover" className="cursor-pointer">
                      Alto Giro (rotação &gt; 5 vezes/mês)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="highValue" />
                    <label htmlFor="highValue" className="cursor-pointer">
                      Valor unitário &gt; MT
                    </label>
                    <Input type="number" placeholder="100.00" className="w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scope Preview */}
          {inventoryType && (
            <Card className="border-twilight bg-twilight">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 text-imperial">Escopo Selecionado:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-imperial">Qtd Estimada de Produtos</div>
                    <div className="text-2xl font-bold text-imperial">{estimatedItems}</div>
                  </div>
                  <div>
                    <div className="text-sm text-imperial">Qtd Estimada de Lotes</div>
                    <div className="text-2xl font-bold text-imperial">{estimatedLots}</div>
                  </div>
                  <div>
                    <div className="text-sm text-imperial">Locais Envolvidos</div>
                    <div className="text-2xl font-bold text-imperial">{locationsInvolved}</div>
                  </div>
                  <div>
                    <div className="text-sm text-imperial">Tempo Estimado</div>
                    <div className="text-2xl font-bold text-imperial">{timeEstimate}h</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* STEP 2: Schedule and Team */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Data e Horário</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data do Inventário *</Label>
                  <Input
                    type="date"
                    value={inventoryDate}
                    onChange={(e) => setInventoryDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 Inventários são mais precisos fora do horário de pico
                  </p>
                </div>
                <div>
                  <Label>Horário de Início</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div>
                  <Label>Duração Estimada (horas)</Label>
                  <Input
                    type="number"
                    placeholder={timeEstimate.toString()}
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Baseado em inventários anteriores similares
                  </p>
                </div>
                <div>
                  <Label>Prazo para Conclusão *</Label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={inventoryDate || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Equipe e Responsabilidades</h3>
              <div className="space-y-4">
                <div>
                  <Label>Responsável Principal *</Label>
                  <Select value={responsible} onValueChange={setResponsible}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.role} ({user.inventoriesCount} inventários)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Supervisor/Aprovador *</Label>
                  <Select value={supervisor} onValueChange={setSupervisor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Modo de Contagem</Label>
                  <RadioGroup value={countingMode} onValueChange={setCountingMode}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="simple" id="simple" />
                        <label htmlFor="simple" className="cursor-pointer">
                          Contagem Simples (1 pessoa conta)
                        </label>
                      </div>
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="double" id="double" />
                        <div>
                          <label htmlFor="double" className="cursor-pointer font-medium">
                            Contagem Dupla (2 pessoas contam independentemente)
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Recomendado para: itens de alto valor, Curva A
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="blind" id="blind" />
                        <div>
                          <label htmlFor="blind" className="cursor-pointer font-medium">
                            Contagem Cega (contador não vê saldo do sistema)
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Recomendado para: máxima acuracidade. Reduz viés.
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Configurações Avançadas</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox id="blockMovements" checked={blockMovements} onCheckedChange={(checked) => setBlockMovements(checked as boolean)} />
                  <div>
                    <label htmlFor="blockMovements" className="cursor-pointer font-medium">
                      Bloquear movimentações durante o inventário
                    </label>
                    <p className="text-xs text-orange-600">
                      Impede entradas/saídas nos locais sendo inventariados. Operação será impactada.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox id="createSnapshot" checked={createSnapshot} onCheckedChange={(checked) => setCreateSnapshot(checked as boolean)} />
                  <div>
                    <label htmlFor="createSnapshot" className="cursor-pointer font-medium">
                      Criar snapshot do estoque
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Congela saldo do sistema no momento do início. Usado para comparação posterior.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox id="allowPartial" checked={allowPartial} onCheckedChange={(checked) => setAllowPartial(checked as boolean)} />
                  <label htmlFor="allowPartial" className="cursor-pointer font-medium">
                    Permitir contagem parcial
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox id="requirePhoto" checked={requirePhoto} onCheckedChange={(checked) => setRequirePhoto(checked as boolean)} />
                  <div className="flex items-center gap-2">
                    <label htmlFor="requirePhoto" className="cursor-pointer font-medium">
                      Exigir foto em divergências &gt;
                    </label>
                    <Input
                      type="number"
                      value={photoThreshold}
                      onChange={(e) => setPhotoThreshold(e.target.value)}
                      className="w-20"
                      disabled={!requirePhoto}
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox id="autoNotify" checked={autoNotify} onCheckedChange={(checked) => setAutoNotify(checked as boolean)} />
                  <label htmlFor="autoNotify" className="cursor-pointer font-medium">
                    Notificar equipe automaticamente
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 3: Instructions */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Instruções para a Equipe</h3>
              <Textarea
                placeholder="Instruções específicas para este inventário..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm">
                  Usar Template: Inventário Geral
                </Button>
                <Button variant="outline" size="sm">
                  Usar Template: Perecíveis
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Materiais Necessários</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(materials).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => setMaterials({ ...materials, [key]: checked as boolean })}
                    />
                    <label htmlFor={key} className="cursor-pointer text-sm capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Preparação do Local</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(preparation).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={`prep-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => setPreparation({ ...preparation, [key]: checked as boolean })}
                    />
                    <label htmlFor={`prep-${key}`} className="cursor-pointer text-sm capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Documentos e Anexos</h3>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste arquivos para cá ou clique para selecionar
                </p>
                <Button variant="outline" className="mt-4">
                  Selecionar Arquivos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 4: Review */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Resumo Completo</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Escopo</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p>
                      <strong>Tipo:</strong> {inventoryTypes.find((t) => t.value === inventoryType)?.label}
                    </p>
                    <p>
                      <strong>Itens Estimados:</strong> {estimatedItems}
                    </p>
                    <p>
                      <strong>Lotes:</strong> {estimatedLots}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Agendamento</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p>
                      <strong>Data:</strong> {inventoryDate ? new Date(inventoryDate).toLocaleDateString("pt-BR") : "Não definida"}
                    </p>
                    <p>
                      <strong>Horário:</strong> {startTime || "Não definido"}
                    </p>
                    <p>
                      <strong>Duração Estimada:</strong> {estimatedDuration || timeEstimate} horas
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Equipe</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p>
                      <strong>Responsável:</strong> {mockUsers.find((u) => u.id === responsible)?.name || "Não definido"}
                    </p>
                    <p>
                      <strong>Supervisor:</strong> {mockUsers.find((u) => u.id === supervisor)?.name || "Não definido"}
                    </p>
                    <p>
                      <strong>Modo:</strong>{" "}
                      {countingMode === "simple" ? "Simples" : countingMode === "double" ? "Dupla" : "Cega"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Configurações</h4>
                  <div className="bg-gray-50 p-3 rounded space-y-1">
                    {blockMovements && <p>✓ Bloquear movimentações</p>}
                    {createSnapshot && <p>✓ Criar snapshot do estoque</p>}
                    {allowPartial && <p>✓ Permitir contagem parcial</p>}
                    {requirePhoto && <p>✓ Exigir foto em divergências &gt; {photoThreshold}%</p>}
                    {autoNotify && <p>✓ Notificar equipe automaticamente</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-twilight bg-twilight">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-imperial">
                <CheckCircle className="w-5 h-5" />
                Pré-validações do Sistema
              </h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm">
                  <span className="text-imperial">✅</span> Escopo definido corretamente
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <span className="text-imperial">✅</span> Responsáveis atribuídos
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <span className="text-imperial">✅</span> Data futura válida
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <span className="text-imperial">✅</span> Sem inventários conflitantes
                </p>
                {blockMovements && (
                  <p className="flex items-center gap-2 text-sm">
                    <span className="text-orange-600">⚠️</span> Movimentações serão bloqueadas
                  </p>
                )}
                <p className="flex items-center gap-2 text-sm">
                  <span className="text-blue-600">ℹ️</span> Equipe será notificada 24h antes
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-900">
                <Info className="w-5 h-5" />
                Ações Automáticas ao Criar
              </h3>
              <div className="space-y-1 text-sm text-blue-900">
                <p>• Criar registro de inventário no sistema</p>
                <p>• Gerar código único: INV-[número]</p>
                <p>• Notificar responsável e equipe</p>
                {blockMovements && <p>• Bloquear locais selecionados</p>}
                {createSnapshot && <p>• Criar snapshot do estoque</p>}
                <p>• Agendar lembretes</p>
                <p>• Gerar lista de contagem (disponível para impressão)</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-start gap-3">
            <Checkbox
              id="confirmReview"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
            />
            <label htmlFor="confirmReview" className="cursor-pointer text-sm font-medium">
              Confirmo que revisei todas as informações e estão corretas *
            </label>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          {currentStep < 4 ? (
            <Button className="bg-imperial hover:bg-imperial" onClick={handleNext} disabled={!inventoryType}>
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-imperial hover:bg-imperial"
              onClick={handleSubmit}
              disabled={!confirmChecked}
            >
              <Check className="w-4 h-4 mr-2" />
              Agendar Inventário
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Agendamento de Inventário?</DialogTitle>
            <DialogDescription>
              O inventário será criado e a equipe será notificada conforme configurações.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-4">
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p>
                <strong>Tipo:</strong> {inventoryTypes.find((t) => t.value === inventoryType)?.label}
              </p>
              <p>
                <strong>Data:</strong> {inventoryDate ? new Date(inventoryDate).toLocaleDateString("pt-BR") : ""}
              </p>
              <p>
                <strong>Itens:</strong> ~{estimatedItems}
              </p>
            </div>

            {blockMovements && (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded text-sm">
                <p className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-4 h-4" />
                  <strong>Atenção:</strong> Movimentações nos locais selecionados serão bloqueadas durante o inventário
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
            <Button className="bg-imperial hover:bg-imperial" onClick={handleConfirm}>
              <Check className="w-4 h-4 mr-2" />
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




