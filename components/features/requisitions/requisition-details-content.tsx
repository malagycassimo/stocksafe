"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Printer, Copy, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Download, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { requisicaoService, RequisicaoData } from "@/app/services/requisicaoService"
import { useAuth } from "@/hooks/useAuth"

const statusMap: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING: "Submetida",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
  FULFILLED: "Concluída",
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  FULFILLED: "bg-emerald-100 text-emerald-800",
}

const priorityMap: Record<string, string> = {
  BAIXA: "Baixa",
  NORMAL: "Normal",
  ALTA: "Alta",
  URGENTE: "Urgente",
}

const priorityColors: Record<string, string> = {
  BAIXA: "bg-gray-100 text-gray-800",
  NORMAL: "bg-blue-100 text-blue-800",
  ALTA: "bg-orange-100 text-orange-800",
  URGENTE: "bg-red-100 text-red-800",
}

export function RequisitionDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user: authUser } = useAuth()
  
  const id = params.id as string

  const [requisition, setRequisition] = useState<RequisicaoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  const fetchRequisition = async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await requisicaoService.buscarPorId(id)
      setRequisition(data)
    } catch (err: any) {
      console.error("Erro ao buscar requisição:", err)
      setError("Falha ao carregar os detalhes da requisição.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequisition()
  }, [id])

  const handleApprove = async () => {
    if (!requisition?.id) return
    try {
      setActionLoading(true)
      await requisicaoService.avaliar(requisition.id, {
        status: "APPROVED"
      })
      toast({
        title: "RI aprovada com sucesso!",
        description: "A requisição foi aprovada.",
      })
      setShowApproveModal(false)
      fetchRequisition()
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
    if (!requisition?.id) return
    if (!rejectionReason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Por favor, informe o motivo da rejeição.",
        variant: "destructive",
      })
      return
    }
    try {
      setActionLoading(true)
      await requisicaoService.avaliar(requisition.id, {
        status: "REJECTED",
        justificativa_negacao: rejectionReason,
      })
      toast({
        title: "RI rejeitada",
        description: "A requisição foi rejeitada.",
      })
      setShowRejectModal(false)
      fetchRequisition()
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando detalhes...</span>
      </div>
    )
  }

  if (error || !requisition) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-150 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error || "Requisição não encontrada."}</span>
        </div>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/requisicoes")}>
          Voltar para Lista
        </Button>
      </div>
    )
  }

  const isApprover = authUser?.perfil === "ADMIN" || authUser?.perfil === "COMPRAS_PROCUREMENT"
  const isCreator = authUser?.id === requisition.usuario_id
  const canApprove = isApprover && requisition.status === "PENDING"
  const canEdit = isCreator && (requisition.status === "DRAFT" || requisition.status === "PENDING")

  const displayStatus = statusMap[requisition.status || ""] || requisition.status || "Rascunho"
  const displayPriority = priorityMap[requisition.prioridade || ""] || requisition.prioridade || "Normal"
  const displayInitials = requisition.solicitante_nome
    ? requisition.solicitante_nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "RI"

  // Synthetic history log since database has no history table
  const syntheticHistory = [
    {
      date: requisition.createdAt ? new Date(requisition.createdAt).toLocaleString("pt-BR") : "-",
      user: requisition.solicitante_nome,
      action: "Criou a requisição",
      status: "DRAFT",
    },
    {
      date: requisition.createdAt ? new Date(requisition.createdAt).toLocaleString("pt-BR") : "-",
      user: requisition.solicitante_nome,
      action: "Submeteu para aprovação",
      status: "PENDING",
    },
  ]

  if (requisition.status === "APPROVED" || requisition.status === "REJECTED") {
    syntheticHistory.push({
      date: requisition.updatedAt ? new Date(requisition.updatedAt).toLocaleString("pt-BR") : "-",
      user: "Gestor do Sistema",
      action: requisition.status === "APPROVED" ? "Aprovou a requisição" : "Rejeitou a requisição",
      status: requisition.status,
    })
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-emerald-600">
          Home
        </Link>
        {" / "}
        <Link href="/requisicoes" className="hover:text-emerald-600">
          Requisições
        </Link>
        {" / "}
        <span className="text-foreground">RI #{requisition.codigo}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">Requisição Interna #{requisition.codigo}</h1>
          <Badge className={`${statusColors[requisition.status || "DRAFT"]} text-base px-4 py-1`}>
            {displayStatus}
          </Badge>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Link href={`/requisicoes/${requisition.id}/editar`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
              <Button variant="outline" className="text-red-600 border-red-600 bg-transparent">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </>
          )}
          {requisition.status === "APPROVED" && authUser?.perfil === "COMPRAS_PROCUREMENT" && (
            <Link href="/compras/rfqs/nova">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <FileText className="w-4 h-4 mr-2" />
                Criar RFQ
              </Button>
            </Link>
          )}
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </Button>
        </div>
      </div>

      {/* General Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Nº RI</div>
                <div className="font-mono font-medium">{requisition.codigo}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Data de Criação</div>
                <div>{requisition.createdAt ? new Date(requisition.createdAt).toLocaleDateString("pt-BR") : "-"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Solicitante</div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                      {displayInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{requisition.solicitante_nome}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Departamento</div>
                <div>{requisition.departamento}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Centro de Custo</div>
                <div>{requisition.centro_custo}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Data Necessária</div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {requisition.date_necessaria ? new Date(requisition.date_necessaria).toLocaleDateString("pt-BR") : "-"}
                  </span>
                  {requisition.prioridade === "URGENTE" && <Badge className="bg-red-100 text-red-800">Urgente</Badge>}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Prioridade</div>
                <Badge className={priorityColors[requisition.prioridade || "NORMAL"]}>{displayPriority}</Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status Atual</div>
                <Badge className={statusColors[requisition.status || "DRAFT"]}>{displayStatus}</Badge>
              </div>
              {requisition.justificativa && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Justificativa</div>
                  <div className="text-sm">{requisition.justificativa}</div>
                </div>
              )}
              {requisition.status === "REJECTED" && requisition.justificativa_negacao && (
                <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-lg">
                  <div className="text-sm font-semibold mb-1">Justificativa da Negação</div>
                  <div className="text-sm">{requisition.justificativa_negacao}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Itens da Requisição</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Produto</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Qtd Solicitada</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Unidade</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Validade Mín. Requerida</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requisition.itens?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm text-emerald-600">{item.produto?.sku}</div>
                      <div className="text-sm">{item.produto?.descricao}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{item.quantidade}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.produto?.unidade_medida || "UN"}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      {item.validade_min_proposta ? (
                        <>
                          {item.validade_min_proposta}
                          {item.validade_min_tipo === "PERCENTAGEM" ? "%" : " dias"}
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.observacoes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between text-sm border-t pt-4">
            <div>
              <span className="font-medium">Total de Itens:</span> {requisition.itens?.length || 0}
            </div>
            <div>
              <span className="font-medium">Quantidade Total:</span>{" "}
              {requisition.itens?.reduce((sum, item) => sum + item.quantidade, 0) || 0} unidades
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Histórico de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syntheticHistory.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-600" />
                  {index < syntheticHistory.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{event.action}</span>
                    <Badge className={statusColors[event.status]} variant="outline">
                      {statusMap[event.status] || event.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.user} • {event.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Section */}
      {canApprove && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-700">Avaliar Requisição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Observações da Aprovação/Negação (Justificativa de negação obrigatória se rejeitada)</Label>
              <Textarea
                placeholder="Adicione observações..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value)
                  setApprovalNotes(e.target.value)
                }}
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowApproveModal(true)}
                className="bg-green-600 hover:bg-green-700 flex-1"
                size="lg"
                disabled={actionLoading}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Aprovar
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                variant="outline"
                className="text-red-600 border-red-600 flex-1"
                size="lg"
                disabled={actionLoading}
              >
                <XCircle className="w-5 h-5 mr-2" />
                Rejeitar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar RI #{requisition.codigo}?</DialogTitle>
            <DialogDescription>
              Esta ação irá aprovar a requisição e notificar o solicitante.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" disabled={actionLoading}>
              {actionLoading ? "Processando..." : "Confirmar Aprovação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar RI #{requisition.codigo}</DialogTitle>
            <DialogDescription>Confirme o motivo da rejeição da requisição.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Motivo da Rejeição *</Label>
            <Textarea
              placeholder="Descreva o motivo da rejeição..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700" disabled={actionLoading}>
              {actionLoading ? "Processando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
