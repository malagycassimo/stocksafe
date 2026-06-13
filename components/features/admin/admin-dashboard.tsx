import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, Users, AlertTriangle, TrendingUp } from "lucide-react"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

export function AdminDashboard() {
  const kpis = {
    produtosCadastrados: 1250,
    valorEstoque: 850000,
    usuariosAtivos: 45,
    alertasValidade: 12,
    taxaConformidade: 97.8,
  }

  const movimentacoesData = [
    { dia: "01", entradas: 120, saidas: 80 },
    { dia: "05", entradas: 150, saidas: 95 },
    { dia: "10", entradas: 180, saidas: 110 },
    { dia: "15", entradas: 140, saidas: 100 },
    { dia: "20", entradas: 200, saidas: 130 },
    { dia: "25", entradas: 170, saidas: 120 },
    { dia: "30", entradas: 190, saidas: 140 },
  ]

  const distribuicaoData = [
    { name: "Alimentos", value: 35, color: "#10B981" },
    { name: "Bebidas", value: 25, color: "#3B82F6" },
    { name: "Limpeza", value: 20, color: "#F59E0B" },
    { name: "Outros", value: 20, color: "#8B5CF6" },
  ]

  const atividadesRecentes = [
    { usuario: "João Silva", acao: "criou", entidade: "PO #789", tempo: "há 5 minutos" },
    { usuario: "Maria Santos", acao: "aprovou", entidade: "RI #456", tempo: "há 15 minutos" },
    { usuario: "Pedro Costa", acao: "recebeu", entidade: "Lote L-2025-045", tempo: "há 30 minutos" },
    { usuario: "Ana Lima", acao: "inspecionou", entidade: "Produto XYZ", tempo: "há 1 hora" },
    { usuario: "Carlos Souza", acao: "cadastrou", entidade: "Fornecedor ABC", tempo: "há 2 horas" },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produtos</CardTitle>
            <Package className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.produtosCadastrados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor em Estoque</CardTitle>
            <DollarSign className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(
                kpis.valorEstoque,
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuários Ativos</CardTitle>
            <Users className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.usuariosAtivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Validade</CardTitle>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{kpis.alertasValidade}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conformidade</CardTitle>
            <TrendingUp className="w-5 h-5 text-imperial" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-imperial">{kpis.taxaConformidade}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações dos Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={movimentacoesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="entradas" stroke="#10B981" strokeWidth={2} name="Entradas" />
                <Line type="monotone" dataKey="saidas" stroke="#EF4444" strokeWidth={2} name="Saídas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Estoque por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribuicaoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuicaoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atividadesRecentes.map((atividade, index) => (
              <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                <div className="w-2 h-2 rounded-full bg-imperial" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{atividade.usuario}</span> {atividade.acao}{" "}
                    <span className="font-medium text-imperial">{atividade.entidade}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{atividade.tempo}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm text-imperial hover:text-imperial font-medium">Ver log completo →</button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




