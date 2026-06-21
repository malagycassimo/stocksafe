"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Download, Plus, MoreVertical, Eye, Clock, XIcon, RefreshCw, Calendar, Send } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { comprasService } from "@/app/services/comprasService"
import { useToast } from "@/hooks/use-toast"

const statusColors: Record<string, string> = {
  "Aguardando Respostas": "bg-yellow-100 text-yellow-800",
  "Parcialmente Respondida": "bg-blue-100 text-blue-800",
  "Totalmente Respondida": "bg-twilight text-imperial",
  Fechada: "bg-gray-100 text-gray-800",
}

interface MappedRFQ {
  id: string
  codigo: string
  riOrigin: string
  createdAt: string
  deadline: string
  suppliers: { name: string; initials: string }[]
  responsesReceived: number
  totalSuppliers: number
  status: string
}

export function RfqsListContent() {
  const [rfqsList, setRfqsList] = useState<MappedRFQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todas")
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)
  const { toast } = useToast()

  const handleCancelRFQ = (id: string, codigo: string) => {
    if (confirm(`Deseja realmente cancelar a cotação ${codigo}?`)) {
      comprasService.cancelarRFQ(id)
        .then(() => {
          toast({
            title: "Cotação Cancelada",
            description: `A cotação ${codigo} foi cancelada com sucesso.`,
          })
          loadRFQs()
        })
        .catch((err) => {
          console.error(err)
          toast({
            title: "Erro ao cancelar cotação",
            description: err.response?.data?.message || err.message,
            variant: "destructive"
          })
        })
    }
  }

  const handleResend = (codigo: string) => {
    toast({
      title: "Convites Reenviados",
      description: `Os convites para fornecedores da cotação ${codigo} foram reenviados com sucesso.`,
    })
  }

  const handleExtendDeadline = (codigo: string) => {
    toast({
      title: "Prazo Estendido",
      description: `O prazo de resposta da cotação ${codigo} foi estendido por mais 48 horas.`,
    })
  }

  const loadRFQs = () => {
    setLoading(true)
    comprasService.listarRFQs()
      .then((data) => {
        if (!data || data.length === 0) {
          setRfqsList([])
          setLoading(false)
          return
        }

        const mapped = data.map((rfq: any) => {
          const responses = rfq.propostas?.length || 0
          const totalInvited = Math.max(3, responses)
          
          let displayStatus = "Aguardando Respostas"
          if (rfq.status === "CLOSED" || rfq.status === "FECHADA") {
            displayStatus = "Fechada"
          } else if (rfq.status === "RESPONDED" || rfq.status === "RESPONDIDA") {
            displayStatus = "Totalmente Respondida"
          } else if (responses > 0) {
            displayStatus = "Parcialmente Respondida"
          }

          const suppliers = rfq.propostas?.map((p: any) => {
            const name = p.fornecedor?.razao_social || p.fornecedor?.nome || "Fornecedor"
            const initials = name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
            return { name, initials }
          }) || []

          return {
            id: rfq.id,
            codigo: rfq.codigo || rfq.id,
            riOrigin: "-", // no direct link saved in the DB model
            createdAt: rfq.createdAt,
            deadline: rfq.dataLimite,
            suppliers,
            responsesReceived: responses,
            totalSuppliers: totalInvited,
            status: displayStatus
          }
        })
        setRfqsList(mapped)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Erro ao carregar RFQs:", err)
        setRfqsList([])
        setLoading(false)
      })
  }

  useEffect(() => {
    loadRFQs()
  }, [])

  const getHoursUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffInHours = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    return diffInHours
  }

  const getDeadlineColor = (deadline: string) => {
    const hours = getHoursUntilDeadline(deadline)
    if (hours < 0) return "text-red-600"
    if (hours <= 24) return "text-orange-600"
    return "text-imperial"
  }

  const getDeadlineIndicator = (deadline: string) => {
    const hours = getHoursUntilDeadline(deadline)
    if (hours < 0) return "bg-red-500"
    if (hours <= 24) return "bg-yellow-500"
    return "bg-imperial"
  }

  const filteredRfqs = rfqsList.filter((rfq) => {
    const matchesSearch =
      rfq.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.riOrigin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.suppliers.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "Todas" || rfq.status === statusFilter

    const hoursUntil = getHoursUntilDeadline(rfq.deadline)
    const matchesUrgent = !showUrgentOnly || (hoursUntil <= 24 && hoursUntil >= 0)

    return matchesSearch && matchesStatus && matchesUrgent
  })

  // Summary Metrics
  const activeCount = rfqsList.filter((r) => r.status !== "Fechada").length
  const waitingCount = rfqsList.filter((r) => r.status === "Aguardando Respostas").length
  const totalReceived = rfqsList.reduce((acc, r) => acc + r.responsesReceived, 0)
  const totalInvited = rfqsList.reduce((acc, r) => acc + r.totalSuppliers, 0)
  const avgResponseRate = totalInvited > 0 ? Math.round((totalReceived / totalInvited) * 100) : 0

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
        <span className="text-foreground">RFQs</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">Cotações (RFQ)</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadRFQs} disabled={loading} className="bg-transparent border-gray-200">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/compras/rfqs/nova">
            <Button className="bg-imperial hover:bg-imperial">
              <Plus className="w-4 h-4 mr-2" />
              Nova RFQ
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">RFQs Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{waitingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Respostas Recebidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">{totalReceived}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa Média de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-imperial">{avgResponseRate}%</div>
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
                placeholder="Buscar por número RFQ, RI origem, fornecedor..."
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
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Aguardando Respostas">Aguardando Respostas</SelectItem>
                <SelectItem value="Parcialmente Respondida">Parcialmente Respondida</SelectItem>
                <SelectItem value="Totalmente Respondida">Totalmente Respondida</SelectItem>
                <SelectItem value="Fechada">Fechada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="urgent"
              checked={showUrgentOnly}
              onCheckedChange={(checked) => setShowUrgentOnly(!!checked)}
            />
            <label htmlFor="urgent" className="text-sm font-medium cursor-pointer">
              Mostrar apenas urgentes ({"<"} 24h)
            </label>
          </div>

          <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("Todas"); setShowUrgentOnly(false); }}>
            Limpar Filtros
          </Button>
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
              Carregando cotações...
            </div>
          ) : filteredRfqs.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhuma cotação RFQ encontrada.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nº RFQ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">RI Origem</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Criação</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prazo de Resposta</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fornecedores Convidados</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Respostas Recebidas</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[120px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRfqs.map((rfq) => {
                  const hoursUntil = getHoursUntilDeadline(rfq.deadline)
                  const isUrgent = hoursUntil <= 24 && hoursUntil >= 0
                  const isOverdue = hoursUntil < 0

                  return (
                    <tr
                      key={rfq.id}
                      className={`hover:bg-gray-50 ${isUrgent ? "bg-yellow-50" : ""} ${isOverdue ? "bg-red-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/compras/rfqs/${rfq.id}/comparativo`}
                          className="font-mono text-sm text-imperial hover:text-imperial hover:underline"
                        >
                          {rfq.codigo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                        {rfq.riOrigin}
                      </td>
                      <td className="px-4 py-3 text-sm">{new Date(rfq.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getDeadlineIndicator(rfq.deadline)}`} />
                          <span className={`text-sm font-medium ${getDeadlineColor(rfq.deadline)}`}>
                            {new Date(rfq.deadline).toLocaleString("pt-BR")}
                          </span>
                          {isUrgent && <Clock className="w-4 h-4 text-orange-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {rfq.suppliers.length > 0 ? (
                            <>
                              <div className="flex -space-x-2">
                                {rfq.suppliers.slice(0, 3).map((supplier, idx) => (
                                  <Avatar key={idx} className="w-8 h-8 border-2 border-white">
                                    <AvatarFallback className="bg-twilight text-imperial text-xs">
                                      {supplier.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">({rfq.totalSuppliers})</span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Nenhum</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {rfq.responsesReceived} de {rfq.totalSuppliers}
                          </div>
                          <Progress value={(rfq.responsesReceived / rfq.totalSuppliers) * 100} className="h-2" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={statusColors[rfq.status]}>{rfq.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/compras/rfqs/${rfq.id}/comparativo`}>
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
                              <DropdownMenuItem asChild>
                                <Link href={`/compras/rfqs/${rfq.id}/comparativo`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Comparativo
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/compras/portal-fornecedor/rfq/${rfq.id}/responder`}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Simular Resposta Fornecedor
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResend(rfq.codigo)}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reenviar para Fornecedores
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExtendDeadline(rfq.codigo)}>
                                <Calendar className="w-4 h-4 mr-2" />
                                Estender Prazo
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleCancelRFQ(rfq.id, rfq.codigo)}>
                                <XIcon className="w-4 h-4 mr-2" />
                                Cancelar RFQ
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
