"use client"

import { useState } from "react"
import { Menu, Search, Bell, Package, ChevronDown, User, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import logo from "@/public/logoicon.svg"

interface DashboardHeaderProps {
  user: {
    name: string
    initials: string
  }
  onToggleSidebar: () => void
  isSidebarCollapsed: boolean
}

export function DashboardHeader({ user, onToggleSidebar }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)

  // Mock notifications
  const notifications = [
    { id: 1, message: "PO #123 foi aprovado", time: "há 5 minutos", read: false },
    { id: 2, message: "Novo lote recebido - Produto XYZ", time: "há 1 hora", read: false },
    { id: 3, message: "Alerta de validade: 5 itens próximos ao vencimento", time: "há 2 horas", read: true },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full flex items-center justify-between px-4 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
              <Image src={logo} alt="StockSafe Logo" className="w-30" />
          </div>

          {/* Hamburger Menu */}
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produtos, lotes, POs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 focus-visible:ring-imperial"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2 font-semibold border-b">Notificações</div>
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 cursor-pointer">
                  <div className="flex items-start gap-2 w-full">
                    <Bell className="w-4 h-4 mt-0.5 text-twilight" />
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-twilight font-medium cursor-pointer">
                Ver todas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                <div className="w-8 h-8 rounded-full bg-imperial flex items-center justify-center text-white font-medium text-sm">
                  {user.initials}
                </div>
                <span className="text-sm font-medium hidden md:block">{user.name}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Link href="/perfil">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href="/login">
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}



