// import {
//   LayoutDashboard,
//   Package,
//   FileText,
//   ShoppingCart,
//   CheckSquare,
//   FlaskConical,
//   Warehouse,
//   Truck,
//   AlertTriangle,
//   BarChart3,
//   Settings,
//   Users,
//   MapPin,
//   Building2,
//   User,
//   Home,
//   Send,
//   Target,
//   DollarSign,
//   Shield,
// } from "lucide-react"

// export type UserProfile =
//   | "GERAL"
//   | "REQUISITANTE"
//   | "COMPRAS"
//   | "FORNECEDOR"
//   | "RECEBIMENTO"
//   | "QA"
//   | "FINANCEIRO"
//   | "ADMIN"

// interface MenuItem {
//   icon: any
//   label: string
//   path?: string | null
//   badge?: string | number | null
//   highlight?: boolean
//   submenu?: Array<{ label: string; path: string }>
// }

// export const SIDEBAR_CONFIG: Record<UserProfile, { items: MenuItem[] }> = {
//   // PERFIL: GERAL (Acesso Completo - todas as opções)
//   GERAL: {
//     items: [
//       {
//         icon: LayoutDashboard,
//         label: "Dashboard",
//         path: "/dashboard",
//       },
//       {
//         icon: Package,
//         label: "Cadastros",
//         submenu: [
//           { label: "Produtos", path: "/cadastros/produtos" },
//           { label: "Fornecedores", path: "/cadastros/fornecedores" },
//           { label: "Locais", path: "/cadastros/locais" },
//           { label: "Usuários", path: "/cadastros/usuarios" },
//         ],
//       },
//       {
//         icon: FileText,
//         label: "Requisições",
//         submenu: [
//           { label: "Minhas Requisições", path: "/requisicoes" },
//           { label: "Nova Requisição", path: "/requisicoes/nova" },
//           { label: "Aprovar Requisições", path: "/requisicoes/aprovar" },
//         ],
//       },
//       {
//         icon: ShoppingCart,
//         label: "Compras",
//         submenu: [
//           { label: "RFQs", path: "/compras/rfqs" },
//           { label: "Pedidos de Compra", path: "/compras/pos" },
//         ],
//       },
//       {
//         icon: CheckSquare,
//         label: "Recebimento",
//         submenu: [
//           { label: "Check-in", path: "/recebimento/checkin" },
//           { label: "Conferência", path: "/recebimento/conferencia" },
//           { label: "Aguardando", path: "/recebimento/aguardando" },
//           { label: "Fiscal", path: "/recebimento/fiscal" },
//         ],
//       },
//       {
//         icon: FlaskConical,
//         label: "Qualidade",
//         submenu: [
//           { label: "Quarentena", path: "/qualidade/quarentena" },
//           { label: "Inspeções", path: "/qualidade/inspecoes" },
//         ],
//       },
//       {
//         icon: Warehouse,
//         label: "Estoque",
//         submenu: [
//           { label: "Consultar", path: "/estoque/consulta" },
//           { label: "Movimentações", path: "/estoque/movimentacoes" },
//           { label: "Transferências", path: "/estoque/transferencias" },
//           { label: "Inventário", path: "/estoque/inventario" },
//         ],
//       },
//       {
//         icon: Truck,
//         label: "Expedição",
//         submenu: [
//           { label: "Ordens", path: "/expedicao/ordens" },
//           { label: "Reposição", path: "/expedicao/reposicao" },
//         ],
//       },
//       {
//         icon: AlertTriangle,
//         label: "Validade",
//         badge: "criticos",
//         highlight: true,
//         submenu: [
//           { label: "Dashboard", path: "/validade/dashboard" },
//           { label: "Campanhas", path: "/validade/campanhas" },
//           { label: "Descartes", path: "/validade/descartes" },
//         ],
//       },
//       {
//         icon: BarChart3,
//         label: "Relatórios",
//         path: "/relatorios",
//       },
//       {
//         icon: Settings,
//         label: "Admin",
//         submenu: [
//           { label: "Políticas de Validade", path: "/admin/politicas" },
//           { label: "Padrões de Etiquetas", path: "/admin/etiquetas" },
//           { label: "Workflows", path: "/admin/workflows" },
//           { label: "Auditoria", path: "/admin/auditoria" },
//         ],
//       },
//       {
//         icon: User,
//         label: "Meu Perfil",
//         path: "/perfil",
//       },
//     ],
//   },

