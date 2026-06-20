"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, Users, AlertTriangle, TrendingUp, Loader2, ArrowDownCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { estoqueService } from "@/app/services/estoqueService"
import { produtoService } from "@/app/services/produtoService"
import { usuarioService } from "@/app/services/usuarioService"
import { requisicaoService } from "@/app/services/requisicaoService"
import { recebimentoService } from "@/app/services/recebimentoService"
import { qualidadeService } from "@/app/services/qualidadeService"

interface AtividadeFormatada {
  usuario: string
  acao: string
  entidade: string
  tempo: string
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({
    produtosCadastrados: 0,
    valorEstoque: 0,
    usuariosAtivos: 0,
    alertasValidade: 0,
    taxaConformidade: 97.8,
  })
  const [curtoPrazoItems, setCurtoPrazoItems] = useState<any[]>([])
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [atividadesRecentes, setAtividadesRecentes] = useState<AtividadeFormatada[]>([])

  const movimentacoesData = [
    { dia: "01", entradas: 120, saidas: 80 },
    { dia: "05", entradas: 150, saidas: 95 },
    { dia: "10", entradas: 180, saidas: 110 },
    { dia: "15", entradas: 140, saidas: 100 },
    { dia: "20", entradas: 200, saidas: 130 },
    { dia: "25", entradas: 170, saidas: 120 },
    { dia: "30", entradas: 190, saidas: 140 },
  ]

  const distribuicaoData = [
    { name: "Alimentos", value: 35, color: "#10B981" },
    { name: "Bebidas", value: 25, color: "#3B82F6" },
    { name: "Limpeza", value: 20, color: "#F59E0B" },
    { name: "Outros", value: 20, color: "#8B5CF6" },
  ]

