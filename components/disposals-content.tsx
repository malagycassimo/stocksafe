"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Plus, Download, Camera, Upload, FileText, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { validadeService, type ProdutoCritico } from "@/app/services/validadeService"

export function DisposalsContent() {
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  // State
  const [showDisposalModal, setShowDisposalModal] = useState(false)
  const [activeItem, setActiveItem] = useState<ProdutoCritico | null>(null)
  const [items, setItems] = useState<ProdutoCritico[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Modal form state
  const [disposalDate, setDisposalDate] = useState("")
  const [disposalReason, setDisposalReason] = useState("vencimento")
  const [disposalType, setDisposalType] = useState("comum")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [company, setCompany] = useState("")
  const [mtrNumber, setMtrNumber] = useState("")
  const [costCenter, setCostCenter] = useState("estoque")

  // Load critical products (awaiting disposal)
  const loadData = async () => {
    try {
      setLoading(true)
      const data = await validadeService.listarProdutosCriticos()
      setItems(data.items)
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os lotes para descarte.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filter items that are vencidos (diasRestantes <= 0)
  const awaitingItems = items.filter(item => item.diasRestantes <= 0 && item.quantidade > 0)

  // Summary stats
  const totalAwaiting = awaitingItems.length
  const totalQuantity = awaitingItems.reduce((sum, item) => sum + item.quantidade, 0)
  const totalValue = awaitingItems.reduce((sum, item) => sum + item.valorTotal, 0)

  const handleOpenDisposalModal = (item: ProdutoCritico) => {
    setActiveItem(item)
    setDisposalDate(new Date().toISOString().split("T")[0])
    setDescription(`Descarte do lote ${item.lote} devido a validade expirada.`)
    setShowDisposalModal(true)
  }

  const handleRegisterDisposal = async () => {
    if (!activeItem) return
    try {
      setActionLoading(true)
      await validadeService.descartar(activeItem.id, authUser?.id)
      toast({
        title: "Descarte registrado",
        description: "O descarte do lote foi registrado com sucesso."
      })
      setShowDisposalModal(false)
      loadData()
    } catch (error) {
      toast({
        title: "Erro no descarte",
        description: "Falha ao registrar o descarte do lote.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDescartarEmMassa = async () => {
    try {
      setActionLoading(true)
      const result = await validadeService.descartarEmMassa(authUser?.id)
      toast({
        title: "Descarte em massa realizado",
        description: result.message
      })
      loadData()
    } catch (error) {
      toast({
        title: "Erro no descarte",
        description: "Não foi possível processar o descarte em massa.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-red-700">Gestão de Descartes</h1>
          <p className="text-muted-foreground">Registro e controle de produtos descartados</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={handleDescartarEmMassa}
            disabled={actionLoading || totalAwaiting === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Descarte em Massa (Vencidos)
          </Button>
        </div>
      </div>

      {/* Modal Dialog */}
      <Dialog open={showDisposalModal} onOpenChange={setShowDisposalModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Descarte</DialogTitle>
            <DialogDescription>Preencha as informações do descarte</DialogDescription>
          </DialogHeader>

          {activeItem && (
            <div className="space-y-4">
              {/* Item Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Itens a Descartar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted rounded text-sm space-y-1">
                    <p><span className="font-semibold">Produto:</span> {activeItem.produto.descricao} ({activeItem.produto.sku})</p>
                    <p><span className="font-semibold">Lote:</span> {activeItem.lote}</p>
                    <p><span className="font-semibold">Validade:</span> {new Date(activeItem.validade).toLocaleDateString("pt-BR")} ({activeItem.validadeTexto})</p>
                    <p><span className="font-semibold">Quantidade:</span> {activeItem.quantidade} {activeItem.unidadeMedida}</p>
                    <p><span className="font-semibold">Valor:</span> {formatCurrency(activeItem.valorTotal)}</p>
                    <p><span className="font-semibold">Local de Origem:</span> {activeItem.local}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Disposal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informações do Descarte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="disposal-date">Data do Descarte *</Label>
                    <Input
                      id="disposal-date"
                      type="date"
                      value={disposalDate}
                      onChange={(e) => setDisposalDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo do Descarte *</Label>
                    <Select value={disposalReason} onValueChange={setDisposalReason}>
                      <SelectTrigger id="reason">
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vencimento">Vencimento</SelectItem>
                        <SelectItem value="avaria">Avaria/Dano Físico</SelectItem>
                        <SelectItem value="contaminacao">Contaminação Suspeita/Confirmada</SelectItem>
                        <SelectItem value="recall">Recall do Fabricante</SelectItem>
                        <SelectItem value="nao-conformidade">Não Conformidade Crítica</SelectItem>
                        <SelectItem value="qualidade">Qualidade Comprometida</SelectItem>
                        <SelectItem value="regulatorio">Regulatório</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Descarte *</Label>
                    <RadioGroup value={disposalType} onValueChange={setDisposalType}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comum" id="comum" />
                        <Label htmlFor="comum" className="font-normal">Descarte Comum</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="especial" id="especial" />
                        <Label htmlFor="especial" className="font-normal">Descarte Especial (requer tratamento)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="incineracao" id="incineracao" />
                        <Label htmlFor="incineracao" className="font-normal">Incineração (produtos perigosos)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="compostagem" id="compostagem" />
                        <Label htmlFor="compostagem" className="font-normal">Compostagem (orgânicos)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição Detalhada *</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva as condições do produto, motivo detalhado, destino final..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="location">Local do Descarte</Label>
                      <Input
                        id="location"
                        placeholder="Ex: Container externo"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa Coletora</Label>
                      <Input
                        id="company"
                        placeholder="Se aplicável"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mtr">Certificado/Número MTR</Label>
                      <Input
                        id="mtr"
                        placeholder="Manifesto de Transporte"
                        value={mtrNumber}
                        onChange={(e) => setMtrNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Impact */}
              <Card className="border-red-300 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-base">Impacto Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Valor do Produto:</span>
                    <span className="font-bold">{formatCurrency(activeItem.valorTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Custo de Descarte Estimado (5%):</span>
                    <span className="font-bold">{formatCurrency(activeItem.valorTotal * 0.05)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Perda Total:</span>
                    <span className="font-bold text-red-600">{formatCurrency(activeItem.valorTotal * 1.05)}</span>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="cost-center">Centro de Custo *</Label>
                    <Select value={costCenter} onValueChange={setCostCenter}>
                      <SelectTrigger id="cost-center">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="estoque">Estoque</SelectItem>
                        <SelectItem value="perdas">Perdas e Avarias</SelectItem>
                        <SelectItem value="qualidade">Qualidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDisposalModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleRegisterDisposal}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Registrar Descarte"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="awaiting" className="w-full">
        <TabsList>
          <TabsTrigger value="awaiting">Aguardando Descarte</TabsTrigger>
          <TabsTrigger value="completed">Descartes Realizados</TabsTrigger>
          <TabsTrigger value="pending-approval">Pendentes de Aprovação</TabsTrigger>
        </TabsList>

        <TabsContent value="awaiting" className="space-y-4">
          {/* Alert Card */}
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-900">{totalAwaiting} produtos vencidos aguardando descarte</p>
                  <p className="text-sm text-red-800 mt-1">Valor Total: {formatCurrency(totalValue)}</p>
                </div>
                <Button 
                  className="bg-red-600 hover:bg-red-700" 
                  onClick={handleDescartarEmMassa}
                  disabled={actionLoading || totalAwaiting === 0}
                >
                  Iniciar Descarte em Lote
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Itens Aguardando Descarte</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
                  <p className="text-sm text-muted-foreground">Carregando lotes vencidos...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 w-16">Criticidade</th>
                        <th className="text-left p-2">Produto</th>
                        <th className="text-left p-2">Lote</th>
                        <th className="text-left p-2">Validade</th>
                        <th className="text-right p-2">Quantidade</th>
                        <th className="text-right p-2">Valor Total</th>
                        <th className="text-left p-2">Local</th>
                        <th className="text-left p-2">Motivo</th>
                        <th className="text-center p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {awaitingItems.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-8 text-muted-foreground">
                            Nenhum item vencido aguardando descarte.
                          </td>
                        </tr>
                      ) : (
                        awaitingItems.map(item => (
                          <tr key={item.id} className="border-b bg-red-50 hover:bg-red-100/80 transition-colors">
                            <td className="p-2 text-center text-xl">{item.criticidadeSemaforo}</td>
                            <td className="p-2">
                              <div>
                                <p className="font-mono text-xs text-muted-foreground">{item.produto.sku}</p>
                                <p className="text-sm font-medium">{item.produto.descricao}</p>
                              </div>
                            </td>
                            <td className="p-2 font-mono text-xs font-semibold">{item.lote}</td>
                            <td className="p-2">
                              <p className="text-sm">{new Date(item.validade).toLocaleDateString("pt-BR")}</p>
                              <p className="text-red-700 font-bold text-xs">{item.validadeTexto}</p>
                            </td>
                            <td className="p-2 text-right font-medium">{item.quantidade} {item.unidadeMedida}</td>
                            <td className="p-2 text-right font-bold">{formatCurrency(item.valorTotal)}</td>
                            <td className="p-2 text-xs font-medium">{item.local}</td>
                            <td className="p-2">
                              <Badge variant="outline" className="bg-white">Vencimento</Badge>
                            </td>
                            <td className="p-2 text-center">
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleOpenDisposalModal(item)}
                              >
                                Registrar Descarte
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <div className="space-x-4">
                    <span>Total Aguardando: {totalAwaiting} itens</span>
                    <span>Qtd Total: {totalQuantity} unidades</span>
                  </div>
                  <div>
                    <span className="font-bold text-red-600">Valor Total a Descartar: {formatCurrency(totalValue)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Descartes Realizados</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Descartado</p>
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(4850)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Qtd Descartada</p>
                  <p className="text-3xl font-bold">285 kg</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Perda</p>
                  <p className="text-3xl font-bold text-red-500">1.8%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Descartes Realizados</CardTitle>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Código</th>
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Produto</th>
                      <th className="text-left p-2">Lote</th>
                      <th className="text-right p-2">Qtd</th>
                      <th className="text-right p-2">Valor</th>
                      <th className="text-left p-2">Motivo</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Responsável</th>
                      <th className="text-center p-2">Laudo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-emerald-600">DESC-001</td>
                      <td className="p-2">20/01/2025</td>
                      <td className="p-2">
                        <div>
                          <p className="font-mono text-xs">FRS-032</p>
                          <p className="text-sm">Iogurte Natural</p>
                        </div>
                      </td>
                      <td className="p-2 font-mono text-xs">LOT2025-045</td>
                      <td className="p-2 text-right">10 kg</td>
                      <td className="p-2 text-right font-bold">{formatCurrency(180)}</td>
                      <td className="p-2">
                        <Badge variant="outline">Vencimento</Badge>
                      </td>
                      <td className="p-2">Comum</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                            SU
                          </div>
                          <span className="text-sm">Stock User</span>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          ✅ Gerado
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pendentes de Aprovação</CardTitle>
              <CardDescription>Descartes aguardando autorização</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">Nenhum descarte pendente de aprovação</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
