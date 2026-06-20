"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  FileText,
  Download,
  Play,
  Calendar,
  Clock,
  Edit,
  Trash,
  Plus,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { estoqueService } from "@/app/services/estoqueService"
import { validadeService } from "@/app/services/validadeService"

export function ReportsHubContent() {
  const { toast } = useToast()
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportStep, setReportStep] = useState(1)
  const [selectedReportTitle, setSelectedReportTitle] = useState("")

  // Form state
  const [period, setPeriod] = useState("30days")
  const [format, setFormat] = useState("pdf")
  const [delivery, setDelivery] = useState("download")

  // API data state
  const [loading, setLoading] = useState(true)
  const [estoqueMetricas, setEstoqueMetricas] = useState<any>(null)
  const [validadeMetricas, setValidadeMetricas] = useState<any>(null)
  const [allStock, setAllStock] = useState<any[]>([])

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const [estData, valData, stockData] = await Promise.all([
          estoqueService.obterMetricas().catch(() => null),
          validadeService.obterMetricas().catch(() => null),
          estoqueService.listar({}).catch(() => [])
        ])
        if (!active) return
        setEstoqueMetricas(estData)
        setValidadeMetricas(valData)
        setAllStock(stockData)
      } catch (err) {
        console.error("Erro ao carregar dados do hub de relatórios:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + " MT"
  }

  const handleGenerateReportSubmit = () => {
    let headers: string[] = []
    let rows: any[][] = []
    const reportTitle = selectedReportTitle || "Relatório"

    if (reportTitle === "Curva ABC") {
      const productSummary: Record<string, { sku: string; desc: string; totalValue: number; qty: number }> = {}
      allStock.forEach((item: any) => {
        const sku = item.produto?.sku || "SKU"
        if (!productSummary[sku]) {
          productSummary[sku] = {
            sku: sku,
            desc: item.produto?.descricao || "Produto",
            totalValue: 0,
            qty: 0
          }
        }
        productSummary[sku].totalValue += (item.quantidade * item.valor_unitario)
        productSummary[sku].qty += item.quantidade
      })

      const sortedProducts = Object.values(productSummary).sort((a, b) => b.totalValue - a.totalValue)
      const grandTotalValue = sortedProducts.reduce((sum, p) => sum + p.totalValue, 0)

      let accumulatedValue = 0
      headers = ["SKU", "Descrição", "Quantidade", "Valor Total (MT)", "Acumulado (%)", "Classe"]
      rows = sortedProducts.map(p => {
        accumulatedValue += p.totalValue
        const pct = grandTotalValue > 0 ? (accumulatedValue / grandTotalValue) * 100 : 0
        let classe = "C"
        if (pct <= 70) classe = "A"
        else if (pct <= 90) classe = "B"

        return [
          p.sku,
          p.desc,
          p.qty,
          p.totalValue.toFixed(2),
          pct.toFixed(2) + "%",
          classe
        ]
      })
    } else if (reportTitle === "Estoque Parado") {
      headers = ["SKU", "Descrição", "Lote", "Quantidade", "Valor Unitário (MT)", "Valor Total (MT)", "Status"]
      rows = allStock.map((item: any) => [
        item.produto?.sku || "SKU",
        item.produto?.descricao || "Produto",
        item.lote || "LOTE",
        item.quantidade,
        item.valor_unitario.toFixed(2),
        (item.quantidade * item.valor_unitario).toFixed(2),
        item.status
      ])
    } else if (reportTitle === "Rupturas e Disponibilidade") {
      const stockMap: Record<string, { sku: string; desc: string; qty: number; min: number }> = {}
      allStock.forEach((item: any) => {
        const sku = item.produto?.sku || "SKU"
        if (!stockMap[sku]) {
          stockMap[sku] = {
            sku: sku,
            desc: item.produto?.descricao || "Produto",
            qty: 0,
            min: 50
          }
        }
        stockMap[sku].qty += item.quantidade
      })
      const lowStock = Object.values(stockMap).filter(p => p.qty < p.min)
      headers = ["SKU", "Descrição", "Quantidade Atual", "Estoque de Segurança", "Status"]
      rows = lowStock.map(p => [
        p.sku,
        p.desc,
        p.qty,
        p.min,
        p.qty === 0 ? "Ruptura Total" : "Abaixo do Mínimo"
      ])
    } else if (reportTitle === "Itens em Risco" || reportTitle === "Perdas por Vencimento") {
      const expiring = allStock.filter((item: any) => item.dias_restantes <= 90)
      headers = ["SKU", "Descrição", "Lote", "Validade", "Dias Restantes", "Quantidade", "Valor em Risco (MT)"]
      rows = expiring.map((item: any) => [
        item.produto?.sku || "SKU",
        item.produto?.descricao || "Produto",
        item.lote || "LOTE",
        item.validade ? new Date(item.validade).toLocaleDateString() : "-",
        item.dias_restantes,
        item.quantidade,
        (item.quantidade * item.valor_unitario).toFixed(2)
      ])
    } else {
      headers = ["SKU", "Descrição", "Quantidade", "Valor Unitário (MT)", "Valor Total (MT)"]
      rows = allStock.map((item: any) => [
        item.produto?.sku || "SKU",
        item.produto?.descricao || "Produto",
        item.quantidade,
        item.valor_unitario.toFixed(2),
        (item.quantidade * item.valor_unitario).toFixed(2)
      ])
    }

    if (format === "pdf") {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${reportTitle} - StockSafe</title>
              <style>
                body { font-family: sans-serif; padding: 25px; color: #333; }
                h1 { color: #800020; border-bottom: 2px solid #800020; padding-bottom: 10px; margin-bottom: 5px; }
                .meta { font-size: 12px; color: #666; margin-bottom: 25px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-size: 11px; }
                th { background-color: #f8f9fa; font-weight: bold; }
                tr:nth-child(even) { background-color: #fafafa; }
                .footer { margin-top: 40px; font-size: 10px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
              </style>
            </head>
            <body>
              <h1>Relatório: ${reportTitle}</h1>
              <div class="meta">
                <p><strong>StockSafe Hub de Relatórios</strong></p>
                <p>Data de Geração: ${new Date().toLocaleString()}</p>
                <p>Período selecionado: ${period === "30days" ? "Últimos 30 dias" : "Personalizado"}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    ${headers.map(h => `<th>${h}</th>`).join("")}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(r => `
                    <tr>
                      ${r.map(val => `<td>${val}</td>`).join("")}
                    </tr>
                  `).join("")}
                </tbody>
              </table>
              <div class="footer">StockSafe - Sistema de Gestão de Estoque e Validades</div>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    } else {
      const csvContent = [headers, ...rows]
        .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
        .join("\n")

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${reportTitle.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xls" : "csv"}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    toast({
      title: "Relatório gerado com sucesso",
      description: `O relatório "${reportTitle}" foi gerado em formato ${format.toUpperCase()}.`,
    })
    setShowReportModal(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-12 w-12 text-imperial animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando centro de analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-imperial">Relatórios e Analytics</h1>
        <p className="text-muted-foreground">Centro de análises e relatórios do sistema</p>
      </div>

      {/* Executive Dashboards */}
      <div>
        <h2 className="text-xl font-bold mb-4">Dashboards Executivos</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-twilight">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-10 w-10 text-imperial" />
                  <div>
                    <h3 className="font-bold">Visão Geral do Negócio</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">KPIs consolidados de todo o sistema</p>
                <div className="space-y-1 text-xs">
                  <p>Valor em Estoque: <span className="font-bold">{formatCurrency(estoqueMetricas?.valor_total_estoque || 185420)}</span></p>
                  <p>Movimentações Hoje: <span className="font-bold">{estoqueMetricas?.total_itens || 42}</span></p>
                  <p>Taxa de Atendimento: <span className="font-bold">96%</span></p>
                </div>
                <Link href="/dashboard">
                  <Button className="w-full bg-imperial hover:bg-imperial mt-3" size="sm">
                    Abrir Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-twilight">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-10 w-10 text-imperial" />
                  <div>
                    <h3 className="font-bold">Análise Financeira</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Valor do estoque, custos, perdas</p>
                <div className="space-y-1 text-xs">
                  <p>Valor do Estoque: <span className="font-bold">{formatCurrency(estoqueMetricas?.valor_total_estoque || 185420)}</span></p>
                  <p>Perdas Este Mês: <span className="font-bold text-red-600">{formatCurrency(validadeMetricas?.cards?.vencidos?.valor || 4850)}</span></p>
                  <p>ROI Estoque: <span className="font-bold">18%</span></p>
                </div>
                <Link href="/dashboard">
                  <Button className="w-full bg-imperial hover:bg-imperial mt-3" size="sm">
                    Abrir Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-blue-300">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-10 w-10 text-blue-600" />
                  <div>
                    <h3 className="font-bold">Performance Operacional</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Produtividade, tempos, eficiência</p>
                <div className="space-y-1 text-xs">
                  <p>Tempo Médio Recebimento: <span className="font-bold">2.5h</span></p>
                  <p>Acuracidade Inventário: <span className="font-bold">98%</span></p>
                  <p>Eficiência Picking: <span className="font-bold">92%</span></p>
                </div>
                <Link href="/dashboard">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-3" size="sm">
                    Abrir Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-red-300">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-10 w-10 text-red-600" />
                  <div>
                    <h3 className="font-bold">Controle de Validades</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Perdas, riscos, campanhas</p>
                <div className="space-y-1 text-xs">
                  <p>Em Risco: <span className="font-bold text-red-600">{formatCurrency(validadeMetricas?.kpis?.valorTotalEmRisco || 26670)}</span></p>
                  <p>Taxa de Perda: <span className="font-bold">{validadeMetricas?.kpis?.taxaPerda || 1.8}%</span></p>
                  <p>Campanhas Ativas: <span className="font-bold">{validadeMetricas?.kpis?.produtosCampanha || 5}</span></p>
                </div>
                <Link href="/validade/dashboard">
                  <Button className="w-full bg-red-600 hover:bg-red-700 mt-3" size="sm">
                    Abrir Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Categories */}
      <Tabs defaultValue="estoque" className="w-full">
        <TabsList>
          <TabsTrigger value="estoque">📦 Estoque</TabsTrigger>
          <TabsTrigger value="compras">🛒 Compras</TabsTrigger>
          <TabsTrigger value="validade">⚠️ Validade</TabsTrigger>
          <TabsTrigger value="operacional">📊 Operacional</TabsTrigger>
          <TabsTrigger value="avancado">📈 Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <ReportCard
              title="Curva ABC"
              description="Classificação de produtos por valor/giro"
              lastUpdate="Atualizado ontem"
              onGenerate={() => {
                setSelectedReportTitle("Curva ABC")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Giro de Estoque"
              description="Análise de rotação por produto/categoria"
              kpi="Últimos 90 dias"
              onGenerate={() => {
                setSelectedReportTitle("Giro de Estoque")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Rupturas e Disponibilidade"
              description="Produtos em falta e nível de serviço"
              kpi="Taxa: 96%"
              onGenerate={() => {
                setSelectedReportTitle("Rupturas e Disponibilidade")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Estoque Parado"
              description="Produtos sem movimentação há > 90 dias"
              kpi="8.450 MT parado"
              onGenerate={() => {
                setSelectedReportTitle("Estoque Parado")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Ocupação de Armazém"
              description="Utilização de espaço por local"
              kpi="78% ocupação média"
              onGenerate={() => {
                setSelectedReportTitle("Ocupação de Armazém")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Movimentações Consolidadas"
              description="Entradas, saídas e saldo por período"
              kpi="Este mês"
              onGenerate={() => {
                setSelectedReportTitle("Movimentações Consolidadas")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="compras" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <ReportCard
              title="Scorecard de Fornecedores"
              description="Performance e conformidade de fornecedores"
              kpi="Score Médio: 85/100"
              onGenerate={() => {
                setSelectedReportTitle("Scorecard de Fornecedores")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Conformidade Lote/Validade"
              description="Taxa de conformidade por fornecedor"
              kpi="92% conformidade"
              onGenerate={() => {
                setSelectedReportTitle("Conformidade Lote/Validade")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Lead Time de Fornecedores"
              description="Prazo médio vs prometido"
              kpi="Lead time: 7 dias"
              onGenerate={() => {
                setSelectedReportTitle("Lead Time de Fornecedores")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Não Conformidades"
              description="NCs por fornecedor e tipo"
              kpi="5 NCs este mês"
              onGenerate={() => {
                setSelectedReportTitle("Não Conformidades")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Volume de Compras"
              description="Valor comprado por fornecedor/categoria"
              kpi="Este ano"
              onGenerate={() => {
                setSelectedReportTitle("Volume de Compras")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Análise de Preços"
              description="Evolução de preços por produto/fornecedor"
              onGenerate={() => {
                setSelectedReportTitle("Análise de Preços")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="validade" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <ReportCard
              title="Perdas por Vencimento"
              description="Valor e quantidade perdidos"
              kpi="4.850 MT este mês"
              onGenerate={() => {
                setSelectedReportTitle("Perdas por Vencimento")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Itens em Risco"
              description="Projeção de perdas por horizonte"
              kpi="26.670 MT em risco"
              onGenerate={() => {
                setSelectedReportTitle("Itens em Risco")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Efetividade FEFO"
              description="% de picking correto (validade)"
              kpi="94% FEFO aplicado"
              onGenerate={() => {
                setSelectedReportTitle("Efetividade FEFO")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Análise de Campanhas"
              description="Performance de campanhas de escoamento"
              kpi="78% taxa de sucesso"
              onGenerate={() => {
                setSelectedReportTitle("Análise de Campanhas")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Descartes"
              description="Volume e valor de descartes"
              kpi="4.850 MT descartado"
              onGenerate={() => {
                setSelectedReportTitle("Descartes")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Produtos Mais Críticos"
              description="Top produtos com mais perdas"
              onGenerate={() => {
                setSelectedReportTitle("Produtos Mais Críticos")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="operacional" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <ReportCard
              title="Acuracidade de Inventário"
              description="Precisão de inventários cíclicos"
              kpi="98% acuracidade"
              onGenerate={() => {
                setSelectedReportTitle("Acuracidade de Inventário")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Produtividade de Recebimento"
              description="Tempo médio de conferência"
              kpi="15 min/item"
              onGenerate={() => {
                setSelectedReportTitle("Produtividade de Recebimento")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Performance de Picking"
              description="Tempo e acuracidade de separação"
              kpi="45 itens/hora"
              onGenerate={() => {
                setSelectedReportTitle("Performance de Picking")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Inspeções QA"
              description="Taxa de aprovação/reprovação"
              kpi="96% aprovação"
              onGenerate={() => {
                setSelectedReportTitle("Inspeções QA")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Tempo de Ciclo"
              description="Recebimento até disponibilização"
              kpi="4.2 horas médias"
              onGenerate={() => {
                setSelectedReportTitle("Tempo de Ciclo")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="avancado" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <ReportCard
              title="Análise de Sazonalidade"
              description="Padrões de demanda por período"
              onGenerate={() => {
                setSelectedReportTitle("Análise de Sazonalidade")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Previsão de Demanda"
              description="Projeção baseada em histórico"
              kpi="Algoritmo: Média móvel"
              onGenerate={() => {
                setSelectedReportTitle("Previsão de Demanda")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Ponto de Reposição"
              description="Sugestão de min/máx por produto"
              onGenerate={() => {
                setSelectedReportTitle("Ponto de Reposição")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Análise de Correlação"
              description="Produtos frequentemente movimentados juntos"
              onGenerate={() => {
                setSelectedReportTitle("Análise de Correlação")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
            <ReportCard
              title="Benchmarking Interno"
              description="Comparação entre locais/períodos"
              onGenerate={() => {
                setSelectedReportTitle("Benchmarking Interno")
                setReportStep(1)
                setShowReportModal(true)
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Relatórios Agendados</CardTitle>
            <Button className="bg-imperial hover:bg-imperial">
              <Plus className="h-4 w-4 mr-2" />
              Agendar Novo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome do Relatório</th>
                  <th className="text-left p-2">Frequência</th>
                  <th className="text-left p-2">Próxima Execução</th>
                  <th className="text-left p-2">Destinatários</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-center p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">Curva ABC - Mensal</td>
                  <td className="p-2">Mensal (dia 1)</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>01/02/2025 08:00</span>
                    </div>
                  </td>
                  <td className="p-2">gerencia@stocksafe.com +2</td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      Ativo
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">Perdas por Vencimento</td>
                  <td className="p-2">Semanal (Segunda-feira)</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>27/01/2025 07:00</span>
                    </div>
                  </td>
                  <td className="p-2">qualidade@stocksafe.com</td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      Ativo
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Relatórios Gerados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Data/Hora</th>
                  <th className="text-left p-2">Tipo de Relatório</th>
                  <th className="text-left p-2">Parâmetros</th>
                  <th className="text-left p-2">Gerado Por</th>
                  <th className="text-right p-2">Tamanho</th>
                  <th className="text-center p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>22/01/2025 14:30</span>
                    </div>
                  </td>
                  <td className="p-2">Curva ABC</td>
                  <td className="p-2 text-sm text-muted-foreground">Últimos 90 dias, Todas categorias</td>
                  <td className="p-2">João Silva</td>
                  <td className="p-2 text-right">2.3 MB</td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>21/01/2025 09:15</span>
                    </div>
                  </td>
                  <td className="p-2">Perdas por Vencimento</td>
                  <td className="p-2 text-sm text-muted-foreground">Este mês, Todos produtos</td>
                  <td className="p-2">Maria Santos</td>
                  <td className="p-2 text-right">856 KB</td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Report Generator Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerar Relatório - {selectedReportTitle}</DialogTitle>
            <DialogDescription>Configure os parâmetros do relatório</DialogDescription>
          </DialogHeader>

          {reportStep === 1 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Período *</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={period} onValueChange={setPeriod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="today" id="today" />
                      <Label htmlFor="today" className="font-normal">Hoje</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="7days" id="7days" />
                      <Label htmlFor="7days" className="font-normal">Últimos 7 dias</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30days" id="30days" />
                      <Label htmlFor="30days" className="font-normal">Últimos 30 dias</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="month" id="month" />
                      <Label htmlFor="month" className="font-normal">Este Mês</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="year" id="year" />
                      <Label htmlFor="year" className="font-normal">Este Ano</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="font-normal">Personalizado</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Filtros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Categorias</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="frescos">Frescos</SelectItem>
                        <SelectItem value="congelados">Congelados</SelectItem>
                        <SelectItem value="bebidas">Bebidas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Locais</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os locais" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="cd">Centro Distribuição</SelectItem>
                        <SelectItem value="loja1">Loja Centro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agrupamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Agrupar por</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Produto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="produto">Produto</SelectItem>
                        <SelectItem value="categoria">Categoria</SelectItem>
                        <SelectItem value="fornecedor">Fornecedor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ordenar por</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Valor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="valor">Valor</SelectItem>
                        <SelectItem value="quantidade">Quantidade</SelectItem>
                        <SelectItem value="nome">Nome</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReportModal(false)}>
                  Cancelar
                </Button>
                <Button className="bg-imperial hover:bg-imperial" onClick={() => setReportStep(2)}>
                  Próximo →
                </Button>
              </div>
            </div>
          )}

          {reportStep === 2 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Formato de Saída *</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={format} onValueChange={setFormat}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="pdf" />
                      <Label htmlFor="pdf" className="font-normal">PDF (layout profissional, gráficos)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="xlsx" id="xlsx" />
                      <Label htmlFor="xlsx" className="font-normal">XLSX (Excel, análise)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="csv" id="csv" />
                      <Label htmlFor="csv" className="font-normal">CSV (dados brutos)</Label>
                    </div>
                  </RadioGroup>

                  {format === "pdf" && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cover" />
                        <Label htmlFor="cover" className="font-normal">Incluir capa</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="charts" defaultChecked />
                        <Label htmlFor="charts" className="font-normal">Incluir gráficos</Label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={delivery} onValueChange={setDelivery}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="download" id="download" />
                      <Label htmlFor="download" className="font-normal">Download Imediato</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email" className="font-normal">Enviar por Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both" className="font-normal">Ambos</Label>
                    </div>
                  </RadioGroup>

                  {(delivery === "email" || delivery === "both") && (
                    <div className="mt-4 space-y-2">
                      <Label>Destinatários</Label>
                      <Input placeholder="email1@example.com, email2@example.com" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Salvar Configuração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="favorite" />
                    <Label htmlFor="favorite" className="font-normal">Salvar como favorito</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="schedule" />
                    <Label htmlFor="schedule" className="font-normal">Agendar execução recorrente</Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReportStep(1)}>
                  ← Voltar
                </Button>
                <Button className="bg-imperial hover:bg-imperial" onClick={handleGenerateReportSubmit}>
                  Gerar Relatório
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReportCard({
  title,
  description,
  kpi,
  lastUpdate,
  onGenerate,
}: {
  title: string
  description: string
  kpi?: string
  lastUpdate?: string
  onGenerate: () => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <FileText className="h-5 w-5 text-imperial mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          {kpi && (
            <p className="text-sm font-medium text-imperial">{kpi}</p>
          )}
          {lastUpdate && (
            <p className="text-xs text-muted-foreground">{lastUpdate}</p>
          )}
          <Button
            size="sm"
            className="w-full bg-imperial hover:bg-imperial"
            onClick={onGenerate}
          >
            Gerar Relatório
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
