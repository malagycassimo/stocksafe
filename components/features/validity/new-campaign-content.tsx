"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { validadeService, type ProdutoCritico } from "@/app/services/validadeService"

export function NewCampaignContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allItems, setAllItems] = useState<ProdutoCritico[]>([])

  // Step 1 filters
  const [horizon, setHorizon] = useState("30")
  const [minValue, setMinValue] = useState("")
  const [selectedLotes, setSelectedLotes] = useState<Set<string>>(new Set())

  // Step 2 configurations
  const [campaignName, setCampaignName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [discount, setDiscount] = useState("15")

  // Load critical products on mount
  useEffect(() => {
    let active = true
    setIsLoading(true)
    validadeService.listarProdutosCriticos()
      .then((res) => {
        if (!active) return
        setAllItems(res.items || [])
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Erro ao listar produtos críticos:", err)
        setIsLoading(false)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os lotes críticos do estoque.",
          variant: "destructive",
        })
      })

    return () => {
      active = false
    }
  }, [toast])

  // Filter items based on horizon and minValue
  const filteredItems = useMemo(() => {
    const horizonDays = parseInt(horizon, 10)
    const minValNum = parseFloat(minValue) || 0

    return allItems.filter((item) => {
      const matchHorizon = item.diasRestantes <= horizonDays
      const matchValue = item.valorTotal >= minValNum
      return matchHorizon && matchValue
    })
  }, [allItems, horizon, minValue])

  // Pre-select all matching items when filtered items change
  useEffect(() => {
    setSelectedLotes(new Set(filteredItems.map(item => item.id)))
  }, [filteredItems])

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLotes(new Set(filteredItems.map(item => item.id)))
    } else {
      setSelectedLotes(new Set())
    }
  }

  const toggleSelectLote = (id: string, checked: boolean) => {
    const next = new Set(selectedLotes)
    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }
    setSelectedLotes(next)
  }

  // Selected items calculations
  const selectedList = useMemo(() => {
    return allItems.filter(item => selectedLotes.has(item.id))
  }, [allItems, selectedLotes])

  const totals = useMemo(() => {
    const count = selectedList.length
    const qty = selectedList.reduce((acc, curr) => acc + curr.quantidade, 0)
    const val = selectedList.reduce((acc, curr) => acc + curr.valorTotal, 0)
    const minDays = selectedList.length > 0 
      ? Math.min(...selectedList.map(item => item.diasRestantes))
      : 0

    return { count, qty, val, minDays }
  }, [selectedList])

  const handleCreateCampaign = () => {
    if (selectedLotes.size === 0) {
      toast({
        title: "Seleção vazia",
        description: "Selecione pelo menos um lote para a campanha.",
        variant: "destructive",
      })
      return
    }

    if (!discount || parseFloat(discount) <= 0 || parseFloat(discount) > 100) {
      toast({
        title: "Desconto inválido",
        description: "Insira um valor de desconto válido entre 1% e 100%.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    validadeService.criarCampanhaValidade({
      descontoPct: parseFloat(discount),
      loteIds: Array.from(selectedLotes)
    })
    .then((res) => {
      setIsSubmitting(false)
      toast({
        title: "Campanha Criada!",
        description: `Código da campanha: ${res.codigo}. Os lotes selecionados agora estão marcados como CAMPANHA.`,
      })
      router.push("/validade/campanhas")
    })
    .catch((err) => {
      console.error(err)
      setIsSubmitting(false)
      toast({
        title: "Erro ao criar campanha",
        description: err.response?.data?.message || err.message,
        variant: "destructive"
      })
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/validade/dashboard" className="hover:text-foreground">Validade</Link>
            <span>/</span>
            <Link href="/validade/campanhas" className="hover:text-foreground">Campanhas</Link>
            <span>/</span>
            <span className="text-foreground">Nova Campanha</span>
          </div>
          <h1 className="text-3xl font-bold text-imperial">Nova Campanha de Escoamento</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/validade/campanhas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Link>
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= s ? "bg-imperial text-white" : "bg-gray-250 text-gray-600"}`}>
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${step >= s ? "text-imperial" : "text-gray-600"}`}>
                    {s === 1 ? "Seleção de Itens" : s === 2 ? "Configuração" : "Revisão"}
                  </p>
                </div>
                {s < 3 && <div className={`h-0.5 w-24 mx-4 ${step > s ? "bg-imperial" : "bg-gray-250"}`} />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Item Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etapa 1: Seleção de Itens</CardTitle>
              <CardDescription>Defina os critérios para selecionar produtos em risco de vencimento</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-semibold block">Horizonte de Validade *</Label>
                <RadioGroup value={horizon} onValueChange={setHorizon} className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7" id="7days" />
                    <Label htmlFor="7days" className="font-normal cursor-pointer">Vence em ≤ 7 dias</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15" id="15days" />
                    <Label htmlFor="15days" className="font-normal cursor-pointer">Vence em ≤ 15 dias</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30" id="30days" />
                    <Label htmlFor="30days" className="font-normal cursor-pointer">Vence em ≤ 30 dias</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="90" id="90days" />
                    <Label htmlFor="90days" className="font-normal cursor-pointer">Vence em ≤ 90 dias</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="min-value" className="font-semibold block">Valor de Lote Mínimo (Opcional)</Label>
                <Input
                  id="min-value"
                  type="number"
                  placeholder="0,00 MT"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Incluir apenas lotes com valor estimado superior ao informado.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span>Preview da Seleção</span>
                {filteredItems.length > 0 && (
                  <span className="text-xs text-muted-foreground font-normal">
                    {selectedLotes.size} de {filteredItems.length} lotes marcados
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8 space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-imperial" />
                  <span className="text-sm text-muted-foreground">Carregando lotes do estoque...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Nenhum lote atende aos filtros atuais</p>
                  <p className="text-xs text-muted-foreground">Tente estender o horizonte de validade.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 grid-cols-3 bg-gray-50 p-4 rounded-lg">
                    <div className="text-center border-r">
                      <p className="text-xs text-muted-foreground">Lotes Selecionados</p>
                      <p className="text-2xl font-bold text-imperial">{totals.count}</p>
                    </div>
                    <div className="text-center border-r">
                      <p className="text-xs text-muted-foreground">Quantidade Total</p>
                      <p className="text-2xl font-bold">{totals.qty} un</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Valor Total</p>
                      <p className="text-2xl font-bold text-red-650">{totals.val.toLocaleString("pt-BR")} MT</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="p-3 text-left w-12">
                            <Checkbox
                              checked={filteredItems.length > 0 && selectedLotes.size === filteredItems.length}
                              onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
                            />
                          </th>
                          <th className="p-3 text-left">Produto</th>
                          <th className="p-3 text-left font-mono">Lote</th>
                          <th className="p-3 text-left">Validade</th>
                          <th className="p-3 text-right">Qtd</th>
                          <th className="p-3 text-right">Valor Estimado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-3">
                              <Checkbox
                                checked={selectedLotes.has(item.id)}
                                onCheckedChange={(checked) => toggleSelectLote(item.id, checked as boolean)}
                              />
                            </td>
                            <td className="p-3">
                              <div className="font-semibold">{item.produto.sku}</div>
                              <div className="text-xs text-muted-foreground">{item.produto.descricao}</div>
                            </td>
                            <td className="p-3 font-mono text-xs">{item.lote}</td>
                            <td className="p-3">
                              <div>{new Date(item.validade).toLocaleDateString("pt-BR")}</div>
                              <div className={`text-xs ${item.diasRestantes <= 7 ? 'text-red-600 font-bold' : item.diasRestantes <= 15 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                                {item.diasRestantes < 0 ? `Vencido há ${Math.abs(item.diasRestantes)}d` : `${item.diasRestantes} dias restantes`}
                              </div>
                            </td>
                            <td className="p-3 text-right font-medium">{item.quantidade} {item.unidadeMedida}</td>
                            <td className="p-3 text-right font-semibold">{item.valorTotal.toLocaleString("pt-BR")} MT</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Configuration */}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etapa 2: Configuração da Campanha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Campanha *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Liquidação de Perecíveis - Fevereiro"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição / Justificativa</Label>
                <Textarea
                  id="description"
                  placeholder="Objetivo da campanha, público-alvo, estratégia de escoamento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start">Data Início</Label>
                  <Input
                    id="start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end">Data Fim</Label>
                  <Input
                    id="end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações de Desconto</CardTitle>
              <CardDescription>Defina o desconto percentual que será aplicado aos lotes selecionados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Percentual de Desconto (%) *</Label>
                <Input
                  id="discount"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="15"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">O desconto será registrado nas informações da campanha.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etapa 3: Revisão e Criação</CardTitle>
              <CardDescription>Confirme os detalhes antes de ativar a campanha de validade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 border-b pb-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Nome da Campanha</p>
                  <p className="font-semibold text-lg text-imperial">{campaignName || "Escoamento Rápido de Validades"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Desconto Aplicado</p>
                  <p className="font-bold text-lg text-green-700">{discount}% de Desconto</p>
                </div>
                {startDate && endDate && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground font-semibold">Vigência</p>
                    <p className="font-medium text-sm">
                      {new Date(startDate).toLocaleDateString("pt-BR")} até {new Date(endDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="font-semibold text-sm mb-3">Lotes Selecionados para esta Campanha:</p>
                <div className="overflow-x-auto border rounded-md">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-2 text-left">SKU</th>
                        <th className="p-2 text-left">Produto</th>
                        <th className="p-2 text-left font-mono">Lote</th>
                        <th className="p-2 text-right">Qtd</th>
                        <th className="p-2 text-right">Valor Atual</th>
                        <th className="p-2 text-right text-green-750">Valor com Desconto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedList.map((item) => {
                        const originalValue = item.valorTotal
                        const discountedValue = originalValue * (1 - parseFloat(discount) / 100)
                        return (
                          <tr key={item.id}>
                            <td className="p-2 font-semibold">{item.produto.sku}</td>
                            <td className="p-2">{item.produto.descricao}</td>
                            <td className="p-2 font-mono">{item.lote}</td>
                            <td className="p-2 text-right">{item.quantidade} {item.unidadeMedida}</td>
                            <td className="p-2 text-right">{originalValue.toLocaleString("pt-BR")} MT</td>
                            <td className="p-2 text-right font-bold text-green-600">{discountedValue.toLocaleString("pt-BR")} MT</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="grid gap-4 grid-cols-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Itens</p>
                    <p className="text-xl font-bold">{totals.count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor Total Original</p>
                    <p className="text-xl font-bold text-red-600">{totals.val.toLocaleString("pt-BR")} MT</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Novo Valor Estimado</p>
                    <p className="text-xl font-bold text-green-605">
                      {(totals.val * (1 - parseFloat(discount) / 100)).toLocaleString("pt-BR")} MT
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {step < 3 ? (
              <Button
                className="bg-imperial hover:bg-imperial"
                onClick={() => {
                  if (step === 1 && selectedLotes.size === 0) {
                    toast({
                      title: "Nenhum item selecionado",
                      description: "Por favor, marque pelo menos um lote para continuar.",
                      variant: "destructive"
                    })
                    return
                  }
                  setStep(step + 1)
                }}
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="bg-imperial hover:bg-imperial"
                onClick={handleCreateCampaign}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ativando Campanha...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Criar e Ativar Campanha
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
