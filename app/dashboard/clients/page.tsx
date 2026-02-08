'use client'

import { useEffect, useState } from 'react'
import api from '@/src/services/api'
import { Sidebar } from '@/src/components/Sidebar'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { 
    Trophy, ShieldAlert, User, Search, Filter, 
    CheckCircle2, AlertOctagon, History
} from 'lucide-react'

// Interface dos dados
interface ClientRank {
    id: string;
    name: string;
    phone: string;
    totalBorrowed: number;
    totalPaid: number;
    openCount: number;
    paidCount: number; // Precisamos garantir que o backend mande isso ou calculamos
    lateCount: number;
    status: string;
}

export default function ClientsPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [ranking, setRanking] = useState<ClientRank[]>([])
    const [loading, setLoading] = useState(true)
    
    // --- FILTROS ---
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<'todos' | 'risco' | 'vip'>('todos')

    useEffect(() => {
        api.get('/me').then(res => setUser(res.data.user)).catch(() => { Cookies.remove('token'); router.replace('/') })
        loadRanking()
    }, [])

    async function loadRanking() {
        try {
            const { data } = await api.get('/clients-ranking')
            // Ordenação padrão: Score maior primeiro
            const sorted = data.sort((a: ClientRank, b: ClientRank) => {
                const scoreA = calculateScore(a);
                const scoreB = calculateScore(b);
                return scoreB - scoreA;
            })
            setRanking(sorted)
            setLoading(false)
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    // Função auxiliar de Score (Mesma lógica do Card)
    function calculateScore(client: ClientRank) {
        let score = 1000 - (client.lateCount * 150) + (client.totalPaid > 0 ? 50 : 0);
        return Math.max(0, Math.min(1000, score));
    }

    // --- LÓGICA DE FILTRAGEM ---
    const filteredClients = ranking.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
        const score = calculateScore(client);

        if (!matchesSearch) return false;

        if (filterType === 'risco') return score < 500; // Só mostra Score baixo
        if (filterType === 'vip') return score >= 850;  // Só mostra Score alto
        
        return true; // 'todos'
    })

    return (
        <div className="flex h-screen bg-black font-sans text-zinc-100 overflow-hidden">
            <Sidebar user={user} debtors={[]} onLogout={() => { Cookies.remove('token'); router.replace('/') }} />

            <main className="flex-1 p-8 overflow-y-auto">
                
                {/* HEADER COM BUSCA E FILTROS */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Trophy className="text-yellow-500" /> Score de Crédito
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">Análise de risco e histórico completo da carteira.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                        {/* Botões de Filtro */}
                        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                            <button 
                                onClick={() => setFilterType('todos')}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${filterType === 'todos' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Todos
                            </button>
                            <button 
                                onClick={() => setFilterType('vip')}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${filterType === 'vip' ? 'bg-green-900/30 text-green-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Somente VIPs
                            </button>
                            <button 
                                onClick={() => setFilterType('risco')}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${filterType === 'risco' ? 'bg-red-900/30 text-red-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Alto Risco
                            </button>
                        </div>

                        {/* Input de Busca */}
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome..." 
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* GRID DE CARDS */}
                {loading ? (
                    <div className="text-zinc-500 flex items-center gap-2"><div className="w-4 h-4 bg-purple-500 rounded-full animate-ping"/> Analisando histórico...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredClients.map(client => (
                            <ScoreCard key={client.id} client={client} />
                        ))}
                    </div>
                )}

                {!loading && filteredClients.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                        <Filter className="text-zinc-600 mb-4" size={48} />
                        <p className="text-zinc-500 font-bold">Nenhum cliente encontrado com este filtro.</p>
                    </div>
                )}
            </main>
        </div>
    )
}

// --- CARD DE SCORE MELHORADO ---
function ScoreCard({ client }: { client: ClientRank }) {
    
    // Cálculo do Score
    let score = 1000 - (client.lateCount * 150) + (client.totalPaid > 0 ? 50 : 0);
    score = Math.max(0, Math.min(1000, score));

    // Definição das Categorias
    let theme = {
        bg: 'bg-zinc-900',
        border: 'border-zinc-800',
        text: 'text-zinc-400',
        label: 'Regular (B)',
        barColor: 'bg-blue-500',
        statusColor: 'text-blue-400'
    };

    if (score >= 850) {
        theme = {
            bg: 'bg-green-950/10',
            border: 'border-green-500/20',
            text: 'text-green-500',
            label: 'Prime (A+)',
            barColor: 'bg-green-500',
            statusColor: 'text-green-400'
        };
    } else if (score < 500) {
        theme = {
            bg: 'bg-red-950/10',
            border: 'border-red-500/20',
            text: 'text-red-500',
            label: 'Risco Alto (C-)',
            barColor: 'bg-red-600',
            statusColor: 'text-red-400'
        };
    }

    // Lógica de Histórico (Correção da Ambiguidade)
    let historyLabel = "Sem Histórico";
    let historyColor = "text-zinc-500";

    if (client.lateCount > 0) {
        historyLabel = "Histórico Irregular";
        historyColor = "text-red-500";
    } else if (client.totalPaid > 0) {
        historyLabel = "Bom Pagador";
        historyColor = "text-green-500";
    } else if (client.openCount > 0) {
        historyLabel = "Cliente Novo"; // Só é novo se não tem atraso nem pagamento antigo
        historyColor = "text-blue-400";
    }

    return (
        <div className={`p-6 rounded-xl border ${theme.border} ${theme.bg} relative overflow-hidden group hover:border-opacity-50 transition-all`}>
            
            {/* Header do Card */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl bg-black/40 border border-white/5 ${theme.text}`}>
                        {client.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg truncate w-40">{client.name}</h3>
                        <div className={`text-xs font-bold flex items-center gap-1 ${historyColor}`}>
                           {client.lateCount > 0 ? <AlertOctagon size={12}/> : <History size={12}/>}
                           {historyLabel}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`block text-2xl font-black ${theme.statusColor}`}>{score}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Score</span>
                </div>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden mb-6 border border-zinc-800/50">
                <div className={`h-full ${theme.barColor} transition-all duration-1000`} style={{ width: `${score/10}%` }} />
            </div>

            {/* Estatísticas (Dossiê) */}
            <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/50 pt-4 bg-black/20 -mx-6 -mb-6 px-6 pb-6">
                <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Em Aberto</p>
                    <p className="text-white font-mono text-sm font-bold flex items-center gap-2">
                        {client.openCount} {client.openCount === 1 ? 'Contrato' : 'Contratos'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Negativos</p>
                    <p className={`font-mono text-sm font-bold ${client.lateCount > 0 ? 'text-red-500' : 'text-zinc-300'}`}>
                        {client.lateCount} {client.lateCount === 1 ? 'Atraso' : 'Atrasos'}
                    </p>
                </div>
            </div>

        </div>
    )
}