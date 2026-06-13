"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { GeneralTab } from "./form-tabs/general-tab"
import { ValidityTab } from "./form-tabs/validity-tab"
import { TraceabilityTab } from "./form-tabs/traceability-tab"
import { StorageTab } from "./form-tabs/storage-tab"
import { produtoService, ProdutoData } from "@/app/services/produtoService"

interface ProductFormContentProps {
  mode: "new" | "edit"
  productId?: string
}

export interface ProductFormData {
  // Aba: Geral
  sku: string
  description: string
  category: string
  unit: string
  packSize: string
  brand: string
  suppliers: string[]
  internalBarcode: string
  notes: string
  status: boolean

  // Aba: Validade
  shelfLife: number
  minValidityType: "percentage" | "days"
  minValidityValue: number
  expeditionPolicy: "FEFO" | "FIFO" | "LIFO"
  enableAlerts: boolean
  alertDays: number[]
  customAlertDays: number
  minValidityForClient: number

  // Aba: Rastreabilidade
  lotControl: boolean
  lotFormat: "free" | "specific"
  lotMask: string
  lotRequiredIn: string[]
  requireDatasheet: boolean
  trackBySerial: boolean
  requireCertifications: boolean
  certifications: string[]
  quarantineDays: number

  // Aba: Armazenagem
  storageType: {
    temperature: string
    customTempMin?: number
    customTempMax?: number
    humidity: string
    customHumidity?: number
    otherConditions: string[]
  }
  defaultLocations: string[]
  maxStacking: number
  weightPerUnit: number
  weightUnit: string
  dimensions: {
    length: number
    width: number
    height: number
  }
  palletType: string
  unitsPerPallet: number
  incompatibilities: string[]
  specialInstructions: string
}

const initialFormData: ProductFormData = {
  sku: "",
  description: "",
  category: "",
  unit: "",
  packSize: "",
  brand: "",
  suppliers: [],
  internalBarcode: "",
  notes: "",
  status: true,
  shelfLife: 0,
  minValidityType: "percentage",
  minValidityValue: 70,
  expeditionPolicy: "FEFO",
  enableAlerts: true,
  alertDays: [7, 15, 30],
  customAlertDays: 0,
  minValidityForClient: 0,
  lotControl: false,
  lotFormat: "free",
  lotMask: "",
  lotRequiredIn: ["recebimento"],
  requireDatasheet: false,
  trackBySerial: false,
  requireCertifications: false,
  certifications: [],
  quarantineDays: 0,
  storageType: {
    temperature: "ambiente",
    humidity: "ambiente",
    otherConditions: [],
  },
  defaultLocations: [],
  maxStacking: 0,
  weightPerUnit: 0,
  weightUnit: "KG",
  dimensions: {
    length: 0,
    width: 0,
    height: 0,
  },
  palletType: "none",
  unitsPerPallet: 0,
  incompatibilities: [],
  specialInstructions: "",
}

