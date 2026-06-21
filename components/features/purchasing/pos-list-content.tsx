"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Download, Plus, MoreVertical, Eye, Printer, Mail, XIcon, Copy, History, RefreshCw } from "lucide-react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { comprasService } from "@/app/services/comprasService"
import { useToast } from "@/hooks/use-toast"

const statusColors: Record<string, string> = {
  Rascunho: "bg-gray-100 text-gray-800",
  Emitido: "bg-blue-100 text-blue-800",
  Confirmado: "bg-indigo-100 text-indigo-800",
  Faturado: "bg-purple-100 text-purple-800",
  "Aguardando Recebimento": "bg-orange-100 text-orange-800",
  "Recebido Parcial": "bg-yellow-100 text-yellow-800",
  Concluído: "bg-twilight text-imperial",
  Cancelado: "bg-red-100 text-red-800",
  Atrasado: "bg-red-100 text-red-800",
}

interface MappedPO {
  id: string
  issueDate: string
  supplier: { name: string; initials: string }
  riOrigin: string
  rfqOrigin: string | null
  itemsCount: number
  totalValue: number
  currency: string
  expectedDelivery: string
  status: string
}

export function PosListContent() {
  const [posList, setPosList] = useState<MappedPO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [activeTab, setActiveTab] = useState("todos")
  const { toast } = useToast()

  const handlePrintPO = (id: string) => {
    toast({
      title: "Impressão Iniciada",
      description: `O documento do pedido ${id} foi enviado para a fila de impressão.`,
    })
  }

  const handleSendEmail = (id: string, supplier: string) => {
    toast({
      title: "E-mail Enviado",
      description: `O PDF do pedido ${id} foi enviado para o fornecedor ${supplier}.`,
    })
  }

  const handleDuplicatePO = (id: string) => {
    toast({
      title: "Pedido Duplicado",
      description: `Rascunho de cópia do pedido ${id} criado com sucesso.`,
    })
  }

  const handleViewHistory = (id: string) => {
    toast({
      title: "Histórico Carregado",
      description: `Exibindo logs de auditoria do pedido ${id}.`,
    })
  }

  const handleCancelPO = (id: string) => {
    if (confirm(`Deseja realmente cancelar o Pedido de Compra ${id}?`)) {
      comprasService.cancelarPO(id)
        .then(() => {
          toast({
            title: "Pedido Cancelado",
            description: `O Pedido de Compra ${id} foi cancelado com sucesso.`,
          })
          loadPOs()
        })
        .catch((err) => {
          console.error(err)
          toast({
            title: "Erro ao cancelar pedido",
            description: err.response?.data?.message || err.message,
            variant: "destructive"
          })
        })
    }
  }

  const loadPOs = () => {
    setLoading(true)
    comprasService.listarPOs()
      .then((data) => {
        if (!data || data.length === 0) {
          setPosList([])
          setLoading(false)
          return
        }

        const mapped = data.map((po: any) => {
          let uiStatus = "Emitido"
          if (po.status === "CONFIRMADO") uiStatus = "Confirmado"
          else if (po.status === "FATURADO") uiStatus = "Faturado"
          else if (po.status === "CANCELADO") uiStatus = "Cancelado"

          const name = po.fornecedor?.razao_social || "Fornecedor"
          const initials = name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()

          return {
            id: po.codigo || po.id,
            issueDate: po.createdAt,
            supplier: { name, initials },
            riOrigin: "-", // backend does not map PO directly to RI
            rfqOrigin: po.proposta?.rfq?.codigo || null,
            itemsCount: po.proposta?.itens?.length || 1,
            totalValue: po.totalValue || 0,
            currency: "MT",
            expectedDelivery: po.expectedDelivery,
            status: uiStatus
          }
        })
        setPosList(mapped)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Erro ao carregar POs:", err)
        setPosList([])
        setLoading(false)
      })
  }

  useEffect(() => {
    loadPOs()
  }, [])

  const isOverdue = (expectedDelivery: string, status: string) => {
    if (status === "Concluído" || status === "Cancelado") return false
    const today = new Date()
    const delivery = new Date(expectedDelivery)
    return delivery < today
  }

  const isUrgent = (expectedDelivery: string, status: string) => {
    if (status === "Concluído" || status === "Cancelado") return false
    const today = new Date()
    const delivery = new Date(expectedDelivery)
    const diffTime = delivery.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }

  const filteredPOs = posList.filter((po) => {
    const matchesSearch =
      po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po.rfqOrigin && po.rfqOrigin.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "Todos" || po.status === statusFilter

    let matchesTab = true
    if (activeTab === "confirmacao") matchesTab = po.status === "Emitido"
    else if (activeTab === "faturacao") matchesTab = po.status === "Confirmado"
    else if (activeTab === "recebimento") matchesTab = po.status === "Faturado"
    else if (activeTab === "atrasados") matchesTab = isOverdue(po.expectedDelivery, po.status)

    return matchesSearch && matchesStatus && matchesTab
  })

  // Metrics
  const activeCount = posList.filter((po) => po.status !== "Cancelado").length
  const totalValueSum = posList.reduce((sum, po) => sum + po.totalValue, 0)
  const waitingConfirmCount = posList.filter((po) => po.status === "Emitido").length
  const waitingInvoiceCount = posList.filter((po) => po.status === "Confirmado").length
  const overdueCount = posList.filter((po) => isOverdue(po.expectedDelivery, po.status)).length

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/compras" className="hover:text-imperial">
          Compras
        </Link>
        {" / "}
        <span className="text-foreground">Pedidos de Compra</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">Pedidos de Compra (PO)</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPOs} disabled={loading} className="bg-transparent border-gray-200">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/compras/pos/novo">
            <Button className="bg-imperial hover:bg-imperial">
              <Plus className="w-4 h-4 mr-2" />
              Novo PO
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">POs Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total (Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">
              {totalValueSum.toFixed(2)} MT
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Confirmação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{waitingConfirmCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Faturação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{waitingInvoiceCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tabs */}
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="confirmacao">Aguardando Confirmação</TabsTrigger>
            <TabsTrigger value="faturacao">Aguardando Faturação</TabsTrigger>
            <TabsTrigger value="recebimento">Aguardando Recebimento</TabsTrigger>
            <TabsTrigger value="atrasados">Atrasados</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[300px]">
            <label className="text-sm font-medium mb-2 block">Busca</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número PO, fornecedor, RI/RFQ origem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-[200px]">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Rascunho">Rascunho</SelectItem>
                <SelectItem value="Emitido">Emitido</SelectItem>
                <SelectItem value="Confirmado">Confirmado</SelectItem>
                <SelectItem value="Faturado">Faturado</SelectItem>
                <SelectItem value="Aguardando Recebimento">Aguardando Recebimento</SelectItem>
                <SelectItem value="Recebido Parcial">Recebido Parcial</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("Todos"); setActiveTab("todos"); }}>Limpar Filtros</Button>
          <Button variant="outline" className="text-imperial border-imperial bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mr-2 text-imperial" />
              Carregando pedidos de compra...
            </div>
          ) : filteredPOs.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum pedido de compra encontrado.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nº PO</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Emissão</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fornecedor</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">RFQ Origem</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qtd Itens</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Valor Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Prevista</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[120px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPOs.map((po) => {
                  const overdue = isOverdue(po.expectedDelivery, po.status)
                  const urgent = isUrgent(po.expectedDelivery, po.status)

                  return (
                    <tr
                      key={po.id}
                      className={`hover:bg-gray-50 ${overdue ? "bg-red-50" : ""} ${urgent ? "bg-yellow-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/compras/pos/${po.id}`}
                          className="font-mono text-sm text-imperial hover:text-imperial hover:underline"
                        >
                          {po.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">{new Date(po.issueDate).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-twilight text-imperial text-xs">
                              {po.supplier.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{po.supplier.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {po.rfqOrigin ? (
                          <Link
                            href={`/compras/rfqs/${po.rfqOrigin}`}
                            className="font-mono text-xs text-purple-600 hover:underline block"
                          >
                            {po.rfqOrigin}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{po.itemsCount}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium text-imperial">
                          {po.totalValue.toFixed(2)} {po.currency}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className={overdue ? "text-red-600 font-medium" : urgent ? "text-orange-600" : ""}>
                          {new Date(po.expectedDelivery).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={statusColors[overdue ? "Atrasado" : po.status]}>
                          {overdue ? "Atrasado" : po.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/compras/pos/${po.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/compras/pos/${po.id}`} className="w-full cursor-pointer">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem onClick={() => handlePrintPO(po.id)}>
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimir PO
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendEmail(po.id, po.supplier.name)}>
                                <Mail className="w-4 h-4 mr-2" />
                                Enviar por Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicatePO(po.id)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewHistory(po.id)}>
                                <History className="w-4 h-4 mr-2" />
                                Ver Histórico
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleCancelPO(po.id)}>
                                <XIcon className="w-4 h-4 mr-2" />
                                Cancelar PO
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
          )}
        </div>
      </div>
    </div>
  )
}
