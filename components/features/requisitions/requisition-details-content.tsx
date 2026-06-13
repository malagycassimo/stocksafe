"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Printer, Copy, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Download, FileText } from "lucide-react"
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

const mockRequisition = {
  id: "RI-2025-003",
  number: "RI-2025-003",
  createdAt: "2025-01-14",
  requester: { name: "Pedro Costa", initials: "PC", department: "Limpeza" },
  costCenter: "CC-003",
  neededDate: "2025-01-25",
  priority: "Baixa",
  status: "Submetida",
  justification: "Reposição de estoque para manutenção mensal das áreas comuns",
  items: [
    {
      id: "1",
      sku: "LMP-001",
      description: "Detergente Neutro - 5L",
      quantity: 10,
      unit: "UN",
      minValidity: "80%",
      currentStock: 5,
      notes: "Preferência por marca X",
    },
    {
      id: "2",
      sku: "LMP-015",
      description: "Desinfetante Multiuso - 2L",
      quantity: 15,
      unit: "UN",
      minValidity: "90%",
      currentStock: 8,
      notes: "",
    },
  ],
  attachments: [
    { name: "Previsao_Demanda_Jan.xlsx", size: "245 KB" },
    { name: "Orcamento_Fornecedor.pdf", size: "1.2 MB" },
  ],
  history: [
    { date: "2025-01-14 09:30", user: "Pedro Costa", action: "Criou a requisição", status: "Rascunho" },
    { date: "2025-01-14 10:15", user: "Pedro Costa", action: "Submeteu para aprovação", status: "Submetida" },
  ],
  relatedRfqs: [],
}

const statusColors: Record<string, string> = {
  Rascunho: "bg-gray-100 text-gray-800",
  Submetida: "bg-blue-100 text-blue-800",
  Aprovada: "bg-twilight text-imperial",
  "Em Compras": "bg-orange-100 text-orange-800",
  Concluída: "bg-twilight text-imperial",
  Rejeitada: "bg-red-100 text-red-800",
}

const priorityColors: Record<string, string> = {
  Baixa: "bg-gray-100 text-gray-800",
  Normal: "bg-blue-100 text-blue-800",
  Alta: "bg-orange-100 text-orange-800",
  Urgente: "bg-red-100 text-red-800",
}