// ─── Mapeamento: ProdutoData (backend) → ProductFormData (frontend) ────────────
function mapApiParaFormulario(api: ProdutoData): ProductFormData {
  // alertas_dias_config guarda o array de dias pré-definidos como JSON
  let alertDays: number[] = [7, 15, 30]
  try {
    if (Array.isArray(api.alertas_dias_config)) alertDays = api.alertas_dias_config
    else if (typeof api.alertas_dias_config === "string")
      alertDays = JSON.parse(api.alertas_dias_config)
  } catch {}

  // restricoes_armazenagem guarda o array de "otherConditions" como JSON
  let otherConditions: string[] = []
  try {
    if (api.restricoes_armazenagem) otherConditions = JSON.parse(api.restricoes_armazenagem)
  } catch {}

  return {
    sku: api.sku ?? "",
    description: api.descricao ?? "",
    category: api.categoria ?? "",
    unit: api.unidade_medida ?? "",
    packSize: api.tamanho_embalagem ?? "",
    brand: api.marca ?? "",
    suppliers: [],
    internalBarcode: api.codigo_barras_interno ?? "",
    notes: api.observacoes ?? "",
    status: api.status_ativo ?? true,

    shelfLife: api.vida_util_dias ?? 0,
    minValidityType: api.tipo_controle_validade === "DIAS" ? "days" : "percentage",
    minValidityValue: api.validade_min_recebimento ?? 70,
    expeditionPolicy: (api.politica_expedicao as "FEFO" | "FIFO" | "LIFO") ?? "FEFO",
    enableAlerts: api.alertas_habilitados ?? true,
    alertDays,
    customAlertDays: api.alerta_personalizado_dias ?? 0,
    minValidityForClient: api.validade_min_cliente_dias ?? 0,

    lotControl: api.controle_lote ?? false,
    lotFormat: "free",
    lotMask: "",
    lotRequiredIn: ["recebimento"],
    requireDatasheet: api.ficha_tecnica_obrigatoria ?? false,
    trackBySerial: api.controle_numero_serie ?? false,
    requireCertifications: api.certificacoes_obrigatorias ?? false,
    certifications: [],
    quarantineDays: api.dias_quarentena ?? 0,

    storageType: {
      temperature: api.condicao_temperatura ?? "ambiente",
      humidity: api.condicao_umidade ?? "ambiente",
      otherConditions,
    },
    defaultLocations: [],
    maxStacking: api.empilhamento_maximo ?? 0,
    weightPerUnit: api.peso_unidade ?? 0,
    weightUnit: api.unidade_peso ?? "KG",
    dimensions: {
      length: api.comprimento_cm ?? 0,
      width: api.largura_cm ?? 0,
      height: api.altura_cm ?? 0,
    },
    palletType: api.tipo_palete ?? "none",
    unitsPerPallet: 0,
    incompatibilities: [],
    specialInstructions: api.instrucoes_especiais ?? "",
  }
}

// ─── Mapeamento: ProductFormData (frontend) → ProdutoData (backend) ────────────
function mapFormularioParaApi(form: ProductFormData): ProdutoData {
  return {
    sku: form.sku,
    codigo_barras_interno: form.internalBarcode || null,
    descricao: form.description,
    categoria: form.category,
    unidade_medida: form.unit,
    tamanho_embalagem: form.packSize || null,
    marca: form.brand || null,
    observacoes: form.notes || null,
    status_ativo: form.status,

    vida_util_dias: form.shelfLife,
    politica_expedicao: form.expeditionPolicy,
    tipo_controle_validade: form.minValidityType === "days" ? "DIAS" : "PORCENTAGEM",
    validade_min_recebimento: form.minValidityValue,
    validade_min_cliente_dias: form.minValidityForClient,
    alertas_habilitados: form.enableAlerts,
    alertas_dias_config: form.alertDays,
    alerta_personalizado_dias: form.customAlertDays,

    controle_lote: form.lotControl,
    controle_numero_serie: form.trackBySerial,
    ficha_tecnica_obrigatoria: form.requireDatasheet,
    certificacoes_obrigatorias: form.requireCertifications,
    dias_quarentena: form.quarantineDays,

    condicao_temperatura: form.storageType.temperature,
    condicao_umidade: form.storageType.humidity,
    restricoes_armazenagem:
      form.storageType.otherConditions.length > 0
        ? JSON.stringify(form.storageType.otherConditions)
        : null,
    peso_unidade: form.weightPerUnit,
    unidade_peso: form.weightUnit,
    comprimento_cm: form.dimensions.length,
    largura_cm: form.dimensions.width,
    altura_cm: form.dimensions.height,
    empilhamento_maximo: form.maxStacking,
    tipo_palete: form.palletType,
    instrucoes_especiais: form.specialInstructions || null,
  }
}

