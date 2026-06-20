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
import { fornecedorService, FornecedorData } from "@/app/services/fornecedorService"

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
  currency: "MT",
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

// Mapeamento de formulário frontend para modelo de API do backend
function mapFormToApi(form: SupplierFormData): FornecedorData {
  return {
    razao_social: form.companyName,
    nome_fantasia: form.tradeName || null,
    nuit: form.nuit,
    tipo_pessoa: form.type === "juridica" ? "JURIDICA" : "FISICA",
    email_principal: form.primaryEmail,
    email_secundario: form.secondaryEmail || null,
    telefone_principal: form.primaryPhone,
    telefone_secundario: form.secondaryPhone || null,
    website: form.website || null,
    cobrança_rua: form.billingAddress.street,
    cobrança_numero: form.billingAddress.number || null,
    cobrança_complemento: form.billingAddress.complement || null,
    cobrança_bairro: form.billingAddress.neighborhood,
    cobrança_cidade: form.billingAddress.city,
    cobrança_provincia: form.billingAddress.province,
    cobrança_cep: form.billingAddress.zipCode || null,
    cobrança_pais: form.billingAddress.country || "Moçambique",
    mesmo_endereco: form.deliveryAddress.sameAsBilling,
    entrega_rua: form.deliveryAddress.sameAsBilling ? form.billingAddress.street : form.deliveryAddress.street || null,
    entrega_numero: form.deliveryAddress.sameAsBilling ? form.billingAddress.number : form.deliveryAddress.number || null,
    entrega_complemento: form.deliveryAddress.sameAsBilling ? form.billingAddress.complement : form.deliveryAddress.complement || null,
    entrega_bairro: form.deliveryAddress.sameAsBilling ? form.billingAddress.neighborhood : form.deliveryAddress.neighborhood || null,
    entrega_cidade: form.deliveryAddress.sameAsBilling ? form.billingAddress.city : form.deliveryAddress.city || null,
    entrega_provincia: form.deliveryAddress.sameAsBilling ? form.billingAddress.province : form.deliveryAddress.province || null,
    entrega_cep: form.deliveryAddress.sameAsBilling ? form.billingAddress.zipCode : form.deliveryAddress.zipCode || null,
    entrega_pais: form.deliveryAddress.sameAsBilling ? (form.billingAddress.country || "Moçambique") : (form.deliveryAddress.country || "Moçambique"),
    status_ativo: form.status,
    situacao: form.situation === "bloqueado" ? "Bloqueado" : form.situation === "avaliacao" ? "Avaliacao" : "Normal",
    
    cert_iso9001: form.certifications.iso9001,
    cert_iso22000: form.certifications.iso22000,
    cert_haccp: form.certifications.haccp,
    cert_organico: form.certifications.organic,
    cert_kosher: form.certifications.kosher,
    cert_halal: form.certifications.halal,
    cert_outras: form.certifications.others,

    incoterm: form.incoterm || "EXW",
    prazo_pagamento_dias: Number(form.paymentTerm) || 30,
    moeda: form.currency || "MT",
    desconto_porcentagem: Number(form.discount) || 0.0,
    prazo_entrega_dias: Number(form.deliveryTime) || 0,
    formas_pagamento: form.paymentMethod,
    valor_minimo_pedido: Number(form.minOrderValue) || 0.0,
    valor_maximo_credito: Number(form.maxCreditValue) || 0.0,
    sla_resposta_cotacao_h: Number(form.rfqResponseSla) || 24,
    sla_validade_lote_h: Number(form.lotValiditySla) || 48,
    sla_lead_time_dias: Number(form.averageLeadTime) || 0,
    categorias_fornecidas: form.categories,
    obs_categorias: form.categoryNotes || null
  };
}

