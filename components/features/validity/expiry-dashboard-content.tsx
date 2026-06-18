"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingDown, TrendingUp, Camera, Download } from "lucide-react"
import Link from "next/link"

export function ExpiryDashboardContent() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-red-700">Controle de Validades</h1>
            <p className="text-muted-foreground">Monitoramento em tempo real de produtos próximos ao vencimento</p>
          </div>
          <Badge variant="outline" className="bg-twilight text-imperial">
            Atualizado há 5 minutos
          </Badge>
        </div>
      </div>

      {/* Critical Alert Banner */}
      <Card className="border-red-300 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-900">🔴 3 produtos venceram nas últimas 24 horas (MZN 450,00)</p>
              <p className="text-sm text-red-800 mt-1">🔴 5 produtos vencerão hoje</p>
            </div>
            <Button variant="outline" className="text-red-700 border-red-600">
              Ver Todos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border-red-300 bg-red-50 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-red-700 font-medium">🔴 VENCIDOS</p>
              <p className="text-4xl font-bold text-red-900">8</p>
              <p className="text-sm text-red-700">lotes</p>
              <p className="text-lg font-bold text-red-900">MZN 2.450,00</p>
              <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 mt-2">
                Ação Urgente
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-300 bg-orange-50 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-orange-700 font-medium">🟠 ≤ 7 DIAS</p>
              <p className="text-4xl font-bold text-orange-900">15</p>
              <p className="text-sm text-orange-700">lotes</p>
              <p className="text-lg font-bold text-orange-900">MZN 8.920,00</p>
              <p className="text-xs text-orange-700 mt-1">12% do estoque</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-300 bg-yellow-50 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-yellow-700 font-medium">🟡 ≤ 15 DIAS</p>
              <p className="text-4xl font-bold text-yellow-900">22</p>
              <p className="text-sm text-yellow-700">lotes</p>
              <p className="text-lg font-bold text-yellow-900">MZN 15.300,00</p>
              <p className="text-xs text-yellow-700 mt-1">18% do estoque</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-25 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-yellow-600 font-medium">🟡 ≤ 30 DIAS</p>
              <p className="text-4xl font-bold text-yellow-800">35</p>
              <p className="text-sm text-yellow-600">lotes</p>
              <p className="text-lg font-bold text-yellow-800">MZN 28.500,00</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-300 bg-blue-50 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-blue-700 font-medium">🔵 31-60 DIAS</p>
              <p className="text-4xl font-bold text-blue-900">48</p>
              <p className="text-sm text-blue-700">lotes</p>
              <p className="text-lg font-bold text-blue-900">MZN 42.100,00</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-twilight bg-twilight cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-imperial font-medium">🟢 61-90 DIAS</p>
              <p className="text-4xl font-bold text-imperial">92</p>
              <p className="text-sm text-imperial">lotes</p>
              <p className="text-lg font-bold text-imperial">MZN 78.600,00</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Indicators */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valor Total em Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">MZN 26.670,00</p>
            <p className="text-sm text-muted-foreground mt-1">15% do estoque total</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
              <TrendingUp className="h-4 w-4" />
              <span>+8% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taxa de Perda (Este Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-imperial">1.8%</p>
            <p className="text-sm text-muted-foreground mt-1">Meta: &lt; 2%</p>
            <Progress value={90} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dias Médios até Vencimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">45</p>
            <p className="text-sm text-muted-foreground mt-1">dias (média ponderada)</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-imperial">
              <TrendingUp className="h-4 w-4" />
              <span>Tendência: Subindo</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos em Campanha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className="text-sm text-muted-foreground mt-1">itens</p>
            <Button variant="link" className="text-blue-600 p-0 mt-2" asChild>
              <Link href="/validade/campanhas">Ver Campanhas →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-red-600">
          <CardContent className="pt-6">
            <Button className="w-full bg-red-600 hover:bg-red-700" size="lg">
              🗑️ Processar Descartes
              <Badge variant="secondary" className="ml-2">
                8
              </Badge>
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

        <Card className="border-imperial">
          <CardContent className="pt-6">
            <Button className="w-full bg-imperial hover:bg-imperial" size="lg">
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
          {selectedItems.length > 0 && (
            <Card className="mb-4 border-twilight bg-twilight">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedItems.length} itens selecionados</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Criar Campanha
                    </Button>
                    <Button size="sm" variant="outline">
                      Transferir
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600">
                      Descartar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 w-12">
                    <Checkbox />
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
                <tr className="border-b bg-red-100 hover:bg-red-200">
                  <td className="p-2">
                    <Checkbox />
                  </td>
                  <td className="p-2 text-center text-2xl">🔴🔴🔴</td>
                  <td className="p-2">
                    <div>
                      <p className="font-mono text-xs">FRS-045</p>
                      <p className="text-sm font-medium">Filé de Frango Congelado</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        Congelado
                      </Badge>
                    </div>
                  </td>
                  <td className="p-2 font-mono text-xs">LOT2024-099</td>
                  <td className="p-2">
                    <div>
                      <p className="font-bold">20/01/2025</p>
                      <p className="text-red-700 font-bold">Vencido há 2 dias</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <Progress value={0} className="h-2 w-20" />
                    <p className="text-xs mt-1">0%</p>
                  </td>
                  <td className="p-2 text-right">
                    <p className="font-medium">25 kg</p>
                  </td>
                  <td className="p-2 text-right">MZN 18,50</td>
                  <td className="p-2 text-right">
                    <p className="font-bold">MZN 462,50</p>
                  </td>
                  <td className="p-2 text-xs">ARM01 &gt; ZF</td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      📦 Disponível
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="destructive">
                        🗑️ Descartar
                      </Button>
                    </div>
                  </td>
                </tr>

                <tr className="border-b bg-orange-50 hover:bg-orange-100">
                  <td className="p-2">
                    <Checkbox />
                  </td>
                  <td className="p-2 text-center text-2xl">🔴🔴</td>
                  <td className="p-2">
                    <div>
                      <p className="font-mono text-xs">BEB-120</p>
                      <p className="text-sm font-medium">Suco de Laranja Natural</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        Bebidas
                      </Badge>
                    </div>
                  </td>
                  <td className="p-2 font-mono text-xs">LOT2025-087</td>
                  <td className="p-2">
                    <div>
                      <p className="font-bold">24/01/2025</p>
                      <p className="text-red-700 font-bold">2 dias</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <Progress value={5} className="h-2 w-20" />
                    <p className="text-xs mt-1">5%</p>
                  </td>
                  <td className="p-2 text-right">
                    <p className="font-medium">100 L</p>
                  </td>
                  <td className="p-2 text-right">MZN 8,90</td>
                  <td className="p-2 text-right">
                    <p className="font-bold">MZN 890,00</p>
                  </td>
                  <td className="p-2 text-xs">ARM01 &gt; ZF</td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      📦 Disponível
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        📢 Campanha
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <div className="space-x-4">
                <span>Total de Linhas: 45</span>
                <span>Qtd Total: 850 unidades</span>
              </div>
              <div>
                <span className="font-bold text-red-600">Valor Total em Risco: MZN 26.670,00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




