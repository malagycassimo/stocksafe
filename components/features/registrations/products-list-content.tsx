// "use client"

// import { useState, useMemo } from "react"
// import Link from "next/link"
// import {
//   Search,
//   Download,
//   Plus,
//   MoreVertical,
//   Edit,
//   Eye,
//   Copy,
//   Power,
//   ChevronUp,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   Package,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { useToast } from "@/hooks/use-toast"

// // Mock data
// const mockProducts = [
//   {
//     id: "1",
//     sku: "ALM-001",
//     description: "Arroz Branco Tipo 1 - Pacote 5kg",
//     category: "Seco",
//     shelfLife: 365,
//     minEntryValidity: "80%",
//     lotControl: true,
//     status: "Ativo",
//   },
//   {
//     id: "2",
//     sku: "FRS-045",
//     description: "Filé de Frango Congelado - 1kg",
//     category: "Congelado",
//     shelfLife: 180,
//     minEntryValidity: "90 dias",
//     lotControl: true,
//     status: "Ativo",
//   },
//   {
//     id: "3",
//     sku: "BEB-120",
//     description: "Suco de Laranja Natural - 1L",
//     category: "Bebidas",
//     shelfLife: 7,
//     minEntryValidity: "5 dias",
//     lotControl: true,
//     status: "Ativo",
//   },
//   {
//     id: "4",
//     sku: "LMP-089",
//     description: "Detergente Líquido Neutro - 500ml",
//     category: "Limpeza",
//     shelfLife: 730,
//     minEntryValidity: "60%",
//     lotControl: false,
//     status: "Ativo",
//   },
//   {
//     id: "5",
//     sku: "FRS-012",
//     description: "Alface Americana Orgânica - Unidade",
//     category: "Fresco",
//     shelfLife: 5,
//     minEntryValidity: "3 dias",
//     lotControl: true,
//     status: "Ativo",
//   },
//   {
//     id: "6",
//     sku: "SEC-078",
//     description: "Macarrão Espaguete Integral - 500g",
//     category: "Seco",
//     shelfLife: 540,
//     minEntryValidity: "75%",
//     lotControl: false,
//     status: "Inativo",
//   },
// ]

// type SortField = "sku" | "description" | "category" | "shelfLife" | "status"
// type SortDirection = "asc" | "desc"

// const categoryColors: Record<string, string> = {
//   Fresco: "bg-green-100 text-green-800",
//   Seco: "bg-yellow-100 text-yellow-800",
//   Congelado: "bg-blue-100 text-blue-800",
//   Bebidas: "bg-purple-100 text-purple-800",
//   Limpeza: "bg-gray-100 text-gray-800",
//   Outros: "bg-orange-100 text-orange-800",
// }

// export function ProductsListContent() {
//   const { toast } = useToast()
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([])
//   const [statusFilter, setStatusFilter] = useState("Todos")
//   const [lotControlFilter, setLotControlFilter] = useState("Todos")
//   const [sortField, setSortField] = useState<SortField>("sku")
//   const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage, setItemsPerPage] = useState(25)
//   const [selectedProducts, setSelectedProducts] = useState<string[]>([])
//   const [showExportModal, setShowExportModal] = useState(false)
//   const [showDeactivateModal, setShowDeactivateModal] = useState(false)
//   const [productToDeactivate, setProductToDeactivate] = useState<string | null>(null)

//   // Filter and sort products
//   const filteredProducts = useMemo(() => {
//     let filtered = mockProducts

//     // Search filter
//     if (searchQuery) {
//       filtered = filtered.filter(
//         (p) =>
//           p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           p.description.toLowerCase().includes(searchQuery.toLowerCase()),
//       )
//     }

//     // Category filter
//     if (selectedCategories.length > 0) {
//       filtered = filtered.filter((p) => selectedCategories.includes(p.category))
//     }

//     // Status filter
//     if (statusFilter !== "Todos") {
//       filtered = filtered.filter((p) => p.status === statusFilter)
//     }

