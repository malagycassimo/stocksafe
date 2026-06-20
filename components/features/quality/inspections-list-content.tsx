"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  Thermometer,
  Shield,
  FileText,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { qualidadeService, InspectionHistoryItem } from "@/app/services/qualidadeService"

export function InspectionsListContent() {
  const [inspections, setInspections] = useState<InspectionHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("TODOS")
  const [selectedInspection, setSelectedInspection] = useState<InspectionHistoryItem | null>(null)

  useEffect(() => {
    let active = true
    qualidadeService.listInspecoes()
      .then((data) => {
        if (!active) return
        setInspections(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Erro ao carregar histórico de inspeções:", err)
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Filtered inspections
  const filtered = useMemo(() => {
    return inspections.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lote?.codigo_lote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lote?.produto?.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lote?.produto?.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parecerTecnico.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus =
        statusFilter === "TODOS" ||
        (statusFilter === "APROVADO" && item.statusAprovado) ||
        (statusFilter === "REPROVADO" && !item.statusAprovado)

      return matchSearch && matchStatus
    })
  }, [inspections, searchQuery, statusFilter])

  // KPIs
  const totalCount = inspections.length
  const approvedCount = inspections.filter((i) => i.statusAprovado).length
  const rejectedCount = totalCount - approvedCount
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 100

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-imperial" />
        <p className="text-muted-foreground text-sm">Carregando histórico de inspeções...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <span>Qualidade</span>
        {" / "}
        <span className="text-foreground">Histórico de Inspeções</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-imperial">Histórico de Inspeções</h1>
          <p className="text-muted-foreground mt-1">Laudos de qualidade emitidos e decisões de lote</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Inspecionado</p>
                <p className="text-2xl font-bold text-imperial">{totalCount}</p>
              </div>
              <FileText className="w-10 h-10 text-imperial opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-green-600">{approvalRate}%</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lotes Liberados</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lotes Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[300px]">
              <label className="text-sm font-medium mb-2 block">Buscar Laudo</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por lote, produto, parecer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-[200px]">
              <label className="text-sm font-medium mb-2 block">Decisão Final</label>
              <div className="flex gap-1 bg-gray-150 p-1 rounded-md border border-gray-200">
                <Button
                  variant={statusFilter === "TODOS" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter("TODOS")}
                  className="flex-1 text-xs"
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === "APROVADO" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter("APROVADO")}
                  className="flex-1 text-xs text-green-600"
                >
                  Aprovados
                </Button>
                <Button
                  variant={statusFilter === "REPROVADO" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter("REPROVADO")}
                  className="flex-1 text-xs text-red-600"
                >
                  Reprovados
                </Button>
              </div>
            </div>

            <Button variant="outline" className="text-imperial border-imperial">
              <Download className="w-4 h-4 mr-2" />
              Exportar Laudos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Nenhuma inspeção encontrada</h3>
            <p className="text-muted-foreground">Tente alterar os termos da busca ou filtros.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Laudo ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Lote</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Temperatura</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Decisão</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Parecer Técnico</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 w-[100px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">
                      INSP-{item.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-sm">
                          {item.lote?.produto?.sku || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.lote?.produto?.descricao || "Produto não identificado"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{item.lote?.codigo_lote || "N/A"}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.temperatura !== null && item.temperatura !== undefined ? (
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          {item.temperatura}°C
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={item.statusAprovado ? "bg-green-100 text-green-800 border-0" : "bg-red-100 text-red-800 border-0"}>
                        {item.statusAprovado ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            APROVADO
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            REPROVADO
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-[250px] truncate">
                      {item.parecerTecnico}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedInspection(item)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog open={!!selectedInspection} onOpenChange={(open) => !open && setSelectedInspection(null)}>
        <DialogContent className="max-w-2xl">
          {selectedInspection && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-imperial flex items-center justify-between">
                  <span>Laudo Técnico de Inspeção</span>
                  <Badge className={selectedInspection.statusAprovado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {selectedInspection.statusAprovado ? "APROVADO" : "REPROVADO"}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="font-mono">
                  Laudo ID: INSP-{selectedInspection.id.toUpperCase()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 border bg-gray-50 p-4 rounded-lg text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Produto SKU / Descrição:</span>
                    <span className="font-bold">{selectedInspection.lote?.produto?.sku} - {selectedInspection.lote?.produto?.descricao}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Lote / Quantidade:</span>
                    <span className="font-mono font-semibold">{selectedInspection.lote?.codigo_lote} ({selectedInspection.lote?.quantidade || 0} unidades)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Data da Análise:</span>
                    <span className="flex items-center gap-1 font-medium mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedInspection.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Inspetor Responsável:</span>
                    <span className="flex items-center gap-1 font-medium mt-1">
                      <User className="w-4 h-4" />
                      Inspetor Técnico ID: {selectedInspection.usuarioId.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <h4 className="font-semibold text-sm">Checklist de Integridade</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      {selectedInspection.embalagemIntegra ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Embalagem Íntegra</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedInspection.lacreIntegro ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Lacre do Veículo Íntegro</span>
                    </div>
                    {selectedInspection.temperatura !== null && selectedInspection.temperatura !== undefined && (
                      <div className="flex items-center gap-2 col-span-2">
                        <Thermometer className="w-4 h-4 text-red-500" />
                        <span>Temperatura Medida: <strong>{selectedInspection.temperatura}°C</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 border-t pt-3">
                  <span className="text-muted-foreground block text-xs font-semibold">Parecer Técnico:</span>
                  <p className="text-sm border p-3 rounded bg-white text-gray-700 italic">
                    "{selectedInspection.parecerTecnico}"
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedInspection(null)}>
                  Fechar
                </Button>
                <Button className="bg-imperial hover:bg-imperial text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Imprimir PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
