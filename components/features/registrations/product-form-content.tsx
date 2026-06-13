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

interface ProductFormContentProps {
  mode: "new" | "edit"
  productId?: string
}

export interface ProductFormData {
  // General
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

  // Validity
  shelfLife: number
  minValidityType: "percentage" | "days"
  minValidityValue: number
  expeditionPolicy: "FEFO" | "FIFO" | "LIFO"
  enableAlerts: boolean
  alertDays: number[]
  customAlertDays: number
  minValidityForClient: number

  // Traceability
  lotControl: boolean
  lotFormat: "free" | "specific"
  lotMask: string
  lotRequiredIn: string[]
  requireDatasheet: boolean
  trackBySerial: boolean
  requireCertifications: boolean
  certifications: string[]
  quarantineDays: number

  // Storage
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

export function ProductFormContent({ mode, productId }: ProductFormContentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [activeTab, setActiveTab] = useState("geral")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load product data in edit mode
  useEffect(() => {
    if (mode === "edit" && productId) {
      // Mock data for edit mode
      setFormData({
        ...initialFormData,
        sku: "ALM-001",
        description: "Arroz Branco Tipo 1 - Pacote 5kg",
        category: "Seco",
        unit: "UN",
        packSize: "1x5kg",
        brand: "Marca Exemplo",
        status: true,
        shelfLife: 365,
        lotControl: true,
      })
    }
  }, [mode, productId])

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData)
    setHasUnsavedChanges(hasChanges)
  }, [formData])

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // General tab validation
    if (!formData.sku.trim()) {
      newErrors.sku = "Campo obrigatório"
    }
    if (!formData.description.trim() || formData.description.length < 3) {
      newErrors.description = "Descrição deve ter no mínimo 3 caracteres"
    }
    if (!formData.category) {
      newErrors.category = "Campo obrigatório"
    }
    if (!formData.unit) {
      newErrors.unit = "Campo obrigatório"
    }

    // Validity tab validation
    if (formData.lotControl && formData.shelfLife <= 0) {
      newErrors.shelfLife = "Campo obrigatório quando controle por lote está ativo"
    }
    if (formData.minValidityValue <= 0) {
      newErrors.minValidityValue = "Valor deve ser maior que zero"
    }

    setErrors(newErrors)

    // Find first tab with errors
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.sku || newErrors.description || newErrors.category || newErrors.unit) {
        setActiveTab("geral")
      } else if (newErrors.shelfLife || newErrors.minValidityValue) {
        setActiveTab("validade")
      }
    }

    return Object.keys(newErrors).length === 0
  }

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Produto salvo com sucesso!",
      description: `Produto ${formData.sku} foi ${mode === "new" ? "cadastrado" : "atualizado"} com sucesso.`,
    })

    setIsSaving(false)

    if (saveAndNew) {
      setFormData(initialFormData)
      setActiveTab("geral")
      setHasUnsavedChanges(false)
    } else {
      router.push("/cadastros/produtos")
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelModal(true)
    } else {
      router.push("/cadastros/produtos")
    }
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
      case "rastreabilidade":
        return false
      case "armazenagem":
        return false
      default:
        return false
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
        <Link href="/cadastros/produtos" className="hover:text-imperial">
          Cadastros
        </Link>
        {" / "}
        <Link href="/cadastros/produtos" className="hover:text-imperial">
          Produtos
        </Link>
        {" / "}
        <span className="text-foreground">
          {mode === "new" ? "Novo Produto" : `Editar: ${formData.description || formData.sku}`}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">
          {mode === "new" ? "Novo Produto" : `Editar Produto: ${formData.sku}`}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button className="bg-imperial hover:bg-imperial" onClick={() => handleSave()} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger
            value="geral"
            className="relative data-[state=active]:bg-imperial data-[state=active]:text-white"
          >
            Geral
            {getTabErrors("geral") && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                !
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="validade"
            className="relative data-[state=active]:bg-imperial data-[state=active]:text-white"
          >
            Requisitos de Validade
            {getTabErrors("validade") && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                !
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="rastreabilidade"
            className="relative data-[state=active]:bg-imperial data-[state=active]:text-white"
          >
            Rastreabilidade
            {getTabErrors("rastreabilidade") && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                !
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="armazenagem"
            className="relative data-[state=active]:bg-imperial data-[state=active]:text-white"
          >
            Armazenagem
            {getTabErrors("armazenagem") && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                !
              </Badge>
            )}
          </TabsTrigger>
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
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            {mode === "new" && (
              <Button
                variant="outline"
                className="text-imperial border-imperial bg-transparent"
                onClick={() => handleSave(true)}
                disabled={isSaving}
              >
                Salvar e Novo
              </Button>
            )}
            <Button className="bg-imperial hover:bg-imperial" onClick={() => handleSave()} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Add padding to prevent content from being hidden by sticky footer */}
      <div className="h-20" />

      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descartar alterações?</DialogTitle>
            <DialogDescription>Você tem alterações não salvas. Deseja realmente sair sem salvar?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Continuar Editando
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




