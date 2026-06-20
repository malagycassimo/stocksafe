"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Download, MoreVertical, Eye, Clipboard, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { recebimentoService } from "@/app/services/recebimentoService"

const mockPOs = [
  {
    id: "PO-2025-001",
    checkinDate: "2025-01-30 14:30",
    supplier: "Fornecedor A",
    expectedDate: "2025-01-21",
    itemsCount: 2,
    totalValue: 775.0,
    hasCheckin: true,
    inspectionStatus: "Não Iniciado",
    priority: "normal",
  },
  {
    id: "PO-2025-002",
    checkinDate: null,
    supplier: "Fornecedor B",
    expectedDate: "2025-01-22",
    itemsCount: 5,
    totalValue: 1250.0,
    hasCheckin: false,
    inspectionStatus: "Não Iniciado",
    priority: "normal",
  },
  {
    id: "PO-2025-003",
    checkinDate: "2025-01-29 10:15",
    supplier: "Fornecedor C",
    expectedDate: "2025-01-18",
    itemsCount: 3,
    totalValue: 890.5,
    hasCheckin: true,
    inspectionStatus: "Em Andamento (1 de 3)",
    priority: "urgent",
  },
  {
    id: "PO-2025-004",
    checkinDate: null,
    supplier: "Fornecedor D",
    expectedDate: "2025-01-31",
    itemsCount: 1,
    totalValue: 450.0,
    hasCheckin: false,
    inspectionStatus: "Não Iniciado",
    priority: "normal",
  },
]

