"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, TrendingUp, DollarSign, Target } from "lucide-react"
import Link from "next/link"

export function CampaignsListContent() {
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
                <p className="text-3xl font-bold">5</p>
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
                <p className="text-3xl font-bold">45.200 MT</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Escoamento</p>
                <p className="text-3xl font-bold text-imperial">82%</p>
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
                <p className="text-3xl font-bold text-imperial">12.850 MT</p>
              </div>
              <DollarSign className="h-8 w-8 text-imperial" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas (5)</CardTitle>
          <CardDescription>Lista de todas as campanhas de escoamento</CardDescription>
        </CardHeader>
        <CardContent>
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
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <Link href="/validade/campanhas/1" className="font-mono text-imperial hover:underline">
                      CAMP-001
                    </Link>
                  </td>
                  <td className="p-2">
                    <div>
                      <p className="font-medium">Escoamento Frescos - Janeiro</p>
                      <p className="text-xs text-muted-foreground">Promoção 20% + Transferência lojas</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-sm">
                      <p>15/01 - 30/01/2025</p>
                      <Badge variant="outline" className="mt-1 bg-twilight text-imperial text-xs">
                        Ativa
                      </Badge>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <p className="font-medium">12</p>
                    <Button variant="link" className="text-xs p-0 h-auto">
                      Ver Itens
                    </Button>
                  </td>
                  <td className="p-2 text-right">
                    <p className="font-bold">8.920,00 MT</p>
                    <p className="text-xs text-muted-foreground">12% estoque</p>
                  </td>
                  <td className="p-2">
                    <div className="space-y-1">
                      <Progress value={65} className="h-2" />
                      <p className="text-xs font-medium">65% escoado</p>
                      <p className="text-xs text-muted-foreground">Vendido: 6 | Em risco: 6</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-sm">
                      <p>25/01/2025</p>
                      <p className="text-orange-600 font-medium">3 dias</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-twilight text-imperial flex items-center justify-center text-xs font-medium">
                        JS
                      </div>
                      <span className="text-sm">João Silva</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      🟢 Ativa
                    </Badge>
                  </td>
                  <td className="p-2 text-center">
                    <Button size="sm" className="bg-imperial hover:bg-imperial">
                      Monitorar
                    </Button>
                  </td>
                </tr>

                <tr className="border-b hover:bg-muted/50 bg-red-50">
                  <td className="p-2">
                    <Link href="/validade/campanhas/2" className="font-mono text-imperial hover:underline">
                      CAMP-002
                    </Link>
                  </td>
                  <td className="p-2">
                    <div>
                      <p className="font-medium">Urgente - Bebidas Vencendo</p>
                      <p className="text-xs text-muted-foreground">Desconto 30% + Loja Centro</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-sm">
                      <p>20/01 - 23/01/2025</p>
                      <Badge variant="outline" className="mt-1 bg-red-50 text-red-700 text-xs">
                        Encerra em 1 dia
                      </Badge>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <p className="font-medium">8</p>
                    <Button variant="link" className="text-xs p-0 h-auto">
                      Ver Itens
                    </Button>
                  </td>
                  <td className="p-2 text-right">
                    <p className="font-bold">5.200,00 MT</p>
                    <p className="text-xs text-muted-foreground">7% estoque</p>
                  </td>
                  <td className="p-2">
                    <div className="space-y-1">
                      <Progress value={38} className="h-2" />
                      <p className="text-xs font-medium">38% escoado</p>
                      <p className="text-xs text-muted-foreground">Vendido: 3 | Em risco: 5</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-sm">
                      <p>23/01/2025</p>
                      <p className="text-red-600 font-bold">1 dia</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-twilight text-imperial flex items-center justify-center text-xs font-medium">
                        MS
                      </div>
                      <span className="text-sm">Maria Santos</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      🟢 Ativa
                    </Badge>
                  </td>
                  <td className="p-2 text-center">
                    <Button size="sm" className="bg-imperial hover:bg-imperial">
                      Monitorar
                    </Button>
                  </td>
                </tr>

                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <Link href="/validade/campanhas/3" className="font-mono text-imperial hover:underline">
                      CAMP-003
                    </Link>
                  </td>
                  <td className="p-2">
                    <div>
                      <p className="font-medium">Escoamento Dezembro</p>
                      <p className="text-xs text-muted-foreground">Transferência + Uso interno</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-sm">
                      <p>01/12 - 20/12/2024</p>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <p className="font-medium">25</p>
                  </td>
                  <td className="p-2 text-right">
                    <p className="font-bold">18.500,00 MT</p>
                  </td>
                  <td className="p-2">
                    <div className="space-y-1">
                      <Progress value={100} className="h-2" />
                      <p className="text-xs font-medium text-imperial">100% escoado</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <p className="text-sm text-muted-foreground">-</p>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-twilight text-imperial flex items-center justify-center text-xs font-medium">
                        PC
                      </div>
                      <span className="text-sm">Pedro Costa</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      ✅ Encerrada
                    </Badge>
                  </td>
                  <td className="p-2 text-center">
                    <Button size="sm" variant="outline">
                      Ver Resultados
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




