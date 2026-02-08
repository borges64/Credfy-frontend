import { useEffect, useState } from 'react'
import { X, Calendar, User, Phone, MapPin, DollarSign, Percent, Fingerprint, Layers, Loader2 } from 'lucide-react'
import api from '../services/api'
import { toast } from 'sonner'
import { useLoans } from '../Context/LoansContext';
 // Se estiver usando o contexto criado

interface NewLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void; // <--- NOVA PROP
    initialData?: any;
}

interface NewLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewLoanModal({ isOpen, onClose, onSuccess, initialData }: NewLoanModalProps) {
    const { refreshLoans } = useLoans() // Para atualizar a lista assim que criar
    const [loading, setLoading] = useState(false)
    
    // States do Formulário
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [document, setDocument] = useState('')
    const [amount, setAmount] = useState('')
    const [interest, setInterest] = useState('20')
    const [installments, setInstallments] = useState('1')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // MODO EDIÇÃO: Preenche os campos
                setName(initialData.name || '')
                setPhone(initialData.phone || '')
                setAddress(initialData.address || '')
                setDocument(initialData.document || '')
                setAmount(String(initialData.amount || ''))
                setInterest(String(initialData.interest || '20'))
                // Nota: Parcelas geralmente não se edita facilmente após criado, mantemos 1 ou o que vier
                // setInstallments... (Geralmente bloqueado na edição ou mantido)
                if(initialData.paymentDate) {
                    setDate(new Date(initialData.paymentDate).toISOString().split('T')[0])
                }
            } else {
                // MODO CRIAÇÃO: Limpa tudo
                setName(''); setPhone(''); setAddress(''); setDocument('')
                setAmount(''); setInterest('20'); setInstallments('1')
                setDate(new Date().toISOString().split('T')[0])
            }
        }
    }, [isOpen, initialData])

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                name,
                phone,
                address,
                document,
                amount: Number(amount),
                interest: Number(interest),
                installments: Number(installments),
                paymentDate: new Date(date).toISOString(),
                isPaid: initialData ? initialData.isPaid : false // Mantém status se for edição
            }

            if (initialData && initialData.id) {
                // EDIÇÃO (PUT)
                await api.put(`/loans/${initialData.id}`, payload)
                toast.success("Cadastro atualizado!")
            } else {
                // CRIAÇÃO (POST)
                await api.post('/loans', payload)
                toast.success("Empréstimo criado!")
            }

            if (onSuccess) onSuccess()
            onClose()
            
        } catch (err) {
            console.error(err)
            toast.error("Erro ao salvar.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#09090b] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto ring-1 ring-white/5">
                
                {/* Header */}
                <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 sticky top-0 z-10">
                    <h2 className="font-bold text-white text-lg">
                        {initialData ? 'Editar Cadastro' : 'Novo Empréstimo'}
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Campos do Formulário (Mantenha igual ao anterior) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-400 ml-1 uppercase">Nome Completo</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500" size={18} />
                            <input type="text" className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-600 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} autoFocus={!initialData} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase">WhatsApp</label>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500" size={18} />
                                <input type="text" className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-600 outline-none transition-all" value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase">Endereço</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500" size={18} />
                                <input type="text" className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-600 outline-none transition-all" value={address} onChange={e => setAddress(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-400 ml-1 uppercase">CPF/CNPJ (Opcional)</label>
                        <div className="relative group">
                            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500" size={18} />
                            <input type="text" className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-600 outline-none transition-all" value={document} onChange={e => setDocument(e.target.value)} />
                        </div>
                    </div>

                    {/* DADOS FINANCEIROS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase">Valor (R$)</label>
                            <div className="relative group">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500" size={18} />
                                <input type="number" className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-green-600 outline-none transition-all font-mono font-bold" value={amount} onChange={e => setAmount(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase">Juros (%)</label>
                            <div className="relative group">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500" size={18} />
                                <input type="number" className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-600 outline-none transition-all font-mono font-bold" value={interest} onChange={e => setInterest(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {!initialData && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 ml-1 uppercase">Parcelas</label>
                                <div className="relative group">
                                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500" size={18} />
                                    <select className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-600 outline-none transition-all appearance-none cursor-pointer" value={installments} onChange={e => setInstallments(e.target.value)}>
                                        <option value="1">À Vista (1x)</option>
                                        <option value="2">2x Parcelas</option>
                                        <option value="3">3x Parcelas</option>
                                        <option value="4">4x Parcelas</option>
                                        <option value="5">5x Parcelas</option>
                                        <option value="6">6x Parcelas</option>
                                        <option value="10">10x Parcelas</option>
                                        <option value="12">12x Parcelas</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 ml-1 uppercase">Vencimento</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500" size={18} />
                                    <input type="date" className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-600 outline-none transition-all cursor-pointer" value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {initialData && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase">Vencimento Atual</label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500" size={18} />
                                <input type="date" className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-600 outline-none transition-all cursor-pointer" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (initialData ? 'Salvar Alterações' : 'Confirmar Empréstimo')}
                    </button>

                </form>
            </div>
        </div>
    )
}