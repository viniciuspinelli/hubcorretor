import { auth } from "@/auth";
import {
  FileText,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    label: "Cotações Abertas",
    value: "—",
    icon: FileText,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Clientes Ativos",
    value: "—",
    icon: Users,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Comissões do Mês",
    value: "R$ —",
    icon: DollarSign,
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    label: "Vendas Fechadas",
    value: "—",
    icon: TrendingUp,
    color: "bg-purple-50 text-purple-600",
  },
];

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo ao HubCorretor 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Olá, {session?.user?.name ?? "Corretor"}! Aqui está o resumo do seu painel.
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm"
          >
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder de atividade recente */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Atividade Recente
        </h2>
        <p className="text-sm text-gray-400 text-center py-8">
          Nenhuma atividade registrada ainda. Comece cadastrando um cliente!
        </p>
      </div>
    </div>
  );
}
