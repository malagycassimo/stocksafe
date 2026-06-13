"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getSidebarConfig } from "@/lib/sidebar-config"
import { useAuth } from "@/hooks/useAuth"

interface DashboardSidebarProps {
  isCollapsed: boolean
  userProfile: string
}

interface MenuItem {
  icon: any
  label: string
  path?: string | null
  badge?: string | number | null
  highlight?: boolean
  submenu?: Array<{ label: string; path: string }>
}

export function DashboardSidebar({ isCollapsed, userProfile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["Dashboard"])
  const [profile, setProfile] = useState<string>(userProfile)

  const { user } = useAuth()
  const perfilAtivo = user?.perfil || userProfile || "REQUISITANTE"

  // Read profile from localStorage on mount
  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile")
    if (storedProfile) {
      setProfile(storedProfile)
    }
  }, [])

  // Get menu items based on profile
  const menuItems = getSidebarConfig(perfilAtivo).items

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const isActive = (path?: string | null) => {
    if (!path) return false
    return pathname === path
  }

  const hasActiveChild = (item: MenuItem): boolean => {
    if (!item.submenu) return false
    return item.submenu.some((child) => {
      if (child.path && pathname === child.path) return true
      return false
    })
  }

  // Auto-expand menu when a child is active
  useEffect(() => {
    menuItems.forEach((item) => {
      if (hasActiveChild(item) && !expandedItems.includes(item.label)) {
        setExpandedItems((prev) => [...prev, item.label])
      }
    })
  }, [pathname])

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const isExpanded = expandedItems.includes(item.label)
    const Icon = item.icon

    if (hasSubmenu) {
      const hasActive = hasActiveChild(item)
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
              "hover:bg-emerald-50 hover:text-emerald-600",
              hasActive && "text-emerald-600",
              isCollapsed && "justify-center px-2",
              item.highlight && "bg-yellow-50",
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="default"
                    className={cn(
                      "h-5 min-w-5 flex items-center justify-center",
                      item.badge === "criticos" && "bg-red-500",
                      item.badge === "pendentes" && "bg-yellow-500",
                      item.badge === "aprovacao" && "bg-blue-500",
                      item.badge === "aguardando" && "bg-orange-500",
                      item.badge === "quarentena" && "bg-purple-500",
                    )}
                  >
                    {typeof item.badge === "number" ? item.badge : "!"}
                  </Badge>
                )}
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </>
            )}
          </button>
          {isExpanded && !isCollapsed && (
            <div className="ml-4 border-l border-gray-200">
              {item.submenu?.map((child) => (
                <Link
                  key={child.label}
                  href={child.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                    "hover:bg-emerald-50 hover:text-emerald-600",
                    isActive(child.path) && "bg-emerald-100 text-emerald-700 border-r-4 border-emerald-600",
                    "pl-8",
                  )}
                >
                  <span className="flex-1">{child.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    // Item without submenu
    return (
      <Link
        key={item.label}
        href={item.path || "#"}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
          "hover:bg-emerald-50 hover:text-emerald-600",
          isActive(item.path) && "bg-emerald-100 text-emerald-700 border-r-4 border-emerald-600",
          item.highlight && "bg-yellow-50",
          isCollapsed && "justify-center px-2",
          level > 0 && "pl-8",
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <Badge
                variant="default"
                className={cn(
                  "h-5 min-w-5 flex items-center justify-center",
                  item.badge === "criticos" && "bg-red-500",
                  item.badge === "pendentes" && "bg-yellow-500",
                  item.badge === "aprovacao" && "bg-blue-500",
                  item.badge === "aguardando" && "bg-orange-500",
                  item.badge === "quarentena" && "bg-purple-500",
                )}
              >
                {typeof item.badge === "number" ? item.badge : "!"}
              </Badge>
            )}
          </>
        )}
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto",
        isCollapsed ? "w-20" : "w-[260px]",
      )}
    >
      <nav className="py-4">{menuItems.map((item) => renderMenuItem(item))}</nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="text-xs text-muted-foreground mb-2">Versão v1.0.0</div>
          <button className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            <HelpCircle className="w-4 h-4" />
            Ajuda
          </button>
        </div>
      )}
    </aside>
  )
}
