"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronRight, Lock, Bell, Camera, Eye, EyeOff, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { usuarioService } from "@/app/services/usuarioService"

interface User {
  name: string
  email: string
  profile: string
  initials: string
  phone?: string
  department?: string
  position?: string
  lastAccess: string
  avatar?: string | null
}

interface ProfileContentProps {
  user: User
}

export function ProfileContent({ user: initialUser }: ProfileContentProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user: authUser } = useAuth()

  // Form states
  const [user, setUser] = useState(initialUser)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Preferences states
  const [preferences, setPreferences] = useState({
    emailValidity: true,
    emailRequisitions: true,
    emailDailySummary: false,
    pushNotifications: true,
    language: "pt",
  })

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" }
    if (password.length < 8) return { strength: 1, label: "Fraca", color: "bg-destructive" }

    let strength = 1
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    if (strength === 2) return { strength: 2, label: "Média", color: "bg-warning" }
    if (strength >= 3) return { strength: 3, label: "Forte", color: "bg-success" }
    return { strength: 1, label: "Fraca", color: "bg-destructive" }
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  // Handlers
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      // Validation
      if (user.name.length < 3) {
        toast({
          title: "Erro de validação",
          description: "Nome deve ter no mínimo 3 caracteres",
          variant: "destructive",
        })
        return
      }

      if (authUser) {
        await usuarioService.atualizar(authUser.id, {
          nome_completo: user.name,
          telefone: user.phone || undefined,
          departamento: user.department || undefined,
          cargo: user.position || undefined,
        })

        const updatedUser = {
          ...authUser,
          nome: user.name,
          telefone: user.phone || undefined,
          departamento: user.department || undefined,
          cargo: user.position || undefined,
        }
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }

      toast({
        title: "Perfil updated com sucesso!",
        description: "Suas informações foram salvas.",
      })
      setIsEditingProfile(false)
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleCancelProfile = () => {
    setUser(initialUser)
    setAvatarPreview(null)
    setIsEditingProfile(false)
  }

  const handleChangePassword = async () => {
    try {
      // Validations
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos de senha",
          variant: "destructive",
        })
        return
      }

      if (passwordData.newPassword.length < 6) {
        toast({
          title: "Senha fraca",
          description: "A nova senha deve ter no mínimo 6 caracteres",
          variant: "destructive",
        })
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: "Senhas não coincidem",
          description: "A nova senha e a confirmação devem ser iguais",
          variant: "destructive",
        })
        return
      }

      if (authUser) {
        await usuarioService.atualizar(authUser.id, {
          senha: passwordData.newPassword
        })
      }

      toast({
        title: "Senha alterada com sucesso!",
        description: "Sua senha foi atualizada.",
      })

      // Clear fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Erro ao alterar senha",
        description: "Não foi possível alterar a senha. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleSavePreferences = async () => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Preferências salvas!",
        description: "Suas preferências foram atualizadas.",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as preferências",
        variant: "destructive",
      })
    }
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return `+258 ${numbers}`
    if (numbers.length <= 5) return `+258 ${numbers.slice(0, 2)} ${numbers.slice(2)}`
    if (numbers.length <= 8) return `+258 ${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`
    return `+258 ${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 9)}`
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Home</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Perfil</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-primary">Meu Perfil</h1>

      {/* Main Card */}
      <div className="mx-auto max-w-[800px] space-y-6">
        {/* Section 1: Photo and Basic Info */}
        <Card className="p-6">
          <div className="flex gap-6">
            {/* Avatar Column */}
            <div className="flex flex-col items-center gap-3">
              <div className="group relative">
                <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-primary text-4xl font-semibold text-primary-foreground">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview || "/placeholder.svg"}
                      alt="Avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    user.initials
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Camera className="h-6 w-6 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleAvatarClick}>
                Alterar Foto
              </Button>
            </div>

            {/* Info Column */}
            <div className="flex flex-1 flex-col justify-center gap-2">
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">{user.profile}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Último acesso: {user.lastAccess}</p>
            </div>
          </div>
        </Card>

        {/* Section 2: Personal Data Form */}
        <Card className="p-6">
          <h3 className="mb-6 text-xl font-semibold">Dados Pessoais</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={user.name}
                  onChange={(e) => {
                    setUser({ ...user, name: e.target.value })
                    setIsEditingProfile(true)
                  }}
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input id="email" value={user.email} disabled className="bg-muted" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={user.phone || ""}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    setUser({ ...user, phone: formatted })
                    setIsEditingProfile(true)
                  }}
                  placeholder="+258 XX XXX XXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={user.department || ""}
                  onChange={(e) => {
                    setUser({ ...user, department: e.target.value })
                    setIsEditingProfile(true)
                  }}
                  placeholder="Digite seu departamento"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={user.position || ""}
                onChange={(e) => {
                  setUser({ ...user, position: e.target.value })
                  setIsEditingProfile(true)
                }}
                placeholder="Digite seu cargo"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleCancelProfile} disabled={!isEditingProfile}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={!isEditingProfile}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </Card>

        {/* Section 3: Change Password */}
        <Card className="bg-muted/50 p-6">
          <div className="mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Segurança</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                Senha Atual <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                Nova Senha <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Mínimo 8 caracteres, letras e números"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordData.newPassword && (
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{passwordStrength.label}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirmar Nova Senha <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Digite a senha novamente"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordData.confirmPassword && (
                <div className="flex items-center gap-1 text-sm">
                  {passwordData.newPassword === passwordData.confirmPassword ? (
                    <>
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-success">Senhas coincidem</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">Senhas não coincidem</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button onClick={handleChangePassword} className="w-full">
                Alterar Senha
              </Button>
            </div>
          </div>
        </Card>

        {/* Section 4: Preferences */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Preferências de Notificação</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailValidity"
                checked={preferences.emailValidity}
                onCheckedChange={(checked) => setPreferences({ ...preferences, emailValidity: checked as boolean })}
              />
              <Label htmlFor="emailValidity" className="cursor-pointer font-normal">
                Receber alertas de validade por email
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailRequisitions"
                checked={preferences.emailRequisitions}
                onCheckedChange={(checked) => setPreferences({ ...preferences, emailRequisitions: checked as boolean })}
              />
              <Label htmlFor="emailRequisitions" className="cursor-pointer font-normal">
                Receber notificações de requisições aprovadas
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailDailySummary"
                checked={preferences.emailDailySummary}
                onCheckedChange={(checked) => setPreferences({ ...preferences, emailDailySummary: checked as boolean })}
              />
              <Label htmlFor="emailDailySummary" className="cursor-pointer font-normal">
                Receber resumo diário por email
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pushNotifications"
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked as boolean })}
              />
              <Label htmlFor="pushNotifications" className="cursor-pointer font-normal">
                Notificações push no navegador
              </Label>
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Português (PT)</SelectItem>
                  <SelectItem value="en" disabled>
                    English (EN)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button onClick={handleSavePreferences} className="w-full">
                Salvar Preferências
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}



