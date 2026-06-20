"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash, FileDown } from "lucide-react"

export function WorkflowsContent() {
  const [showRuleModal, setShowRuleModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-imperial">Configuração de Workflows e Aprovações</h1>
        <p className="text-muted-foreground">Regras de aprovação para operações críticas</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
          <TabsTrigger value="receiving">Recebimento</TabsTrigger>
          <TabsTrigger value="adjustments">Ajustes</TabsTrigger>
          <TabsTrigger value="disposal">Descarte</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Regras de aprovação para compras e pedidos</p>
            <Dialog open={showRuleModal} onOpenChange={setShowRuleModal}>
              <DialogTrigger asChild>
                <Button className="bg-imperial hover:bg-imperial">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Regra
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Regra de Aprovação</DialogTitle>
                  <DialogDescription>Configure os critérios e níveis de aprovação</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-name">Nome da Regra *</Label>
                    <Input
                      id="rule-name"
                      placeholder="Ex: Compras acima de 10.000 MT"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operation-type">Tipo de Operação *</Label>
                    <Select>
                      <SelectTrigger id="operation-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal-req">Requisição Interna</SelectItem>
                        <SelectItem value="rfq">RFQ</SelectItem>
                        <SelectItem value="po">Pedido de Compra</SelectItem>
                        <SelectItem value="po-invoice">Faturação de PO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Condições *</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Select defaultValue="and">
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="and">E</SelectItem>
                            <SelectItem value="or">OU</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground flex items-center">Operador lógico</span>
                      </div>

                      <div className="border rounded p-3 space-y-2">
                        <div className="flex gap-2 items-end">
                          <div className="flex-1 space-y-2">
                            <Label>Campo</Label>
                            <Select defaultValue="total-value">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="total-value">Valor Total</SelectItem>
                                <SelectItem value="item-count">Quantidade de Itens</SelectItem>
                                <SelectItem value="supplier">Fornecedor</SelectItem>
                                <SelectItem value="category">Categoria</SelectItem>
                                <SelectItem value="requester">Solicitante</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="w-32 space-y-2">
                            <Label>Operador</Label>
                            <Select defaultValue="gte">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gte">≥</SelectItem>
                                <SelectItem value="lte">≤</SelectItem>
                                <SelectItem value="eq">=</SelectItem>
                                <SelectItem value="neq">≠</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex-1 space-y-2">
                            <Label>Valor</Label>
                            <Input type="number" placeholder="10000" />
                          </div>

                          <Button variant="outline" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Condição
                      </Button>

                      <div className="p-2 bg-twilight rounded text-sm">
                        <span className="font-medium">Exemplo:</span> Valor Total ≥ 10.000 MT E Categoria = "Frescos"
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Níveis de Aprovação *</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border rounded p-3 space-y-3">
                        <p className="font-medium">Nível 1</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Aprovador *</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user1">João Silva (Gerente)</SelectItem>
                                <SelectItem value="user2">Maria Santos (Diretora)</SelectItem>
                                <SelectItem value="group1">Grupo: Gerência</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Prazo para Aprovar</Label>
                            <div className="flex gap-2">
                              <Input type="number" defaultValue="24" className="w-20" />
                              <Select defaultValue="hours">
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hours">horas</SelectItem>
                                  <SelectItem value="days">dias</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Ação se vencer prazo</Label>
                          <Select defaultValue="escalate">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="escalate">Escalar para Nível 2</SelectItem>
                              <SelectItem value="auto-approve">Aprovar Automaticamente</SelectItem>
                              <SelectItem value="auto-reject">Rejeitar Automaticamente</SelectItem>
                              <SelectItem value="alert">Enviar Alerta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Nível 2
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notificações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notify-approved" defaultChecked />
                        <Label htmlFor="notify-approved" className="font-normal">
                          Notificar solicitante quando aprovado
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notify-rejected" defaultChecked />
                        <Label htmlFor="notify-rejected" className="font-normal">
                          Notificar solicitante quando rejeitado
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remind-approver" defaultChecked />
                        <Label htmlFor="remind-approver" className="font-normal">
                          Enviar lembretes ao aprovador
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notify-management" />
                        <Label htmlFor="notify-management" className="font-normal">
                          Notificar gerência em caso de rejeição
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowRuleModal(false)}>
                      Cancelar
                    </Button>
                    <Button className="bg-imperial hover:bg-imperial">
                      Salvar Regra
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Regra</th>
                      <th className="text-left p-2">Condição</th>
                      <th className="text-left p-2">Aprovador Nível 1</th>
                      <th className="text-left p-2">Aprovador Nível 2</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">Compras &gt; 10.000 MT</td>
                      <td className="p-2 text-sm">Valor Total ≥ 10.000 MT</td>
                      <td className="p-2">
                        <div className="text-sm">
                          <p className="font-medium">João Silva</p>
                          <p className="text-xs text-muted-foreground">Gerente</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <p className="font-medium">Maria Santos</p>
                          <p className="text-xs text-muted-foreground">Diretora</p>
                        </div>
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
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">Compras Frescos</td>
                      <td className="p-2 text-sm">Categoria = "Frescos" E Valor ≥ 5.000 MT</td>
                      <td className="p-2">
                        <div className="text-sm">
                          <p className="font-medium">Pedro Costa</p>
                          <p className="text-xs text-muted-foreground">Supervisor</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="text-sm text-muted-foreground">-</span>
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
        </TabsContent>

        <TabsContent value="receiving" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Regras de aprovação para recebimento com desvios
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Exemplos de Regras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• Desvio de validade &gt; 10% requer aprovação QA</p>
                <p>• Rejeição &gt; 5.000 MT requer aprovação Gerência</p>
                <p>• Aceite com desvio sempre requer aprovação</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Regra</th>
                      <th className="text-left p-2">Condição</th>
                      <th className="text-left p-2">Aprovador</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">Desvio de Validade</td>
                      <td className="p-2 text-sm">Desvio &gt; 10% da validade esperada</td>
                      <td className="p-2">
                        <div className="text-sm">
                          <p className="font-medium">Grupo: Qualidade</p>
                        </div>
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
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">Rejeição Alto Valor</td>
                      <td className="p-2 text-sm">Valor da Rejeição &gt; 5.000 MT</td>
                      <td className="p-2">
                        <div className="text-sm">
                          <p className="font-medium">Gerente de Compras</p>
                        </div>
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
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Regras de aprovação para ajustes de inventário e movimentações manuais
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Exemplos de Regras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• Ajuste &gt; 1.000 MT requer aprovação Gerente</p>
                <p>• Ajuste negativo &gt; 20% do saldo requer 2 aprovações</p>
                <p>• Movimentação manual sempre requer aprovação</p>
                <p>• Correção de lote/validade requer aprovação QA</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Regra</th>
                      <th className="text-left p-2">Condição</th>
                      <th className="text-left p-2">Aprovador</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">Ajuste Alto Valor</td>
                      <td className="p-2 text-sm">Valor do Ajuste &gt; 1.000 MT</td>
                      <td className="p-2">
                        <div className="text-sm">
                          <p className="font-medium">Gerente de Estoque</p>
                        </div>
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
        </TabsContent>

        <TabsContent value="disposal" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Regras de aprovação para descartes
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Exemplos de Regras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• Descarte &gt; 500 MT requer aprovação</p>
                <p>• Descarte especial/incineração sempre requer aprovação QA + Gerência</p>
                <p>• Descarte de produtos não vencidos requer justificativa + 2 aprovações</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Regra</th>
                      <th className="text-left p-2">Condição</th>
                      <th className="text-left p-2">Aprovadores</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">Descarte Alto Valor</td>
                      <td className="p-2 text-sm">Valor &gt; 500 MT</td>
                      <td className="p-2">
                        <div className="text-sm">
                          <p className="font-medium">Gerente</p>
                        </div>
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
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">Descarte Especial</td>
                      <td className="p-2 text-sm">Tipo = Especial OU Incineração</td>
                      <td className="p-2">
                        <div className="text-sm">
                          <p className="font-medium">QA + Gerência</p>
                        </div>
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
        </TabsContent>
      </Tabs>

      {/* Approval Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Matriz de Aprovações (visão geral)</CardTitle>
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar Matriz (PDF)
            </Button>
          </div>
          <CardDescription>Tabela consolidada de níveis de aprovação por operação e valor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Operação</th>
                  <th className="text-center p-2 bg-twilight">&lt; 1K MT</th>
                  <th className="text-center p-2 bg-yellow-50">1-5K MT</th>
                  <th className="text-center p-2 bg-orange-50">5-10K MT</th>
                  <th className="text-center p-2 bg-red-50">&gt; 10K MT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Compra</td>
                  <td className="p-2 text-center bg-twilight">Nenhuma</td>
                  <td className="p-2 text-center bg-yellow-50">Gerente</td>
                  <td className="p-2 text-center bg-orange-50">Gerente</td>
                  <td className="p-2 text-center bg-red-50">Diretor</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Descarte</td>
                  <td className="p-2 text-center bg-yellow-50">Gerente</td>
                  <td className="p-2 text-center bg-yellow-50">Gerente</td>
                  <td className="p-2 text-center bg-red-50">Dir+QA</td>
                  <td className="p-2 text-center bg-red-50">Dir+QA+Fin</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Ajuste Inventário</td>
                  <td className="p-2 text-center bg-twilight">Nenhuma</td>
                  <td className="p-2 text-center bg-yellow-50">Gerente</td>
                  <td className="p-2 text-center bg-orange-50">Gerente</td>
                  <td className="p-2 text-center bg-red-50">Diretor</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-twilight border"></div>
              <span>Nenhuma aprovação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border"></div>
              <span>1 aprovação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-50 border"></div>
              <span>2 aprovações</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border"></div>
              <span>3+ aprovações</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




