"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Printer,
  Maximize2,
  Minimize2,
  Warehouse,
  Thermometer,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { localService, LocalData } from "@/app/services/localService"

interface LocationNode {
  id: string
  code: string
  name: string
  type: "warehouse" | "zone" | "corridor" | "shelf" | "position"
  parentId?: string
  temperature?: { min: number; max: number }
  humidity?: { min: number; max: number }
  capacity: { max: number; current: number }
  dimensions?: { length: number; width: number; height: number }
  children?: LocationNode[]
}

const mockLocationsFallback: LocationNode[] = [
  {
    id: "1",
    code: "ARM01",
    name: "Armazém Principal (Fallback)",
    type: "warehouse",
    capacity: { max: 1000, current: 650 },
    children: [
      {
        id: "2",
        code: "ARM01-ZF",
        name: "Zona Fria",
        type: "zone",
        parentId: "1",
        temperature: { min: 2, max: 8 },
        capacity: { max: 300, current: 180 },
      }
    ]
  }
]

const typeIcons = {
  warehouse: Warehouse,
  zone: Package,
  corridor: Package,
  shelf: Package,
  position: Package,
}

const typeColors = {
  warehouse: "text-blue-600",
  zone: "text-purple-600",
  corridor: "text-green-600",
  shelf: "text-orange-600",
  position: "text-gray-600",
}

function getNextType(currentType: string): 'ARMAZEM' | 'ZONA' | 'CORREDOR' | 'PRATELEIRA' | 'POSICAO' {
  if (currentType === "warehouse") return "ZONA";
  if (currentType === "zone") return "CORREDOR";
  if (currentType === "corridor") return "PRATELEIRA";
  if (currentType === "shelf") return "POSICAO";
  return "POSICAO";
}

