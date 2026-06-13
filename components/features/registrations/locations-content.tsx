"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
  Edit,
  Copy,
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

const mockLocations: LocationNode[] = [
  {
    id: "1",
    code: "ARM01",
    name: "Armazém Principal",
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
        children: [
          {
            id: "3",
            code: "ARM01-ZF-CA",
            name: "Corredor A",
            type: "corridor",
            parentId: "2",
            capacity: { max: 150, current: 90 },
            children: [
              {
                id: "4",
                code: "ARM01-ZF-CA-P01",
                name: "Prateleira A1",
                type: "shelf",
                parentId: "3",
                capacity: { max: 50, current: 30 },
                children: [
                  {
                    id: "5",
                    code: "ARM01-ZF-CA-P01-001",
                    name: "Posição 001",
                    type: "position",
                    parentId: "4",
                    capacity: { max: 10, current: 6 },
                  },
                  {
                    id: "6",
                    code: "ARM01-ZF-CA-P01-002",
                    name: "Posição 002",
                    type: "position",
                    parentId: "4",
                    capacity: { max: 10, current: 8 },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "7",
        code: "ARM01-ZS",
        name: "Zona Seca",
        type: "zone",
        parentId: "1",
        temperature: { min: 15, max: 25 },
        capacity: { max: 500, current: 320 },
      },
      {
        id: "8",
        code: "ARM01-ZC",
        name: "Zona Congelados",
        type: "zone",
        parentId: "1",
        temperature: { min: -18, max: -12 },
        capacity: { max: 200, current: 150 },
      },
    ],
  },
  {
    id: "9",
    code: "ARM02",
    name: "Armazém Secundário",
    type: "warehouse",
    capacity: { max: 500, current: 200 },
  },
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
  corridor: "text-imperial",
  shelf: "text-orange-600",
  position: "text-gray-600",
}

export function LocationsContent() {
  const [expandedNodes, setExpandedNodes] = useState<string[]>(["1", "2", "3", "4"])
  const [selectedLocation, setSelectedLocation] = useState<LocationNode | null>(mockLocations[0].children?.[0] || null)
  const [searchQuery, setSearchQuery] = useState("")

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
    collectIds(mockLocations)
    setExpandedNodes(allIds)
  }

  const collapseAll = () => {
    setExpandedNodes([])
  }

  const renderTree = (nodes: LocationNode[], level = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0
      const isExpanded = expandedNodes.includes(node.id)
      const Icon = typeIcons[node.type]
      const isSelected = selectedLocation?.id === node.id

      return (
        <div key={node.id}>
          <div
            className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 cursor-pointer rounded ${
              isSelected ? "bg-twilight border-l-4 border-imperial" : ""
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
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {!hasChildren && <div className="w-5" />}
            <Icon className={`w-4 h-4 ${typeColors[node.type]}`} />
            <span className="text-sm font-medium flex-1">{node.name}</span>
            {node.temperature && <Thermometer className="w-3 h-3 text-blue-500" />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Sub-nível
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Etiqueta
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
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
        <Link href="/dashboard" className="hover:text-imperial">
          Home
        </Link>
        {" / "}
        <span>Cadastros</span>
        {" / "}
        <span className="text-foreground">Locais</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">Hierarquia de Locais</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={expandAll}>
            <Maximize2 className="w-4 h-4 mr-2" />
            Expandir Todos
          </Button>
          <Button variant="outline" onClick={collapseAll}>
            <Minimize2 className="w-4 h-4 mr-2" />
            Colapsar Todos
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Etiquetas em Lote
          </Button>
          <Button className="bg-imperial hover:bg-imperial">
            <Plus className="w-4 h-4 mr-2" />
            Novo Armazém
          </Button>
        </div>
      </div>

      {/* Two Panel Layout */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left Panel - Tree View */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <Input
                placeholder="Buscar local..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">{renderTree(mockLocations)}</CardContent>
          </Card>
        </div>

        {/* Right Panel - Details */}
        <div className="col-span-3">
          {selectedLocation ? (
            <div className="space-y-6">
              {/* Breadcrumb */}
              <div className="text-sm text-muted-foreground">Armazém Principal &gt; Zona Fria &gt; Corredor A</div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{selectedLocation.name}</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" className="text-red-600 bg-transparent">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>

              {/* Details Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Código do Local *</Label>
                      <Input value={selectedLocation.code} readOnly />
                    </div>
                    <div>
                      <Label>Tipo *</Label>
                      <Select value={selectedLocation.type} onValueChange={() => {}}>
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
                    <Input value={selectedLocation.name} onChange={() => {}} />
                  </div>
                </CardContent>
              </Card>

              {/* Storage Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Condições de Armazenagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Temperatura Controlada</Label>
                    <Switch checked={!!selectedLocation.temperature} onCheckedChange={() => {}} />
                  </div>
                  {selectedLocation.temperature && (
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <div>
                        <Label>Temperatura Mínima (°C)</Label>
                        <Input type="number" value={selectedLocation.temperature.min} onChange={() => {}} />
                      </div>
                      <div>
                        <Label>Temperatura Máxima (°C)</Label>
                        <Input type="number" value={selectedLocation.temperature.max} onChange={() => {}} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label>Umidade Controlada</Label>
                    <Switch checked={!!selectedLocation.humidity} onCheckedChange={() => {}} />
                  </div>
                  <div className="space-y-2">
                    <Label>Outras Condições</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="light" />
                        <label htmlFor="light" className="text-sm">
                          Protegido de luz
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="segregated" />
                        <label htmlFor="segregated" className="text-sm">
                          Área segregada
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="quarantine" />
                        <label htmlFor="quarantine" className="text-sm">
                          Quarentena
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="blocked" />
                        <label htmlFor="blocked" className="text-sm">
                          Bloqueado
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Capacity */}
              <Card>
                <CardHeader>
                  <CardTitle>Capacidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Capacidade Máxima</Label>
                      <Input type="number" value={selectedLocation.capacity.max} onChange={() => {}} />
                    </div>
                    <div>
                      <Label>Capacidade Atual</Label>
                      <Input type="number" value={selectedLocation.capacity.current} readOnly />
                    </div>
                  </div>
                  <div>
                    <Label>Ocupação</Label>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={(selectedLocation.capacity.current / selectedLocation.capacity.max) * 100}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">
                        {Math.round((selectedLocation.capacity.current / selectedLocation.capacity.max) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button className="bg-imperial hover:bg-imperial">Salvar</Button>
                <Button variant="outline" className="text-imperial bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Sub-nível
                </Button>
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecione um local</h3>
              <p className="text-muted-foreground">Clique em um local na árvore para ver os detalhes</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}