export function RequisitionDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [adjustmentRequest, setAdjustmentRequest] = useState("")

  // Mock user profile - in real app, get from auth context
  type UserProfile = "REQUISITANTE" | "COMPRAS" | "RECEBIMENTO" | "QA" | "ADMIN" | "GESTOR" | "FORNECEDOR"
  const userProfile: UserProfile = "GESTOR" as UserProfile
  const isApprover = userProfile === "GESTOR" || userProfile === "ADMIN"
  const isCreator = true // Mock - check if current user is the creator
  const canApprove = isApprover && mockRequisition.status === "Submetida"
  const canEdit = isCreator && (mockRequisition.status === "Rascunho" || mockRequisition.status === "Submetida")

  const handleApprove = () => {
    toast({
      title: "RI aprovada com sucesso!",
      description: "O solicitante e o departamento de Compras foram notificados.",
    })
    setShowApproveModal(false)
    router.push("/requisicoes")
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Por favor, informe o motivo da rejeição.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "RI rejeitada",
      description: "O solicitante foi notificado sobre a rejeição.",
    })
    setShowRejectModal(false)
    router.push("/requisicoes")
  }

  const handleRequestAdjustments = () => {
    if (!adjustmentRequest.trim()) {
      toast({
        title: "Ajustes obrigatórios",
        description: "Por favor, descreva os ajustes necessários.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Ajustes solicitados",
      description: "O solicitante foi notificado sobre os ajustes necessários.",
    })
    setShowAdjustModal(false)
    router.push("/requisicoes")
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <Link href="/requisicoes" className="hover:text-imperial">
          Requisições
        </Link>
        {" / "}
        <span className="text-foreground">RI #{mockRequisition.number}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-imperial mb-2">Requisição Interna #{mockRequisition.number}</h1>
          <Badge className={`${statusColors[mockRequisition.status]} text-base px-4 py-1`}>
            {mockRequisition.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Link href={`/requisicoes/${params.id}/editar`}>
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
          {mockRequisition.status === "Aprovada" && userProfile === "COMPRAS" && (
            <Link href="/compras/rfqs/nova">
              <Button className="bg-imperial hover:bg-imperial">
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
                <div className="font-mono font-medium">{mockRequisition.number}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Data de Criação</div>
                <div>{new Date(mockRequisition.createdAt).toLocaleDateString("pt-BR")}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Solicitante</div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-twilight text-imperial text-xs">
                      {mockRequisition.requester.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{mockRequisition.requester.name}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Departamento</div>
                <div>{mockRequisition.requester.department}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Centro de Custo</div>
                <div>{mockRequisition.costCenter}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Data Necessária</div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {new Date(mockRequisition.neededDate).toLocaleDateString("pt-BR")}
                  </span>
                  {mockRequisition.priority === "Urgente" && <Badge className="bg-red-100 text-red-800">Urgente</Badge>}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Prioridade</div>
                <Badge className={priorityColors[mockRequisition.priority]}>{mockRequisition.priority}</Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status Atual</div>
                <Badge className={statusColors[mockRequisition.status]}>{mockRequisition.status}</Badge>
              </div>
              {mockRequisition.justification && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Justificativa</div>
                  <div className="text-sm">{mockRequisition.justification}</div>
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
                  <th className="px-4 py-3 text-center text-sm font-semibold">Estoque Atual</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockRequisition.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm text-imperial">{item.sku}</div>
                      <div className="text-sm">{item.description}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.unit}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.minValidity}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={item.currentStock < item.quantity ? "text-orange-600 font-medium" : ""}>
                        {item.currentStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between text-sm border-t pt-4">
            <div>
              <span className="font-medium">Total de Itens:</span> {mockRequisition.items.length}
            </div>
            <div>
              <span className="font-medium">Quantidade Total:</span>{" "}
              {mockRequisition.items.reduce((sum, item) => sum + item.quantity, 0)} unidades
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      {mockRequisition.attachments.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Anexos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockRequisition.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{file.size}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Histórico de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRequisition.history.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-imperial" />
                  {index < mockRequisition.history.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{event.action}</span>
                    <Badge className={statusColors[event.status]} variant="outline">
                      {event.status}
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

      {/* Related RFQs/POs */}
      {mockRequisition.relatedRfqs.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>RFQs/POs Relacionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Nenhuma RFQ ou PO criada ainda.</div>
          </CardContent>
        </Card>
      )}

      {/* Approval Section */}
      {canApprove && (
        <Card className="border-twilight bg-twilight">
          <CardHeader>
            <CardTitle className="text-imperial">Aprovar Requisição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Observações da Aprovação (opcional)</Label>
              <Textarea
                placeholder="Adicione observações sobre a aprovação..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowApproveModal(true)}
                className="bg-imperial hover:bg-imperial flex-1"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Aprovar
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                variant="outline"
                className="text-red-600 border-red-600 flex-1"
                size="lg"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Rejeitar
              </Button>
              <Button
                onClick={() => setShowAdjustModal(true)}
                variant="outline"
                className="text-yellow-600 border-yellow-600 flex-1"
                size="lg"
              >
                <AlertCircle className="w-5 h-5 mr-2" />
                Solicitar Ajustes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar RI #{mockRequisition.number}?</DialogTitle>
            <DialogDescription>
              Esta ação irá aprovar a requisição e notificar o solicitante e o departamento de Compras.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} className="bg-imperial hover:bg-imperial">
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar RI #{mockRequisition.number}</DialogTitle>
            <DialogDescription>Informe o motivo da rejeição para o solicitante.</DialogDescription>
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
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Adjustments Modal */}
      <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Ajustes - RI #{mockRequisition.number}</DialogTitle>
            <DialogDescription>Descreva os ajustes necessários para o solicitante.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Ajustes Solicitados *</Label>
            <Textarea
              placeholder="Descreva os ajustes necessários..."
              value={adjustmentRequest}
              onChange={(e) => setAdjustmentRequest(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestAdjustments} className="bg-yellow-600 hover:bg-yellow-700">
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




