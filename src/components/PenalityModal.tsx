import { X, Gavel, DollarSign } from 'lucide-react'
import { useState } from 'react'

interface PenaltyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
}

export function PenaltyModal({ isOpen, onClose, onConfirm }: PenaltyModalProps) {
    const [amount, setAmount] = useState('')

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onConfirm(Number(amount))
        setAmount('')
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-zinc-950 border border-red-900/50 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={24}/>
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-900/20 rounded-full border border-red-500/20 text-red-500">
                        <Gavel size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Aplicar Multa</h2>
                        <p className="text-xs text-zinc-500">Adicione um valor extra à parcela.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-red-500 uppercase mb-1 ml-1">Valor da Multa</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                            <input 
                                type="number" 
                                autoFocus 
                                required 
                                className="w-full bg-black border border-red-900/30 rounded-xl py-3 pl-10 text-white focus:border-red-500 outline-none transition-all text-lg font-mono placeholder:text-zinc-700" 
                                placeholder="0.00" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold py-3 rounded-xl transition-colors text-sm">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 text-sm shadow-lg shadow-red-900/20">
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}