export function AwaitingReceiptContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [supplierFilter, setSupplierFilter] = useState("Todos")
  const [priorityFilter, setPriorityFilter] = useState("Todos")
  const [checkinFilter, setCheckinFilter] = useState(false)
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    recebimentoService.listPurchaseOrders()
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((po: any) => ({
            id: po.codigo,
            dbId: po.id,
            checkinDate: po.checkIn ? new Date(po.checkIn.createdAt).toLocaleString("pt-BR") : null,
            supplier: po.fornecedor?.razao_social || "Fornecedor",
            expectedDate: po.expectedDelivery.split('T')[0],
            itemsCount: po.itens?.length || 1,
            totalValue: po.totalValue,
            hasCheckin: po.checkIn !== null,
            inspectionStatus: po.status === 'FATURADO' ? 'Concluído' : po.checkIn ? 'Em Andamento' : 'Não Iniciado',
            priority: new Date(po.expectedDelivery) < new Date() ? 'high' : 'normal'
          }))
          setPurchaseOrders(mapped)
        } else {
          setPurchaseOrders([])
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar POs:", err)
        setPurchaseOrders(mockPOs) // Fallback to mockPOs if API fails or database is empty
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const getPriorityInfo = (expectedDate: string) => {
    const today = new Date()
    const expected = new Date(expectedDate)
    const diffTime = expected.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < -3) {
      return { label: "Urgente", color: "bg-red-100 text-red-800", icon: "🔴" }
    } else if (diffDays >= -3 && diffDays < -1) {
      return { label: "Alta", color: "bg-orange-100 text-orange-800", icon: "🟠" }
    } else if (diffDays >= -1 && diffDays <= 1) {
      return { label: "Média", color: "bg-yellow-100 text-yellow-800", icon: "🟡" }
    } else {
      return { label: "Normal", color: "bg-twilight text-imperial", icon: "🟢" }
    }
  }

  const isOverdue = (expectedDate: string) => {
    const today = new Date()
    const expected = new Date(expectedDate)
    return expected < today
  }

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch = po.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          po.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSupplier = supplierFilter === "Todos" || po.supplier === supplierFilter
    const matchesPriority = priorityFilter === "Todos" || 
      (priorityFilter === "Atrasados" && isOverdue(po.expectedDate))
    const matchesCheckin = !checkinFilter || po.hasCheckin
    return matchesSearch && matchesSupplier && matchesPriority && matchesCheckin
  })

  const totalAwaiting = filteredPOs.length
  const totalOverdue = filteredPOs.filter((po) => isOverdue(po.expectedDate)).length
  const totalWithCheckin = filteredPOs.filter((po) => po.hasCheckin).length
  const totalValue = filteredPOs.reduce((sum, po) => sum + po.totalValue, 0)

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/recebimento" className="hover:text-imperial">
          Recebimento
        </Link>
        {" / "}
        <span className="text-foreground">Aguardando Recebimento</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-imperial">POs Aguardando Recebimento</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Aguardando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAwaiting}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalOverdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Check-in Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">{totalWithCheckin}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total Aguardando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">{totalValue.toFixed(2)} MT</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[300px]">
            <label className="text-sm font-medium mb-2 block">Busca</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número PO, fornecedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-[180px]">
            <label className="text-sm font-medium mb-2 block">Fornecedor</label>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Fornecedor A">Fornecedor A</SelectItem>
                <SelectItem value="Fornecedor B">Fornecedor B</SelectItem>
                <SelectItem value="Fornecedor C">Fornecedor C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[180px]">
            <label className="text-sm font-medium mb-2 block">Prioridade</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Atrasados">Atrasados</SelectItem>
                <SelectItem value="Vence Hoje">Vence Hoje</SelectItem>
                <SelectItem value="Próximos 3 dias">Próximos 3 dias</SelectItem>
                <SelectItem value="Futuros">Futuros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="checkinOnly"
              checked={checkinFilter}
              onCheckedChange={(checked) => setCheckinFilter(!!checked)}
            />
            <Label htmlFor="checkinOnly" className="font-normal cursor-pointer whitespace-nowrap">
              Apenas com check-in
            </Label>
          </div>

          <Button variant="outline">Limpar Filtros</Button>
          <Button variant="outline" className="text-imperial border-imperial bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nº PO</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Check-in</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fornecedor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Prevista</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qtd Itens</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Valor Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Check-in</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status Conferência</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[120px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-muted-foreground">
                    Carregando pedidos de compra...
                  </td>
                </tr>
              ) : filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum pedido de compra encontrado.
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => {
                  const overdue = isOverdue(po.expectedDate)
                  const priority = getPriorityInfo(po.expectedDate)

                  return (
                    <tr
                      key={po.id}
                      className={`hover:bg-gray-50 ${overdue ? "bg-red-50" : ""} ${
                        priority.label === "Média" ? "bg-yellow-50" : ""
                      }`}
                    >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{priority.icon}</span>
                        <Link
                          href={`/compras/pos/${po.id}`}
                          className="font-mono text-sm text-imperial hover:text-imperial hover:underline"
                        >
                          {po.id}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {po.checkinDate ? (
                        <span className="text-imperial">{po.checkinDate}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{po.supplier}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className={overdue ? "text-red-600 font-medium" : ""}>
                        {new Date(po.expectedDate).toLocaleDateString("pt-BR")}
                      </div>
                      {overdue && (
                        <div className="text-xs text-red-600 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          Atrasado
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{po.itemsCount}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium text-imperial">{po.totalValue.toFixed(2)} MT</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {po.hasCheckin ? (
                        <Badge className="bg-twilight text-imperial">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Realizado
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        className={
                          po.inspectionStatus.includes("Andamento")
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {po.inspectionStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {!po.hasCheckin ? (
                          <Link href="/recebimento/checkin">
                            <Button size="sm" className="bg-imperial hover:bg-imperial">
                              <Clipboard className="w-4 h-4 mr-1" />
                              Check-in
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/recebimento/conferencia?po=${po.id}`}>
                            <Button size="sm" className="bg-imperial hover:bg-imperial">
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Conferir
                            </Button>
                          </Link>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes do PO
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Etiquetas Provisórias
                            </DropdownMenuItem>
                            {po.hasCheckin && (
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Check-in
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Reportar Problema
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}




