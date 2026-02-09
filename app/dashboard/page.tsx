'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import api from '@/src/services/api'
import { Plus, LogOut, Search, TrendingUp, Users, Wallet, AlertCircle, Eye, EyeOff, Filter, Bot } from 'lucide-react'
import { Sidebar } from '@/src/components/Sidebar'
import { DebtorCard } from '@/src/components/DebtorCard'
import { NewLoanModal } from '@/src/components/NewLoanModal'
import { ClientDetailsModal } from '@/src/components/ClientDetailsModal'
import { MessageModal } from '@/src/components/MessageModal'
import { AiChatModal } from '@/src/components/AiChatModal' // <--- Certifique-se de ter criado este arquivo
import { toast } from 'sonner'

// --- INTERFACES ---
interface RawLoan {
  id: string,
  debtorId: string,
  name: string,
  phone: string,
  address: string,
  document?: string,
  amount: number,
  interest: number,
  penalty: number,
  paymentDate: string,
  isPaid: boolean
}

interface DebtorSummary {
    debtorId: string;
    name: string;
    document?: string;
    phone?: string;
    loansCount: number;
    totalAmount: number;
    isPaid: boolean;
    hasLate: boolean;
    nextDate: string;
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState({ name: 'Gestor', email: '' })
  const [loading, setLoading] = useState(true)

  // --- DADOS ---
  const [rawLoans, setRawLoans] = useState<RawLoan[]>([])
  const [metrics, setMetrics] = useState({ totalLent: 0, activeClients: 0, projectedProfit: 0, lateCount: 0 })

  // --- ESTADOS DE CONTROLE ---
  const [searchTerm, setSearchTerm] = useState('')
  const [hidePaid, setHidePaid] = useState(false) // Filtro "Olho"