//   // PERFIL: REQUISITANTE
//   REQUISITANTE: {
//     items: [
//       {
//         icon: Home,
//         label: "Dashboard",
//         path: "/dashboard",
//       },
//       {
//         icon: FileText,
//         label: "Requisições",
//         badge: "pendentes",
//         submenu: [
//           { label: "Minhas Requisições", path: "/requisicoes" },
//           { label: "Nova Requisição", path: "/requisicoes/nova" },
//         ],
//       },
//       {
//         icon: Package,
//         label: "Estoque",
//         path: "/estoque/consulta",
//       },
//       {
//         icon: AlertTriangle,
//         label: "Validades",
//         path: "/validade/dashboard",
//         badge: "criticos",
//         highlight: true,
//       },
//       {
//         icon: User,
//         label: "Meu Perfil",
//         path: "/perfil",
//       },
//     ],
//   },

//   // PERFIL: COMPRAS
//   COMPRAS: {
//     items: [
//       {
//         icon: Home,
//         label: "Dashboard",
//         path: "/dashboard",
//       },
//       {
//         icon: Package,
//         label: "Cadastros",
//         submenu: [
//           { label: "Produtos", path: "/cadastros/produtos" },
//           { label: "Fornecedores", path: "/cadastros/fornecedores" },
//         ],
//       },
//       {
//         icon: FileText,
//         label: "Requisições",
//         badge: "aprovacao",
//         submenu: [
//           { label: "Todas as Requisições", path: "/requisicoes" },
//           { label: "Aprovar Requisições", path: "/requisicoes/aprovar" },
//         ],
//       },
//       {
//         icon: ShoppingCart,
//         label: "Compras",
//         badge: "pendentes",
//         submenu: [
//           { label: "RFQs", path: "/compras/rfqs" },
//           { label: "Pedidos de Compra", path: "/compras/pos" },
//         ],
//       },
//       {
//         icon: Package,
//         label: "Estoque",
//         path: "/estoque/consulta",
//       },
//       {
//         icon: AlertTriangle,
//         label: "Validade",
//         badge: "criticos",
//         highlight: true,
//         submenu: [
//           { label: "Dashboard", path: "/validade/dashboard" },
//           { label: "Campanhas", path: "/validade/campanhas" },
//         ],
//       },
//       {
//         icon: BarChart3,
//         label: "Relatórios",
//         path: "/relatorios",
//       },
//       {
//         icon: User,
//         label: "Meu Perfil",
//         path: "/perfil",
//       },
//     ],
//   },

//   // PERFIL: FORNECEDOR
//   FORNECEDOR: {
//     items: [
//       {
//         icon: Home,
//         label: "Dashboard",
//         path: "/dashboard",
//       },
//       {
//         icon: FileText,
//         label: "Minhas Cotações",
//         path: "/compras/portal-fornecedor",
//         badge: "pendentes",
//       },
//       {
//         icon: ShoppingCart,
//         label: "Meus Pedidos",
//         path: "/compras/pos",
//       },
//       {
//         icon: Building2,
//         label: "Minha Empresa",
//         path: "/cadastros/fornecedores/meu-cadastro",
//       },
//       {
//         icon: User,
//         label: "Meu Perfil",
//         path: "/perfil",
//       },
//     ],
//   },

