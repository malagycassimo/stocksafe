"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  FileText, 
  Tag, 
  Calendar, 
  User, 
  Truck, 
  AlertTriangle,
  CheckCircle2, 
  DollarSign, 
  RefreshCw 
} from "lucide-react"
import { recebimentoService } from "@/app/services/recebimentoService"
import { useToast } from "@/hooks/use-toast"

const statusColors: Record<string, string> = {
  Rascunho: "bg-gray-100 text-gray-800",
  EMITIDO: "bg-blue-100 text-blue-800",
  Emitido: "bg-blue-100 text-blue-800",
  CONFIRMADO: "bg-indigo-100 text-indigo-800",
  Confirmado: "bg-indigo-100 text-indigo-800",
  FATURADO: "bg-purple-100 text-purple-800",
  Faturado: "bg-purple-100 text-purple-800",
  Concluído: "bg-twilight text-imperial",
  Cancelado: "bg-red-100 text-red-800",
  CANCELADO: "bg-red-100 text-red-800",
  Atrasado: "bg-red-100 text-red-800",
}

export default function PurchaseOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const poId = params?.id as string

  const [po, setPo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const user = {
    name: "João Silva",
    email: "joao.silva@stocksafe.com",
    profile: "COMPRAS" as const,
    initials: "JS",
  }

  const loadPoDetails = () => {
    if (!poId) return
    setLoading(true)
    recebimentoService.getPurchaseOrder(poId)
      .then((data) => {
        setPo(data)
      })
      .catch((err) => {
        console.error("Erro ao obter detalhes da PO:", err)
        toast({
          title: "Erro ao carregar Pedido",
          description: err.response?.data?.message || err.message,
          variant: "destructive"
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadPoDetails()
  }, [poId])

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
          <RefreshCw className="w-8 h-8 animate-spin text-imperial mb-4" />
          <p className="text-sm font-medium">Carregando detalhes do Pedido de Compra...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!po) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
          <h2 className="text-lg font-bold text-gray-800">Pedido de Compra não encontrado</h2>
          <p className="text-sm mt-1 mb-6">Não foi possível carregar os dados do pedido #{poId}.</p>
          <Link href="/compras/pos">
            <Button className="bg-imperial text-white hover:bg-imperial/90">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Listagem
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const isOverdue = () => {
    if (po.status === "FATURADO" || po.status === "CANCELADO") return false
    const today = new Date()
    const delivery = new Date(po.expectedDelivery)
    return delivery < today
  }

  const activeStatus = isOverdue() ? "Atrasado" : po.status

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-imperial">Home</Link>
          {" / "}
          <Link href="/compras/pos" className="hover:text-imperial">Compras</Link>
          {" / "}
          <Link href="/compras/pos" className="hover:text-imperial">Pedidos de Compra</Link>
          {" / "}
          <span className="text-foreground">Pedido #{po.codigo}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-imperial">
                Pedido de Compra #{po.codigo}
              </h1>
              <Badge className={statusColors[activeStatus] || "bg-gray-100"}>
                {activeStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Criado em {new Date(po.createdAt).toLocaleDateString("pt-BR")} às {new Date(po.createdAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/compras/pos">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
            </Link>
            
            {po.status !== "CANCELADO" && po.status !== "FATURADO" && (
              <>
                <Link href={`/compras/pos/${po.id}/faturar`}>
                  <Button className="bg-imperial text-white hover:bg-imperial/90" size="sm">
                    <FileText className="w-4 h-4 mr-2" /> Faturar / NF
                  </Button>
                </Link>
                <Link href={`/compras/pos/${po.id}/etiquetas-provisorias`}>
                  <Button variant="outline" className="text-imperial border-imperial hover:bg-twilight" size="sm">
                    <Tag className="w-4 h-4 mr-2" /> Etiquetas Provisórias
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Body content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* General Information Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Informações do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Valor Total do Pedido</Label>
                  <div className="text-xl font-bold text-imperial mt-1">
                    {po.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Previsão de Entrega</Label>
                  <div className="text-sm font-semibold flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {new Date(po.expectedDelivery).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Qtd Itens</Label>
                  <div className="text-sm font-semibold mt-2">
                    {po.itens?.length || 0} produtos cadastrados
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Produto</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Unidade</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Qtd Esperada</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Preço Unit.</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {po.itens?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm font-medium">{item.sku}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">{item.unit}</td>
                        <td className="px-4 py-3 text-center text-sm font-medium">{item.qtyExpected}</td>
                        <td className="px-4 py-3 text-right text-sm">{item.price.toFixed(2)} MT</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          {(item.qtyExpected * item.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} MT
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Supplier and Logistic Details Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fornecedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Razão Social</Label>
                  <div className="font-bold text-gray-800 text-sm mt-1">
                    {po.fornecedor?.razao_social}
                  </div>
                </div>
                {po.fornecedor?.nuit && (
                  <div>
                    <Label className="text-muted-foreground">NUIT</Label>
                    <div className="text-sm font-medium mt-1">
                      {po.fornecedor.nuit}
                    </div>
                  </div>
                )}
                {po.fornecedor?.email_principal && (
                  <div>
                    <Label className="text-muted-foreground">E-mail Principal</Label>
                    <div className="text-sm font-medium mt-1 text-imperial hover:underline">
                      <a href={`mailto:${po.fornecedor.email_principal}`}>{po.fornecedor.email_principal}</a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Check-In logistic Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Logístico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {po.checkIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-imperial font-semibold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-imperial" />
                      Check-In Realizado
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Código Check-In</Label>
                      <div className="font-mono text-sm font-bold mt-1">
                        {po.checkIn.codigoCheckIn}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Data/Hora</Label>
                      <div className="text-sm font-medium mt-1">
                        {new Date(po.checkIn.createdAt).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status Logístico</Label>
                      <div className="mt-1">
                        <Badge className="bg-imperial text-white">{po.checkIn.status}</Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                    <Truck className="w-10 h-10 text-gray-300 mb-2" />
                    <p className="text-sm font-medium">Aguardando chegada do veículo</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nenhum Check-In logístico associado a este pedido foi registrado ainda.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
