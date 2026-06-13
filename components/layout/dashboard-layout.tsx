"use client"

import type React from "react"
import { useState } from "react"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    name: string
    email: string
    profile: string
    initials: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        user={user}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <div className="flex pt-16">
        {/* Sidebar */}
        <DashboardSidebar isCollapsed={isSidebarCollapsed} userProfile={user.profile} />

        {/* Main Content */}
        <main className={`flex-1 p-4 transition-all duration-300 max-w-full overflow-x-hidden ${isSidebarCollapsed ? "ml-20" : "ml-[260px]"}`}>
          {children}
        </main>
      </div>
    </div>
  )
}