//   // PERFIL: RECEBIMENTO/ARMAZÉM
//   RECEBIMENTO: {
//     items: [
//       {
//         icon: Home,
//         label: "Dashboard",
//         path: "/dashboard",
//       },
//       {
//         icon: MapPin,
//         label: "Locais",
//         path: "/cadastros/locais",
//       },
//       {
//         icon: Truck,
//         label: "Recebimento",
//         badge: "aguardando",
//         submenu: [
//           { label: "Check-in", path: "/recebimento/checkin" },
//           { label: "Conferência", path: "/recebimento/conferencia" },
//           { label: "Aguardando", path: "/recebimento/aguardando" },
//         ],
//       },
//       {
//         icon: Package,
//         label: "Estoque",
//         submenu: [
//           { label: "Consultar Estoque", path: "/estoque/consulta" },
//           { label: "Movimentações", path: "/estoque/movimentacoes" },
//           { label: "Transferências", path: "/estoque/transferencias" },
//           { label: "Inventário", path: "/estoque/inventario" },
//         ],
//       },
//       {
//         icon: Send,
//         label: "Expedição",
//         submenu: [
//           { label: "Ordens de Separação", path: "/expedicao/ordens" },
//           { label: "Reposição", path: "/expedicao/reposicao" },
//         ],
//       },
//       {
//         icon: AlertTriangle,
//         label: "Validade",
//         badge: "criticos",
//         highlight: true,
//         submenu: [
//           { label: "Dashboard", path: "/validade/dashboard" },
//           { label: "Campanhas", path: "/validade/campanhas" },
//           { label: "Descartes", path: "/validade/descartes" },
//         ],
//       },
//       {
//         icon: User,
//         label: "Meu Perfil",
//         path: "/perfil",
//       },
//     ],
//   },

//   // PERFIL: QA (QUALIDADE)
//   QA: {
//     items: [
//       {
//         icon: Home,
//         label: "Dashboard",
//         path: "/dashboard",
//       },
//       {
//         icon: Shield,
//         label: "Qualidade",
//         badge: "quarentena",
//         submenu: [
//           { label: "Fila de Quarentena", path: "/qualidade/quarentena" },
//           { label: "Inspeções", path: "/qualidade/inspecoes" },
//         ],
//       },
//       {
//         icon: Package,
//         label: "Estoque",
//         path: "/estoque/consulta",
//       },
//       {
//         icon: AlertTriangle,
//         label: "Validade",
//         badge: "criticos",
//         highlight: true,
//         submenu: [
//           { label: "Dashboard", path: "/validade/dashboard" },
//           { label: "Campanhas", path: "/validade/campanhas" },
//           { label: "Descartes", path: "/validade/descartes" },
//         ],
//       },
//       {
//         icon: BarChart3,
//         label: "Relatórios",
//         path: "/relatorios",
//       },
//       {
//         icon: User,
//         label: "Meu Perfil",
//         path: "/perfil",
//       },
//     ],
//   },

//   // PERFIL: FINANCEIRO
//   FINANCEIRO: {
//     items: [
//       {
//         icon: Home,
//         label: "Dashboard",
//         path: "/dashboard",
//       },
//       {
//         icon: DollarSign,
//         label: "Conferência Fiscal",
//         path: "/recebimento/fiscal",
//         badge: "pendentes",
//       },
//       {
//         icon: ShoppingCart,
//         label: "Pedidos de Compra",
//         path: "/compras/pos",
//       },
//       {
//         icon: Package,
//         label: "Estoque",
//         path: "/estoque/consulta",
//       },
//       {
//         icon: AlertTriangle,
//         label: "Validades",
//         path: "/validade/dashboard",
//       },
//       {
//         icon: BarChart3,
//         label: "Relatórios",
//         path: "/relatorios",
//       },
//       {
//         icon: User,
//         label: "Meu Perfil",
//         path: "/perfil",
//       },
//     ],
//   },

