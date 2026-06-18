"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function NewCampaignContent() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1
  const [horizon, setHorizon] = useState("7")
  const [minValue, setMinValue] = useState("")

  // Step 2
  const [campaignName, setCampaignName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [responsible, setResponsible] = useState("")
  const [transferToStore, setTransferToStore] = useState(false)
  const [applyDiscount, setApplyDiscount] = useState(false)
  const [prioritizeFEFO, setPrioritizeFEFO] = useState(false)
  const [discount, setDiscount] = useState("20")

  const handleCreateCampaign = () => {
    alert("Campanha criada com sucesso!")
    router.push("/validade/campanhas")
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
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= s ? "bg-imperial text-white" : "bg-gray-200 text-gray-600"}`}>
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${step >= s ? "text-imperial" : "text-gray-600"}`}>
                    {s === 1 ? "Seleção de Itens" : s === 2 ? "Configuração" : "Revisão"}
                  </p>
                </div>
                {s < 3 && <div className={`h-0.5 w-24 mx-4 ${step > s ? "bg-imperial" : "bg-gray-200"}`} />}
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
              <CardDescription>Defina os critérios para selecionar produtos em risco</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Horizonte de Validade *</Label>
                <RadioGroup value={horizon} onValueChange={setHorizon}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7" id="7days" />
                    <Label htmlFor="7days" className="font-normal">Vence em ≤ 7 dias</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15" id="15days" />
                    <Label htmlFor="15days" className="font-normal">Vence em ≤ 15 dias</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30" id="30days" />
                    <Label htmlFor="30days" className="font-normal">Vence em ≤ 30 dias</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-value">Valor Mínimo (Opcional)</Label>
                <Input
                  id="min-value"
                  type="number"
                  placeholder="MZN 0,00"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Incluir apenas itens com valor ≥ X</p>
              </div>

              <Button className="w-full bg-imperial hover:bg-imperial">
                Buscar Itens
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview da Seleção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Itens</p>
                    <p className="text-3xl font-bold">15</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Qtd Total</p>
                    <p className="text-3xl font-bold">850 un</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-3xl font-bold text-red-600">MZN 8.920</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 w-12"><Checkbox /></th>
                        <th className="text-left p-2">Produto</th>
                        <th className="text-left p-2">Lote</th>
                        <th className="text-left p-2">Validade</th>
                        <th className="text-right p-2">Qtd</th>
                        <th className="text-right p-2">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2"><Checkbox defaultChecked /></td>
                        <td className="p-2">Filé de Frango</td>
                        <td className="p-2 font-mono text-xs">LOT2025-001</td>
                        <td className="p-2">
                          <p className="text-sm">25/01/2025</p>
                          <p className="text-xs text-orange-600">3 dias</p>
                        </td>
                        <td className="p-2 text-right">50 kg</td>
                        <td className="p-2 text-right">MZN 925,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
                  placeholder="Ex: Escoamento Frescos - Janeiro 2025"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Objetivo da campanha, público-alvo, estratégia..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start">Data Início *</Label>
                  <Input
                    id="start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end">Data Fim *</Label>
                  <Input
                    id="end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável *</Label>
                <Select value={responsible} onValueChange={setResponsible}>
                  <SelectTrigger id="responsible">
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joao">João Silva</SelectItem>
                    <SelectItem value="maria">Maria Santos</SelectItem>
                    <SelectItem value="pedro">Pedro Costa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações da Campanha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="transfer"
                    checked={transferToStore}
                    onCheckedChange={(checked) => setTransferToStore(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="transfer" className="font-normal">
                      Transferir para Loja de Alta Rotação
                    </Label>
                    {transferToStore && (
                      <div className="mt-2 space-y-2">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a loja" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="centro">Loja Centro</SelectItem>
                            <SelectItem value="matola">Loja Matola</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="discount"
                    checked={applyDiscount}
                    onCheckedChange={(checked) => setApplyDiscount(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="discount" className="font-normal">
                      Aplicar Desconto/Promoção
                    </Label>
                    {applyDiscount && (
                      <div className="mt-2">
                        <Input
                          type="number"
                          placeholder="% de desconto"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fefo"
                    checked={prioritizeFEFO}
                    onCheckedChange={(checked) => setPrioritizeFEFO(checked as boolean)}
                  />
                  <Label htmlFor="fefo" className="font-normal">
                    Priorizar na Expedição (FEFO Forçado)
                  </Label>
                </div>
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{campaignName || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-medium">
                    {startDate && endDate ? `${new Date(startDate).toLocaleDateString("pt-BR")} a ${new Date(endDate).toLocaleDateString("pt-BR")}` : "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsável</p>
                  <p className="font-medium">{responsible || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Itens</p>
                  <p className="font-medium">15 produtos</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="font-medium mb-2">Ações Configuradas:</p>
                <div className="space-y-1">
                  {transferToStore && <p className="text-sm">✅ Transferir para loja</p>}
                  {applyDiscount && <p className="text-sm">✅ Desconto de {discount}%</p>}
                  {prioritizeFEFO && <p className="text-sm">✅ Priorizar na expedição</p>}
                  {!transferToStore && !applyDiscount && !prioritizeFEFO && (
                    <p className="text-sm text-muted-foreground">Nenhuma ação configurada</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-red-600">MZN 8.920</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Qtd Total</p>
                    <p className="text-2xl font-bold">850 un</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Validade Mais Próxima</p>
                    <p className="text-2xl font-bold text-orange-600">3 dias</p>
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
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {step < 3 ? (
              <Button
                className="bg-imperial hover:bg-imperial"
                onClick={() => setStep(step + 1)}
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="bg-imperial hover:bg-imperial"
                onClick={handleCreateCampaign}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Criar e Ativar Campanha
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




