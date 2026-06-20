"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  Download,
  Search,
  Clock,
  Settings,
  Lock,
  User,
  FileText,
  BarChart3,
  X
} from "lucide-react"

export function AuditTrailContent() {
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)

  // Filter state
  const [dateRange, setDateRange] = useState("7days")
  const [selectedUser, setSelectedUser] = useState("all")
  const [selectedAction, setSelectedAction] = useState("all")
  const [selectedModule, setSelectedModule] = useState("all")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Trilha de Auditoria</h1>
          <p className="text-muted-foreground">Histórico completo de ações no sistema</p>
          <Badge variant="outline" className="mt-2">Logs retidos por 90 dias</Badge>
        </div>
        <Button variant="outline" onClick={() => setShowConfigModal(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </div>

      {/* Security Banner */}
      <Card className="border-blue-300 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium">
                Esta tela registra todas as ações realizadas no sistema para fins de auditoria e compliance
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Logs são imutáveis e criptografados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros Avançados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Período *</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1hour">Última hora</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Usuário</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="user1">João Silva</SelectItem>
                  <SelectItem value="user2">Maria Santos</SelectItem>
                  <SelectItem value="user3">Pedro Costa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Ação</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="create">Create (Criar)</SelectItem>
                  <SelectItem value="read">Read (Ler)</SelectItem>
                  <SelectItem value="update">Update (Atualizar)</SelectItem>
                  <SelectItem value="delete">Delete (Excluir)</SelectItem>
                  <SelectItem value="login">Login/Logout</SelectItem>
                  <SelectItem value="approval">Aprovação/Rejeição</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Módulo</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="products">Produtos</SelectItem>
                  <SelectItem value="suppliers">Fornecedores</SelectItem>
                  <SelectItem value="pos">POs</SelectItem>
                  <SelectItem value="receiving">Recebimentos</SelectItem>
                  <SelectItem value="inventory">Inventários</SelectItem>
                  <SelectItem value="users">Usuários</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Busca Livre</Label>
              <Input placeholder="Buscar em descrição, valores, IDs..." />
            </div>

            <div className="space-y-2">
              <Label>IP de Origem</Label>
              <Input placeholder="192.168.1.*" />
            </div>

            <div className="space-y-2">
              <Label>Resultado</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="failure">Falha</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="bg-imperial hover:bg-imperial">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline">
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
            <Button variant="outline">
              Salvar Filtro
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Resultados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-imperial" />
              <div>
                <p className="text-2xl font-bold">1.248</p>
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
                <p className="text-xs text-imperial mt-1">+12% vs período anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">18</p>
                <p className="text-sm text-muted-foreground">Usuários Envolvidos</p>
                <Button variant="link" className="p-0 h-auto text-xs">Ver Ranking →</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">8</p>
                <p className="text-sm text-muted-foreground">Ações Críticas</p>
                <p className="text-xs text-muted-foreground mt-1">Deletes, Rejeições, Falhas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Distribuição</p>
                <div className="h-8 bg-muted rounded flex overflow-hidden">
                  <div className="bg-imperial w-[40%]" title="CREATE"></div>
                  <div className="bg-blue-500 w-[20%]" title="READ"></div>
                  <div className="bg-yellow-500 w-[30%]" title="UPDATE"></div>
                  <div className="bg-red-500 w-[10%]" title="DELETE"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Logs de Auditoria</CardTitle>
              <CardDescription>Ordenado por mais recente primeiro</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="50">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 por página</SelectItem>
                  <SelectItem value="100">100 por página</SelectItem>
                  <SelectItem value="200">200 por página</SelectItem>
                  <SelectItem value="500">500 por página</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">Usuário</th>
                  <th className="text-left p-2">Ação</th>
                  <th className="text-left p-2">Entidade</th>
                  <th className="text-left p-2">Descrição</th>
                  <th className="text-left p-2">IP de Origem</th>
                  <th className="text-left p-2">Dispositivo</th>
                  <th className="text-center p-2">Resultado</th>
                  <th className="text-center p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50 bg-red-50">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="text-xs">
                        <p className="font-mono">22/01/2025</p>
                        <p className="font-mono">14:32:15.428</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-twilight text-imperial flex items-center justify-center text-xs">
                        JS
                      </div>
                      <span>João Silva</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-red-100 text-red-700">
                      🔴 DELETE
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div>
                      <p className="font-medium">Produto</p>
                      <p className="text-xs text-muted-foreground">ID: 12345</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <p className="truncate max-w-xs">Deletou produto SKU-12345 "Filé de Frango Congelado"</p>
                  </td>
                  <td className="p-2">
                    <p className="font-mono text-xs">192.168.1.45</p>
                    <p className="text-xs text-muted-foreground">🇧🇷 BR</p>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <span>💻</span>
                      <span className="text-xs">Chrome</span>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      ✅ Sucesso
                    </Badge>
                  </td>
                  <td className="p-2 text-center">
                    <Button size="sm" variant="outline" onClick={() => setShowDetailsModal(true)}>
                      Detalhes
                    </Button>
                  </td>
                </tr>

                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="text-xs">
                        <p className="font-mono">22/01/2025</p>
                        <p className="font-mono">14:30:42.156</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                        MS
                      </div>
                      <span>Maria Santos</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                      🟡 UPDATE
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div>
                      <p className="font-medium">PO</p>
                      <p className="text-xs text-muted-foreground">#789</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <p className="truncate max-w-xs">Atualizou PO #789: valor de 1.000 MT para 1.200 MT</p>
                  </td>
                  <td className="p-2">
                    <p className="font-mono text-xs">192.168.1.52</p>
                    <p className="text-xs text-muted-foreground">🇧🇷 BR</p>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <span>📱</span>
                      <span className="text-xs">Safari</span>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      ✅ Sucesso
                    </Badge>
                  </td>
                  <td className="p-2 text-center">
                    <Button size="sm" variant="outline" onClick={() => setShowDetailsModal(true)}>
                      Detalhes
                    </Button>
                  </td>
                </tr>

                <tr className="border-b hover:bg-muted/50 bg-yellow-50">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="text-xs">
                        <p className="font-mono">22/01/2025</p>
                        <p className="font-mono">14:28:33.892</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                        PC
                      </div>
                      <span>Pedro Costa</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-purple-100 text-purple-700">
                      🟣 LOGIN
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div>
                      <p className="font-medium">Autenticação</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <p className="truncate max-w-xs text-red-600">Tentativa de login falhou (senha incorreta)</p>
                  </td>
                  <td className="p-2">
                    <p className="font-mono text-xs">203.0.113.45</p>
                    <p className="text-xs text-muted-foreground">🇺🇸 US</p>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <span>💻</span>
                      <span className="text-xs">Firefox</span>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      ❌ Falha
                    </Badge>
                  </td>
                  <td className="p-2 text-center">
                    <Button size="sm" variant="outline" onClick={() => setShowDetailsModal(true)}>
                      Detalhes
                    </Button>
                  </td>
                </tr>

                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="text-xs">
                        <p className="font-mono">22/01/2025</p>
                        <p className="font-mono">14:25:18.234</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs">
                        SY
                      </div>
                      <div>
                        <span>Sistema</span>
                        <Badge variant="outline" className="ml-2 text-xs">AUTO</Badge>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      🟢 CREATE
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div>
                      <p className="font-medium">Inventário</p>
                      <p className="text-xs text-muted-foreground">INV-123</p>
                    </div>
                  </td>
                  <td className="p-2">
                    <p className="truncate max-w-xs">Criou inventário cíclico automático INV-123</p>
                  </td>
                  <td className="p-2">
                    <p className="font-mono text-xs">127.0.0.1</p>
                    <p className="text-xs text-muted-foreground">Local</p>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <span>🖥️</span>
                      <span className="text-xs">Sistema</span>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <Badge variant="outline" className="bg-twilight text-imperial">
                      ✅ Sucesso
                    </Badge>
                  </td>
                  <td className="p-2 text-center">
                    <Button size="sm" variant="outline" onClick={() => setShowDetailsModal(true)}>
                      Detalhes
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between text-sm">
            <div>
              <span>Total de eventos: 1.248</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Anterior</Button>
              <Button variant="outline" size="sm">Próximo</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis and Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade por Usuário (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">João Silva</span>
                <span className="font-bold">342</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Maria Santos</span>
                <span className="font-bold">285</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pedro Costa</span>
                <span className="font-bold">198</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ana Oliveira</span>
                <span className="font-bold">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sistema</span>
                <span className="font-bold">142</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Anomalias Detectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 bg-yellow-50 rounded text-sm">
                <p className="font-medium text-yellow-900">⚠️ Login de IP novo/incomum</p>
                <p className="text-xs text-yellow-700">Pedro Costa - 203.0.113.45</p>
              </div>
              <div className="p-2 bg-orange-50 rounded text-sm">
                <p className="font-medium text-orange-900">⚠️ Múltiplas tentativas de login falhas</p>
                <p className="text-xs text-orange-700">Pedro Costa - 3 tentativas</p>
              </div>
              <div className="p-2 bg-red-50 rounded text-sm">
                <p className="font-medium text-red-900">⚠️ Ações fora do horário habitual</p>
                <p className="text-xs text-red-700">João Silva - 23:45</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-3" size="sm">
              Investigar Todas
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance e Retenção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="outline" className="bg-twilight text-imperial">Conforme</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Retenção:</span>
              <span className="text-sm font-medium">90 dias</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Logs mais antigos:</span>
              <span className="text-sm font-medium">24/10/2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Espaço utilizado:</span>
              <span className="text-sm font-medium">2.4 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Próxima limpeza:</span>
              <span className="text-sm font-medium">25/01/2025</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes Completos do Log</DialogTitle>
            <DialogDescription>Informações detalhadas da ação auditada</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID do Log:</span>
                  <span className="font-mono">550e8400-e29b-41d4-a716-446655440000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp Exato:</span>
                  <span className="font-mono">22/01/2025 14:32:15.428</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usuário:</span>
                  <span>João Silva (joao.silva@stocksafe.com)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP de Origem:</span>
                  <span className="font-mono">192.168.1.45 (Maputo, Moçambique)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sessão ID:</span>
                  <span className="font-mono">sess_abc123xyz789</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalhes da Ação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <Badge variant="outline" className="bg-red-100 text-red-700">DELETE</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entidade:</span>
                  <span>Produto</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID da Entidade:</span>
                  <span className="font-mono">12345</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Módulo:</span>
                  <span>Cadastros / Produtos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Endpoint API:</span>
                  <span className="font-mono text-xs">/api/products/12345</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método HTTP:</span>
                  <Badge variant="outline">DELETE</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contexto da Requisição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Status:</span>
                  <Badge variant="outline" className="bg-twilight text-imperial">200 OK</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tempo de Processamento:</span>
                  <span>142 ms</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Valores (Antes)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  "id": 12345,
  "sku": "FRS-045",
  "description": "Filé de Frango Congelado",
  "category": "Frescos",
  "unitPrice": 18.50,
  "status": "active"
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metadados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Navegador:</span>
                  <span>Chrome 120.0.6099.129</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sistema Operacional:</span>
                  <span>Windows 11</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dispositivo:</span>
                  <span>💻 Desktop</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolução:</span>
                  <span>1920x1080</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timezone:</span>
                  <span>Africa/Maputo (CAT)</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1">
                Exportar Este Log (JSON)
              </Button>
              <Button variant="outline" className="flex-1">
                Copiar ID do Log
              </Button>
              <Button variant="outline" className="flex-1">
                Marcar como Investigado
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Config Modal */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurações de Auditoria</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Retenção de Logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Período de Retenção</Label>
                  <div className="flex gap-2">
                    <Input type="number" defaultValue="90" className="w-24" />
                    <span className="flex items-center">dias</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recomendado: 90-365 dias (conforme compliance)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="archive-old" defaultChecked />
                  <Label htmlFor="archive-old" className="font-normal">
                    Arquivar logs antigos (não deletar)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="alert-space" defaultChecked />
                  <Label htmlFor="alert-space" className="font-normal">
                    Alerta quando próximo do limite de espaço
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Eventos Rastreados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="track-create" defaultChecked disabled />
                  <Label htmlFor="track-create" className="font-normal">Create (obrigatório)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="track-update" defaultChecked disabled />
                  <Label htmlFor="track-update" className="font-normal">Update (obrigatório)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="track-delete" defaultChecked disabled />
                  <Label htmlFor="track-delete" className="font-normal">Delete (obrigatório)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="track-read" />
                  <Label htmlFor="track-read" className="font-normal">Read/Visualizações (gera muito volume)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="track-login" defaultChecked />
                  <Label htmlFor="track-login" className="font-normal">Login/Logout</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="track-approval" defaultChecked />
                  <Label htmlFor="track-approval" className="font-normal">Aprovações/Rejeições</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="track-print" defaultChecked />
                  <Label htmlFor="track-print" className="font-normal">Impressões</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="track-export" defaultChecked />
                  <Label htmlFor="track-export" className="font-normal">Exportações</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="track-config" defaultChecked disabled />
                  <Label htmlFor="track-config" className="font-normal">Mudanças de Configuração (obrigatório)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="track-errors" defaultChecked />
                  <Label htmlFor="track-errors" className="font-normal">Erros e Falhas</Label>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Desabilitar Read reduz volume em ~70%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detecção de Anomalias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="enable-anomaly" defaultChecked />
                  <Label htmlFor="enable-anomaly" className="font-normal">
                    Ativar detecção automática de anomalias
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Sensibilidade</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notificar (emails separados por vírgula)</Label>
                  <Input placeholder="admin@stocksafe.com, security@stocksafe.com" />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowConfigModal(false)}>
                Cancelar
              </Button>
              <Button className="bg-imperial hover:bg-imperial">
                Salvar Configurações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}




