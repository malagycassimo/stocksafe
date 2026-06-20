"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Eye, Check, X, AlertCircle, RefreshCw, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { requisicaoService, RequisicaoData } from "@/app/services/requisicaoService"

const priorityMap: Record<string, string> = {
  BAIXA: "Baixa",
  NORMAL: "Normal",
  ALTA: "Alta",
  URGENTE: "Urgente",
}

const priorityColors: Record<string, string> = {
  BAIXA: "bg-gray-100 text-gray-800 border-gray-200",
  NORMAL: "bg-blue-100 text-blue-800 border-blue-200",
  ALTA: "bg-orange-100 text-orange-800 border-orange-200",
  URGENTE: "bg-red-100 text-red-800 border-red-200",
}

export function ApproveRequisitionsContent() {
  const { toast } = useToast()
  const [requisitions, setRequisitions] = useState<RequisicaoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  
  // Modal states
  const [selectedReq, setSelectedReq] = useState<RequisicaoData | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const fetchPendingRequisitions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await requisicaoService.listarTodas()
      // Filter only PENDING (Submetida)
      setRequisitions(data.filter((r) => r.status === "PENDING"))
    } catch (err: any) {
      console.error("Erro ao buscar requisições:", err)
      setError("Falha ao carregar a lista de requisições pendentes.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingRequisitions()
  }, [])

  const getDaysUntil = (dateString?: string) => {
    if (!dateString) return 999
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffInDays
  }

  const handleApprove = async () => {
    if (!selectedReq?.id) return
    try {
      setActionLoading(true)
      await requisicaoService.avaliar(selectedReq.id, {
        status: "APPROVED"
      })
      toast({
        title: "RI aprovada com sucesso!",
        description: `A requisição #${selectedReq.codigo} foi aprovada.`,
      })
      setShowApproveModal(false)
      setSelectedReq(null)
      fetchPendingRequisitions()
    } catch (err: any) {
      console.error("Erro ao aprovar:", err)
      toast({
        title: "Erro ao aprovar",
        description: err.response?.data?.error || "Falha ao aprovar a requisição.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedReq?.id) return
    if (!rejectionReason.trim()) {
      toast({
        title: "Justificativa obrigatória",
        description: "Por favor, insira o motivo da rejeição.",
        variant: "destructive",
      })
      return
    }

    try {
      setActionLoading(true)
      await requisicaoService.avaliar(selectedReq.id, {
        status: "REJECTED",
        justificativa_negacao: rejectionReason.trim()
      })
      toast({
        title: "RI rejeitada com sucesso!",
        description: `A requisição #${selectedReq.codigo} foi rejeitada.`,
      })
      setShowRejectModal(false)
      setSelectedReq(null)
      setRejectionReason("")
      fetchPendingRequisitions()
    } catch (err: any) {
      console.error("Erro ao rejeitar:", err)
      toast({
        title: "Erro ao rejeitar",
        description: err.response?.data?.error || "Falha ao rejeitar a requisição.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const filteredRequisitions = requisitions.filter((req) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesCode = req.codigo?.toLowerCase().includes(query) || false
      const matchesRequester = req.solicitante_nome?.toLowerCase().includes(query) || false
      const matchesDept = req.departamento?.toLowerCase().includes(query) || false
      return matchesCode || matchesRequester || matchesDept
    }
    return true
  })

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-emerald-600">Home</Link>
        {" / "}
        <Link href="/requisicoes" className="hover:text-emerald-600">Requisições</Link>
        {" / "}
        <span className="text-foreground font-medium">Aprovar</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-700">Aprovação de Requisições</h1>
          <p className="text-muted-foreground text-sm">Gerencie, aprove ou rejeite requisições internas de materiais.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{requisitions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Busca rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número RI, solicitante ou departamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline" onClick={() => setSearchQuery("")}>Limpar Filtro</Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* List Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="text-sm text-muted-foreground">Carregando requisições pendentes...</span>
          </div>
        ) : filteredRequisitions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">Nenhuma requisição pendente de aprovação</p>
            <p className="text-sm">Todas as requisições enviadas já foram revisadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Nº RI</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Data Criação</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Solicitante</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Departamento</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Necessária em</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Itens</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Prioridade</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-[160px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequisitions.map((req) => {
                  const displayPriority = priorityMap[req.prioridade || ""] || req.prioridade || "Normal"
                  
                  return (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium">
                        <Link
                          href={`/requisicoes/${req.id}`}
                          className="text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          {req.codigo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString("pt-BR") : "-"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{req.solicitante_nome}</td>
                      <td className="px-4 py-3 text-gray-700">{req.departamento}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{req.date_necessaria ? new Date(req.date_necessaria).toLocaleDateString("pt-BR") : "-"}</span>
                          {req.date_necessaria && getDaysUntil(req.date_necessaria) <= 3 && (
                            <Clock className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{req.itens?.length || 0}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`border ${priorityColors[req.prioridade || "NORMAL"]}`}>
                          {displayPriority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/requisicoes/${req.id}`}>
                            <Button variant="ghost" size="sm" title="Visualizar Detalhes">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200"
                            onClick={() => {
                              setSelectedReq(req)
                              setShowApproveModal(true)
                            }}
                            title="Aprovar Requisição"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-700 hover:text-red-800 hover:bg-red-50 border-red-200"
                            onClick={() => {
                              setSelectedReq(req)
                              setShowRejectModal(true)
                            }}
                            title="Rejeitar Requisição"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Approve Dialog */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Requisição #{selectedReq?.codigo}?</DialogTitle>
            <DialogDescription>
              Esta ação irá aprovar a requisição e notificar o solicitante.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowApproveModal(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Reject Dialog */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Requisição #{selectedReq?.codigo}?</DialogTitle>
            <DialogDescription>
              Por favor, insira o motivo da rejeição abaixo para notificar o solicitante.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="reason">Motivo da Rejeição <span className="text-red-500">*</span></Label>
            <Textarea
              id="reason"
              placeholder="Ex: Quantidades excessivas / Produto incorreto..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button onClick={handleReject} disabled={actionLoading} className="bg-red-650 hover:bg-red-700 text-white">
              {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