//     // Lot control filter
//     if (lotControlFilter !== "Todos") {
//       const hasLotControl = lotControlFilter === "Sim"
//       filtered = filtered.filter((p) => p.lotControl === hasLotControl)
//     }

//     // Sort
//     filtered.sort((a, b) => {
//       let aValue: string | number = a[sortField]
//       let bValue: string | number = b[sortField]

//       if (typeof aValue === "string") aValue = aValue.toLowerCase()
//       if (typeof bValue === "string") bValue = bValue.toLowerCase()

//       if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
//       if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
//       return 0
//     })

//     return filtered
//   }, [searchQuery, selectedCategories, statusFilter, lotControlFilter, sortField, sortDirection])

//   // Pagination
//   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
//   const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

//   const handleSort = (field: SortField) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc")
//     } else {
//       setSortField(field)
//       setSortDirection("asc")
//     }
//   }

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       setSelectedProducts(paginatedProducts.map((p) => p.id))
//     } else {
//       setSelectedProducts([])
//     }
//   }

//   const handleSelectProduct = (productId: string, checked: boolean) => {
//     if (checked) {
//       setSelectedProducts([...selectedProducts, productId])
//     } else {
//       setSelectedProducts(selectedProducts.filter((id) => id !== productId))
//     }
//   }

//   const clearFilters = () => {
//     setSearchQuery("")
//     setSelectedCategories([])
//     setStatusFilter("Todos")
//     setLotControlFilter("Todos")
//   }

//   const handleExport = (format: string) => {
//     toast({
//       title: "Exportação iniciada",
//       description: `Exportando ${selectedProducts.length > 0 ? selectedProducts.length : filteredProducts.length} produtos para ${format}`,
//     })
//     setShowExportModal(false)
//   }

//   const handleDeactivate = () => {
//     toast({
//       title: "Produto desativado",
//       description: "O produto foi desativado com sucesso.",
//     })
//     setShowDeactivateModal(false)
//     setProductToDeactivate(null)
//   }

//   const handleBulkDeactivate = () => {
//     toast({
//       title: "Produtos desativados",
//       description: `${selectedProducts.length} produtos foram desativados com sucesso.`,
//     })
//     setSelectedProducts([])
//   }

//   const SortIcon = ({ field }: { field: SortField }) => {
//     if (sortField !== field) return null
//     return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
//   }

//   return (
//     <div className="p-6">
//       {/* Breadcrumb */}
//       <div className="text-sm text-muted-foreground mb-4">
//         <Link href="/dashboard" className="hover:text-emerald-600">
//           Home
//         </Link>
//         {" / "}
//         <span>Cadastros</span>
//         {" / "}
//         <span className="text-foreground">Produtos</span>
//       </div>

//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-bold text-emerald-700">Produtos</h1>
//         <Link href="/cadastros/produtos/novo">
//           <Button className="bg-emerald-600 hover:bg-emerald-700">
//             <Plus className="w-4 h-4 mr-2" />
//             Novo Produto
//           </Button>
//         </Link>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
//         <div className="flex flex-wrap gap-4 items-end">
//           {/* Search */}
//           <div className="flex-1 min-w-[300px]">
//             <label className="text-sm font-medium mb-2 block">Busca Global</label>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Buscar por SKU, descrição..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           {/* Category Filter */}
//           <div className="w-[200px]">
//             <label className="text-sm font-medium mb-2 block">Categoria</label>
//             <Select
//               value={selectedCategories.length === 1 ? selectedCategories[0] : "Todos"}
//               onValueChange={(value) => setSelectedCategories(value ? [value] : [])}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Todas as categorias" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Todos">Todas as categorias</SelectItem>
//                 <SelectItem value="Fresco">Fresco</SelectItem>
//                 <SelectItem value="Seco">Seco</SelectItem>
//                 <SelectItem value="Congelado">Congelado</SelectItem>
//                 <SelectItem value="Bebidas">Bebidas</SelectItem>
//                 <SelectItem value="Limpeza">Limpeza</SelectItem>
//                 <SelectItem value="Outros">Outros</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Status Filter */}
//           <div className="w-[150px]">
//             <label className="text-sm font-medium mb-2 block">Status</label>
//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Todos">Todos</SelectItem>
//                 <SelectItem value="Ativo">Ativo</SelectItem>
//                 <SelectItem value="Inativo">Inativo</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Lot Control Filter */}
//           <div className="w-[180px]">
//             <label className="text-sm font-medium mb-2 block">Controle por Lote</label>
//             <Select value={lotControlFilter} onValueChange={setLotControlFilter}>
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Todos">Todos</SelectItem>
//                 <SelectItem value="Sim">Sim</SelectItem>
//                 <SelectItem value="Não">Não</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Clear Filters */}
//           <Button variant="outline" onClick={clearFilters}>
//             Limpar Filtros
//           </Button>

