"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Download,
  Plus,
  MoreVertical,
  Edit,
  Eye,
  ShoppingCart,
  AlertTriangle,
  Ban,
  Power,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { fornecedorService, FornecedorData } from "@/app/services/fornecedorService"

// Mock data
const mockSuppliers = [
  {
    id: "1",
    name: "Distribuidora Alimentos Ltda",
    nuit: "123456789",
    contact: "contato@distribuidora.com / (11) 98765-4321",
    score: 92,
    certifications: ["ISO 9001", "HACCP"],
    status: "Ativo",
  },
  {
    id: "2",
    name: "Frigorífico Premium S.A.",
    nuit: "987654321",
    contact: "vendas@frigopremium.com / (11) 91234-5678",
    score: 88,
    certifications: ["ISO 22000", "Orgânico"],
    status: "Ativo",
  },
  {
    id: "3",
    name: "Hortifruti Verde Vida",
    nuit: "456789123",
    contact: "comercial@verdevida.com / (11) 99876-5432",
    score: 75,
    certifications: ["Orgânico"],
    status: "Ativo",
  },
  {
    id: "4",
    name: "Produtos de Limpeza Clean Pro",
    nuit: "789123456",
    contact: "atendimento@cleanpro.com / (11) 97654-3210",
    score: 65,
    certifications: ["ISO 9001"],
    status: "Ativo",
  },
  {
    id: "5",
    name: "Fornecedor Bloqueado Ltda",
    nuit: "321654987",
    contact: "contato@bloqueado.com / (11) 96543-2109",
    score: 45,
    certifications: [],
    status: "Bloqueado",
  },
  {
    id: "6",
    name: "Fornecedor Inativo S.A.",
    nuit: "654987321",
    contact: "info@inativo.com / (11) 95432-1098",
    score: 58,
    certifications: ["ISO 9001"],
    status: "Inativo",
  },
]

type SortField = "name" | "nuit" | "score" | "status"
type SortDirection = "asc" | "desc"

const certificationColors: Record<string, string> = {
  "ISO 9001": "bg-blue-100 text-blue-800",
  "ISO 22000": "bg-purple-100 text-purple-800",
  HACCP: "bg-twilight text-imperial",
  Orgânico: "bg-twilight text-imperial",
  Kosher: "bg-indigo-100 text-indigo-800",
  Halal: "bg-twilight text-imperial",
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-imperial"
  if (score >= 70) return "text-blue-600"
  if (score >= 50) return "text-yellow-600"
  return "text-red-600"
}

const getScoreLabel = (score: number) => {
  if (score >= 90) return "Excelente"
  if (score >= 70) return "Bom"
  if (score >= 50) return "Regular"
  return "Ruim"
}

const getScoreBarColor = (score: number) => {
  if (score >= 90) return "bg-imperial"
  if (score >= 70) return "bg-blue-500"
  if (score >= 50) return "bg-yellow-500"
  return "bg-red-500"
}

