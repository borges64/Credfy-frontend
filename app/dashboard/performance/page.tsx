'use client'

import { useEffect, useState, useMemo } from 'react'
import api from '@/src/services/api'
import { Sidebar } from '@/src/components/Sidebar'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { TrendingUp, DollarSign, PiggyBank, AlertOctagon } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function PerformancePage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [loans, setLoans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/me').then(res => setUser(res.data.user)).catch(() => { Cookies.remove('token'); router.replace('/') })
        api.get('/loans').then(res => { setLoans(res.data); setLoading(false) }).catch(err => console.error(err))
    }, [])

    // --- CÁLCULOS FINANCEIROS (A MÁGICA) ---
    const metrics = useMemo(() => {
        let totalLent = 0;
        let totalReceived = 0;
        let projectedInterest = 0;
        let totalPenalty = 0;

        loans.forEach(loan => {
            totalLent += loan.amount;
            const interestVal = loan.amount * (loan.interest / 100);
            projectedInterest += interestVal;
            totalPenalty += loan.penalty;

            if (loan.isPaid) {
                totalReceived += (loan.amount + interestVal + loan.penalty);
            }
        });

        const totalReceivable = totalLent + projectedInterest + totalPenalty;
        const projectedProfit = (projectedInterest + totalPenalty) - (totalReceived - totalLent > 0 ? 0 : 0); // Simplificado

        return { totalLent, totalReceived, totalReceivable, projectedProfit, totalPenalty }
    }, [loans]);

    // --- DADOS PARA O GRÁFICO DE FLUXO MENSAL ---
    const monthlyData = useMemo(() => {
        const grouped: any = {};
        loans.forEach(loan => {
            if(loan.isPaid) return; // Só projeta futuro
            const date = new Date(loan.paymentDate);
            const key = `${date.getMonth() + 1}/${date.getFullYear()}`; // Ex: "10/2023"
            
            if(!grouped[key]) grouped[key] = { name: key, Entrada: 0 };
            grouped[key].Entrada += (loan.amount + (loan.amount * (loan.interest/100)) + loan.penalty);
        });
        // Ordena por data e pega os próximos 6 meses
        return Object.values(grouped).sort((a:any,b:any) => {
            const [ma, ya] = a.name.split('/'); const [mb, yb] = b.name.split('/');
            return new Date(Number(ya), Number(ma)-1).getTime() - new Date(Number(yb), Number(mb)-1).getTime();
        }).slice(0, 6); 
    }, [loans]);

    // --- DADOS PARA O GRÁFICO DE PIZZA (STATUS) ---
    const pieData = useMemo(() => {
        let paid = 0, pending = 0, late = 0;
        const today = new Date().setHours(0,0,0,0);

        loans.forEach(loan => {
            if(loan.isPaid) paid++;
            else if (new Date(loan.paymentDate).getTime() < today) late++;
            else pending++;
        });

        return [
            { name: 'Pagos', value: paid, color: '#22c55e' }, // Green
            { name: 'Em Aberto', value: pending, color: '#a855f7' }, // Purple
            { name: 'Atrasados', value: late, color: '#ef4444' }, // Red
        ].filter(d => d.value > 0);
    }, [loans]);


    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
                    <p className="text-zinc-400 text-xs mb-1">{label}</p>
                    <p className="text-purple-400 font-bold font-mono">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex h-screen bg-black font-sans text-zinc-100 overflow-hidden">
            <Sidebar user={user} debtors={[]} onLogout={() => { Cookies.remove('token'); router.replace('/') }} />

            <main className="flex-1 p-8 overflow-y-auto relative">
                {/* HEADER */}
                 <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-left duration-500">
                    <div className="p-3 bg-purple-600/20 rounded-lg text-purple-500 box-shadow-purple-glow">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Performance Financeira</h1>
                        <p className="text-zinc-400">Análise detalhada da sua carteira.</p>
                    </div>
                </div>

                {/* CARDS DE RESUMO */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <CardMetric title="Total Emprestado (Capital)" value={metrics.totalLent} icon={<DollarSign size={20} />} color="zinc" />
                    <CardMetric title="Total Já Recebido" value={metrics.totalReceived} icon={<PiggyBank size={20} />} color="green" />
                    <CardMetric title="Lucro Bruto Projetado" value={metrics.projectedProfit} subtitle={`Inclui R$ ${metrics.totalPenalty.toFixed(2)} de multas`} icon={<TrendingUp size={20} />} color="purple" isBold />
                    <CardMetric title="Total a Receber (Geral)" value={metrics.totalReceivable - metrics.totalReceived} icon={<AlertOctagon size={20} />} color="red" />
                </div>

                {/* ÁREA DOS GRÁFICOS */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[400px]">
                    
                    {/* GRÁFICO 1: FLUXO DE CAIXA MENSAL */}
                    <div className="xl:col-span-2 bg-[#0a0a0a] border border-zinc-800 rounded-xl p-6 flex flex-col shadow-2xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><TrendingUp size={16} className="text-purple-500"/> Projeção de Entradas (Próx. Meses)</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="name" stroke="#71717a" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717a" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#a855f7', strokeWidth: 1 }} />
                                    <Area type="monotone" dataKey="Entrada" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorEntrada)" activeDot={{ r: 8, stroke: 'black', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* GRÁFICO 2: COMPOSIÇÃO DA CARTEIRA */}
                    <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-6 flex flex-col shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <h3 className="text-lg font-bold text-white mb-2">Status da Carteira</h3>
                        <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}50)` }} stroke={entry.color} strokeWidth={2} /> ))}
                                    </Pie>
                                    <Tooltip contentStyle={{background: '#18181b', border: '1px solid #27272a', borderRadius: '8px'}} itemStyle={{color: 'white'}} formatter={(value) => `${value} contratos`} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(val) => <span className="text-zinc-300 text-sm">{val}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-white">{loans.length}</span>
                                <span className="text-xs text-zinc-500 uppercase font-bold">Contratos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

// Componente auxiliar para os Cards de Topo
function CardMetric({ title, value, subtitle, icon, color, isBold }: any) {
    const colors: any = {
        zinc: { bg: 'bg-zinc-900', border: 'border-zinc-800', text: 'text-zinc-400', iconBg: 'bg-zinc-800', iconText: 'text-zinc-500' },
        purple: { bg: 'bg-purple-900/20', border: 'border-purple-500/30', text: 'text-purple-300', iconBg: 'bg-purple-500/20', iconText: 'text-purple-500' },
        green: { bg: 'bg-green-900/20', border: 'border-green-500/30', text: 'text-green-300', iconBg: 'bg-green-500/20', iconText: 'text-green-500' },
        red: { bg: 'bg-red-900/20', border: 'border-red-500/30', text: 'text-red-300', iconBg: 'bg-red-500/20', iconText: 'text-red-500' },
    }
    const theme = colors[color] || colors.zinc;

    return (
        <div className={`${theme.bg} border ${theme.border} rounded-xl p-4 flex items-start justify-between shadow-lg hover:scale-[1.02] transition-transform relative overflow-hidden group`}>
            <div className={`absolute -top-10 -right-10 w-32 h-32 ${theme.bg} blur-[50px] rounded-full opacity-50 group-hover:scale-150 transition-transform`}></div>
            <div>
                <p className={`text-xs font-bold uppercase mb-1 ${theme.text}`}>{title}</p>
                <p className={`text-2xl font-mono ${isBold ? 'font-black text-white' : 'font-bold text-zinc-200'}`}>
                    {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                {subtitle && <p className="text-[10px] text-zinc-500 mt-1 font-mono">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-lg ${theme.iconBg} ${theme.iconText} relative z-10`}>
                {icon}
            </div>
        </div>
    )
}