// Mapeamento de modelo de API do backend para formulário frontend
function mapApiToForm(api: FornecedorData): SupplierFormData {
  return {
    companyName: api.razao_social || "",
    tradeName: api.nome_fantasia || "",
    nuit: api.nuit || "",
    type: api.tipo_pessoa === "FISICA" ? "fisica" : "juridica",
    primaryEmail: api.email_principal || "",
    secondaryEmail: api.email_secundario || "",
    primaryPhone: api.telefone_principal || "",
    secondaryPhone: api.telefone_secundario || "",
    website: api.website || "",
    billingAddress: {
      street: api.cobrança_rua || "",
      number: api.cobrança_numero || "",
      complement: api.cobrança_complemento || "",
      neighborhood: api.cobrança_bairro || "",
      city: api.cobrança_cidade || "",
      province: api.cobrança_provincia || "",
      zipCode: api.cobrança_cep || "",
      country: api.cobrança_pais || "Moçambique",
    },
    deliveryAddress: {
      sameAsBilling: api.mesmo_endereco ?? true,
      street: api.entrega_rua || "",
      number: api.entrega_numero || "",
      complement: api.entrega_complemento || "",
      neighborhood: api.entrega_bairro || "",
      city: api.entrega_cidade || "",
      province: api.entrega_provincia || "",
      zipCode: api.entrega_cep || "",
      country: api.entrega_pais || "Moçambique",
    },
    status: api.status_ativo ?? true,
    situation: api.situacao === "Bloqueado" ? "bloqueado" : api.situacao === "Avaliacao" ? "avaliacao" : "normal",
    blockReason: "",
    certifications: {
      iso9001: api.cert_iso9001 ?? false,
      iso22000: api.cert_iso22000 ?? false,
      haccp: api.cert_haccp ?? false,
      organic: api.cert_organico ?? false,
      kosher: api.cert_kosher ?? false,
      halal: api.cert_halal ?? false,
      others: api.cert_outras ?? false,
    },
    certificationDetails: [],
    datasheets: [],
    additionalDocuments: [],
    incoterm: api.incoterm || "EXW",
    paymentTerm: String(api.prazo_pagamento_dias ?? 30),
    paymentMethod: api.formas_pagamento || [],
    discount: api.desconto_porcentagem ?? 0,
    currency: api.moeda || "MT",
    deliveryTime: api.prazo_entrega_dias ?? 0,
    rfqResponseSla: api.sla_resposta_cotacao_h ?? 24,
    lotValiditySla: api.sla_validade_lote_h ?? 48,
    averageLeadTime: api.sla_lead_time_dias ?? 0,
    minOrderValue: api.valor_minimo_pedido ?? 0,
    maxCreditValue: api.valor_maximo_credito ?? 0,
    categories: api.categorias_fornecidas || [],
    categoryNotes: api.obs_categorias || "",
    score: 85,
    classification: "Bom",
    evaluationPeriod: "90",
  };
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
      async function loadSupplier() {
        try {
          const apiData = await fornecedorService.buscarPorId(supplierId!)
          if (apiData) {
            setFormData(mapApiToForm(apiData))
          }
        } catch (err) {
          toast({
            title: "Erro ao carregar",
            description: "Não foi possível carregar os dados do fornecedor da API.",
            variant: "destructive"
          })
        }
      }
      loadSupplier()
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
    try {
      const apiData = mapFormToApi(formData)
      if (mode === "new") {
        await fornecedorService.criar(apiData)
        toast({
          title: "Fornecedor cadastrado com sucesso!",
          description: `Fornecedor ${formData.companyName} foi cadastrado com sucesso.`,
        })
      } else {
        await fornecedorService.atualizar(supplierId!, apiData)
        toast({
          title: "Fornecedor atualizado com sucesso!",
          description: `Fornecedor ${formData.companyName} foi atualizado com sucesso.`,
        })
      }
      router.push("/cadastros/fornecedores")
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Erro ao salvar",
        description: err.response?.data?.error || "Ocorreu um erro ao comunicar com a API.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
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