//           {/* Export */}
//           <Button
//             variant="outline"
//             className="text-emerald-600 border-emerald-600 bg-transparent"
//             onClick={() => setShowExportModal(true)}
//           >
//             <Download className="w-4 h-4 mr-2" />
//             Exportar
//           </Button>
//         </div>
//       </div>

//       {/* Bulk Actions Bar */}
//       {selectedProducts.length > 0 && (
//         <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4 flex items-center justify-between">
//           <span className="text-sm font-medium">
//             {selectedProducts.length} {selectedProducts.length === 1 ? "produto selecionado" : "produtos selecionados"}
//           </span>
//           <div className="flex gap-2">
//             <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>
//               Exportar Selecionados
//             </Button>
//             <Button variant="outline" size="sm" className="text-red-600 bg-transparent" onClick={handleBulkDeactivate}>
//               Desativar Selecionados
//             </Button>
//             <Button variant="ghost" size="sm" onClick={() => setSelectedProducts([])}>
//               <X className="w-4 h-4 mr-1" />
//               Cancelar Seleção
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Table */}
//       {filteredProducts.length === 0 ? (
//         <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
//           <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
//           <p className="text-muted-foreground mb-4">Comece cadastrando seu primeiro produto</p>
//           <Link href="/cadastros/produtos/novo">
//             <Button className="bg-emerald-600 hover:bg-emerald-700">Cadastrar Primeiro Produto</Button>
//           </Link>
//         </div>
//       ) : (
//         <>
//           <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b border-gray-200">
//                   <tr>
//                     <th className="w-12 px-4 py-3">
//                       <Checkbox
//                         checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
//                         onCheckedChange={handleSelectAll}
//                       />
//                     </th>
//                     <th
//                       className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
//                       onClick={() => handleSort("sku")}
//                     >
//                       <div className="flex items-center gap-2">
//                         SKU
//                         <SortIcon field="sku" />
//                       </div>
//                     </th>
//                     <th
//                       className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
//                       onClick={() => handleSort("description")}
//                     >
//                       <div className="flex items-center gap-2">
//                         Descrição
//                         <SortIcon field="description" />
//                       </div>
//                     </th>
//                     <th
//                       className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
//                       onClick={() => handleSort("category")}
//                     >
//                       <div className="flex items-center gap-2">
//                         Categoria
//                         <SortIcon field="category" />
//                       </div>
//                     </th>
//                     <th
//                       className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
//                       onClick={() => handleSort("shelfLife")}
//                     >
//                       <div className="flex items-center justify-center gap-2">
//                         Vida Útil
//                         <SortIcon field="shelfLife" />
//                       </div>
//                     </th>
//                     <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
//                       Validade Mínima Entrada
//                     </th>
//                     <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Controle por Lote</th>
//                     <th
//                       className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
//                       onClick={() => handleSort("status")}
//                     >
//                       <div className="flex items-center justify-center gap-2">
//                         Status
//                         <SortIcon field="status" />
//                       </div>
//                     </th>
//                     <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px]">Ações</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {paginatedProducts.map((product) => (
//                     <tr key={product.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3">
//                         <Checkbox
//                           checked={selectedProducts.includes(product.id)}
//                           onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
//                         />
//                       </td>
//                       <td className="px-4 py-3">
//                         <Link
//                           href={`/cadastros/produtos/${product.id}`}
//                           className="font-mono text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
//                         >
//                           {product.sku}
//                         </Link>
//                       </td>
//                       <td className="px-4 py-3">
//                         <Link
//                           href={`/cadastros/produtos/${product.id}`}
//                           className="text-sm hover:text-emerald-600 hover:underline"
//                           title={product.description}
//                         >
//                           {product.description}
//                         </Link>
//                       </td>
//                       <td className="px-4 py-3">
//                         <Badge className={categoryColors[product.category]}>{product.category}</Badge>
//                       </td>
//                       <td className="px-4 py-3 text-center text-sm">{product.shelfLife} dias</td>
//                       <td className="px-4 py-3 text-center text-sm">{product.minEntryValidity}</td>
//                       <td className="px-4 py-3 text-center">
//                         <span className="text-lg">{product.lotControl ? "✅" : "➖"}</span>
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         <Badge
//                           variant={product.status === "Ativo" ? "default" : "secondary"}
//                           className={product.status === "Ativo" ? "bg-emerald-600" : ""}
//                         >
//                           {product.status}
//                         </Badge>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center justify-center gap-2">
//                           <Link href={`/cadastros/produtos/${product.id}/editar`}>
//                             <Button variant="ghost" size="sm">
//                               <Edit className="w-4 h-4 text-gray-600" />
//                             </Button>
//                           </Link>
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant="ghost" size="sm">
//                                 <MoreVertical className="w-4 h-4 text-gray-600" />
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               <DropdownMenuItem asChild>
//                                 <Link href={`/cadastros/produtos/${product.id}`} className="flex items-center">
//                                   <Eye className="w-4 h-4 mr-2" />
//                                   Ver Detalhes
//                                 </Link>
//                               </DropdownMenuItem>
//                               <DropdownMenuItem>
//                                 <Copy className="w-4 h-4 mr-2" />
//                                 Duplicar
//                               </DropdownMenuItem>
//                               <DropdownMenuSeparator />
//                               <DropdownMenuItem
//                                 className="text-red-600"
//                                 onClick={() => {
//                                   setProductToDeactivate(product.id)
//                                   setShowDeactivateModal(true)
//                                 }}
//                               >
//                                 <Power className="w-4 h-4 mr-2" />
//                                 Desativar
//                               </DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Pagination */}
//           <div className="mt-4 flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-muted-foreground">Itens por página:</span>
//               <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
//                 <SelectTrigger className="w-[80px]">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="10">10</SelectItem>
//                   <SelectItem value="25">25</SelectItem>
//                   <SelectItem value="50">50</SelectItem>
//                   <SelectItem value="100">100</SelectItem>
//                 </SelectContent>
//               </Select>
//               <span className="text-sm text-muted-foreground ml-4">
//                 Mostrando {(currentPage - 1) * itemsPerPage + 1}-
//                 {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} produtos
//               </span>
//             </div>