//   // PERFIL: ADMIN
//   ADMIN: {
//     items: [
//       {
//         icon: Home,
//         label: "Dashboard",
//         path: "/dashboard",
//       },
//       {
//         icon: Package,
//         label: "Cadastros",
//         submenu: [
//           { label: "Produtos", path: "/cadastros/produtos" },
//           { label: "Fornecedores", path: "/cadastros/fornecedores" },
//           { label: "Locais", path: "/cadastros/locais" },
//           { label: "Usuários", path: "/cadastros/usuarios" },
//         ],
//       },
//       {
//         icon: FileText,
//         label: "Requisições",
//         submenu: [
//           { label: "Todas as Requisições", path: "/requisicoes" },
//           { label: "Aprovar", path: "/requisicoes/aprovar" },
//         ],
//       },
//       {
//         icon: ShoppingCart,
//         label: "Compras",
//         submenu: [
//           { label: "RFQs", path: "/compras/rfqs" },
//           { label: "Pedidos de Compra", path: "/compras/pos" },
//         ],
//       },
//       {
//         icon: Truck,
//         label: "Recebimento",
//         submenu: [
//           { label: "Check-in", path: "/recebimento/checkin" },
//           { label: "Conferência", path: "/recebimento/conferencia" },
//           { label: "Aguardando", path: "/recebimento/aguardando" },
//           { label: "Fiscal", path: "/recebimento/fiscal" },
//         ],
//       },
//       {
//         icon: Shield,
//         label: "Qualidade",
//         submenu: [
//           { label: "Quarentena", path: "/qualidade/quarentena" },
//           { label: "Inspeções", path: "/qualidade/inspecoes" },
//         ],
//       },
//       {
//         icon: Package,
//         label: "Estoque",
//         submenu: [
//           { label: "Consultar", path: "/estoque/consulta" },
//           { label: "Movimentações", path: "/estoque/movimentacoes" },
//           { label: "Transferências", path: "/estoque/transferencias" },
//           { label: "Inventário", path: "/estoque/inventario" },
//         ],
//       },
//       {
//         icon: Send,
//         label: "Expedição",
//         submenu: [
//           { label: "Ordens", path: "/expedicao/ordens" },
//           { label: "Reposição", path: "/expedicao/reposicao" },
//         ],
//       },
//       {
//         icon: AlertTriangle,
//         label: "Validade",
//         badge: "criticos",
//         highlight: true,
//         submenu: [
//           { label: "Dashboard", path: "/validade/dashboard" },
//           { label: "Campanhas", path: "/validade/campanhas" },
//           { label: "Descartes", path: "/validade/descartes" },
//         ],
//       },
//       {
//         icon: BarChart3,
//         label: "Relatórios",
//         path: "/relatorios",
//       },
//       {
//         icon: Settings,
//         label: "Admin",
//         submenu: [
//           { label: "Políticas de Validade", path: "/admin/politicas" },
//           { label: "Padrões de Etiquetas", path: "/admin/etiquetas" },
//           { label: "Workflows", path: "/admin/workflows" },
//           { label: "Auditoria", path: "/admin/auditoria" },
//         ],
//       },
//       {
//         icon: User,
//         label: "Meu Perfil",
//         path: "/perfil",
//       },
//     ],
//   },
// }

// export function getSidebarConfig(profile: string): { items: MenuItem[] } {
//   const userProfile = profile as UserProfile
//   return SIDEBAR_CONFIG[userProfile] || SIDEBAR_CONFIG.GERAL
// }


import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  CheckSquare,
  FlaskConical,
  Warehouse,
  Truck,
  AlertTriangle,
  BarChart3,
  Settings,
  Users,
  MapPin,
  Building2,
  User,
  Home,
  Send,
  Target,
  DollarSign,
  Shield,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth";

// 💡 1. Atualizado para bater com as strings exatas do validador do teu backend
export type UserProfile =
  | "GERAL"
  | "REQUISITANTE"
  | "COMPRAS_PROCUREMENT" // Mudado de COMPRAS para COMPRAS_PROCUREMENT
  | "FORNECEDOR"
  | "RECEBIMENTO_ARMAZEM"  // Mudado de RECEBIMENTO para RECEBIMENTO_ARMAZEM
  | "QUALIDADE_QA"        // Mudado de QA para QUALIDADE_QA
  | "FINANCEIRO"
  | "ADMIN"

