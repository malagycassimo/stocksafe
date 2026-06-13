"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Download, Plus, MoreVertical, Edit, Eye, Key, Ban, Trash2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

const mockUsers = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@stocksafe.com",
    profile: "ADMIN",
    department: "TI",
    lastAccess: "2025-01-15T10:30:00",
    status: true,
    avatar: "",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@stocksafe.com",
    profile: "COMPRAS",
    department: "Compras",
    lastAccess: "2025-01-15T09:15:00",
    status: true,
    avatar: "",
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro.costa@stocksafe.com",
    profile: "RECEBIMENTO",
    department: "Armazém",
    lastAccess: "2025-01-14T16:45:00",
    status: true,
    avatar: "",
  },
  {
    id: "4",
    name: "Ana Oliveira",
    email: "ana.oliveira@stocksafe.com",
    profile: "QA",
    department: "Qualidade",
    lastAccess: "2025-01-15T08:00:00",
    status: false,
    avatar: "",
  },
]

const profileColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  COMPRAS: "bg-blue-100 text-blue-800",
  RECEBIMENTO: "bg-twilight text-imperial",
  QA: "bg-orange-100 text-orange-800",
  REQUISITANTE: "bg-gray-100 text-gray-800",
  FORNECEDOR: "bg-yellow-100 text-yellow-800",
}

export function UsersListContent() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [profileFilter, setProfileFilter] = useState("Todos")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "há menos de 1 hora"
    if (diffInHours < 24) return `há ${diffInHours} horas`
    const diffInDays = Math.floor(diffInHours / 24)
    return `há ${diffInDays} ${diffInDays === 1 ? "dia" : "dias"}`
  }

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    toast({
      title: currentStatus ? "Usuário desativado" : "Usuário ativado",
      description: "O status do usuário foi atualizado com sucesso.",
    })
  }

  const handleNewUser = () => {
    setEditingUser(null)
    setShowUserModal(true)
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setShowUserModal(true)
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
        <span className="text-foreground">Usuários</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-imperial">Usuários e Permissões</h1>
        <Button className="bg-imperial hover:bg-imperial" onClick={handleNewUser}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[300px]">
            <label className="text-sm font-medium mb-2 block">Busca</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-[200px]">
            <label className="text-sm font-medium mb-2 block">Perfil</label>
            <Select value={profileFilter} onValueChange={setProfileFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="COMPRAS">Compras</SelectItem>
                <SelectItem value="RECEBIMENTO">Recebimento</SelectItem>
                <SelectItem value="QA">Qualidade</SelectItem>
                <SelectItem value="REQUISITANTE">Requisitante</SelectItem>
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

          <Button variant="outline">Limpar Filtros</Button>
          <Button variant="outline" className="text-imperial border-imperial bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuário</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Perfil</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Departamento</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Último Acesso</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-twilight text-imperial">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge className={profileColors[user.profile]}>{user.profile}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.department}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {getRelativeTime(user.lastAccess)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Switch checked={user.status} onCheckedChange={() => handleToggleStatus(user.id, user.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="w-4 h-4 mr-2" />
                            Ver Log de Atividades
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Key className="w-4 h-4 mr-2" />
                            Redefinir Senha
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-orange-600">
                            <Ban className="w-4 h-4 mr-2" />
                            Bloquear
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
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

      {/* User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
              <TabsTrigger value="permissions">Acesso e Permissões</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input placeholder="João Silva" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" placeholder="joao.silva@stocksafe.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <Input placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <Label>Departamento</Label>
                  <Input placeholder="TI" />
                </div>
              </div>
              <div>
                <Label>Cargo</Label>
                <Input placeholder="Analista de Sistemas" />
              </div>
            </TabsContent>
            <TabsContent value="permissions" className="space-y-4 mt-4">
              <div>
                <Label>Perfil *</Label>
                <Select defaultValue="REQUISITANTE">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REQUISITANTE">Requisitante</SelectItem>
                    <SelectItem value="COMPRAS">Compras/Procurement</SelectItem>
                    <SelectItem value="RECEBIMENTO">Recebimento/Armazém</SelectItem>
                    <SelectItem value="QA">Qualidade (QA)</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Requisitante: Pode criar e visualizar suas próprias requisições
                </p>
              </div>
              <div className="space-y-3">
                <Label>Permissões Customizadas</Label>
                <div className="border rounded-lg p-4 space-y-3">
                  <div>
                    <div className="font-medium mb-2">Módulo Cadastros</div>
                    <div className="space-y-2 pl-4">
                      <div className="flex items-center gap-2">
                        <Checkbox id="cadastros-view" />
                        <label htmlFor="cadastros-view" className="text-sm">
                          Visualizar
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="cadastros-create" />
                        <label htmlFor="cadastros-create" className="text-sm">
                          Criar
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="cadastros-edit" />
                        <label htmlFor="cadastros-edit" className="text-sm">
                          Editar
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="cadastros-delete" />
                        <label htmlFor="cadastros-delete" className="text-sm">
                          Excluir
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Módulo Requisições</div>
                    <div className="space-y-2 pl-4">
                      <div className="flex items-center gap-2">
                        <Checkbox id="req-view" defaultChecked />
                        <label htmlFor="req-view" className="text-sm">
                          Visualizar
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="req-create" defaultChecked />
                        <label htmlFor="req-create" className="text-sm">
                          Criar
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="req-approve" />
                        <label htmlFor="req-approve" className="text-sm">
                          Aprovar
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4 mt-4">
              {!editingUser && (
                <div className="space-y-2">
                  <Label>Senha *</Label>
                  <Input type="password" placeholder="••••••••" />
                  <Input type="password" placeholder="Confirmar senha" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label>Forçar troca de senha no primeiro login</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>Status Ativo</Label>
                <Switch defaultChecked />
              </div>
              <div>
                <Label>Notificações</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="notif-email" defaultChecked />
                    <label htmlFor="notif-email" className="text-sm">
                      Email
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="notif-push" />
                    <label htmlFor="notif-push" className="text-sm">
                      Push no navegador
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              Cancelar
            </Button>
            <Button className="bg-imperial hover:bg-imperial">Salvar Usuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




