"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Info, Plus, Edit, MoreVertical } from "lucide-react"

export function ValidityPoliciesContent() {
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [validityType, setValidityType] = useState("percentage")
  const [percentage, setPercentage] = useState([70])
  const [expiryPolicy, setExpiryPolicy] = useState("fefo")

  // Form state
  const [category, setCategory] = useState("")
  const [shelfLife, setShelfLife] = useState("")
  const [minDays, setMinDays] = useState("")
  const [minExpedition, setMinExpedition] = useState("")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Políticas de Validade</h1>
          <p className="text-muted-foreground">Regras de validade mínima por categoria de produto</p>
        </div>
        <Dialog open={showPolicyModal} onOpenChange={setShowPolicyModal}>
          <DialogTrigger asChild>
            <Button className="bg-imperial hover:bg-imperial">
              <Plus className="h-4 w-4 mr-2" />
              Nova Política
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Política de Validade</DialogTitle>
              <DialogDescription>Configure as regras de validade para uma categoria</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frescos">Frescos</SelectItem>
                    <SelectItem value="congelados">Congelados</SelectItem>
                    <SelectItem value="secos">Secos</SelectItem>
                    <SelectItem value="bebidas">Bebidas</SelectItem>
                    <SelectItem value="laticinios">Laticínios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shelf-life">Vida Útil Padrão (dias)</Label>
                <Input
                  id="shelf-life"
                  type="number"
                  placeholder="Ex: 30"
                  value={shelfLife}
                  onChange={(e) => setShelfLife(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Vida útil típica dos produtos desta categoria
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Validade Mínima na Entrada *</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={validityType} onValueChange={setValidityType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage" className="font-normal">Por percentual da vida útil</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="absolute" id="absolute" />
                      <Label htmlFor="absolute" className="font-normal">Por dias absolutos</Label>
                    </div>
                  </RadioGroup>

                  {validityType === "percentage" && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Percentual: {percentage[0]}%</Label>
                        <Slider
                          value={percentage}
                          onValueChange={setPercentage}
                          min={0}
                          max={100}
                          step={5}
                        />
                      </div>
                      {shelfLife && (
                        <p className="text-sm text-imperial">
                          Se vida útil = {shelfLife} dias, aceita produtos com ≥ {Math.round((parseInt(shelfLife) * percentage[0]) / 100)} dias
                        </p>
                      )}
                    </div>
                  )}

                  {validityType === "absolute" && (
                    <div className="space-y-2">
                      <Label htmlFor="min-days">Mínimo de dias *</Label>
                      <Input
                        id="min-days"
                        type="number"
                        placeholder="Ex: 180"
                        value={minDays}
                        onChange={(e) => setMinDays(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Aceita produtos com no mínimo este número de dias até vencer
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="min-expedition">Validade Mínima para Expedição (dias)</Label>
                <Input
                  id="min-expedition"
                  type="number"
                  placeholder="Ex: 7"
                  value={minExpedition}
                  onChange={(e) => setMinExpedition(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Bloqueia expedição se validade restante for menor que este valor
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Política de Expedição *</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={expiryPolicy} onValueChange={setExpiryPolicy}>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fefo" id="fefo" />
                        <Label htmlFor="fefo" className="font-normal">
                          FEFO (First-Expire-First-Out) - RECOMENDADO
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        Produtos que vencem primeiro são separados primeiro
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fifo" id="fifo" />
                        <Label htmlFor="fifo" className="font-normal">
                          FIFO (First-In-First-Out)
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        Produtos que entraram primeiro saem primeiro
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lifo" id="lifo" />
                        <Label htmlFor="lifo" className="font-normal">
                          LIFO (Last-In-First-Out)
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        Produtos que entraram por último saem primeiro
                      </p>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Horizontes de Alerta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alert-7" defaultChecked />
                      <Label htmlFor="alert-7" className="font-normal">7 dias</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alert-15" defaultChecked />
                      <Label htmlFor="alert-15" className="font-normal">15 dias</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alert-30" defaultChecked />
                      <Label htmlFor="alert-30" className="font-normal">30 dias</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alert-60" />
                      <Label htmlFor="alert-60" className="font-normal">60 dias</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alert-90" />
                      <Label htmlFor="alert-90" className="font-normal">90 dias</Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Outro valor" className="w-32" />
                    <span className="text-sm text-muted-foreground">dias</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sistema enviará alertas quando produtos atingirem estes prazos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ações Automáticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="block-receive" defaultChecked />
                    <Label htmlFor="block-receive" className="font-normal">
                      Bloquear recebimento se validade &lt; mínimo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="block-expedition" defaultChecked />
                    <Label htmlFor="block-expedition" className="font-normal">
                      Bloquear expedição se validade &lt; mínimo expedição
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="alert-purchasing" defaultChecked />
                    <Label htmlFor="alert-purchasing" className="font-normal">
                      Enviar alerta automático para Compras
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="suggest-campaign" />
                    <Label htmlFor="suggest-campaign" className="font-normal">
                      Sugerir campanha de escoamento automaticamente
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Justificativas, regulamentações aplicáveis..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowPolicyModal(false)}>
                  Cancelar
                </Button>
                <Button className="bg-imperial hover:bg-imperial">
                  Salvar Política
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-300 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-900">
              Estas políticas definem os requisitos mínimos de validade para recebimento e expedição de produtos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Políticas Configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Categoria</th>
                  <th className="text-left p-2">Vida Útil Padrão</th>
                  <th className="text-left p-2">Mínimo na Entrada</th>
                  <th className="text-left p-2">Mínimo para Expedição</th>
                  <th className="text-left p-2">Política de Saída</th>
                  <th className="text-left p-2">Horizonte de Alerta</th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-center p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div>
                      <p className="font-medium">Frescos</p>
                      <p className="text-xs text-muted-foreground">42 produtos</p>
                    </div>
                  </td>
                  <td className="p-2">30 dias</td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      70% da vida útil
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">≥ 21 dias</p>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      7 dias
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      FEFO
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="text-xs">7, 15, 30 dias</div>
                  </td>
                  <td className="p-2 text-center">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      Ativa
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>

                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div>
                      <p className="font-medium">Congelados</p>
                      <p className="text-xs text-muted-foreground">28 produtos</p>
                    </div>
                  </td>
                  <td className="p-2">180 dias</td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      50% da vida útil
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">≥ 90 dias</p>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      15 dias
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      FEFO
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="text-xs">15, 30, 60 dias</div>
                  </td>
                  <td className="p-2 text-center">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      Ativa
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>

                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div>
                      <p className="font-medium">Secos</p>
                      <p className="text-xs text-muted-foreground">156 produtos</p>
                    </div>
                  </td>
                  <td className="p-2">365 dias</td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      180 dias mínimos
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      30 dias
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      FEFO
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="text-xs">30, 60, 90 dias</div>
                  </td>
                  <td className="p-2 text-center">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      Ativa
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>

                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div>
                      <p className="font-medium">Bebidas</p>
                      <p className="text-xs text-muted-foreground">64 produtos</p>
                    </div>
                  </td>
                  <td className="p-2">270 dias</td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      90 dias mínimos
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      15 dias
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      FEFO
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="text-xs">15, 30, 60 dias</div>
                  </td>
                  <td className="p-2 text-center">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      Ativa
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
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




