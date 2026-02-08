'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User as UserIcon, LogOut, TrendingUp, LayoutDashboard, ChevronDown, ChevronUp, Wallet, Users} from 'lucide-react'


// Interface atualizada para receber os dados
interface SidebarProps {
  user: { name: string } | null
  debtors: any[] // Recebe a lista para calcular os totais
  onLogout: () => void
}

export function Sidebar({ user, onLogout, debtors = [] }: SidebarProps) {
  const pathname = usePathname()

  // Estado para controlar se mostra ou não os gráficos (Toggle)
  const [showStats, setShowStats] = useState(false)

  // Cálculos de Performance (Protegido contra lista vazia)
  const safeDebtors = Array.isArray(debtors) ? debtors : []
  const totalLent = safeDebtors.reduce((acc, cur) => acc + Number(cur.amount || 0), 0)
  const totalInterest = safeDebtors.reduce((acc, cur) => acc + (Number(cur.amount || 0) * (Number(cur.interest || 0) / 100)), 0)

  // Margem de lucro (visual)
  const profitMargin = totalLent > 0 ? Math.round((totalInterest / totalLent) * 100) : 0

  // Estilo do link
  const linkStyle = (path: string) => `
    w-full flex items-center gap-3 px-4 py-3 font-medium transition-all rounded-r-full mr-4 mb-1
    ${pathname === path
      ? 'bg-purple-600/10 text-purple-400 border-l-4 border-purple-500'
      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}
  `

  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="pt-6 pl-6">
        <h2 className="text-2xl font-bold  tracking-tighter mb-8">
          Cred<span className="text-purple-500">fy</span>
        </h2>
        {/* User Info */}
        <div className="flex items-center gap-3 mb-8 p-3 bg-zinc-900 rounded-lg border border-zinc-800 mr-6">
          <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400">
            <UserIcon size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-zinc-500 uppercase font-semibold">Bem vindo,</p>
            <p className="text-sm font-bold text-white truncate">
              {user?.name || "..."}
            </p>
          </div>
        </div>


        {/* Menu de Navegação */}
        <nav className="mb-6">
          <Link href="/dashboard" className={linkStyle('/dashboard')}>
            <LayoutDashboard size={18} />
            Painel Geral
          </Link>
          <Link href="/dashboard/clients" className={linkStyle('/dashboard/clients')}>
            <Users size={18} />
            Clientes & Ranking
          </Link>
          <Link href="/dashboard/performance" className={linkStyle('/dashboard/performance')}>
            <TrendingUp size={18} />
            Gráficos Detalhados
          </Link>
         
        </nav>




        {/* --- SEÇÃO RETRÁTIL DE ESTATÍSTICAS (O que você pediu) --- */}
        <div className="mr-6 border-t border-zinc-800 pt-4">
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between text-xs font-bold text-zinc-500 uppercase hover:text-white transition-colors mb-4"
          >
            <span className="flex items-center gap-2"><Wallet size={14} /> Resumo Rápido</span>
            {showStats ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Só renderiza se o usuário clicou (showStats === true) */}
          {showStats && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">

              {/* Barra 1: Total Emprestado */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Emprestado</span>
                  <span>R$ {totalLent.toFixed(0)}</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div className="h-full bg-zinc-600 w-full opacity-50"></div>
                </div>
              </div>

              {/* Barra 2: Lucro Projetado */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-purple-300 font-bold">
                  <span>Lucro Previsto</span>
                  <span>+ R$ {totalInterest.toFixed(0)}</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-purple-600 transition-all duration-1000"
                    style={{ width: `${Math.min(profitMargin * 2, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-zinc-600 text-right mt-1">Margem média: {profitMargin}%</p>
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="p-6 border-t border-zinc-900">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Encerrar Sessão
        </button>
      </div>
    </aside>
  )
}