//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setCurrentPage(currentPage - 1)}
//                 disabled={currentPage === 1}
//               >
//                 <ChevronLeft className="w-4 h-4 mr-1" />
//                 Anterior
//               </Button>

//               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                 let pageNum
//                 if (totalPages <= 5) {
//                   pageNum = i + 1
//                 } else if (currentPage <= 3) {
//                   pageNum = i + 1
//                 } else if (currentPage >= totalPages - 2) {
//                   pageNum = totalPages - 4 + i
//                 } else {
//                   pageNum = currentPage - 2 + i
//                 }

//                 return (
//                   <Button
//                     key={pageNum}
//                     variant={currentPage === pageNum ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setCurrentPage(pageNum)}
//                     className={currentPage === pageNum ? "bg-emerald-600 hover:bg-emerald-700" : ""}
//                   >
//                     {pageNum}
//                   </Button>
//                 )
//               })}

//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setCurrentPage(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//               >
//                 Próximo
//                 <ChevronRight className="w-4 h-4 ml-1" />
//               </Button>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Export Modal */}
//       <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Exportar Produtos</DialogTitle>
//             <DialogDescription>
//               Selecione o formato de exportação para{" "}
//               {selectedProducts.length > 0
//                 ? `${selectedProducts.length} produtos selecionados`
//                 : `${filteredProducts.length} produtos`}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-3 py-4">
//             <Button variant="outline" className="justify-start bg-transparent" onClick={() => handleExport("XLSX")}>
//               <Download className="w-4 h-4 mr-2" />
//               Exportar como Excel (.xlsx)
//             </Button>
//             <Button variant="outline" className="justify-start bg-transparent" onClick={() => handleExport("CSV")}>
//               <Download className="w-4 h-4 mr-2" />
//               Exportar como CSV (.csv)
//             </Button>
//             <Button variant="outline" className="justify-start bg-transparent" onClick={() => handleExport("PDF")}>
//               <Download className="w-4 h-4 mr-2" />
//               Exportar como PDF (.pdf)
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Deactivate Confirmation Modal */}
//       <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Desativar Produto</DialogTitle>
//             <DialogDescription>
//               Tem certeza que deseja desativar este produto? Ele não aparecerá mais nas listagens ativas, mas poderá ser
//               reativado posteriormente.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowDeactivateModal(false)}>
//               Cancelar
//             </Button>
//             <Button variant="destructive" onClick={handleDeactivate}>
//               Desativar
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }


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
  Copy,
  Power,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
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
import { produtoService, ProdutoData } from "@/app/services/produtoService"

