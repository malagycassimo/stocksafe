"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Edit,
  Pause,
  Play,
  StopCircle,
  Download,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  DollarSign,
  Target
} from "lucide-react"
import Link from "next/link"

interface CampaignMonitoringContentProps {
  campaignId: string
}

export function CampaignMonitoringContent({ campaignId }: CampaignMonitoringContentProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [newNote, setNewNote] = useState("")

  // Mock data
  const campaign = {
    id: campaignId,
    code: `CAMP-${campaignId.toString().padStart(3, "0")}`,
    name: "Escoamento Frescos - Janeiro",
    status: "ativa" as const,
    startDate: "15/01/2025",
    endDate: "30/01/2025",
    daysRemaining: 8,
    progress: 65,
    targetProgress: 75,
    itemsEscoados: 8,
    itemsTotal: 12,
    valorSalvo: 5845.0,
    valorTotal: 8920.0,
    valorEmRisco: 3075.0,
    itemsCriticos: 3,
    taxaSucesso: 78,
    responsible: "João Silva",
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
            <span className="text-foreground">{campaign.code}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-imperial">{campaign.name}</h1>
            <Badge variant="outline" className="bg-twilight text-imperial">
              🟢 {campaign.status === "ativa" ? "Ativa" : campaign.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Período: {campaign.startDate} a {campaign.endDate} ({campaign.daysRemaining} dias restantes)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm">
            <Pause className="h-4 w-4 mr-2" />
            Pausar
          </Button>
          <Button variant="outline" size="sm" className="text-red-600">
            <StopCircle className="h-4 w-4 mr-2" />
            Encerrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className={campaign.progress >= campaign.targetProgress ? "border-twilight bg-twilight" : "border-orange-300 bg-orange-50"}>
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="relative inline-flex items-center justify-center w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - campaign.progress / 100)}`}
                    className={campaign.progress >= campaign.targetProgress ? "text-imperial" : "text-orange-600"}
                  />
                </svg>
                <div className="absolute">
                  <p className="text-3xl font-bold">{campaign.progress}%</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Progresso Geral</p>
                <p className="text-xs text-muted-foreground">Meta: {campaign.targetProgress}%</p>
                <p className="text-xs font-medium mt-1">{campaign.itemsEscoados} de {campaign.itemsTotal} itens escoados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-twilight bg-twilight">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <DollarSign className="h-12 w-12 mx-auto text-imperial" />
              <div>
                <p className="text-3xl font-bold text-imperial">{campaign.valorSalvo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT</p>
                <p className="text-sm font-medium mt-1">Valor Salvo</p>
                <p className="text-xs text-muted-foreground">
                  {((campaign.valorSalvo / campaign.valorTotal) * 100).toFixed(0)}% do valor total
                </p>
                <p className="text-xs text-red-600 mt-2">
                  {campaign.valorEmRisco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT ainda em risco
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={campaign.daysRemaining < 3 ? "border-red-300 bg-red-50" : "border-blue-300 bg-blue-50"}>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Clock className={`h-12 w-12 mx-auto ${campaign.daysRemaining < 3 ? "text-red-600" : "text-blue-600"}`} />
              <div>
                <p className={`text-4xl font-bold ${campaign.daysRemaining < 3 ? "text-red-700" : "text-blue-700"}`}>
                  {campaign.daysRemaining}
                </p>
                <p className="text-sm font-medium mt-1">dias restantes</p>
                <p className="text-xs text-muted-foreground">até o fim da campanha</p>
                <Progress value={(1 - campaign.daysRemaining / 15) * 100} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-12 w-12 mx-auto text-orange-600" />
              <div>
                <p className="text-4xl font-bold text-orange-700">{campaign.itemsCriticos}</p>
                <p className="text-sm font-medium mt-1">Itens Críticos</p>
                <p className="text-xs text-muted-foreground">vencem em &lt; 3 dias</p>
                <Button size="sm" className="mt-2 bg-orange-600 hover:bg-orange-700 w-full">
                  Ver Itens
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-twilight bg-twilight">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Target className="h-12 w-12 mx-auto text-imperial" />
              <div>
                <p className="text-4xl font-bold text-imperial">{campaign.taxaSucesso}%</p>
                <p className="text-sm font-medium mt-1">Taxa de Sucesso</p>
                <p className="text-xs text-muted-foreground">vendidos/transferidos vs vencidos</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-sm text-imperial">
                  <TrendingUp className="h-4 w-4" />
                  <span>Melhorando</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline and Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 bg-muted rounded flex items-center justify-center">
              <p className="text-muted-foreground">[Gráfico de Linha: % Escoado vs Meta Linear]</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Timeline de Atividades</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                  <span className="text-lg">📦</span>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">22/01 14:30</span> | Transferidos 50 kg de Filé de Frango para Loja Centro
                    </p>
                    <p className="text-xs text-muted-foreground">por João Silva</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                  <span className="text-lg">💰</span>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">22/01 10:15</span> | Vendidos 30 L de Suco de Laranja com desconto de 20%
                    </p>
                    <p className="text-xs text-muted-foreground">por Maria Santos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded">
                  <span className="text-lg">🗑️</span>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">21/01 23:59</span> | Venceram 10 kg de Iogurte Natural - não escoados
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded">
                  <span className="text-lg">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">21/01 08:00</span> | Alerta: Queijo Minas vence em 1 dia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Items Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos da Campanha</CardTitle>
              <CardDescription>Acompanhamento detalhado por item</CardDescription>
            </div>
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
                  <th className="text-left p-2 w-12"><Checkbox /></th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Produto</th>
                  <th className="text-left p-2">Lote</th>
                  <th className="text-left p-2">Validade</th>
                  <th className="text-right p-2">Qtd Original</th>
                  <th className="text-right p-2">Qtd Escoada</th>
                  <th className="text-right p-2">Qtd Atual</th>
                  <th className="text-right p-2">Valor Salvo</th>
                  <th className="text-left p-2">Ação Realizada</th>
                  <th className="text-center p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-twilight hover:bg-twilight">
                  <td className="p-2"><Checkbox /></td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      🟢 Escoado
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div>
                      <p className="font-mono text-xs">FRS-045</p>
                      <p className="text-sm font-medium">Filé de Frango</p>
                    </div>
                  </td>
                  <td className="p-2 font-mono text-xs">LOT2025-001</td>
                  <td className="p-2">
                    <p className="text-sm">25/01/2025</p>
                    <p className="text-xs text-orange-600">3 dias</p>
                  </td>
                  <td className="p-2 text-right">50 kg</td>
                  <td className="p-2 text-right text-imperial font-medium">50 kg</td>
                  <td className="p-2 text-right">0 kg</td>
                  <td className="p-2 text-right font-bold text-imperial">925,00 MT</td>
                  <td className="p-2">Transferido p/ Loja Centro</td>
                  <td className="p-2 text-center">
                    <Button size="sm" variant="outline">Ver Detalhes</Button>
                  </td>
                </tr>

                <tr className="border-b bg-yellow-50 hover:bg-yellow-100">
                  <td className="p-2"><Checkbox /></td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                      🟡 Em Campanha
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div>
                      <p className="font-mono text-xs">BEB-120</p>
                      <p className="text-sm font-medium">Suco de Laranja</p>
                    </div>
                  </td>
                  <td className="p-2 font-mono text-xs">LOT2025-087</td>
                  <td className="p-2">
                    <p className="text-sm">24/01/2025</p>
                    <p className="text-xs text-red-600 font-bold">2 dias</p>
                  </td>
                  <td className="p-2 text-right">100 L</td>
                  <td className="p-2 text-right text-imperial font-medium">70 L</td>
                  <td className="p-2 text-right text-yellow-600">30 L</td>
                  <td className="p-2 text-right font-bold text-imperial">623,00 MT</td>
                  <td className="p-2">Vendido (desc. 20%)</td>
                  <td className="p-2 text-center">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Ação Urgente</Button>
                  </td>
                </tr>

                <tr className="border-b bg-red-50 hover:bg-red-100">
                  <td className="p-2"><Checkbox /></td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-red-100 text-red-700">
                      🔴 Vencido
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div>
                      <p className="font-mono text-xs">LAT-032</p>
                      <p className="text-sm font-medium">Iogurte Natural</p>
                    </div>
                  </td>
                  <td className="p-2 font-mono text-xs">LOT2025-045</td>
                  <td className="p-2">
                    <p className="text-sm">21/01/2025</p>
                    <p className="text-xs text-red-600 font-bold">Vencido há 1 dia</p>
                  </td>
                  <td className="p-2 text-right">10 kg</td>
                  <td className="p-2 text-right">0 kg</td>
                  <td className="p-2 text-right">0 kg</td>
                  <td className="p-2 text-right font-bold text-red-600">0,00 MT</td>
                  <td className="p-2 text-red-600">Vencido</td>
                  <td className="p-2 text-center">
                    <Button size="sm" variant="destructive">Descartar</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <div className="space-x-4">
                <span>Total de Itens: {campaign.itemsTotal}</span>
                <span className="text-imperial">Qtd Escoada: {campaign.itemsEscoados}</span>
              </div>
              <div>
                <span className="font-bold text-imperial">Valor Total Salvo: {campaign.valorSalvo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executed Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚚</span>
              <div className="flex-1">
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Transferências</p>
                <p className="text-xs mt-1">120 unidades | 2.150 MT</p>
                <Button variant="link" className="p-0 h-auto text-xs mt-1">Ver Detalhes →</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <div className="flex-1">
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Vendas com Desconto</p>
                <p className="text-xs mt-1">Desc. médio: 22% | 3.695 MT</p>
                <Button variant="link" className="p-0 h-auto text-xs mt-1">Ver Detalhes →</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏢</span>
              <div className="flex-1">
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Uso Interno</p>
                <p className="text-xs mt-1">15 unidades | Cantina</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">↩️</span>
              <div className="flex-1">
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Devolução</p>
                <p className="text-xs mt-1">5 unidades | Fornecedor A</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recommendations */}
      {campaign.itemsCriticos > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-orange-900">⚠️ {campaign.itemsCriticos} itens vencem em &lt; 3 dias e ainda não foram escoados</p>
                <p className="text-sm text-orange-800 mt-1">Suco de Laranja (30 L), Queijo Minas (8 kg), Iogurte Grego (12 kg)</p>
                <Button className="mt-3 bg-orange-600 hover:bg-orange-700">
                  Ação Imediata
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notas da Campanha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-twilight text-imperial flex items-center justify-center text-xs font-medium">
                  JS
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">João Silva</span>
                    <span className="text-xs text-muted-foreground">21/01/2025 15:30</span>
                  </div>
                  <p className="text-sm mt-1">Aumentado desconto de 15% para 20% no Suco de Laranja devido à baixa aceitação. Vendas melhoraram 40%.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Adicionar nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button className="bg-imperial hover:bg-imperial">
              Salvar Nota
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




