"use client"

import { useEffect, useState } from "react"
import { CheckCircle, DollarSign, FileText } from "lucide-react"

const MESSAGES = [
    { icon: <DollarSign size={18} className="text-green-400" />, text: "Recebimento de R$ 350,00 confirmado", time: "agora" },
    { icon: <FileText size={18} className="text-blue-400" />, text: "Novo contrato de R$ 5.000,00 gerado", time: "há 2 min" },
    { icon: <DollarSign size={18} className="text-green-400" />, text: "Juros de R$ 45,00 calculados", time: "há 5 min" },
    { icon: <CheckCircle size={18} className="text-purple-400" />, text: "Cliente 'João Silva' quitou a dívida", time: "há 12 min" },
    { icon: <DollarSign size={18} className="text-green-400" />, text: "Pix de R$ 1.200,00 recebido", time: "há 15 min" },
]

export function RevenueSimulator() {
    const [current, setCurrent] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Ciclo para mostrar e esconder as notificações
        const showInterval = setInterval(() => {
            setIsVisible(true)

            // Esconde após 4 segundos
            setTimeout(() => {
                setIsVisible(false)
                // Troca para a próxima mensagem logo após esconder
                setTimeout(() => {
                    setCurrent((prev) => (prev + 1) % MESSAGES.length)
                }, 500)
            }, 5000)

        }, 8000) // Aparece uma nova a cada 8 segundos

        return () => clearInterval(showInterval)
    }, [])

    const msg = MESSAGES[current]

    return (
        <div
            className={`fixed bottom-4 left-4 z-50 transition-all duration-700 transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
        >
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-xs md:max-w-sm">
                <div className="bg-zinc-800 p-2 rounded-full border border-zinc-700">
                    {msg.icon}
                </div>
                <div>
                    <p className="text-sm font-bold text-white">{msg.text}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
                        Sistema Ativo • {msg.time}
                    </p>
                </div>
            </div>
        </div>
    )
}
