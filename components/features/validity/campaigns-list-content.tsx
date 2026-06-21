"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, TrendingUp, Banknote, Wallet, Target, Loader2 } from "lucide-react"
import Link from "next/link"
import { validadeService } from "@/app/services/validadeService"

export function CampaignsListContent() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCampaigns() {
      try {
        setLoading(true)
        const data = await validadeService.listarCampanhas()
        setCampaigns(data)
      } catch (error) {
        console.error("Erro ao carregar campanhas:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCampaigns()
  }, [])

  // KPI Calculations
  const activeCampaigns = campaigns.filter(c => c.status === "ATIVA")
  const totalActiveCount = activeCampaigns.length
  
  const totalValueInCampaign = activeCampaigns.reduce((sum, c) => sum + c.valorEmRisco, 0)
  
  const avgEscoamentoPct = activeCampaigns.length > 0
    ? Math.round(activeCampaigns.reduce((sum, c) => sum + c.progressoEscoadoPct, 0) / activeCampaigns.length)
    : 0

  const totalSavedValue = campaigns.reduce((sum, c) => sum + c.quantidadeVendida * (c.valorEmRisco / (c.quantidadeRestante + c.quantidadeVendida || 1)), 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + " MT"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Campanhas de Escoamento</h1>
          <p className="text-muted-foreground">Gestão de ações para reduzir perdas por vencimento</p>
        </div>
        <Button className="bg-imperial hover:bg-imperial" asChild>
          <Link href="/validade/campanhas/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Campanhas Ativas</p>
                <p className="text-3xl font-bold">{totalActiveCount}</p>
              </div>
              <Target className="h-8 w-8 text-imperial" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor em Campanha</p>
                <p className="text-3xl font-bold">{formatCurrency(totalValueInCampaign)}</p>
              </div>
              <Banknote className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Escoamento</p>
                <p className="text-3xl font-bold text-imperial">{avgEscoamentoPct}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-imperial" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Este Mês</p>
                <p className="text-3xl font-bold text-imperial">{formatCurrency(totalSavedValue)}</p>
              </div>
              <Wallet className="h-8 w-8 text-imperial" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas ({campaigns.length})</CardTitle>
          <CardDescription>Lista de todas as campanhas de escoamento</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 text-imperial animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando campanhas do backend...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Código</th>
                    <th className="text-left p-2">Nome</th>
                    <th className="text-left p-2">Período</th>
                    <th className="text-center p-2">Qtd Itens</th>
                    <th className="text-right p-2">Valor em Risco</th>
                    <th className="text-left p-2 w-48">Progresso</th>
                    <th className="text-left p-2">Validade Mais Próxima</th>
                    <th className="text-left p-2">Responsável</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-center p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-muted-foreground">
                        Nenhuma campanha de escoamento cadastrada.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((camp) => (
                      <tr key={camp.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <Link href={`/validade/campanhas/${camp.id}`} className="font-mono text-imperial hover:underline">
                            {camp.codigo}
                          </Link>
                        </td>
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{camp.nome}</p>
                            <p className="text-xs text-muted-foreground">{camp.descricao}</p>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="text-sm">
                            <p>
                              {new Date(camp.dataInicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} -{" "}
                              {new Date(camp.dataFim).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                            </p>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <p className="font-medium">{camp.qtdItens}</p>
                        </td>
                        <td className="p-2 text-right">
                          <p className="font-bold">{formatCurrency(camp.valorEmRisco)}</p>
                        </td>
                        <td className="p-2">
                          <div className="space-y-1">
                            <Progress value={camp.progressoEscoadoPct} className="h-2" />
                            <p className="text-xs font-medium">{camp.progressoEscoadoPct}% escoado</p>
                            <p className="text-xs text-muted-foreground">
                              Vendido: {camp.quantidadeVendida} | Em risco: {camp.quantidadeRestante}
                            </p>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="text-sm">
                            {camp.validadeMaisProxima ? (
                              <>
                                <p>{new Date(camp.validadeMaisProxima).toLocaleDateString("pt-BR")}</p>
                                {(() => {
                                  const diffDays = Math.ceil((new Date(camp.validadeMaisProxima).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                  if (diffDays <= 0) return <p className="text-red-600 font-bold text-xs">Vencido</p>;
                                  if (diffDays === 1) return <p className="text-red-600 font-bold text-xs">1 dia</p>;
                                  return <p className="text-orange-600 font-medium text-xs">{diffDays} dias</p>;
                                })()}
                              </>
                            ) : (
                              <p className="text-muted-foreground">-</p>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-twilight text-imperial flex items-center justify-center text-xs font-medium">
                              {camp.responsavel ? camp.responsavel.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "JS"}
                            </div>
                            <span className="text-sm">{camp.responsavel || "João Silva"}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className={camp.status === "ATIVA" ? "bg-twilight text-imperial" : "bg-blue-50 text-blue-700"}>
                            {camp.status === "ATIVA" ? "🟢 Ativa" : "✅ Encerrada"}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Button size="sm" className="bg-imperial hover:bg-imperial" asChild>
                            <Link href={`/validade/campanhas/${camp.id}`}>
                              {camp.status === "ATIVA" ? "Monitorar" : "Ver Resultados"}
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
