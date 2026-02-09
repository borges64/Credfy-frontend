'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  PieChart,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Wallet,
  TrendingUp,
  UserCircle
} from 'lucide-react'
import { useLoans } from '../Context/LoansContext'

interface SidebarProps {
  user: { name: string; email: string };
  onLogout: () => void;
  // Removemos a necessidade de receber 'debtors' via props
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [isSummaryOpen, setIsSummaryOpen] = useState(true)

  // CONECTA DIRETO NOS DADOS GLOBAIS
  const { loans, loading } = useLoans()

  // --- CÁLCULOS DO RESUMO RÁPIDO (IGUAL AO DASHBOARD) ---
  const metrics = loans.reduce((acc: any, loan: any) => {
      // Cálculo do Lucro (Juros + Multa)
      const interestVal = loan.amount * (loan.interest / 100);
      const profit = interestVal + loan.penalty;

      acc.totalLent += loan.amount;
      acc.totalProfit += profit;

      return acc;
  }, { totalLent: 0, totalProfit: 0 })

  const menuItems = [
    { icon: LayoutDashboard, label: 'Painel Geral', href: '/dashboard' },
    { icon: Users, label: 'Clientes & Ranking', href: '/dashboard/clients' }, // Exemplo de rota
    { icon: PieChart, label: 'Gráficos Detalhados', href: '/dashboard/analytics' }, // Exemplo de rota
    // { icon: Settings, label: 'Configurações', href: '/dashboard/settings' },
  ]

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col hidden md:flex h-full relative z-20">

      {/* PERFIL */}
      <div className="p-6 border-b border-zinc-900">
        <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(147,51,234,0.5)]">
            <UserCircle size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">BEM VINDO,</p>
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Gestor'}</p>
          </div>
        </div>
      </div>

      {/* MENU DE NAVEGAÇÃO */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* --- RESUMO RÁPIDO (AGORA FUNCIONA EM QUALQUER PÁGINA) --- */}
      <div className="p-4 border-t border-zinc-900">
        <button
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="w-full flex items-center justify-between text-xs font-bold text-zinc-500 uppercase mb-4 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Wallet size={14} /> Resumo Rápido
          </div>
          {isSummaryOpen ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
        </button>

        {isSummaryOpen && (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            {loading ? (
                <div className="h-20 bg-zinc-900/50 rounded-xl animate-pulse" />
            ) : (
                <>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>Emprestado</span>
                            <span className="text-zinc-500">R$ 0</span>
                        </div>
                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-700 w-full" />
                        </div>
                        <div className="flex justify-end">
                             <span className="text-sm font-bold text-white font-mono">
                                {metrics.totalLent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                             </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>Lucro Previsto</span>
                            <span className="text-green-500 flex items-center gap-1"><TrendingUp size={10}/> ROI</span>
                        </div>
                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                             {/* Barra de progresso visual (estética) */}
                            <div className="h-full bg-purple-600 w-full" />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                             <span className="text-[10px] text-zinc-600">Margem média: {metrics.totalLent > 0 ? ((metrics.totalProfit / metrics.totalLent) * 100).toFixed(0) : 0}%</span>
                             <span className="text-sm font-bold text-white font-mono">
                                + {metrics.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                             </span>
                        </div>
                    </div>
                </>
            )}
          </div>
        )}
      </div>

      {/* LOGOUT */}
      <div className="p-4 bg-zinc-950">
         <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-zinc-600 hover:text-red-500 transition-colors text-xs font-bold px-2 py-2"
         >
            <LogOut size={16} /> Sair do Sistema
         </button>
      </div>
    </aside>
  )
}