export function ProductFormContent({ mode, productId }: ProductFormContentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [activeTab, setActiveTab] = useState("geral")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // ── Carregar dados reais do backend no modo edição ──────────────────────────
  useEffect(() => {
    if (mode === "edit" && productId) {
      setIsLoadingData(true)
      produtoService
        .buscarPorId(productId)
        .then((dadosApi) => {
          setFormData(mapApiParaFormulario(dadosApi))
        })
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Erro ao carregar produto",
            description: "Não foi possível obter os dados do produto no servidor.",
          })
        })
        .finally(() => setIsLoadingData(false))
    }
  }, [mode, productId])

  // Detectar alterações
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData)
    setHasUnsavedChanges(hasChanges)
  }, [formData])

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.sku.trim()) newErrors.sku = "Campo obrigatório"
    if (!formData.description.trim() || formData.description.length < 3)
      newErrors.description = "Descrição deve ter no mínimo 3 caracteres"
    if (!formData.category) newErrors.category = "Campo obrigatório"
    if (!formData.unit) newErrors.unit = "Campo obrigatório"
    if (formData.lotControl && formData.shelfLife <= 0)
      newErrors.shelfLife = "Campo obrigatório quando controle por lote está ativo"
    if (formData.minValidityValue <= 0)
      newErrors.minValidityValue = "Valor deve ser maior que zero"
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.sku || newErrors.description || newErrors.category || newErrors.unit)
        setActiveTab("geral")
      else if (newErrors.shelfLife || newErrors.minValidityValue)
        setActiveTab("validade")
    }
    return Object.keys(newErrors).length === 0
  }

  // ── Salvar: chama criar ou atualizar no backend ─────────────────────────────
  const handleSave = async (saveAndNew = false) => {
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário antes de salvar.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    const payload = mapFormularioParaApi(formData)

    try {
      if (mode === "new") {
        await produtoService.criar(payload)
        toast({
          title: "Produto cadastrado!",
          description: `Produto ${formData.sku} foi criado com sucesso.`,
        })
      } else if (productId) {
        await produtoService.atualizar(productId, payload)
        toast({
          title: "Produto atualizado!",
          description: `Produto ${formData.sku} foi salvo com sucesso.`,
        })
      }

      if (saveAndNew) {
        setFormData(initialFormData)
        setActiveTab("geral")
        setHasUnsavedChanges(false)
      } else {
        router.push("/cadastros/produtos")
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: err?.response?.data?.error || "Ocorreu um erro ao comunicar com o servidor.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) setShowCancelModal(true)
    else router.push("/cadastros/produtos")
  }

  const confirmCancel = () => {
    setShowCancelModal(false)
    router.push("/cadastros/produtos")
  }

  const getTabErrors = (tab: string): boolean => {
    switch (tab) {
      case "geral":
        return !!(errors.sku || errors.description || errors.category || errors.unit)
      case "validade":
        return !!(errors.shelfLife || errors.minValidityValue)
      default:
        return false
    }
  }

  if (isLoadingData) {
    return (
      <div className="p-6 flex items-center justify-center h-64 text-muted-foreground">
        A carregar dados do produto...
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-emerald-600">Home</Link>
        {" / "}
        <Link href="/cadastros/produtos" className="hover:text-emerald-600">Cadastros</Link>
        {" / "}
        <Link href="/cadastros/produtos" className="hover:text-emerald-600">Produtos</Link>
        {" / "}
        <span className="text-foreground">
          {mode === "new" ? "Novo Produto" : `Editar: ${formData.description || formData.sku}`}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-emerald-700">
          {mode === "new" ? "Novo Produto" : `Editar Produto: ${formData.sku}`}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSave()} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          {["geral", "validade", "rastreabilidade", "armazenagem"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="relative data-[state=active]:bg-emerald-600 data-[state=active]:text-white capitalize"
            >
              {tab === "geral" ? "Geral" : tab === "validade" ? "Requisitos de Validade" : tab === "rastreabilidade" ? "Rastreabilidade" : "Armazenagem"}
              {getTabErrors(tab) && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="geral">
          <GeneralTab formData={formData} updateFormData={updateFormData} errors={errors} />
        </TabsContent>
        <TabsContent value="validade">
          <ValidityTab formData={formData} updateFormData={updateFormData} errors={errors} />
        </TabsContent>
        <TabsContent value="rastreabilidade">
          <TraceabilityTab formData={formData} updateFormData={updateFormData} errors={errors} />
        </TabsContent>
        <TabsContent value="armazenagem">
          <StorageTab formData={formData} updateFormData={updateFormData} errors={errors} />
        </TabsContent>
      </Tabs>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          <div className="flex gap-2">
            {mode === "new" && (
              <Button
                variant="outline"
                className="text-emerald-600 border-emerald-600 bg-transparent"
                onClick={() => handleSave(true)}
                disabled={isSaving}
              >
                Salvar e Novo
              </Button>
            )}
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSave()} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>

      <div className="h-20" />

      {/* Modal de confirmação de cancelamento */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descartar alterações?</DialogTitle>
            <DialogDescription>Você tem alterações não salvas. Deseja realmente sair sem salvar?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>Continuar Editando</Button>
            <Button variant="destructive" onClick={confirmCancel}>Descartar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