  // --- MODAIS ---
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false) // Modal da IA
  const [editingLoan, setEditingLoan] = useState<any>(null)
  const [selectedClient, setSelectedClient] = useState<DebtorSummary | null>(null)
  const [messageClient, setMessageClient] = useState<any>(null)

  // --- 1. CARREGAMENTO INICIAL ---
  useEffect(() => {
    const token = Cookies.get('token')
    if(!token) router.replace('/')

    // Busca dados do usuário logado
    api.get('/me')
        .then((res) => setUser(res.data.user))
        .catch(() => {
            Cookies.remove('token');
            router.replace('/')
        })

    fetchLoans()
  }, [router])

  // --- 2. BUSCA EMPRÉSTIMOS ---
  async function fetchLoans() {
    try {
      const response = await api.get('/loans')
      setRawLoans(response.data)
      calculateMetrics(response.data)
      setLoading(false)
    } catch (error) {
        console.error(error);
        setLoading(false);
        toast.error("Erro ao atualizar dashboard.")
    }
  }

  // --- 3. CÁLCULO DE MÉTRICAS ---
  function calculateMetrics(loans: RawLoan[]) {
      // Total Emprestado (Soma dos valores originais)
      const total = loans.reduce((acc, l) => acc + l.amount, 0);

      // Lucro Projetado (Soma dos Juros + Multas)
      const profit = loans.reduce((acc, l) => {
          const juros = l.amount * (l.interest / 100);
          return acc + juros + l.penalty;
      }, 0);

      // Clientes Ativos: Conta apenas quem tem dívida aberta (!isPaid)
      const activeDebtorIds = new Set(loans.filter(l => !l.isPaid).map(l => l.debtorId));

      // Atrasados: Não pagos com data menor que hoje
      const late = loans.filter(l => !l.isPaid && new Date(l.paymentDate) < new Date()).length;

      setMetrics({
          totalLent: total,
          projectedProfit: profit,
          activeClients: activeDebtorIds.size,
          lateCount: late
      })
  }

  // --- 4. AGRUPAMENTO DE CLIENTES ---
  const groupedDebtors = Object.values(rawLoans.reduce((acc: Record<string, DebtorSummary>, loan) => {
      const key = loan.debtorId;

      if (!acc[key]) {
          acc[key] = {
              debtorId: loan.debtorId,
              name: loan.name,
              document: loan.document,
              phone: loan.phone,
              loansCount: 0,
              totalAmount: 0,
              isPaid: true, // Assume pago até provar o contrário
              hasLate: false,
              nextDate: loan.paymentDate
          };
      }

      acc[key].loansCount += 1;

      // Cálculo do total desta parcela (Base + Juros + Multa)
      const interestAmount = loan.amount * (loan.interest / 100);
      const totalLoanVal = loan.amount + interestAmount + loan.penalty;

      if (!loan.isPaid) {
          acc[key].isPaid = false; // Se tem uma parcela aberta, o cliente deve
          acc[key].totalAmount += totalLoanVal;

          // Verifica atraso
          if (new Date(loan.paymentDate) < new Date()) {
             acc[key].hasLate = true;
          }

          // Define data do próximo vencimento (o mais antigo em aberto)
          if (new Date(loan.paymentDate) < new Date(acc[key].nextDate) || acc[key].isPaid) {
             acc[key].nextDate = loan.paymentDate;
          }
      }
      return acc;
  }, {}));

  // --- 5. FILTROS VISUAIS ---
  const filteredDebtors = groupedDebtors.filter(d => {
      // Filtro de Texto (Nome ou CPF)
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (d.document && d.document.includes(searchTerm));

      // Filtro de "Ocultar Quitados"
      const matchesPaidStatus = hidePaid ? !d.isPaid : true;

      return matchesSearch && matchesPaidStatus;
  }).sort((a, b) => b.totalAmount - a.totalAmount); // Ordena por maior dívida primeiro

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-purple-500 font-bold animate-pulse">Carregando sistema...</div>

  return (
    <div className="flex h-screen bg-black font-sans text-zinc-100 overflow-hidden">

      {/* SIDEBAR (Independente) */}
      <Sidebar user={user} onLogout={() => { Cookies.remove('token'); router.replace('/') }} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">

        {/* HEADER MOBILE */}
        <div className="md:hidden flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-purple-500">Credfy</h1>
            <button onClick={() => { Cookies.remove('token'); router.replace('/') }}><LogOut size={20} /></button>
        </div>

        {/* HEADER DESKTOP */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-zinc-400 text-sm mt-1">Visão geral da sua operação de crédito.</p>
          </div>
          <button
            onClick={() => { setEditingLoan(null); setIsNewLoanOpen(true); }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-purple-900/20 active:scale-95 transition-all w-full md:w-auto justify-center"
          >
            <Plus size={20} /> Novo Empréstimo
          </button>
        </div>

        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard title="Total em Carteira" value={metrics.totalLent} icon={<Wallet size={16} className="text-purple-400"/>} />
            <MetricCard title="Lucro Projetado" value={metrics.projectedProfit} icon={<TrendingUp size={16} className="text-green-400"/>} />
            <MetricCard title="Clientes Ativos" value={metrics.activeClients} icon={<Users size={16} className="text-blue-400"/>} isCurrency={false} />
            <MetricCard title="Parcelas Atrasadas" value={metrics.lateCount} icon={<AlertCircle size={16} className="text-red-400"/>} isCurrency={false} color="red" />
        </div>

        {/* BARRA DE FERRAMENTAS (BUSCA + FILTRO) */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Input de Busca */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nome ou CPF..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 text-white focus:border-purple-500 outline-none placeholder:text-zinc-600 transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* BOTÃO DE OCULTAR QUITADOS */}
            <button
                onClick={() => setHidePaid(!hidePaid)}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all border ${hidePaid ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-black border-zinc-800 text-zinc-500 hover:text-white'}`}
                title={hidePaid ? "Clique para ver todos" : "Clique para ocultar quem já pagou"}
            >
                {hidePaid ? <EyeOff size={18} className="text-purple-500"/> : <Eye size={18}/>}
                <span className="text-sm whitespace-nowrap">{hidePaid ? 'Quitados Ocultos' : 'Mostrar Todos'}</span>
            </button>
        </div>

        {/* GRID DE CARDS (LISTA DE CLIENTES) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDebtors.map(debtor => (
             <DebtorCard
                key={debtor.debtorId}
                data={debtor}
                onOpenDetails={(data) => setSelectedClient(data)}
                onMessage={(data) => setMessageClient(data)}
                onEditClient={(id) => {
                    const loan = rawLoans.find(l => l.debtorId === id);
                    if(loan) {
                        setEditingLoan(loan);
                        setIsNewLoanOpen(true);
                    } else {
                        toast.error("Erro ao carregar dados.")
                    }
                }}
             />
          ))}

          {/* ESTADO VAZIO */}
          {filteredDebtors.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                <Filter className="mx-auto text-zinc-600 mb-2" size={32}/>
                <p className="text-zinc-500">
                    {hidePaid ? 'Nenhum cliente com dívida ativa encontrado.' : 'Nenhum cliente encontrado.'}
                </p>
                {hidePaid && <button onClick={() => setHidePaid(false)} className="mt-2 text-purple-500 hover:text-purple-400 text-sm font-bold underline">Mostrar Quitados</button>}
            </div>
          )}
        </div>

        {/* BOTÃO FLUTUANTE DA IA */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/50 hover:scale-110 transition-transform z-40 group"
        >
          <Bot size={28} className="text-white" />
          <span className="absolute right-full mr-4 bg-zinc-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-700">
             Falar com IA
          </span>
        </button>

      </main>

      {/* --- MODAIS DO SISTEMA --- */}

      <NewLoanModal
        isOpen={isNewLoanOpen}
        onClose={() => { setIsNewLoanOpen(false); setEditingLoan(null); }}
        onSuccess={() => fetchLoans()}
        initialData={editingLoan}
      />

      {selectedClient && (
          <ClientDetailsModal
              client={selectedClient}
              loans={rawLoans}
              onClose={() => setSelectedClient(null)}
              onUpdate={fetchLoans}
              onMessage={(client: any) => setMessageClient(client)}
          />
      )}

      <MessageModal
        isOpen={!!messageClient}
        client={messageClient}
        onClose={() => setMessageClient(null)}
      />

      {/* Modal da IA */}
      <AiChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

    </div>
  )
}

// Componente Visual de Métrica
function MetricCard({ title, value, icon, isCurrency = true, color = "zinc" }: any) {
    const borderColor = color === 'red' ? 'border-red-900/30 bg-red-900/10' : 'border-zinc-800 bg-zinc-900';
    return (
        <div className={`p-4 rounded-xl border ${borderColor} flex flex-col justify-between shadow-lg`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs font-bold text-zinc-500 uppercase">{title}</span>
            </div>
            <span className="text-xl md:text-2xl font-mono font-bold text-white truncate">
                {isCurrency ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value}
            </span>
        </div>
    )
}
