"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Package, Clock, Calendar, ArrowRight, Play } from "lucide-react"

export function StockReplenishmentContent() {
  const [criteriaMinStock, setCriteriaMinStock] = useState(true)
  const [criteriaShortExpiry, setCriteriaShortExpiry] = useState(true)
  const [criteriaHighTurnover, setCriteriaHighTurnover] = useState(false)
  const [criteriaCurveA, setCriteriaCurveA] = useState(false)
  const [targetLocation, setTargetLocation] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-imperial">Reposição de Estoque</h1>
        <p className="text-muted-foreground">Gestão de reabastecimento de áreas de picking e lojas</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abaixo do Mínimo</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reposições Pendentes</p>
                <p className="text-3xl font-bold">8</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reposições Hoje</p>
                <p className="text-3xl font-bold">5</p>
              </div>
              <Calendar className="h-8 w-8 text-imperial" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Validade Curta</p>
                <p className="text-3xl font-bold">15</p>
              </div>
              <Package className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList>
          <TabsTrigger value="suggestions">Sugestões Automáticas</TabsTrigger>
          <TabsTrigger value="scheduled">Reposições Agendadas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {/* Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Critérios de Sugestão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="min-stock"
                    checked={criteriaMinStock}
                    onCheckedChange={(checked) => setCriteriaMinStock(checked as boolean)}
                  />
                  <Label htmlFor="min-stock" className="font-normal">
                    Produtos abaixo do mínimo
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="short-expiry"
                    checked={criteriaShortExpiry}
                    onCheckedChange={(checked) => setCriteriaShortExpiry(checked as boolean)}
                  />
                  <Label htmlFor="short-expiry" className="font-normal">
                    Validade &lt; 15 dias (priorizar rotação)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="high-turnover"
                    checked={criteriaHighTurnover}
                    onCheckedChange={(checked) => setCriteriaHighTurnover(checked as boolean)}
                  />
                  <Label htmlFor="high-turnover" className="font-normal">
                    Alto giro (rotação &gt; X/mês)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="curve-a"
                    checked={criteriaCurveA}
                    onCheckedChange={(checked) => setCriteriaCurveA(checked as boolean)}
                  />
                  <Label htmlFor="curve-a" className="font-normal">
                    Curva A
                  </Label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Local Destino</Label>
                  <Select value={targetLocation} onValueChange={setTargetLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="picking-area">Área de Picking</SelectItem>
                      <SelectItem value="loja-centro">Loja Centro</SelectItem>
                      <SelectItem value="loja-matola">Loja Matola</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="bg-imperial hover:bg-imperial w-full">Gerar Sugestões</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sugestões de Reposição</CardTitle>
                <Button className="bg-imperial hover:bg-imperial">Criar Reposições Selecionadas</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 w-12">
                        <Checkbox />
                      </th>
                      <th className="text-left p-2">Prioridade</th>
                      <th className="text-left p-2">Produto</th>
                      <th className="text-left p-2">Local Destino</th>
                      <th className="text-right p-2">Estoque Atual</th>
                      <th className="text-right p-2">Mínimo</th>
                      <th className="text-right p-2">Máximo</th>
                      <th className="text-right p-2">Qtd Sugerida</th>
                      <th className="text-left p-2">Lote Sugerido (FEFO)</th>
                      <th className="text-left p-2">Local Origem</th>
                      <th className="text-center p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <Checkbox />
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          🔴 Alta
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-mono text-xs">FRS-045</p>
                          <p className="text-sm font-medium">Filé de Frango</p>
                        </div>
                      </td>
                      <td className="p-2">Área Picking</td>
                      <td className="p-2 text-right">5 kg</td>
                      <td className="p-2 text-right">20 kg</td>
                      <td className="p-2 text-right">100 kg</td>
                      <td className="p-2 text-right font-bold">95 kg</td>
                      <td className="p-2">
                        <div className="text-xs">
                          <p className="font-mono">LOT2025-001</p>
                          <p className="text-muted-foreground">Val: 15/02/25 (24 dias)</p>
                        </div>
                      </td>
                      <td className="p-2">Estoque Reserva</td>
                      <td className="p-2 text-center">
                        <Button size="sm" className="bg-imperial hover:bg-imperial">
                          Criar
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reposições Agendadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Código</th>
                      <th className="text-left p-2">Data Agendada</th>
                      <th className="text-left p-2">Produto</th>
                      <th className="text-left p-2">Lote</th>
                      <th className="text-right p-2">Qtd</th>
                      <th className="text-left p-2">De → Para</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Responsável</th>
                      <th className="text-center p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono">REP-001</td>
                      <td className="p-2">22/01/2025</td>
                      <td className="p-2">Filé de Frango</td>
                      <td className="p-2 font-mono text-xs">LOT2025-001</td>
                      <td className="p-2 text-right">50 kg</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span>Reserva</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>Picking</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          Pendente
                        </Badge>
                      </td>
                      <td className="p-2">João Silva</td>
                      <td className="p-2 text-center">
                        <Button size="sm" className="bg-imperial hover:bg-imperial">
                          <Play className="h-4 w-4 mr-1" />
                          Executar
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Reposições</CardTitle>
              <CardDescription>Registro de reposições concluídas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">Histórico em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}




