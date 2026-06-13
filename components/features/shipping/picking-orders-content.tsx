"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  Download,
  Plus,
  Package,
  Clock,
  AlertTriangle,
  Printer,
  User,
  MoreVertical,
  Eye,
  PackageCheck,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import Link from "next/link"

type OrderStatus = "new" | "in_progress" | "picked" | "shipped" | "cancelled"
type OrderPriority = "low" | "normal" | "high" | "urgent"
type DestinationType = "customer" | "store" | "internal" | "other"

interface PickingOrder {
  id: string
  number: string
  createdDate: string
  expectedShipDate: string
  destination: {
    name: string
    city: string
    type: DestinationType
  }
  itemCount: number
  pickedItems: number
  totalItems: number
  fefoAlerts: number
  totalValue: number
  status: OrderStatus
  priority: OrderPriority
  picker: {
    name: string
    avatar: string
  } | null
}

export function PickingOrdersContent() {
  const [orders, setOrders] = useState<PickingOrder[]>([
    {
      id: "1",
      number: "ORD-001",
      createdDate: "2025-01-20",
      expectedShipDate: "2025-01-22",
      destination: {
        name: "Supermercado Central",
        city: "Maputo",
        type: "customer",
      },
      itemCount: 15,
      pickedItems: 12,
      totalItems: 15,
      fefoAlerts: 2,
      totalValue: 15420.5,
      status: "in_progress",
      priority: "high",
      picker: {
        name: "João Silva",
        avatar: "JS",
      },
    },
    {
      id: "2",
      number: "ORD-002",
      createdDate: "2025-01-21",
      expectedShipDate: "2025-01-21",
      destination: {
        name: "Loja Matola",
        city: "Matola",
        type: "store",
      },
      itemCount: 8,
      pickedItems: 0,
      totalItems: 8,
      fefoAlerts: 0,
      totalValue: 8750.0,
      status: "new",
      priority: "urgent",
      picker: null,
    },
    {
      id: "3",
      number: "ORD-003",
      createdDate: "2025-01-19",
      expectedShipDate: "2025-01-23",
      destination: {
        name: "Cliente ABC Lda",
        city: "Beira",
        type: "customer",
      },
      itemCount: 25,
      pickedItems: 25,
      totalItems: 25,
      fefoAlerts: 1,
      totalValue: 32100.75,
      status: "picked",
      priority: "normal",
      picker: {
        name: "Maria Santos",
        avatar: "MS",
      },
    },
    {
      id: "4",
      number: "ORD-004",
      createdDate: "2025-01-18",
      expectedShipDate: "2025-01-20",
      destination: {
        name: "Departamento Produção",
        city: "-",
        type: "internal",
      },
      itemCount: 5,
      pickedItems: 5,
      totalItems: 5,
      fefoAlerts: 0,
      totalValue: 3200.0,
      status: "shipped",
      priority: "normal",
      picker: {
        name: "Pedro Costa",
        avatar: "PC",
      },
    },
  ])

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [destinationFilter, setDestinationFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)
  const [showFefoAlertsOnly, setShowFefoAlertsOnly] = useState(false)

  // Selected items
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Get today's date for comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Helper function to check if order is overdue
  const isOverdue = (expectedDate: string) => {
    const shipDate = new Date(expectedDate)
    shipDate.setHours(0, 0, 0, 0)
    return shipDate < today
  }

  // Helper function to get date indicator
  const getDateIndicator = (expectedDate: string) => {
    const shipDate = new Date(expectedDate)
    shipDate.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (shipDate < today) return { icon: "🔴", label: "Vencida", color: "text-red-600" }
    if (shipDate.getTime() === today.getTime()) return { icon: "🟠", label: "Hoje", color: "text-orange-600" }
    if (shipDate.getTime() === tomorrow.getTime()) return { icon: "🟡", label: "Amanhã", color: "text-yellow-600" }
    return { icon: "🟢", label: "Futuro", color: "text-imperial" }
  }

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.destination.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesDestination = destinationFilter === "all" || order.destination.type === destinationFilter
      const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter
      const matchesOverdue = !showOverdueOnly || isOverdue(order.expectedShipDate)
      const matchesFefo = !showFefoAlertsOnly || order.fefoAlerts > 0

      return matchesSearch && matchesStatus && matchesDestination && matchesPriority && matchesOverdue && matchesFefo
    })
  }, [orders, searchTerm, statusFilter, destinationFilter, priorityFilter, showOverdueOnly, showFefoAlertsOnly])

  // Calculate KPIs
  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "shipped" && o.status !== "cancelled").length
    const inProgressOrders = orders.filter((o) => o.status === "in_progress").length
    const overdueOrders = orders.filter((o) => isOverdue(o.expectedShipDate) && o.status !== "shipped").length
    const totalValue = orders
      .filter((o) => o.status !== "shipped" && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalValue, 0)

    return {
      active: activeOrders,
      inProgress: inProgressOrders,
      overdue: overdueOrders,
      totalValue,
    }
  }, [orders])

  // Status badge helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            🆕 Nova
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            🔵 Em Separação
          </Badge>
        )
      case "picked":
        return (
          <Badge variant="outline" className="bg-twilight text-imperial border-twilight">
            ✅ Separada
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-twilight text-imperial border-twilight">
            📦 Expedida
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            ❌ Cancelada
          </Badge>
        )
    }
  }

  // Priority badge helper
  const getPriorityBadge = (priority: OrderPriority) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            URGENTE
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            ALTA
          </Badge>
        )
      case "normal":
        return null
      case "low":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
            Baixa
          </Badge>
        )
    }
  }

  // Destination type label
  const getDestinationType = (type: DestinationType) => {
    switch (type) {
      case "customer":
        return "Cliente"
      case "store":
        return "Loja"
      case "internal":
        return "Uso Interno"
      case "other":
        return "Outro"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Ordens de Separação (Picking)</h1>
          <p className="text-muted-foreground">Gestão de separação de produtos para expedição</p>
        </div>
        <Button className="bg-imperial hover:bg-imperial" asChild>
          <Link href="/expedicao/ordens/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Ordem
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ordens Ativas</p>
                <p className="text-3xl font-bold">{stats.active}</p>
              </div>
              <Package className="h-8 w-8 text-imperial" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Em Separação</p>
                <p className="text-3xl font-bold">{stats.inProgress}</p>
              </div>
              <PackageCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Atrasadas</p>
                <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                {stats.overdue > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mt-1">
                    Requer atenção
                  </Badge>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valor a Expedir</p>
                <p className="text-2xl font-bold">R$ {stats.totalValue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-imperial" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search">Busca Rápida</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nº ordem, cliente, produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="new">Nova</SelectItem>
                    <SelectItem value="in_progress">Em Separação</SelectItem>
                    <SelectItem value="picked">Separada</SelectItem>
                    <SelectItem value="shipped">Expedida</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destino/Cliente</Label>
                <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                  <SelectTrigger id="destination">
                    <SelectValue placeholder="Selecione o destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="customer">Cliente</SelectItem>
                    <SelectItem value="store">Loja</SelectItem>
                    <SelectItem value="internal">Uso Interno</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overdue"
                    checked={showOverdueOnly}
                    onCheckedChange={(checked) => setShowOverdueOnly(checked as boolean)}
                  />
                  <Label htmlFor="overdue" className="text-sm font-normal">
                    Apenas atrasadas
                  </Label>
                </div>
              </div>

              <div className="flex items-end space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fefo"
                    checked={showFefoAlertsOnly}
                    onCheckedChange={(checked) => setShowFefoAlertsOnly(checked as boolean)}
                  />
                  <Label htmlFor="fefo" className="text-sm font-normal">
                    Apenas com alertas FEFO
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setDestinationFilter("all")
                  setPriorityFilter("all")
                  setShowOverdueOnly(false)
                  setShowFefoAlertsOnly(false)
                }}
              >
                Limpar Filtros
              </Button>
              <Button variant="outline" className="text-imperial border-imperial">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Items Action Bar */}
      {selectedItems.length > 0 && (
        <Card className="border-twilight bg-twilight">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{selectedItems.length} ordens selecionadas</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Múltiplas
                </Button>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Atribuir Separador
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens ({filteredOrders.length})</CardTitle>
          <CardDescription>Lista de ordens de separação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 w-12">
                    <Checkbox />
                  </th>
                  <th className="text-left p-2 w-32">Nº Ordem</th>
                  <th className="text-left p-2 w-28">Data Criação</th>
                  <th className="text-left p-2 w-36">Data Prev. Expedição</th>
                  <th className="text-left p-2 min-w-[200px]">Destino/Cliente</th>
                  <th className="text-center p-2 w-24">Qtd Itens</th>
                  <th className="text-left p-2 w-40">Progresso</th>
                  <th className="text-center p-2 w-28">Alertas FEFO</th>
                  <th className="text-right p-2 w-32">Valor Total</th>
                  <th className="text-left p-2 w-32">Status</th>
                  <th className="text-left p-2 w-32">Separador</th>
                  <th className="text-center p-2 w-28">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const dateIndicator = getDateIndicator(order.expectedShipDate)
                  const progressPercent = (order.pickedItems / order.totalItems) * 100
                  const rowClass = isOverdue(order.expectedShipDate) && order.status !== "shipped" ? "bg-red-50" : ""

                  return (
                    <tr key={order.id} className={`border-b hover:bg-muted/50 ${rowClass}`}>
                      <td className="p-2">
                        <Checkbox
                          checked={selectedItems.includes(order.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedItems([...selectedItems, order.id])
                            } else {
                              setSelectedItems(selectedItems.filter((id) => id !== order.id))
                            }
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <Link href={`/expedicao/ordens/${order.id}`} className="font-medium text-imperial hover:underline">
                            {order.number}
                          </Link>
                          {(order.priority === "urgent" || order.priority === "high") && getPriorityBadge(order.priority)}
                        </div>
                      </td>
                      <td className="p-2">
                        <p className="text-sm">{new Date(order.createdDate).toLocaleDateString("pt-BR")}</p>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-lg">{dateIndicator.icon}</span>
                            <p className="text-sm">{new Date(order.expectedShipDate).toLocaleDateString("pt-BR")}</p>
                          </div>
                          <p className={`text-xs ${dateIndicator.color}`}>{dateIndicator.label}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <p className="font-medium">{order.destination.name}</p>
                          <p className="text-xs text-muted-foreground">{order.destination.city}</p>
                          <Badge variant="outline" className="text-xs">
                            {getDestinationType(order.destination.type)}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <p className="font-medium">{order.itemCount}</p>
                      </td>
                      <td className="p-2">
                        <div className="space-y-2">
                          <Progress value={progressPercent} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {order.pickedItems} de {order.totalItems} itens
                          </p>
                          <p className="text-xs font-medium">{progressPercent.toFixed(0)}% concluído</p>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        {order.fefoAlerts > 0 ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            ⚠️ {order.fefoAlerts} alertas
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        <p className="font-medium">R$ {order.totalValue.toFixed(2)}</p>
                      </td>
                      <td className="p-2">{getStatusBadge(order.status)}</td>
                      <td className="p-2">
                        {order.picker ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-twilight text-imperial flex items-center justify-center text-xs font-medium">
                              {order.picker.avatar}
                            </div>
                            <p className="text-sm">{order.picker.name}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1 justify-center">
                          {(order.status === "new" || order.status === "in_progress") && (
                            <Button size="sm" className="bg-imperial hover:bg-imperial" asChild>
                              <Link href={`/expedicao/ordens/${order.id}/separar`}>Separar</Link>
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/expedicao/ordens/${order.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir Lista
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <User className="h-4 w-4 mr-2" />
                                Atribuir Separador
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Marcar como Urgente
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