export function LocationsContent() {
  const { toast } = useToast()
  const [locationsTree, setLocationsTree] = useState<LocationNode[]>([])
  const [expandedNodes, setExpandedNodes] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationNode | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Estados do Edit
  const [editLocalData, setEditLocalData] = useState<any>(null)

  // Estados do Dialog Add
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newLocalParentId, setNewLocalParentId] = useState<string | null>(null)
  const [newLocalData, setNewLocalData] = useState({
    codigo: "",
    nome: "",
    tipo: "ARMAZEM" as 'ARMAZEM' | 'ZONA' | 'CORREDOR' | 'PRATELEIRA' | 'POSICAO',
    temperatura_controlada: false,
    humidade_controlada: false,
    capacidade_maxima: 0
  })

  // Mapear dados recursivos de API para nós da UI
  const mapBackendLocalToNode = (local: any): LocationNode => {
    let nodeType: "warehouse" | "zone" | "corridor" | "shelf" | "position" = "warehouse";
    switch (local.tipo) {
      case "ARMAZEM": nodeType = "warehouse"; break;
      case "ZONA": nodeType = "zone"; break;
      case "CORREDOR": nodeType = "corridor"; break;
      case "PRATELEIRA": nodeType = "shelf"; break;
      case "POSICAO": nodeType = "position"; break;
    }

    return {
      id: local.id,
      code: local.codigo,
      name: local.nome,
      type: nodeType,
      parentId: local.local_pai_id || undefined,
      capacity: {
        max: local.capacidade_maxima || 0,
        current: local.capacidade_atual || 0
      },
      temperature: local.temperatura_controlada ? { min: 2, max: 8 } : undefined,
      humidity: local.humidade_controlada ? { min: 40, max: 60 } : undefined,
      children: local.sublocais ? local.sublocais.map(mapBackendLocalToNode) : []
    };
  }

  // Carregar locais do backend
  const fetchLocations = async () => {
    try {
      setIsLoading(true)
      const data = await localService.listarTodos()
      if (data && data.length > 0) {
        const mapped = data.map(mapBackendLocalToNode)
        setLocationsTree(mapped)
        
        // Auto-expandir os primeiros nós
        const rootIds = mapped.map(m => m.id)
        setExpandedNodes(prev => [...new Set([...prev, ...rootIds])])
      } else {
        setLocationsTree([])
      }
    } catch (err) {
      console.error("Erro ao carregar locais da API, usando mockData", err)
      setLocationsTree(mockLocationsFallback)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  // Sincronizar dados do editor
  useEffect(() => {
    if (selectedLocation) {
      setEditLocalData({
        id: selectedLocation.id,
        code: selectedLocation.code,
        name: selectedLocation.name,
        type: selectedLocation.type,
        capacityMax: selectedLocation.capacity.max,
        capacityCurrent: selectedLocation.capacity.current,
        temperatureControlled: !!selectedLocation.temperature,
        humidityControlled: !!selectedLocation.humidity,
      })
    } else {
      setEditLocalData(null)
    }
  }, [selectedLocation])

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => (prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]))
  }

  const expandAll = () => {
    const allIds: string[] = []
    const collectIds = (nodes: LocationNode[]) => {
      nodes.forEach((node) => {
        allIds.push(node.id)
        if (node.children) collectIds(node.children)
      })
    }
    collectIds(locationsTree)
    setExpandedNodes(allIds)
  }

  const collapseAll = () => {
    setExpandedNodes([])
  }

  const handleSaveEdit = async () => {
    if (!editLocalData) return
    try {
      let backendType: 'ARMAZEM' | 'ZONA' | 'CORREDOR' | 'PRATELEIRA' | 'POSICAO' = "ARMAZEM";
      switch (editLocalData.type) {
        case "warehouse": backendType = "ARMAZEM"; break;
        case "zone": backendType = "ZONA"; break;
        case "corridor": backendType = "CORREDOR"; break;
        case "shelf": backendType = "PRATELEIRA"; break;
        case "position": backendType = "POSICAO"; break;
      }

      await localService.atualizar(editLocalData.id, {
        codigo: editLocalData.code,
        nome: editLocalData.name,
        tipo: backendType,
        capacidade_maxima: Number(editLocalData.capacityMax) || 0,
        temperatura_controlada: editLocalData.temperatureControlled,
        humidade_controlada: editLocalData.humidityControlled
      })
      toast({
        title: "Sucesso",
        description: "Local atualizado com sucesso."
      })
      fetchLocations()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao atualizar local",
        variant: "destructive"
      })
    }
  }

  const handleDeleteLocal = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este local? Todos os sublocais também serão excluídos.")) return
    try {
      await localService.eliminar(id)
      toast({
        title: "Sucesso",
        description: "Local excluído com sucesso."
      })
      setSelectedLocation(null)
      fetchLocations()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao excluir local",
        variant: "destructive"
      })
    }
  }

  const handleCreateLocal = async () => {
    try {
      await localService.criar({
        codigo: newLocalData.codigo,
        nome: newLocalData.nome,
        tipo: newLocalData.tipo,
        temperatura_controlada: newLocalData.temperatura_controlada,
        humidade_controlada: newLocalData.humidade_controlada,
        capacidade_maxima: Number(newLocalData.capacidade_maxima) || 0,
        local_pai_id: newLocalParentId
      })
      toast({
        title: "Sucesso",
        description: "Local criado com sucesso."
      })
      setShowAddDialog(false)
      // Reset
      setNewLocalData({
        codigo: "",
        nome: "",
        tipo: "ARMAZEM",
        temperatura_controlada: false,
        humidade_controlada: false,
        capacidade_maxima: 0
      })
      fetchLocations()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao criar local",
        variant: "destructive"
      })
    }
  }

  const renderTree = (nodes: LocationNode[], level = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0
      const isExpanded = expandedNodes.includes(node.id)
      const Icon = typeIcons[node.type] || Package
      const isSelected = selectedLocation?.id === node.id

      return (
        <div key={node.id}>
          <div
            className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 cursor-pointer rounded transition-all duration-150 ${
              isSelected ? "bg-emerald-50 border-l-4 border-emerald-600 font-semibold" : ""
            }`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => setSelectedLocation(node)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNode(node.id)
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
            )}
            {!hasChildren && <div className="w-5" />}
            <Icon className={`w-4 h-4 ${typeColors[node.type]}`} />
            <span className="text-sm flex-1 truncate">{node.name} <span className="text-xs text-muted-foreground font-mono">({node.code})</span></span>
            {node.temperature && <Thermometer className="w-3 h-3 text-blue-500" />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="w-3 h-3 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {node.type !== "position" && (
                  <DropdownMenuItem onClick={() => {
                    setNewLocalParentId(node.id)
                    setNewLocalData(prev => ({ ...prev, tipo: getNextType(node.type) }))
                    setShowAddDialog(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Sub-nível
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setSelectedLocation(node)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar no Painel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteLocal(node.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {hasChildren && isExpanded && renderTree(node.children!, level + 1)}
        </div>
      )
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
        <span>Cadastros</span>
        {" / "}
        <span className="text-foreground">Locais</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-emerald-700">Hierarquia de Locais</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={expandAll}>
            <Maximize2 className="w-4 h-4 mr-2" />
            Expandir Todos
          </Button>
          <Button variant="outline" onClick={collapseAll}>
            <Minimize2 className="w-4 h-4 mr-2" />
            Colapsar Todos
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
            setNewLocalParentId(null)
            setNewLocalData(prev => ({ ...prev, tipo: 'ARMAZEM' }))
            setShowAddDialog(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Armazém
          </Button>
        </div>
      </div>

      {/* Two Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Tree View */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="p-4">
              <Input
                placeholder="Buscar local..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardHeader>
            <CardContent className="p-2 max-h-[calc(100vh-280px)] overflow-y-auto min-h-[400px]">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground text-sm">Carregando árvore de locais...</div>
              ) : locationsTree.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">Nenhum local cadastrado. Clique em "Novo Armazém" para começar.</div>
              ) : (
                renderTree(locationsTree)
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Details */}
        <div className="lg:col-span-3">
          {editLocalData ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">{editLocalData.name}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-red-600 bg-transparent hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => handleDeleteLocal(editLocalData.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>

              {/* Details Form */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-emerald-800">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Código do Local *</Label>
                      <Input value={editLocalData.code} onChange={(e) => setEditLocalData({ ...editLocalData, code: e.target.value })} />
                    </div>
                    <div>
                      <Label>Tipo *</Label>
                      <Select value={editLocalData.type} onValueChange={(val) => setEditLocalData({ ...editLocalData, type: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warehouse">Armazém</SelectItem>
                          <SelectItem value="zone">Zona</SelectItem>
                          <SelectItem value="corridor">Corredor</SelectItem>
                          <SelectItem value="shelf">Prateleira</SelectItem>
                          <SelectItem value="position">Posição</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Nome/Descrição *</Label>
                    <Input value={editLocalData.name} onChange={(e) => setEditLocalData({ ...editLocalData, name: e.target.value })} />
                  </div>
                </CardContent>
              </Card>

              {/* Storage Conditions */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-emerald-800">Condições de Armazenagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Temperatura Controlada</Label>
                    <Switch checked={editLocalData.temperatureControlled} onCheckedChange={(checked) => setEditLocalData({ ...editLocalData, temperatureControlled: checked })} />
                  </div>
                  {editLocalData.temperatureControlled && (
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 pl-6 text-sm text-blue-800">
                      💡 Sensor ativo. A faixa padrão para cadeia de frio é de 2.0°C a 8.0°C no Armazém.
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label>Humidade Controlada</Label>
                    <Switch checked={editLocalData.humidityControlled} onCheckedChange={(checked) => setEditLocalData({ ...editLocalData, humidityControlled: checked })} />
                  </div>
                </CardContent>
              </Card>

              {/* Capacity */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-emerald-800">Capacidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Capacidade Máxima</Label>
                      <Input type="number" value={editLocalData.capacityMax} onChange={(e) => setEditLocalData({ ...editLocalData, capacityMax: Number(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Capacidade Atual</Label>
                      <Input type="number" value={editLocalData.capacityCurrent} readOnly className="bg-gray-50" />
                    </div>
                  </div>
                  {editLocalData.capacityMax > 0 && (
                    <div>
                      <Label>Ocupação</Label>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={Math.min(100, (editLocalData.capacityCurrent / editLocalData.capacityMax) * 100)}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">
                          {Math.round(Math.min(100, (editLocalData.capacityCurrent / editLocalData.capacityMax) * 100))}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedLocation(null)}>Cancelar</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveEdit}>Salvar Alterações</Button>
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center shadow-sm border border-dashed border-gray-300">
              <Warehouse className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecione um local</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Clique em qualquer local na árvore hierárquica à esquerda para visualizar e gerenciar as especificações físicas e operacionais.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Local</DialogTitle>
            <DialogDescription>
              {newLocalParentId ? "Adicionar sub-nível sob a localização selecionada." : "Criar uma nova área de armazenamento raiz (Armazém)."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Código do Local *</Label>
              <Input
                placeholder="Ex: ARM03, BOX-A, SHELF-1"
                value={newLocalData.codigo}
                onChange={(e) => setNewLocalData(prev => ({ ...prev, codigo: e.target.value }))}
              />
            </div>
            <div>
              <Label>Nome/Descrição *</Label>
              <Input
                placeholder="Ex: Prateleira Industrial 04"
                value={newLocalData.nome}
                onChange={(e) => setNewLocalData(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div>
              <Label>Tipo de Local</Label>
              <Select value={newLocalData.tipo} onValueChange={(val) => setNewLocalData(prev => ({ ...prev, tipo: val as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARMAZEM">Armazém</SelectItem>
                  <SelectItem value="ZONA">Zona</SelectItem>
                  <SelectItem value="CORREDOR">Corredor</SelectItem>
                  <SelectItem value="PRATELEIRA">Prateleira</SelectItem>
                  <SelectItem value="POSICAO">Posição</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Temperatura Controlada</span>
                <Switch
                  checked={newLocalData.temperatura_controlada}
                  onCheckedChange={(checked) => setNewLocalData(prev => ({ ...prev, temperatura_controlada: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Humidade Controlada</span>
                <Switch
                  checked={newLocalData.humidade_controlada}
                  onCheckedChange={(checked) => setNewLocalData(prev => ({ ...prev, humidade_controlada: checked }))}
                />
              </div>
            </div>
            <div>
              <Label>Capacidade Máxima</Label>
              <Input
                type="number"
                value={newLocalData.capacidade_maxima}
                onChange={(e) => setNewLocalData(prev => ({ ...prev, capacidade_maxima: Number(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateLocal}>Criar Local</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