interface MenuItem {
  icon: any
  label: string
  path?: string | null
  badge?: string | number | null
  highlight?: boolean
  submenu?: Array<{ label: string; path: string }>
}

export const SIDEBAR_CONFIG: Record<UserProfile, { items: MenuItem[] }> = {


  // PERFIL: GERAL (Acesso Completo - todas as opções)
  GERAL: {
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      {
        icon: Package,
        label: "Cadastros",
        submenu: [
          { label: "Produtos", path: "/cadastros/produtos" },
          { label: "Fornecedores", path: "/cadastros/fornecedores" },
          { label: "Locais", path: "/cadastros/locais" },
          { label: "Usuários", path: "/cadastros/usuarios" },
        ],
      },
      {
        icon: FileText,
        label: "Requisições",
        submenu: [
          { label: "Minhas Requisições", path: "/requisicoes" },
          { label: "Nova Requisição", path: "/requisicoes/nova" },
          { label: "Aprovar Requisições", path: "/requisicoes/aprovar" },
        ],
      },
      {
        icon: ShoppingCart,
        label: "Compras",
        submenu: [
          { label: "RFQs", path: "/compras/rfqs" },
          { label: "Pedidos de Compra", path: "/compras/pos" },
        ],
      },
      {
        icon: CheckSquare,
        label: "Recebimento",
        submenu: [
          { label: "Check-in", path: "/recebimento/checkin" },
          { label: "Conferência", path: "/recebimento/conferencia" },
          { label: "Aguardando", path: "/recebimento/aguardando" },
          { label: "Fiscal", path: "/recebimento/fiscal" },
        ],
      },
      {
        icon: FlaskConical,
        label: "Qualidade",
        submenu: [
          { label: "Quarentena", path: "/qualidade/quarentena" },
          { label: "Inspeções", path: "/qualidade/inspecoes" },
        ],
      },
      {
        icon: Warehouse,
        label: "Estoque",
        submenu: [
          { label: "Consultar", path: "/estoque/consulta" },
          { label: "Movimentações", path: "/estoque/movimentacoes" },
          { label: "Transferências", path: "/estoque/transferencias" },
          { label: "Inventário", path: "/estoque/inventario" },
        ],
      },
      {
        icon: Truck,
        label: "Expedição",
        submenu: [
          { label: "Ordens", path: "/expedicao/ordens" },
          { label: "Reposição", path: "/expedicao/reposicao" },
        ],
      },
      {
        icon: AlertTriangle,
        label: "Validade",
        badge: "criticos",
        highlight: true,
        submenu: [
          { label: "Dashboard", path: "/validade/dashboard" },
          { label: "Campanhas", path: "/validade/campanhas" },
          { label: "Descartes", path: "/validade/descartes" },
        ],
      },
      { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
      {
        icon: Settings,
        label: "Admin",
        submenu: [
          { label: "Políticas de Validade", path: "/admin/politicas" },
          { label: "Padrões de Etiquetas", path: "/admin/etiquetas" },
          { label: "Workflows", path: "/admin/workflows" },
          { label: "Auditoria", path: "/admin/auditoria" },
        ],
      },
      { icon: User, label: "Meu Perfil", path: "/perfil" },
    ],
  },

  // PERFIL: REQUISITANTE
  REQUISITANTE: {
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      {
        icon: FileText,
        label: "Requisições",
        badge: "pendentes",
        submenu: [
          { label: "Minhas Requisições", path: "/requisicoes" },
          { label: "Nova Requisição", path: "/requisicoes/nova" },
        ],
      },
      { icon: Package, label: "Estoque", path: "/estoque/consulta" },
      {
        icon: AlertTriangle,
        label: "Validades",
        path: "/validade/dashboard",
        badge: "criticos",
        highlight: true,
      },
      { icon: User, label: "Meu Perfil", path: "/perfil" },
    ],
  },

  // 💡 PERFIL ATUALIZADO: COMPRAS_PROCUREMENT
  COMPRAS_PROCUREMENT: {
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      {
        icon: Package,
        label: "Cadastros",
        submenu: [
          { label: "Produtos", path: "/cadastros/produtos" },
          { label: "Fornecedores", path: "/cadastros/fornecedores" },
        ],
      },
      {
        icon: FileText,
        label: "Requisições",
        badge: "aprovacao",
        submenu: [
          { label: "Todas as Requisições", path: "/requisicoes" },
          { label: "Aprovar Requisições", path: "/requisicoes/aprovar" },
        ],
      },
      {
        icon: ShoppingCart,
        label: "Compras",
        badge: "pendentes",
        submenu: [
          { label: "RFQs", path: "/compras/rfqs" },
          { label: "Pedidos de Compra", path: "/compras/pos" },
        ],
      },
      { icon: Package, label: "Estoque", path: "/estoque/consulta" },
      {
        icon: AlertTriangle,
        label: "Validade",
        badge: "criticos",
        highlight: true,
        submenu: [
          { label: "Dashboard", path: "/validade/dashboard" },
          { label: "Campanhas", path: "/validade/campanhas" },
        ],
      },
      { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
      { icon: User, label: "Meu Perfil", path: "/perfil" },
    ],
  },

  // PERFIL: FORNECEDOR
  FORNECEDOR: {
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      { icon: FileText, label: "Minhas Cotações", path: "/compras/portal-fornecedor", badge: "pendentes" },
      { icon: ShoppingCart, label: "Meus Pedidos", path: "/compras/pos" },
      { icon: Building2, label: "Minha Empresa", path: "/cadastros/fornecedores/meu-cadastro" },
      { icon: User, label: "Meu Perfil", path: "/perfil" },
    ],
  },

  // 💡 PERFIL ATUALIZADO: RECEBIMENTO_ARMAZEM
  RECEBIMENTO_ARMAZEM: {
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      { icon: MapPin, label: "Locais", path: "/cadastros/locais" },
      {
        icon: Truck,
        label: "Recebimento",
        badge: "aguardando",
        submenu: [
          { label: "Check-in", path: "/recebimento/checkin" },
          { label: "Conferência", path: "/recebimento/conferencia" },
          { label: "Aguardando", path: "/recebimento/aguardando" },
        ],
      },
      {
        icon: Package,
        label: "Estoque",
        submenu: [
          { label: "Consultar Estoque", path: "/estoque/consulta" },
          { label: "Movimentações", path: "/estoque/movimentacoes" },
          { label: "Transferências", path: "/estoque/transferencias" },
          { label: "Inventário", path: "/estoque/inventario" },
        ],
      },
      {
        icon: Send,
        label: "Expedição",
        submenu: [
          { label: "Ordens de Separação", path: "/expedicao/ordens" },
          { label: "Reposição", path: "/expedicao/reposicao" },
        ],
      },
      {
        icon: AlertTriangle,
        label: "Validade",
        badge: "criticos",
        highlight: true,
        submenu: [
          { label: "Dashboard", path: "/validade/dashboard" },
          { label: "Campanhas", path: "/validade/campanhas" },
          { label: "Descartes", path: "/validade/descartes" },
        ],
      },
      { icon: User, label: "Meu Perfil", path: "/perfil" },
    ],
  },

  // 💡 PERFIL ATUALIZADO: QUALIDADE_QA
  QUALIDADE_QA: {
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      {
        icon: Shield,
        label: "Qualidade",
        badge: "quarentena",
        submenu: [
          { label: "Fila de Quarentena", path: "/qualidade/quarentena" },
          { label: "Inspeções", path: "/qualidade/inspecoes" },
        ],
      },
      { icon: Package, label: "Estoque", path: "/estoque/consulta" },
      {
        icon: AlertTriangle,
        label: "Validade",
        badge: "criticos",
        highlight: true,
        submenu: [
          { label: "Dashboard", path: "/validade/dashboard" },
          { label: "Campanhas", path: "/validade/campanhas" },
          { label: "Descartes", path: "/validade/descartes" },
        ],
      },
      { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
      { icon: User, label: "Meu Perfil", path: "/perfil" },
    ],
  },

  // PERFIL: FINANCEIRO
  FINANCEIRO: {
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      { icon: DollarSign, label: "Conferência Fiscal", path: "/recebimento/fiscal", badge: "pendentes" },
      { icon: ShoppingCart, label: "Pedidos de Compra", path: "/compras/pos" },
      { icon: Package, label: "Estoque", path: "/estoque/consulta" },
      { icon: AlertTriangle, label: "Validades", path: "/validade/dashboard" },
      { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
      { icon: User, label: "Meu Perfil", path: "/perfil" },
    ],
  },

  // PERFIL: ADMIN
  ADMIN: {
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      {
        icon: Package,
        label: "Cadastros",
        submenu: [
          { label: "Produtos", path: "/cadastros/produtos" },
          { label: "Fornecedores", path: "/cadastros/fornecedores" },
          { label: "Locais", path: "/cadastros/locais" },
          { label: "Usuários", path: "/cadastros/usuarios" },
        ],
      },
      {
        icon: FileText,
        label: "Requisições",
        submenu: [
          { label: "Todas as Requisições", path: "/requisicoes" },
          { label: "Aprovar", path: "/requisicoes/approvar" },
        ],
      },
      {
        icon: ShoppingCart,
        label: "Compras",
        submenu: [
          { label: "RFQs", path: "/compras/rfqs" },
          { label: "Pedidos de Compra", path: "/compras/pos" },
        ],
      },
      {
        icon: Truck,
        label: "Recebimento",
        submenu: [
          { label: "Check-in", path: "/recebimento/checkin" },
          { label: "Conferência", path: "/recebimento/conferencia" },
          { label: "Aguardando", path: "/recebimento/aguardando" },
          { label: "Fiscal", path: "/recebimento/fiscal" },
        ],
      },
      {
        icon: Shield,
        label: "Qualidade",
        submenu: [
          { label: "Quarentena", path: "/qualidade/quarentena" },
          { label: "Inspeções", path: "/qualidade/inspecoes" },
        ],
      },
      {
        icon: Package,
        label: "Estoque",
        submenu: [
          { label: "Consultar", path: "/estoque/consulta" },
          { label: "Movimentações", path: "/estoque/movimentacoes" },
          { label: "Transferências", path: "/estoque/transferencias" },
          { label: "Inventário", path: "/estoque/inventario" },
        ],
      },
      {
        icon: Send,
        label: "Expedição",
        submenu: [
          { label: "Ordens", path: "/expedicao/ordens" },
          { label: "Reposição", path: "/expedicao/reposicao" },
        ],
      },
      {
        icon: AlertTriangle,
        label: "Validade",
        badge: "criticos",
        highlight: true,
        submenu: [
          { label: "Dashboard", path: "/validade/dashboard" },
          { label: "Campanhas", path: "/validade/campanhas" },
          { label: "Descartes", path: "/validade/descartes" },
        ],
      },
      { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
      {
        icon: Settings,
        label: "Admin",
        submenu: [
          { label: "Políticas de Validade", path: "/admin/politicas" },
          { label: "Padrões de Etiquetas", path: "/admin/etiquetas" },
          { label: "Workflows", path: "/admin/workflows" },
          { label: "Auditoria", path: "/admin/auditoria" },
        ],
      },
      { icon: User, label: "Meu Perfil", path: "/perfil" },
    ],
  },
}

// 💡 2. Garante o fallback seguro e tipagem perfeita ao chamar a função
export function getSidebarConfig(profile?: string): { items: MenuItem[] } {
  const userProfile = (profile as UserProfile) || "REQUISITANTE";
  return SIDEBAR_CONFIG[userProfile] || SIDEBAR_CONFIG.GERAL;
}