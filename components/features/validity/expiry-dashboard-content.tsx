"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, TrendingUp, Download, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { validadeService, type ValidadeMetricas, type ProdutoCritico } from "@/app/services/validadeService"

export function ExpiryDashboardContent() {
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  // State
  const [metrics, setMetrics] = useState<ValidadeMetricas | null>(null)
  const [items, setItems] = useState<ProdutoCritico[]>([])
  const [resumo, setResumo] = useState({ totalLinhas: 0, totalQuantidade: 0, valorTotalRisco: 0 })
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [categoria, setCategoria] = useState("TODOS")
  const [status, setStatus] = useState("TODOS")

  // Load metrics & table data
  const loadData = async () => {
    try {
      setLoading(true)
      const [metricsData, tableData] = await Promise.all([
        validadeService.obterMetricas(),
        validadeService.listarProdutosCriticos({
          search: search || undefined,
          categoria: categoria !== "TODOS" ? categoria : undefined,
          status: status !== "TODOS" ? status : undefined,
        })
      ])
      setMetrics(metricsData)
      setItems(tableData.items)
      setResumo(tableData.resumo)
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações de validade.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [search, categoria, status])

  // Actions
  const handleDescartarLote = async (loteId: string) => {
    try {
      setActionLoading(true)
      await validadeService.descartar(loteId, authUser?.id)
      toast({
        title: "Lote descartado",
        description: "O descarte do lote foi registado com sucesso."
      })
      setSelectedItems(prev => prev.filter(id => id !== loteId))
      await loadData()
    } catch (error) {
      toast({
        title: "Erro ao descartar",
        description: "Ocorreu um erro ao tentar descartar o lote.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleColocarEmCampanha = async (loteId: string) => {
    try {
      setActionLoading(true)
      await validadeService.colocarEmCampanha(loteId)
      toast({
        title: "Lote em campanha",
        description: "O lote foi movido para campanha promocional."
      })
      await loadData()
    } catch (error) {
      toast({
        title: "Erro ao mover",
        description: "Não foi possível mover o lote para campanha.",
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
      setSelectedItems([])
      await loadData()
    } catch (error) {
      toast({
        title: "Erro ao descartar em massa",
        description: "Não foi possível processar o descarte em massa.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDescartarSelecionados = async () => {
    try {
      setActionLoading(true)
      await Promise.all(selectedItems.map(id => validadeService.descartar(id, authUser?.id)))
      toast({
        title: "Itens descartados",
        description: `${selectedItems.length} lotes foram descartados com sucesso.`
      })
      setSelectedItems([])
      await loadData()
    } catch (error) {
      toast({
        title: "Erro no descarte",
        description: "Falha ao descartar um ou mais lotes selecionados.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCampanhaSelecionados = async () => {
    try {
      setActionLoading(true)
      await Promise.all(selectedItems.map(id => validadeService.colocarEmCampanha(id)))
      toast({
        title: "Itens em campanha",
        description: `${selectedItems.length} lotes foram movidos para campanha.`
      })
      setSelectedItems([])
      await loadData()
    } catch (error) {
      toast({
        title: "Erro ao mover",
        description: "Falha ao mover um ou mais lotes selecionados.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id])
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id))
    }
  }

  // Format Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val)
  }

  const uniqueCategories = Array.from(new Set(items.map(item => item.produto.categoria).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-red-700">Controle de Validades</h1>
            <p className="text-muted-foreground">Monitoramento em tempo real de produtos próximos ao vencimento</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Sincronizado
            </Badge>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {metrics?.alertaBanner && (metrics.alertaBanner.vencidos24h.quantidade > 0 || metrics.alertaBanner.vencendoHoje > 0) && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
              <div className="flex-1">
                {metrics.alertaBanner.vencidos24h.quantidade > 0 && (
                  <p className="font-bold text-red-900">
                    🔴 {metrics.alertaBanner.vencidos24h.quantidade} produto{metrics.alertaBanner.vencidos24h.quantidade > 1 ? "s" : ""} venceram nas últimas 24 horas ({formatCurrency(metrics.alertaBanner.vencidos24h.valor)})
                  </p>
                )}
                {metrics.alertaBanner.vencendoHoje > 0 && (
                  <p className="text-sm text-red-800 mt-1">
                    🔴 {metrics.alertaBanner.vencendoHoje} produto{metrics.alertaBanner.vencendoHoje > 1 ? "s" : ""} vencerão hoje
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Cards */}
      {metrics?.cards && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card className="border-red-300 bg-red-50 cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-red-700 font-medium">🔴 VENCIDOS</p>
                <p className="text-4xl font-bold text-red-900">{metrics.cards.vencidos.lotes}</p>
                <p className="text-sm text-red-700">lotes</p>
                <p className="text-lg font-bold text-red-900">{formatCurrency(metrics.cards.vencidos.valor)}</p>
                <Button 
                  size="sm" 
                  onClick={handleDescartarEmMassa}
                  disabled={actionLoading || metrics.cards.vencidos.lotes === 0}
                  className="w-full bg-red-600 hover:bg-red-700 mt-2"
                >
                  Descarte Geral
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-300 bg-orange-50 cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-orange-700 font-medium">🟠 ≤ 7 DIAS</p>
                <p className="text-4xl font-bold text-orange-900">{metrics.cards.menos7dias.lotes}</p>
                <p className="text-sm text-orange-700">lotes</p>
                <p className="text-lg font-bold text-orange-900">{formatCurrency(metrics.cards.menos7dias.valor)}</p>
                <p className="text-xs text-orange-700 mt-1">{metrics.cards.menos7dias.percentagemEstoque}% do estoque</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-300 bg-yellow-50 cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-yellow-700 font-medium">🟡 ≤ 15 DIAS</p>
                <p className="text-4xl font-bold text-yellow-900">{metrics.cards.menos15dias.lotes}</p>
                <p className="text-sm text-yellow-700">lotes</p>
                <p className="text-lg font-bold text-yellow-900">{formatCurrency(metrics.cards.menos15dias.valor)}</p>
                <p className="text-xs text-yellow-700 mt-1">{metrics.cards.menos15dias.percentagemEstoque}% do estoque</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-25 cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-yellow-600 font-medium">🟡 ≤ 30 DIAS</p>
                <p className="text-4xl font-bold text-yellow-800">{metrics.cards.menos30dias.lotes}</p>
                <p className="text-sm text-yellow-600">lotes</p>
                <p className="text-lg font-bold text-yellow-800">{formatCurrency(metrics.cards.menos30dias.valor)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-300 bg-blue-50 cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-blue-700 font-medium">🔵 31-60 DIAS</p>
                <p className="text-4xl font-bold text-blue-900">{metrics.cards.de31a60dias.lotes}</p>
                <p className="text-sm text-blue-700">lotes</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(metrics.cards.de31a60dias.valor)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-300 bg-green-50 cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-green-700 font-medium">🟢 61-90 DIAS</p>
                <p className="text-4xl font-bold text-green-900">{metrics.cards.de61a90dias.lotes}</p>
                <p className="text-sm text-green-700">lotes</p>
                <p className="text-lg font-bold text-green-900">{formatCurrency(metrics.cards.de61a90dias.valor)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Indicators */}
      {metrics?.kpis && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Valor Total em Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(metrics.kpis.valorTotalEmRisco)}</p>
              <p className="text-sm text-muted-foreground mt-1">{metrics.kpis.percentagemEmRisco}% do estoque total</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                <TrendingUp className="h-4 w-4" />
                <span>Análise de Criticidade</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Taxa de Perda (Este Mês)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{metrics.kpis.taxaPerda}%</p>
              <p className="text-sm text-muted-foreground mt-1">Meta: &lt; 2%</p>
              <Progress value={Math.min(100, (metrics.kpis.taxaPerda / 2) * 100)} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dias Médios até Vencimento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metrics.kpis.diasMediosVencimento}</p>
              <p className="text-sm text-muted-foreground mt-1">dias (média ponderada)</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>Tendência Estável</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Produtos em Campanha</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{metrics.kpis.produtosCampanha}</p>
              <p className="text-sm text-muted-foreground mt-1">lotes ativos</p>
              <Button variant="link" className="text-blue-600 p-0 mt-2" asChild>
                <Link href="/validade/campanhas">Ver Campanhas →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-red-600">
          <CardContent className="pt-6">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700" 
              size="lg" 
              onClick={handleDescartarEmMassa}
              disabled={actionLoading || (metrics?.cards.vencidos.lotes === 0)}
            >
              🗑️ Processar Descartes
              {metrics && metrics.cards.vencidos.lotes > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {metrics.cards.vencidos.lotes}
                </Badge>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-600">
          <CardContent className="pt-6">
            <Button className="w-full bg-orange-600 hover:bg-orange-700" size="lg" asChild>
              <Link href="/validade/campanhas/nova">📢 Nova Campanha</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-600">
          <CardContent className="pt-6">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              🚚 Transferir para Lojas
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-600">
          <CardContent className="pt-6">
            <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" onClick={() => window.print()}>
              📊 Relatório de Validades
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos com Validade Crítica</CardTitle>
              <CardDescription>Lista detalhada ordenada por criticidade</CardDescription>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar por SKU, descrição ou código do lote..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-4">
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas Categorias</SelectItem>
                  {uniqueCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos Status</SelectItem>
                  <SelectItem value="ATIVO">📦 Disponível</SelectItem>
                  <SelectItem value="CAMPANHA">📢 Em Campanha</SelectItem>
                  <SelectItem value="BLOQUEADO">🔒 Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedItems.length > 0 && (
            <Card className="mb-4 border-emerald-200 bg-emerald-50">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-emerald-800">{selectedItems.length} itens selecionados</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCampanhaSelecionados} disabled={actionLoading}>
                      Mover para Campanha
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDescartarSelecionados} disabled={actionLoading}>
                      Descartar Lotes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando lotes críticos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 w-12">
                      <Checkbox 
                        checked={items.length > 0 && selectedItems.length === items.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-2 w-16">Criticidade</th>
                    <th className="text-left p-2">Produto</th>
                    <th className="text-left p-2">Lote</th>
                    <th className="text-left p-2">Validade</th>
                    <th className="text-left p-2">% Vida</th>
                    <th className="text-right p-2">Qtd</th>
                    <th className="text-right p-2">Valor Unit.</th>
                    <th className="text-right p-2">Valor Total</th>
                    <th className="text-left p-2">Local</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-center p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center py-8 text-muted-foreground">
                        Nenhum lote com validade crítica encontrado.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const isVencido = item.diasRestantes <= 0;
                      return (
                        <tr 
                          key={item.id} 
                          className={`border-b hover:bg-gray-50 transition-colors ${
                            isVencido ? "bg-red-50 hover:bg-red-100/80" : 
                            item.diasRestantes <= 7 ? "bg-orange-50/50 hover:bg-orange-50" : ""
                          }`}
                        >
                          <td className="p-2">
                            <Checkbox 
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                            />
                          </td>
                          <td className="p-2 text-center text-xl font-bold select-none">
                            {item.criticidadeSemaforo}
                          </td>
                          <td className="p-2">
                            <div>
                              <p className="font-mono text-xs text-muted-foreground">{item.produto.sku}</p>
                              <p className="text-sm font-medium">{item.produto.descricao}</p>
                              <Badge variant="outline" className="mt-1 text-xs bg-white">
                                {item.produto.categoria}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-2 font-mono text-xs font-semibold">{item.lote}</td>
                          <td className="p-2">
                            <div>
                              <p className="font-bold">{new Date(item.validade).toLocaleDateString("pt-BR")}</p>
                              <p className={`text-xs font-bold ${isVencido ? "text-red-700" : "text-amber-700"}`}>
                                {item.validadeTexto}
                              </p>
                            </div>
                          </td>
                          <td className="p-2">
                            <Progress 
                              value={item.percentagemVidaUtil} 
                              className={`h-2 w-20 ${isVencido ? "[&>div]:bg-red-600" : item.diasRestantes <= 15 ? "[&>div]:bg-amber-500" : ""}`} 
                            />
                            <p className="text-xs mt-1">{item.percentagemVidaUtil}%</p>
                          </td>
                          <td className="p-2 text-right">
                            <p className="font-medium">{item.quantidade} {item.unidadeMedida}</p>
                          </td>
                          <td className="p-2 text-right">{formatCurrency(item.valorUnitario)}</td>
                          <td className="p-2 text-right">
                            <p className="font-bold">{formatCurrency(item.valorTotal)}</p>
                          </td>
                          <td className="p-2 text-xs font-medium">{item.local}</td>
                          <td className="p-2">
                            <Badge 
                              variant="outline" 
                              className={
                                item.status === "ATIVO" ? "bg-green-50 text-green-700 border-green-200" :
                                item.status === "CAMPANHA" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-gray-50 text-gray-700 border-gray-200"
                              }
                            >
                              {item.status === "ATIVO" ? "📦 Disponível" :
                               item.status === "CAMPANHA" ? "📢 Campanha" :
                               `🔒 ${item.status}`}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1 justify-center">
                              {item.status !== "CAMPANHA" && !isVencido && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleColocarEmCampanha(item.id)}
                                  disabled={actionLoading}
                                  className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                  📢 Campanha
                                </Button>
                              )}
                              {item.quantidade > 0 && (
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => handleDescartarLote(item.id)}
                                  disabled={actionLoading}
                                >
                                  🗑️ Descartar
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <div className="space-x-4">
                <span>Total de Linhas: {resumo.totalLinhas}</span>
                <span>Qtd Total: {resumo.totalQuantidade}</span>
              </div>
              <div>
                <span className="font-bold text-red-600">Valor Total em Risco: {formatCurrency(resumo.valorTotalRisco)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