export function SuppliersListContent() {
  const { toast } = useToast()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [scoreFilter, setScoreFilter] = useState("Todos")
  const [certificationFilter, setCertificationFilter] = useState("Todos")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [showExportModal, setShowExportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [supplierToBlock, setSupplierToBlock] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar dados da API
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true)
      const data = await fornecedorService.listarTodos()
      if (data && data.length > 0) {
        const mapped = data.map((s: any) => {
          const certifications = []
          if (s.cert_iso9001) certifications.push("ISO 9001")
          if (s.cert_iso22000) certifications.push("ISO 22000")
          if (s.cert_haccp) certifications.push("HACCP")
          if (s.cert_organico) certifications.push("Orgânico")
          if (s.cert_kosher) certifications.push("Kosher")
          if (s.cert_halal) certifications.push("Halal")
          if (s.cert_outras) certifications.push("Outras")

          let status = "Ativo"
          if (s.situacao === "Bloqueado") {
            status = "Bloqueado"
          } else if (!s.status_ativo) {
            status = "Inativo"
          }

          return {
            id: s.id,
            name: s.razao_social || s.nome_fantasia || "Sem Razão Social",
            nuit: s.nuit,
            contact: `${s.email_principal || ""} / ${s.telefone_principal || ""}`,
            score: 85, // Score padrão
            certifications,
            status,
          }
        })
        setSuppliers(mapped)
      } else {
        setSuppliers([])
      }
    } catch (err) {
      console.error("Erro ao carregar fornecedores da API, usando mockData", err)
      setSuppliers(mockSuppliers)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  // Filter and sort suppliers
  const filteredSuppliers = useMemo(() => {
    let filtered = [...suppliers]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nuit.includes(searchQuery) ||
          s.contact.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "Todos") {
      filtered = filtered.filter((s) => s.status === statusFilter)
    }

    // Score filter
    if (scoreFilter !== "Todos") {
      if (scoreFilter === "Excelente") {
        filtered = filtered.filter((s) => s.score >= 90)
      } else if (scoreFilter === "Bom") {
        filtered = filtered.filter((s) => s.score >= 70 && s.score < 90)
      } else if (scoreFilter === "Regular") {
        filtered = filtered.filter((s) => s.score >= 50 && s.score < 70)
      } else if (scoreFilter === "Ruim") {
        filtered = filtered.filter((s) => s.score < 50)
      }
    }

    // Certification filter
    if (certificationFilter !== "Todos") {
      filtered = filtered.filter((s) => s.certifications.includes(certificationFilter))
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]

      if (typeof aValue === "string") aValue = aValue.toLowerCase()
      if (typeof bValue === "string") bValue = bValue.toLowerCase()

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [suppliers, searchQuery, statusFilter, scoreFilter, certificationFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(paginatedSuppliers.map((s) => s.id))
    } else {
      setSelectedSuppliers([])
    }
  }

  const handleSelectSupplier = (supplierId: string, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers([...selectedSuppliers, supplierId])
    } else {
      setSelectedSuppliers(selectedSuppliers.filter((id) => id !== supplierId))
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("Todos")
    setScoreFilter("Todos")
    setCertificationFilter("Todos")
  }

  const handleExport = (format: string) => {
    const itemsToExport = selectedSuppliers.length > 0
      ? suppliers.filter(s => selectedSuppliers.includes(s.id))
      : filteredSuppliers

    if (itemsToExport.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Não existem fornecedores para exportar.",
      })
      return
    }

    if (format === "CSV" || format === "XLSX") {
      const headers = ["Nome/Razão Social", "NUIT", "Contato Principal", "Score", "Certificações", "Status"]
      const rows = itemsToExport.map(s => [
        s.name,
        s.nuit,
        s.contact,
        s.score,
        s.certifications.join(" | "),
        s.status
      ])

      const csvContent = [headers, ...rows]
        .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
        .join("\n")

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `fornecedores_${new Date().toISOString().slice(0, 10)}.${format === "XLSX" ? "xls" : "csv"}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (format === "PDF") {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Relatório de Fornecedores - StockSafe</title>
              <style>
                body { font-family: sans-serif; padding: 20px; color: #333; }
                h1 { color: #800020; border-bottom: 2px solid #800020; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                th { background-color: #f3f4f6; font-weight: bold; }
                .footer { margin-top: 30px; font-size: 10px; color: #666; text-align: center; }
              </style>
            </head>
            <body>
              <h1>Relatório de Fornecedores</h1>
              <p>Gerado em: ${new Date().toLocaleString()}</p>
              <table>
                <thead>
                  <tr>
                    <th>Nome / Razão Social</th>
                    <th>NUIT</th>
                    <th>Contato Principal</th>
                    <th>Score</th>
                    <th>Certificações</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsToExport.map(s => `
                    <tr>
                      <td>${s.name}</td>
                      <td>${s.nuit}</td>
                      <td>${s.contact}</td>
                      <td>${s.score}</td>
                      <td>${s.certifications.join(", ") || "-"}</td>
                      <td>${s.status}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
              <div class="footer">StockSafe - Sistema de Gestão de Estoque e Validades</div>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }

    toast({
      title: "Exportação concluída",
      description: `${itemsToExport.length} fornecedores exportados com sucesso em formato ${format}.`,
    })
    setShowExportModal(false)
  }

  const handleBlock = async () => {
    if (!supplierToBlock) return
    try {
      await fornecedorService.atualizar(supplierToBlock, { situacao: "Bloqueado" })
      toast({
        title: "Fornecedor bloqueado",
        description: "O fornecedor foi bloqueado com sucesso.",
      })
      fetchSuppliers()
    } catch (err) {
      toast({
        title: "Erro ao bloquear",
        description: "Não foi possível bloquear o fornecedor.",
        variant: "destructive",
      })
    } finally {
      setShowBlockModal(false)
      setSupplierToBlock(null)
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <span>Cadastros</span>
        {" / "}
        <span className="text-foreground">Fornecedores</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">Fornecedores</h1>
        <Link href="/cadastros/fornecedores/novo">
          <Button className="bg-imperial hover:bg-imperial">
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <label className="text-sm font-medium mb-2 block">Busca Global</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, NUIT, contato..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-[150px]">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Score Filter */}
          <div className="w-[180px]">
            <label className="text-sm font-medium mb-2 block">Score</label>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Excelente">Excelente {">"}90</SelectItem>
                <SelectItem value="Bom">Bom 70-90</SelectItem>
                <SelectItem value="Regular">Regular 50-70</SelectItem>
                <SelectItem value="Ruim">Ruim {"<"}50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Certification Filter */}
          <div className="w-[180px]">
            <label className="text-sm font-medium mb-2 block">Certificações</label>
            <Select value={certificationFilter} onValueChange={setCertificationFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todas</SelectItem>
                <SelectItem value="ISO 9001">ISO 9001</SelectItem>
                <SelectItem value="ISO 22000">ISO 22000</SelectItem>
                <SelectItem value="HACCP">HACCP</SelectItem>
                <SelectItem value="Orgânico">Orgânico</SelectItem>
                <SelectItem value="Kosher">Kosher</SelectItem>
                <SelectItem value="Halal">Halal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <Button variant="outline" onClick={clearFilters}>
            Limpar Filtros
          </Button>

          {/* Export */}
          <Button
            variant="outline"
            className="text-imperial border-imperial bg-transparent"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedSuppliers.length > 0 && (
        <div className="bg-twilight border border-twilight rounded-lg p-4 mb-4 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedSuppliers.length}{" "}
            {selectedSuppliers.length === 1 ? "fornecedor selecionado" : "fornecedores selecionados"}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>
              Exportar Selecionados
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedSuppliers([])}>
              <X className="w-4 h-4 mr-1" />
              Cancelar Seleção
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum fornecedor cadastrado</h3>
          <p className="text-muted-foreground mb-4">Comece cadastrando seu primeiro fornecedor</p>
          <Link href="/cadastros/fornecedores/novo">
            <Button className="bg-imperial hover:bg-imperial">Cadastrar Primeiro Fornecedor</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        checked={
                          selectedSuppliers.length === paginatedSuppliers.length && paginatedSuppliers.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        Nome/Razão Social
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("nuit")}
                    >
                      <div className="flex items-center gap-2">
                        NUIT
                        <SortIcon field="nuit" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contato Principal</th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("score")}
                    >
                      <div className="flex items-center gap-2">
                        Score de Conformidade
                        <SortIcon field="score" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Certificações</th>
                    <th
                      className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedSuppliers.includes(supplier.id)}
                          onCheckedChange={(checked) => handleSelectSupplier(supplier.id, checked as boolean)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/cadastros/fornecedores/${supplier.id}`}
                          className="text-sm font-medium text-imperial hover:text-imperial hover:underline"
                        >
                          {supplier.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">{supplier.nuit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 max-w-[250px] truncate" title={supplier.contact}>
                          {supplier.contact}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Progress value={supplier.score} className="h-2 flex-1" />
                            <span className={`text-sm font-semibold ${getScoreColor(supplier.score)}`}>
                              {supplier.score}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">{getScoreLabel(supplier.score)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {supplier.certifications.length > 0 ? (
                            supplier.certifications.map((cert: string) => (
                              <Badge key={cert} className={certificationColors[cert] || "bg-gray-100 text-gray-800"}>
                                {cert}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={supplier.status === "Ativo" ? "default" : "secondary"}
                          className={
                            supplier.status === "Ativo"
                              ? "bg-imperial"
                              : supplier.status === "Bloqueado"
                                ? "bg-red-600"
                                : ""
                          }
                        >
                          {supplier.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/cadastros/fornecedores/${supplier.id}/editar`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4 text-gray-600" />
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
                                <Link href={`/cadastros/fornecedores/${supplier.id}`} className="flex items-center">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalhes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Ver Histórico de Compras
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Ver Não Conformidades
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSupplierToBlock(supplier.id)
                                  setShowBlockModal(true)
                                }}
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Bloquear
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={async () => {
                                  try {
                                    await fornecedorService.atualizar(supplier.id, { status_ativo: false })
                                    toast({
                                      title: "Fornecedor desativado",
                                      description: "O fornecedor foi desativado com sucesso.",
                                    })
                                    fetchSuppliers()
                                  } catch (err) {
                                    toast({
                                      title: "Erro",
                                      description: "Não foi possível desativar o fornecedor.",
                                      variant: "destructive"
                                    })
                                  }
                                }}
                              >
                                <Power className="w-4 h-4 mr-2" />
                                Desativar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Itens por página:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-4">
                Mostrando {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredSuppliers.length)} de {filteredSuppliers.length}{" "}
                fornecedores
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-imperial hover:bg-imperial" : ""}
                  >
                    {pageNum}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Fornecedores</DialogTitle>
            <DialogDescription>
              Selecione o formato de exportação para{" "}
              {selectedSuppliers.length > 0
                ? `${selectedSuppliers.length} fornecedores selecionados`
                : `${filteredSuppliers.length} fornecedores`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button variant="outline" className="justify-start bg-transparent" onClick={() => handleExport("XLSX")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar como Excel (.xlsx)
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" onClick={() => handleExport("CSV")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar como CSV (.csv)
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" onClick={() => handleExport("PDF")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar como PDF (.pdf)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Modal */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear Fornecedor</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja bloquear este fornecedor? Ele não poderá mais receber novos pedidos até ser
              desbloqueado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleBlock}>
              Bloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




