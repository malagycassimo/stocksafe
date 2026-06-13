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
import { GeneralSupplierTab } from "./form-tabs/general-supplier-tab"
import { DocumentsTab } from "./form-tabs/documents-tab"
import { ConditionsTab } from "./form-tabs/conditions-tab"
import { ScorecardTab } from "./form-tabs/scorecard-tab"

interface SupplierFormContentProps {
  mode: "new" | "edit"
  supplierId?: string
}

export interface SupplierFormData {
  // General
  companyName: string
  tradeName: string
  nuit: string
  type: "juridica" | "fisica"
  primaryEmail: string
  secondaryEmail: string
  primaryPhone: string
  secondaryPhone: string
  website: string
  billingAddress: {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    province: string
    zipCode: string
    country: string
  }
  deliveryAddress: {
    sameAsBilling: boolean
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    province: string
    zipCode: string
    country: string
  }
  status: boolean
  situation: "normal" | "bloqueado" | "avaliacao"
  blockReason: string

  // Documents
  certifications: {
    iso9001: boolean
    iso22000: boolean
    haccp: boolean
    organic: boolean
    kosher: boolean
    halal: boolean
    others: boolean
  }
  certificationDetails: Array<{
    type: string
    number: string
    issueDate: string
    expiryDate: string
    file: string
    issuer: string
  }>
  datasheets: Array<{
    product: string
    type: string
    file: string
    version: string
    uploadDate: string
  }>
  additionalDocuments: Array<{
    name: string
    type: string
    file: string
    uploadDate: string
  }>

  // Conditions
  incoterm: string
  paymentTerm: string
  paymentMethod: string[]
  discount: number
  currency: string
  deliveryTime: number
  rfqResponseSla: number
  lotValiditySla: number
  averageLeadTime: number
  minOrderValue: number
  maxCreditValue: number
  categories: string[]
  categoryNotes: string

  // Scorecard (read-only, calculated)
  score: number
  classification: string
  evaluationPeriod: string
}

const initialFormData: SupplierFormData = {
  companyName: "",
  tradeName: "",
  nuit: "",
  type: "juridica",
  primaryEmail: "",
  secondaryEmail: "",
  primaryPhone: "",
  secondaryPhone: "",
  website: "",
  billingAddress: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    province: "",
    zipCode: "",
    country: "Moçambique",
  },
  deliveryAddress: {
    sameAsBilling: true,
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    province: "",
    zipCode: "",
    country: "Moçambique",
  },
  status: true,
  situation: "normal",
  blockReason: "",
  certifications: {
    iso9001: false,
    iso22000: false,
    haccp: false,
    organic: false,
    kosher: false,
    halal: false,
    others: false,
  },
  certificationDetails: [],
  datasheets: [],
  additionalDocuments: [],
  incoterm: "EXW",
  paymentTerm: "30",
  paymentMethod: [],
  discount: 0,
  currency: "MZN",
  deliveryTime: 0,
  rfqResponseSla: 24,
  lotValiditySla: 48,
  averageLeadTime: 0,
  minOrderValue: 0,
  maxCreditValue: 0,
  categories: [],
  categoryNotes: "",
  score: 0,
  classification: "",
  evaluationPeriod: "90",
}

export function SupplierFormContent({ mode, supplierId }: SupplierFormContentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<SupplierFormData>(initialFormData)
  const [activeTab, setActiveTab] = useState("geral")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load supplier data in edit mode
  useEffect(() => {
    if (mode === "edit" && supplierId) {
      // Mock data for edit mode
      setFormData({
        ...initialFormData,
        companyName: "Distribuidora Alimentos Ltda",
        tradeName: "Distribuidora Alimentos",
        nuit: "123456789",
        primaryEmail: "contato@distribuidora.com",
        primaryPhone: "(11) 98765-4321",
        status: true,
        score: 92,
        classification: "Excelente",
      })
    }
  }, [mode, supplierId])

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
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Campo obrigatório"
    }
    if (!formData.nuit.trim()) {
      newErrors.nuit = "Campo obrigatório"
    }
    if (!formData.primaryEmail.trim()) {
      newErrors.primaryEmail = "Campo obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryEmail)) {
      newErrors.primaryEmail = "Email inválido"
    }
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = "Campo obrigatório"
    }
    if (!formData.billingAddress.street.trim()) {
      newErrors.billingStreet = "Campo obrigatório"
    }
    if (!formData.billingAddress.neighborhood.trim()) {
      newErrors.billingNeighborhood = "Campo obrigatório"
    }
    if (!formData.billingAddress.city.trim()) {
      newErrors.billingCity = "Campo obrigatório"
    }
    if (!formData.billingAddress.province.trim()) {
      newErrors.billingProvince = "Campo obrigatório"
    }

    setErrors(newErrors)

    // Find first tab with errors
    if (Object.keys(newErrors).length > 0) {
      setActiveTab("geral")
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
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
      title: "Fornecedor salvo com sucesso!",
      description: `Fornecedor ${formData.companyName} foi ${mode === "new" ? "cadastrado" : "atualizado"} com sucesso.`,
    })

    setIsSaving(false)
    router.push("/cadastros/fornecedores")
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelModal(true)
    } else {
      router.push("/cadastros/fornecedores")
    }
  }

  const confirmCancel = () => {
    setShowCancelModal(false)
    router.push("/cadastros/fornecedores")
  }

  const getTabErrors = (tab: string): boolean => {
    switch (tab) {
      case "geral":
        return !!(
          errors.companyName ||
          errors.nuit ||
          errors.primaryEmail ||
          errors.primaryPhone ||
          errors.billingStreet ||
          errors.billingNeighborhood ||
          errors.billingCity ||
          errors.billingProvince
        )
      case "documentos":
        return false
      case "condicoes":
        return false
      case "scorecard":
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
        <Link href="/cadastros/fornecedores" className="hover:text-imperial">
          Cadastros
        </Link>
        {" / "}
        <Link href="/cadastros/fornecedores" className="hover:text-imperial">
          Fornecedores
        </Link>
        {" / "}
        <span className="text-foreground">
          {mode === "new" ? "Novo Fornecedor" : `Editar: ${formData.companyName || formData.nuit}`}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">
          {mode === "new" ? "Novo Fornecedor" : `Editar Fornecedor: ${formData.companyName}`}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button className="bg-imperial hover:bg-imperial" onClick={handleSave} disabled={isSaving}>
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
            value="documentos"
            className="relative data-[state=active]:bg-imperial data-[state=active]:text-white"
          >
            Documentos
            {getTabErrors("documentos") && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                !
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="condicoes"
            className="relative data-[state=active]:bg-imperial data-[state=active]:text-white"
          >
            Condições
            {getTabErrors("condicoes") && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                !
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="scorecard"
            className="relative data-[state=active]:bg-imperial data-[state=active]:text-white"
          >
            Scorecard
            {getTabErrors("scorecard") && (
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
          <GeneralSupplierTab formData={formData} updateFormData={updateFormData} errors={errors} />
        </TabsContent>

        <TabsContent value="documentos">
          <DocumentsTab formData={formData} updateFormData={updateFormData} errors={errors} />
        </TabsContent>

        <TabsContent value="condicoes">
          <ConditionsTab formData={formData} updateFormData={updateFormData} errors={errors} />
        </TabsContent>

        <TabsContent value="scorecard">
          <ScorecardTab formData={formData} mode={mode} />
        </TabsContent>
      </Tabs>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button className="bg-imperial hover:bg-imperial" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
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




