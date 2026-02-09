'use client'

import { Sidebar } from '@/src/components/Sidebar'
import { BarChart3, TrendingUp, AlertOctagon, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useLoans } from '@/src/Context/LoansContext'

export default function AnalyticsPage() {
    const { loans, loading } = useLoans()
    const router = useRouter()

    const user = { name: 'Gestor', email: 'admin@credfy.com' }

    if (loading) return <div className="h-screen bg-black flex items-center justify-center text-purple-500 animate-pulse font-bold">Carregando dados...</div>

    // --- CÁLCULOS CORRIGIDOS ---

    // 1. Análise Mês a Mês (Previsto vs Realizado)
    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        const key = date.toISOString().slice(0, 7); // YYYY-MM

        // PEGA TUDO QUE VENCE NESSE MÊS (PAGO OU NÃO)
        const allLoansInMonth = loans.filter(l => l.paymentDate.startsWith(key));

        // Balde 1: O que já foi pago (Dinheiro no Bolso)
        const paidLoans = allLoansInMonth.filter(l => l.isPaid);
        const receivedTotal = paidLoans.reduce((acc, l) => {
             const juros = l.amount * (l.interest / 100);
             return acc + l.amount + juros + l.penalty;
        }, 0);

        // Lucro Real (Juros de quem JÁ PAGOU)
        const realizedProfit = paidLoans.reduce((acc, l) => {
            const juros = l.amount * (l.interest / 100);
            return acc + juros + l.penalty;
        }, 0);

        // Balde 2: O que falta receber (Expectativa)
        const openLoans = allLoansInMonth.filter(l => !l.isPaid);
        const expectedTotal = openLoans.reduce((acc, l) => {
            const juros = l.amount * (l.interest / 100);
            return acc + l.amount + juros + l.penalty;
        }, 0);

        // Total Geral do Mês (Soma do que recebeu + o que falta)
        const monthTotalVolume = receivedTotal + expectedTotal;

        return {
            label: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            receivedTotal,      // O que já entrou (ex: 172 do Vitor)
            expectedTotal,      // O que falta entrar (ex: 330)
            monthTotalVolume,   // O potencial total do mês (ex: 502)
            realizedProfit,     // Lucro que já está no bolso
            percentComplete: monthTotalVolume > 0 ? (receivedTotal / monthTotalVolume) * 100 : 0
        }
    });

    const maxVal = Math.max(...monthlyData.map(m => m.monthTotalVolume)) || 1;

    // 2. Risco (Geral da Carteira)
    const totalOpen = loans.filter(l => !l.isPaid).length;
    const totalLate = loans.filter(l => !l.isPaid && new Date(l.paymentDate) < new Date()).length;
    const latePercentage = totalOpen > 0 ? ((totalLate / totalOpen) * 100).toFixed(1) : '0';

    return (
        <div className="flex h-screen bg-black font-sans text-zinc-100 overflow-hidden">
            <Sidebar user={user} onLogout={() => { Cookies.remove('token'); router.replace('/') }} />

            <main className="flex-1 overflow-y-auto p-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                            <BarChart3 className="text-purple-500" /> Inteligência de Dados
                        </h1>
                        <p className="text-zinc-400">Visão real do que entrou e do que falta entrar.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* CARD 1: Fluxo de Caixa (Total do Mês) */}
                    <div className="col-span-2 bg-zinc-950 border border-zinc-900 p-6 rounded-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-zinc-300 flex items-center gap-2"><Calendar size={16}/> Potencial do Mês</h3>
                            <div className="flex gap-4 text-[10px] font-bold uppercase">
                                <span className="flex items-center gap-1 text-green-500"><div className="w-2 h-2 bg-green-500 rounded-full"/>Recebido</span>
                                <span className="flex items-center gap-1 text-zinc-500"><div className="w-2 h-2 bg-zinc-700 rounded-full"/>A Receber</span>
                            </div>
                        </div>

                        <div className="flex items-end justify-between gap-2 h-40 pt-4">
                            {monthlyData.map((month, idx) => {
                                // Altura total da barra baseada no volume total do mês
                                const heightPercent = (month.monthTotalVolume / maxVal) * 100;
                                // Altura da parte verde (recebida) dentro da barra
                                const receivedHeightPercent = (month.receivedTotal / month.monthTotalVolume) * 100;

                                return (
                                    <div key={idx} className="flex flex-col items-center gap-2 w-full group h-full justify-end">
                                        <div className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                                            {month.monthTotalVolume.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                                        </div>

                                        {/* Barra Fundo (Total Possível) */}
                                        <div
                                            className="w-full bg-zinc-800 rounded-t-sm relative overflow-hidden"
                                            style={{ height: month.monthTotalVolume > 0 ? `${heightPercent}%` : '4px' }}
                                        >
                                            {/* Barra Verde (O que já recebeu) */}
                                            <div
                                                className="absolute bottom-0 left-0 right-0 bg-green-600 transition-all duration-1000"
                                                style={{ height: `${receivedHeightPercent}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold">{month.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* CARD 2: Risco */}
                    <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 rounded-full blur-2xl" />

                        <h3 className="font-bold text-zinc-300 flex items-center gap-2 mb-2"><AlertOctagon size={16}/> Risco Atual</h3>
                        <p className="text-sm text-zinc-500 mb-6">Contratos vencidos e não pagos.</p>

                        <div className="flex items-center gap-4">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-900" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-red-600"
                                        strokeDasharray={251.2}
                                        strokeDashoffset={251.2 - (251.2 * Number(latePercentage) / 100)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute text-xl font-bold text-white">{latePercentage}%</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{totalLate}</p>
                                <p className="text-xs text-zinc-500 uppercase font-bold">Inadimplentes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabela de Performance REAL */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-green-500"/> Performance Financeira</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-400">
                            <thead className="text-xs uppercase bg-zinc-900/50 text-zinc-500">
                                <tr>
                                    <th className="p-3 rounded-l-lg">Mês</th>
                                    <th className="p-3">Total da Carteira (Mês)</th>
                                    <th className="p-3 text-green-400">Já Recebido</th>
                                    <th className="p-3 text-zinc-500">A Receber</th>
                                    <th className="p-3 text-right rounded-r-lg text-purple-400">Lucro Real (No Bolso)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                                {monthlyData.map((month, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                                        <td className="p-3 font-bold text-white">{month.label}</td>

                                        {/* Total Possível */}
                                        <td className="p-3 font-mono text-zinc-300">
                                            {month.monthTotalVolume > 0 ? month.monthTotalVolume.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                        </td>

                                        {/* Já Recebido (Verde) */}
                                        <td className="p-3 font-mono font-bold text-green-500 flex items-center gap-2">
                                            {month.receivedTotal > 0 ? (
                                                <>
                                                    {month.receivedTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    <CheckCircle2 size={14} />
                                                </>
                                            ) : '-'}
                                        </td>

                                        {/* Falta Receber */}
                                        <td className="p-3 font-mono text-zinc-600">
                                            {month.expectedTotal > 0 ? month.expectedTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                        </td>

                                        {/* Lucro Realizado (Só conta se pagou) */}
                                        <td className="p-3 text-right font-mono font-bold text-purple-400">
                                            {month.realizedProfit > 0 ? `+ ${month.realizedProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    )
}
