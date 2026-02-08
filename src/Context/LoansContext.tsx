'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '@/src/services/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

// Tipagem atualizada com os campos novos
interface Loan {
    id: string;
    debtorId: string;
    name: string;
    phone: string;
    address: string;
    document?: string; // <--- Campo Novo
    amount: number;
    interest: number;
    penalty: number;
    paymentDate: string;
    isPaid: boolean;
    installmentsCount?: number;
}

interface Metrics {
    totalLent: number;
    totalReceived: number;
    totalPending: number;
    profit: number;
}

interface LoansContextType {
    loans: Loan[];
    metrics: Metrics;
    loading: boolean;
    refreshLoans: () => Promise<void>;
}

const LoansContext = createContext({} as LoansContextType)

export function LoansProvider({ children }: { children: ReactNode }) {
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter() // Hook de navegação

    const refreshLoans = async () => {
        try {
            // Se o backend der erro 500, cai no CATCH abaixo
            const { data } = await api.get('/loans')
            setLoans(data)
        } catch (error: any) {
            console.error("Erro ao buscar dados:", error)
            toast.error("Erro ao carregar carteira. Verifique o servidor.")
            if (error.response && error.response.status === 401) {
                toast.error("Sessão expirada. Faça login novamente.")
                Cookies.remove('token') // Limpa o token podre
                router.replace('/') // Chuta pra tela de login
            } else {
                toast.error("Erro ao carregar dados.")
            }
        } finally {
            setLoading(false)
        }
    }

    // Carrega ao iniciar
    useEffect(() => { 
        const token = Cookies.get('token')
        if (token) {
            refreshLoans() 
        } else {
            setLoading(false) // Se não tem token, para de carregar
        }
    }, [])

    // Cálculo automático de métricas
    const metrics = loans.reduce((acc, loan) => {
        const interestVal = loan.amount * (loan.interest) // Já vem dividido por 100 do backend? Verifique.
        // Se no backend você divide por 100 (ex: 0.20), então aqui é direto.
        // Se no backend vem inteiro (ex: 20), aqui divide por 100.
        // Baseado no seu código anterior: backend manda (rateBps / 100) -> ex: 0.2
        
        const totalVal = loan.amount + (loan.amount * loan.interest)
        
        acc.totalLent += loan.amount
        
        if (loan.isPaid) {
            acc.totalReceived += totalVal + (loan.penalty || 0)
            acc.profit += (loan.amount * loan.interest) + (loan.penalty || 0)
        } else {
            acc.totalPending += totalVal + (loan.penalty || 0)
        }
        return acc
    }, { totalLent: 0, totalReceived: 0, totalPending: 0, profit: 0 })

    return (
        <LoansContext.Provider value={{ loans, metrics, loading, refreshLoans }}>
            {children}
        </LoansContext.Provider>
    )
}

export const useLoans = () => useContext(LoansContext)