type SortField = "sku" | "descricao" | "categoria" | "vida_util_dias" | "status_ativo"
type SortDirection = "asc" | "desc"

const categoryColors: Record<string, string> = {
  Fresco: "bg-green-100 text-green-800",
  Seco: "bg-yellow-100 text-yellow-800",
  Congelado: "bg-blue-100 text-blue-800",
  Bebidas: "bg-purple-100 text-purple-800",
  Limpeza: "bg-gray-100 text-gray-800",
  Outros: "bg-orange-100 text-orange-800",
}

export function ProductsListContent() {
  const { toast } = useToast()

  // Estados de dados da API
  const [products, setProducts] = useState<ProdutoData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Estados de filtros e paginação
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [lotControlFilter, setLotControlFilter] = useState("Todos")
  const [sortField, setSortField] = useState<SortField>("sku")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showExportModal, setShowExportModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [productToDeactivate, setProductToDeactivate] = useState<string | null>(null)

  // 🔄 CARREGAR DADOS DO BACKEND
  const carregarProdutos = async () => {
    setIsLoading(true)
    try {
      const dados = await produtoService.listarTodos()
      setProducts(dados)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro de Conexão",
        description: "Não foi possível carregar a lista de produtos a partir do servidor.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarProdutos()
  }, [])

  // Filtros e Ordenação reativos via useMemo baseados no estado `products` da API
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.descricao.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.categoria))
    }

    if (statusFilter !== "Todos") {
      const desejaAtivo = statusFilter === "Ativo"
      filtered = filtered.filter((p) => p.status_ativo === desejaAtivo)
    }

    if (lotControlFilter !== "Todos") {
      const hasLotControl = lotControlFilter === "Sim"
      filtered = filtered.filter((p) => p.controle_lote === hasLotControl)
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (typeof aValue === "string") aValue = aValue.toLowerCase()
      if (typeof bValue === "string") bValue = bValue.toLowerCase()

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [products, searchQuery, selectedCategories, statusFilter, lotControlFilter, sortField, sortDirection])

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
      setSelectedProducts(paginatedProducts.map((p) => p.id!).filter(Boolean))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setStatusFilter("Todos")
    setLotControlFilter("Todos")
  }

  const handleExport = (format: string) => {
    const itemsToExport = selectedProducts.length > 0
      ? products.filter(p => selectedProducts.includes(p.id!))
      : filteredProducts

    if (itemsToExport.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Não existem produtos para exportar.",
      })
      return
    }

    if (format === "CSV" || format === "XLSX") {
      const headers = ["SKU", "Descrição", "Categoria", "Vida Útil (Dias)", "Validade Mínima Recebimento (%)", "Controle Lote", "Status"]
      const rows = itemsToExport.map(p => [
        p.sku,
        p.descricao,
        p.categoria,
        p.vida_util_dias,
        p.validade_min_recebimento,
        p.controle_lote ? "Sim" : "Não",
        p.status_ativo ? "Ativo" : "Inativo"
      ])

      const csvContent = [headers, ...rows]
        .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
        .join("\n")

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `produtos_${new Date().toISOString().slice(0, 10)}.${format === "XLSX" ? "xls" : "csv"}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (format === "PDF") {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Relatório de Produtos - StockSafe</title>
              <style>
                body { font-family: sans-serif; padding: 20px; color: #333; }
                h1 { color: #047857; border-bottom: 2px solid #047857; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                th { background-color: #f3f4f6; font-weight: bold; }
                .footer { margin-top: 30px; font-size: 10px; color: #666; text-align: center; }
              </style>
            </head>
            <body>
              <h1>Relatório de Produtos</h1>
              <p>Gerado em: ${new Date().toLocaleString()}</p>
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Vida Útil</th>
                    <th>Validade Mínima</th>
                    <th>Controle Lote</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsToExport.map(p => `
                    <tr>
                      <td>${p.sku}</td>
                      <td>${p.descricao}</td>
                      <td>${p.categoria}</td>
                      <td>${p.vida_util_dias} dias</td>
                      <td>${p.validade_min_recebimento}%</td>
                      <td>${p.controle_lote ? "Sim" : "Não"}</td>
                      <td>${p.status_ativo ? "Ativo" : "Inativo"}</td>
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
      description: `${itemsToExport.length} produtos exportados com sucesso em formato ${format}.`,
    })
    setShowExportModal(false)
  }

  // 🔄 DESACTIVAR PRODUTO NO BANCO VIA API
  const handleDeactivate = async () => {
    if (!productToDeactivate) return

    try {
      await produtoService.atualizar(productToDeactivate, { status_ativo: false })
      toast({
        title: "Produto desativado",
        description: "O produto foi desativado no inventário do StockSafe.",
      })
      carregarProdutos()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha na operação",
        description: "Não foi possível desativar o produto no servidor.",
      })
    } finally {
      setShowDeactivateModal(false)
      setProductToDeactivate(null)
    }
  }

  // 🔄 DESACTIVAR VÁRIOS EM LOTE VIA API
  const handleBulkDeactivate = async () => {
    try {
      await Promise.all(selectedProducts.map((id) => produtoService.atualizar(id, { status_ativo: false })))
      toast({
        title: "Produtos desativados",
        description: `${selectedProducts.length} produtos foram desativados com sucesso.`,
      })
      setSelectedProducts([])
      carregarProdutos()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na desativação em lote",
        description: "Ocorreu um problema ao tentar atualizar os produtos.",
      })
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
        <Link href="/dashboard" className="hover:text-emerald-600">Home</Link>
        {" / "}
        <span>Cadastros</span>
        {" / "}
        <span className="text-foreground">Produtos</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-emerald-700">Produtos</h1>
        <Link href="/cadastros/produtos/novo">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[300px]">
            <label className="text-sm font-medium mb-2 block">Busca Global</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por SKU, descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-[200px]">
            <label className="text-sm font-medium mb-2 block">Categoria</label>
            <Select
              value={selectedCategories.length === 1 ? selectedCategories[0] : "Todos"}
              onValueChange={(value) => setSelectedCategories(value && value !== "Todos" ? [value] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todas as categorias</SelectItem>
                <SelectItem value="Fresco">Fresco</SelectItem>
                <SelectItem value="Seco">Seco</SelectItem>
                <SelectItem value="Congelado">Congelado</SelectItem>
                <SelectItem value="Bebidas">Bebidas</SelectItem>
                <SelectItem value="Limpeza">Limpeza</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              </SelectContent>
            </Select>
          </div>

          <div className="w-[180px]">
            <label className="text-sm font-medium mb-2 block">Controle por Lote</label>
            <Select value={lotControlFilter} onValueChange={setLotControlFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Sim">Sim</SelectItem>
                <SelectItem value="Não">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>

          <Button
            variant="outline"
            className="text-emerald-600 border-emerald-600 bg-transparent"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedProducts.length} {selectedProducts.length === 1 ? "produto selecionado" : "produtos selecionados"}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>Exportar Selecionados</Button>
            <Button variant="outline" size="sm" className="text-red-600 bg-transparent" onClick={handleBulkDeactivate}>
              Desativar Selecionados
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedProducts([])}>
              <X className="w-4 h-4 mr-1" /> Cancelar Seleção
            </Button>
          </div>
        </div>
      )}

      {/* Table States */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-muted-foreground">
          A carregar os dados reais do inventário...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground mb-4">Tente ajustar os seus filtros ou registe um novo produto.</p>
          <Link href="/cadastros/produtos/novo">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Cadastrar Primeiro Produto</Button>
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
                        checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("sku")}>
                      <div className="flex items-center gap-2">SKU <SortIcon field="sku" /></div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("descricao")}>
                      <div className="flex items-center gap-2">Descrição <SortIcon field="descricao" /></div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("categoria")}>
                      <div className="flex items-center gap-2">Categoria <SortIcon field="categoria" /></div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("vida_util_dias")}>
                      <div className="flex items-center justify-center gap-2">Vida Útil <SortIcon field="vida_util_dias" /></div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Validade Mínima Entrada</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Controle por Lote</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("status_ativo")}>
                      <div className="flex items-center justify-center gap-2">Status <SortIcon field="status_ativo" /></div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedProducts.includes(product.id!)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id!, checked as boolean)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/cadastros/produtos/${product.id}`} className="font-mono text-sm text-emerald-600 hover:text-emerald-700 hover:underline">
                          {product.sku}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/cadastros/produtos/${product.id}`} className="text-sm hover:text-emerald-600 hover:underline" title={product.descricao}>
                          {product.descricao}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={categoryColors[product.categoria] || "bg-gray-100 text-gray-800"}>{product.categoria}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{product.vida_util_dias} dias</td>
                      <td className="px-4 py-3 text-center text-sm">{product.validade_min_recebimento}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-lg">{product.controle_lote ? "✅" : "➖"}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={product.status_ativo ? "default" : "secondary"} className={product.status_ativo ? "bg-emerald-600" : ""}>
                          {product.status_ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/cadastros/produtos/${product.id}/editar`}>
                            <Button variant="ghost" size="sm"><Edit className="w-4 h-4 text-gray-600" /></Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4 text-gray-600" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/cadastros/produtos/${product.id}`} className="flex items-center">
                                  <Eye className="w-4 h-4 mr-2" /> Ver Detalhes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem><Copy className="w-4 h-4 mr-2" /> Duplicar</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setProductToDeactivate(product.id!)
                                  setShowDeactivateModal(true)
                                }}
                              >
                                <Power className="w-4 h-4 mr-2" /> Desativar
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

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Itens por página:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-4">
                Mostrando {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} produtos
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                Próximo <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modals para Exportação e Desactivação */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Produtos</DialogTitle>
            <DialogDescription>
              Selecione o formato de exportação para{" "}
              {selectedProducts.length > 0 ? `${selectedProducts.length} produtos selecionados` : `${filteredProducts.length} produtos`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button variant="outline" className="justify-start bg-transparent" onClick={() => handleExport("XLSX")}>
              <Download className="w-4 h-4 mr-2" /> Exportar como Excel (.xlsx)
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" onClick={() => handleExport("CSV")}>
              <Download className="w-4 h-4 mr-2" /> Exportar como CSV (.csv)
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" onClick={() => handleExport("PDF")}>
              <Download className="w-4 h-4 mr-2" /> Exportar como PDF (.pdf)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar Produto</DialogTitle>
            <DialogDescription>Tem certeza que deseja desativar este produto? Ele não aparecerá mais nas listagens ativas.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeactivate}>Desativar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}