  useEffect(() => {
    let active = true
    const loadDashboardData = async () => {
      try {
        const [
          metricasEstoque,
          produtos,
          usuarios,
          requisicoes,
          pos,
          inspecoes,
          curtoPrazoResult,
          allStock,
        ] = await Promise.all([
          estoqueService.obterMetricas(),
          produtoService.listarTodos(),
          usuarioService.listarTodos(),
          requisicaoService.listarTodas().catch(() => []),
          recebimentoService.listPurchaseOrders().catch(() => []),
          qualidadeService.listInspecoes().catch(() => []),
          estoqueService.listar({ faixa_validade: "30_DIAS" }).catch(() => []),
          estoqueService.listar({}).catch(() => []),
        ])

        if (!active) return

        // 1. Set KPI Cards
        setKpis({
          produtosCadastrados: produtos.length || 0,
          valorEstoque: metricasEstoque.valor_total_estoque || 0,
          usuariosAtivos: usuarios.length || 0,
          alertasValidade:
            (metricasEstoque.alertas_criticos?.vencidos || 0) +
            (metricasEstoque.alertas_criticos?.menos_7_dias || 0),
          taxaConformidade: 97.8,
        })

        // 2. Set Critical Expiration list
        setCurtoPrazoItems(curtoPrazoResult || [])

        // 3. Set Low Stock alert list (calculate aggregate quantities of products)
        const stockMap: Record<string, { descricao: string; sku: string; quantidade: number; min: number; unidadeMedida: string }> = {}
        allStock.forEach((item: any) => {
          const sku = item.produto?.sku || "SKU"
          if (!stockMap[sku]) {
            stockMap[sku] = {
              descricao: item.produto?.descricao || "Produto",
              sku: sku,
              quantidade: 0,
              min: 50, // Safety threshold level
              unidadeMedida: item.produto?.unidade_medida || "un"
            }
          }
          stockMap[sku].quantidade += item.quantidade
        })

        const lowStock = Object.values(stockMap).filter((p: any) => p.quantidade < p.min)
        setLowStockItems(lowStock)

        // 4. Process and format recent activities dynamically from all modules
        const reqActivities = (requisicoes || []).map((r: any) => ({
          usuario: r.solicitante?.nome_completo || "Solicitante",
          acao: r.status === "APROVADO" ? "aprovou" : r.status === "REJEITADO" ? "rejeitou" : "criou",
          entidade: `Requisição #${r.codigo || r.id.substring(0, 8)}`,
          tempo: new Date(r.updatedAt || r.createdAt),
        }))

        const poActivities = (pos || []).map((p: any) => ({
          usuario: "Comprador",
          acao: p.status === "FATURADO" ? "faturou" : "registrou",
          entidade: `Pedido de Compra #${p.codigo || p.id.substring(0, 8)}`,
          tempo: new Date(p.createdAt),
        }))

        const inspActivities = (inspecoes || []).map((i: any) => ({
          usuario: "Inspetor QA",
          acao: i.statusAprovado ? "aprovou" : "reprovou",
          entidade: `Inspecção no Lote ${i.lote?.codigo_lote || "L-Estoque"}`,
          tempo: new Date(i.createdAt),
        }))

        // Sort all actions chronologically
        const allActivities = [...reqActivities, ...poActivities, ...inspActivities]
          .sort((a: any, b: any) => b.tempo.getTime() - a.tempo.getTime())
          .slice(0, 5)
          .map((act: any) => {
            const now = new Date()
            const diffMs = now.getTime() - act.tempo.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            const diffHours = Math.floor(diffMins / 60)
            const diffDays = Math.floor(diffHours / 24)

            let tempoStr = "agora mesmo"
            if (diffDays > 0) {
              tempoStr = `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`
            } else if (diffHours > 0) {
              tempoStr = `há ${diffHours} hora${diffHours > 1 ? "s" : ""}`
            } else if (diffMins > 0) {
              tempoStr = `há ${diffMins} minuto${diffMins > 1 ? "s" : ""}`
            }

            return {
              usuario: act.usuario,
              acao: act.acao,
              entidade: act.entidade,
              tempo: tempoStr,
            }
          })

        setAtividadesRecentes(allActivities)
      } catch (error) {
        console.error("Erro ao carregar dados do admin dashboard:", error)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboardData()
    return () => {
      active = false
    }
  }, [])

  const formatCurrency = (val: number, compact = false) => {
    if (compact) {
      const formatted = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(val)
      return `${formatted} MT`
    }
    const formatted = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
    return `${formatted} MT`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-12 w-12 text-imperial animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando métricas do painel...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produtos</CardTitle>
            <Package className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.produtosCadastrados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor em Estoque</CardTitle>
            <DollarSign className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">
              {formatCurrency(kpis.valorEstoque, true)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuários Ativos</CardTitle>
            <Users className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.usuariosAtivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Validade</CardTitle>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{kpis.alertasValidade}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conformidade</CardTitle>
            <TrendingUp className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.taxaConformidade}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banners Grid */}
      {(curtoPrazoItems.length > 0 || lowStockItems.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerta de Produtos com Curto Prazo */}
          {curtoPrazoItems.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-red-700 text-base font-bold">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Alerta de Validade Crítica (Menos de 30 Dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {curtoPrazoItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-200 text-sm">
                      <div>
                        <span className="font-semibold text-red-900">{item.produto?.descricao || "Produto"}</span>
                        <span className="block text-xs text-muted-foreground">
                          Lote: {item.lote} | Qtd: {item.quantidade} {item.produto?.unidade_medida || "un"}
                        </span>
                      </div>
                      <Badge variant="destructive" className="bg-red-600">
                        Vence em {item.dias_restantes} dias
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerta de Estoque Baixo */}
          {lowStockItems.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-orange-700 text-base font-bold">
                  <ArrowDownCircle className="w-5 h-5 text-orange-600" />
                  Alerta de Estoque Mínimo / Ruptura (Abaixo de 50 un)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-orange-200 text-sm">
                      <div>
                        <span className="font-semibold text-orange-900">{item.descricao}</span>
                        <span className="block text-xs text-muted-foreground">
                          SKU: {item.sku}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                        Apenas {item.quantidade} {item.unidadeMedida}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações dos Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={movimentacoesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="entradas" stroke="#10B981" strokeWidth={2} name="Entradas" />
                <Line type="monotone" dataKey="saidas" stroke="#EF4444" strokeWidth={2} name="Saídas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Estoque por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribuicaoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuicaoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atividadesRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente registrada no sistema.</p>
            ) : (
              atividadesRecentes.map((atividade, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                  <div className="w-2 h-2 rounded-full bg-imperial" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{atividade.usuario}</span> {atividade.acao}{" "}
                      <span className="font-medium text-imperial">{atividade.entidade}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{atividade.tempo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
