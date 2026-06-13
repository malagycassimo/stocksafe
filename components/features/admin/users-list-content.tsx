"use client"

import { useState, useEffect, useMemo } from "react"
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
import { usuarioService } from "@/app/services/usuarioService"

const profileColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  COMPRAS: "bg-blue-100 text-blue-800",
  RECEBIMENTO: "bg-green-100 text-green-800",
  QA: "bg-orange-100 text-orange-800",
  REQUISITANTE: "bg-gray-100 text-gray-800",
  FORNECEDOR: "bg-yellow-100 text-yellow-800",
}

const mockUsersFallback = [
  {
    id: "1",
    name: "João Silva (Fallback)",
    email: "joao.silva@stocksafe.com",
    profile: "ADMIN",
    department: "TI",
    lastAccess: new Date().toISOString(),
    status: true,
    avatar: "",
  }
]

export function UsersListContent() {
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [profileFilter, setProfileFilter] = useState("Todos")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Form values
  const [formValues, setFormValues] = useState({
    nome_completo: "",
    email: "",
    telefone: "",
    departamento: "",
    cargo: "",
    perfil: "REQUISITANTE" as 'REQUISITANTE' | 'COMPRAS' | 'RECEBIMENTO' | 'QA' | 'ADMIN',
    senha: "",
    confirmarSenha: "",
    status_ativo: true,
    notificacao_email: true,
  })

  const getInitials = (name: string) => {
    if (!name) return "US"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return "sem registro"
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "há menos de 1 hora"
    if (diffInHours < 24) return `há ${diffInHours} horas`
    const diffInDays = Math.floor(diffInHours / 24)
    return `há ${diffInDays} ${diffInDays === 1 ? "dia" : "dias"}`
  }

  // Carregar usuários da API
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const data = await usuarioService.listarTodos()
      if (data && data.length > 0) {
        const mapped = data.map((u: any) => {
          let frontendProfile = "REQUISITANTE";
          if (u.perfil === "ADMIN") frontendProfile = "ADMIN";
          else if (u.perfil === "COMPRAS_PROCUREMENT") frontendProfile = "COMPRAS";
          else if (u.perfil === "RECEBIMENTO_ARMAZEM") frontendProfile = "RECEBIMENTO";
          else if (u.perfil === "QUALIDADE_QA") frontendProfile = "QA";

          return {
            id: u.id,
            name: u.nome || u.nome_completo || "-",
            email: u.email,
            profile: frontendProfile,
            department: u.departamento || "-",
            lastAccess: u.updatedAt || new Date().toISOString(),
            status: u.statusAtivo ?? u.status_ativo ?? true,
            avatar: "",
            raw: u
          }
        })
        setUsers(mapped)
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error("Erro ao carregar usuários da API, usando mockData", err)
      setUsers(mockUsersFallback)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Atualizar valores de formulário ao editar/criar
  useEffect(() => {
    if (editingUser) {
      const u = editingUser.raw || editingUser
      let frontendProfile = "REQUISITANTE";
      if (u.perfil === "ADMIN") frontendProfile = "ADMIN";
      else if (u.perfil === "COMPRAS_PROCUREMENT" || u.perfil === "COMPRAS") frontendProfile = "COMPRAS";
      else if (u.perfil === "RECEBIMENTO_ARMAZEM" || u.perfil === "RECEBIMENTO") frontendProfile = "RECEBIMENTO";
      else if (u.perfil === "QUALIDADE_QA" || u.perfil === "QA") frontendProfile = "QA";

      setFormValues({
        nome_completo: u.nome || u.nome_completo || u.name || "",
        email: u.email || "",
        telefone: u.telefone || "",
        departamento: u.departamento || u.department || "",
        cargo: u.cargo || "",
        perfil: frontendProfile as any,
        senha: "",
        confirmarSenha: "",
        status_ativo: u.statusAtivo ?? u.status_ativo ?? u.status ?? true,
        notificacao_email: u.notificaEmail ?? u.notificacao_email ?? true,
      })
    } else {
      setFormValues({
        nome_completo: "",
        email: "",
        telefone: "",
        departamento: "",
        cargo: "",
        perfil: "REQUISITANTE",
        senha: "",
        confirmarSenha: "",
        status_ativo: true,
        notificacao_email: true,
      })
    }
  }, [editingUser, showUserModal])

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await usuarioService.atualizar(userId, { status_ativo: !currentStatus })
      toast({
        title: !currentStatus ? "Usuário ativado" : "Usuário desativado",
        description: "O status do usuário foi atualizado com sucesso.",
      })
      fetchUsers()
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário na API.",
        variant: "destructive"
      })
    }
  }

  const handleNewUser = () => {
    setEditingUser(null)
    setShowUserModal(true)
  }

  const handleEditUser = async (user: any) => {
    try {
      const fullUser = await usuarioService.buscarPorId(user.id)
      setEditingUser({ ...user, raw: fullUser })
    } catch (err) {
      setEditingUser(user)
    }
    setShowUserModal(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return
    try {
      await usuarioService.eliminar(userId)
      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso."
      })
      fetchUsers()
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário.",
        variant: "destructive"
      })
    }
  }

  const handleSaveUser = async () => {
    if (!formValues.nome_completo || !formValues.email) {
      toast({
        title: "Erro de validação",
        description: "Nome Completo e Email são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (!editingUser && !formValues.senha) {
      toast({
        title: "Erro de validação",
        description: "A senha é obrigatória para novos usuários.",
        variant: "destructive",
      })
      return
    }

    if (formValues.senha && formValues.senha !== formValues.confirmarSenha) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    let backendProfile: 'ADMIN' | 'COMPRAS_PROCUREMENT' | 'RECEBIMENTO_ARMAZEM' | 'QUALIDADE_QA' | 'REQUISITANTE' = "REQUISITANTE"
    if (formValues.perfil === "ADMIN") backendProfile = "ADMIN"
    else if (formValues.perfil === "COMPRAS") backendProfile = "COMPRAS_PROCUREMENT"
    else if (formValues.perfil === "RECEBIMENTO") backendProfile = "RECEBIMENTO_ARMAZEM"
    else if (formValues.perfil === "QA") backendProfile = "QUALIDADE_QA"

    const payload: any = {
      nome_completo: formValues.nome_completo,
      email: formValues.email,
      telefone: formValues.telefone || null,
      departamento: formValues.departamento || null,
      cargo: formValues.cargo || null,
      perfil: backendProfile,
      status_ativo: formValues.status_ativo,
      notificacao_email: formValues.notificacao_email,
    }

    if (formValues.senha) {
      payload.senha = formValues.senha
    }

    try {
      if (editingUser) {
        await usuarioService.atualizar(editingUser.id, payload)
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso."
        })
      } else {
        await usuarioService.criar(payload)
        toast({
          title: "Sucesso",
          description: "Usuário cadastrado com sucesso."
        })
      }
      setShowUserModal(false)
      fetchUsers()
    } catch (err: any) {
      toast({
        title: "Erro ao salvar",
        description: err.response?.data?.error || "Ocorreu um erro ao salvar o usuário.",
        variant: "destructive"
      })
    }
  }

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesProfile = profileFilter === "Todos" || user.profile === profileFilter

      const matchesStatus =
        statusFilter === "Todos" ||
        (statusFilter === "Ativo" && user.status) ||
        (statusFilter === "Inativo" && !user.status)

      return matchesSearch && matchesProfile && matchesStatus
    })
  }, [users, searchQuery, profileFilter, statusFilter])

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
        <span className="text-foreground">Usuários</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-emerald-700">Usuários e Permissões</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleNewUser}>
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

          <Button variant="outline" onClick={() => {
            setSearchQuery("")
            setProfileFilter("Todos")
            setStatusFilter("Todos")
          }}>Limpar Filtros</Button>
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Modificado Em</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Carregando usuários...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge className={profileColors[user.profile] || "bg-gray-100 text-gray-800"}>{user.profile}</Badge>
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
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
                  <Input
                    placeholder="João Silva"
                    value={formValues.nome_completo}
                    onChange={(e) => setFormValues(prev => ({ ...prev, nome_completo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="joao.silva@stocksafe.com"
                    value={formValues.email}
                    onChange={(e) => setFormValues(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={formValues.telefone}
                    onChange={(e) => setFormValues(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Departamento</Label>
                  <Input
                    placeholder="TI"
                    value={formValues.departamento}
                    onChange={(e) => setFormValues(prev => ({ ...prev, departamento: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Cargo</Label>
                <Input
                  placeholder="Analista de Sistemas"
                  value={formValues.cargo}
                  onChange={(e) => setFormValues(prev => ({ ...prev, cargo: e.target.value }))}
                />
              </div>
            </TabsContent>
            <TabsContent value="permissions" className="space-y-4 mt-4">
              <div>
                <Label>Perfil *</Label>
                <Select
                  value={formValues.perfil}
                  onValueChange={(val) => setFormValues(prev => ({ ...prev, perfil: val as any }))}
                >
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
            </TabsContent>
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{editingUser ? "Nova Senha (deixe em branco para manter a atual)" : "Senha *"}</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formValues.senha}
                  onChange={(e) => setFormValues(prev => ({ ...prev, senha: e.target.value }))}
                />
                <Input
                  type="password"
                  placeholder="Confirmar senha"
                  value={formValues.confirmarSenha}
                  onChange={(e) => setFormValues(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Status Ativo</Label>
                <Switch
                  checked={formValues.status_ativo}
                  onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, status_ativo: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Notificações por Email</Label>
                <Switch
                  checked={formValues.notificacao_email}
                  onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, notificacao_email: checked }))}
                />
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              Cancelar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveUser}>
              {editingUser ? "Atualizar Usuário" : "Salvar Usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
