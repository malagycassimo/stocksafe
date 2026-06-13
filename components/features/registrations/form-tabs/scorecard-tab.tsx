"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Award } from "lucide-react"
import { SupplierFormData } from "@/components/features/registrations/supplier-form-content"

interface ScorecardTabProps {
  formData: SupplierFormData
  mode: "new" | "edit"
}

export function ScorecardTab({ formData, mode }: ScorecardTabProps) {
  const getClassificationColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case "excelente":
        return "bg-twilight text-imperial border-twilight"
      case "bom":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "regular":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "ruim":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-imperial"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const mockMetrics = {
    quality: { score: 95, trend: "up", label: "Qualidade" },
    delivery: { score: 88, trend: "up", label: "Pontualidade de Entrega" },
    price: { score: 92, trend: "stable", label: "Competitividade de Preço" },
    service: { score: 90, trend: "up", label: "Atendimento" },
    compliance: { score: 94, trend: "stable", label: "Conformidade" },
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-imperial" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  if (mode === "new") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scorecard do Fornecedor</CardTitle>
          <CardDescription>Avaliação de desempenho</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Award className="w-16 h-16 mx-auto text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Scorecard não disponível</h3>
              <p className="text-gray-500 max-w-md">
                O scorecard ficará disponível após o cadastro do fornecedor e após as primeiras transações serem
                realizadas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Score Geral</CardTitle>
          <CardDescription>Pontuação consolidada do fornecedor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className={`text-6xl font-bold ${getScoreColor(formData.score)}`}>{formData.score}</div>
              <p className="text-sm text-muted-foreground mt-2">de 100 pontos possíveis</p>
            </div>
            <div>
              <Badge className={`${getClassificationColor(formData.classification)} text-lg px-4 py-2`}>
                {formData.classification}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className="font-medium">{formData.score}%</span>
            </div>
            <Progress value={formData.score} className="h-3" />
          </div>

          <div className="mt-6 pt-6 border-t">
            <Label htmlFor="evaluationPeriod">Período de Avaliação</Label>
            <Select value={formData.evaluationPeriod} disabled>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="60">Últimos 60 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="180">Últimos 6 meses</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
          <CardDescription>Indicadores detalhados por categoria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(mockMetrics).map(([key, metric]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{metric.label}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <span className={`font-semibold ${getScoreColor(metric.score)}`}>{metric.score}%</span>
              </div>
              <Progress value={metric.score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Historical Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Performance</CardTitle>
          <CardDescription>Evolução do score ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">Dezembro 2024</p>
                <p className="text-sm text-muted-foreground">Avaliação mensal</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getScoreColor(92)}`}>92</p>
                <Badge className="bg-twilight text-imperial">Excelente</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">Novembro 2024</p>
                <p className="text-sm text-muted-foreground">Avaliação mensal</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getScoreColor(89)}`}>89</p>
                <Badge className="bg-blue-100 text-blue-800">Bom</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">Outubro 2024</p>
                <p className="text-sm text-muted-foreground">Avaliação mensal</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getScoreColor(91)}`}>91</p>
                <Badge className="bg-twilight text-imperial">Excelente</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observations */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
          <CardDescription>Comentários sobre o desempenho do fornecedor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-imperial pl-4 py-2">
              <p className="font-medium text-imperial">Pontos Fortes</p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Excelente qualidade dos produtos</li>
                <li>• Alta taxa de entregas pontuais</li>
                <li>• Boa conformidade com especificações</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <p className="font-medium text-yellow-700">Pontos de Atenção</p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Tempo de resposta a cotações pode ser melhorado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





