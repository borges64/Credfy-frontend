import { X, MessageCircle, Copy, Send, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface MessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: any; // Recebe os dados do cliente
}

export function MessageModal({ isOpen, onClose, client }: MessageModalProps) {
    const [type, setType] = useState<'formal' | 'friendly'>('formal')
    const [text, setText] = useState('')

    // Formata Moeda
    const f = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    // Formata Data
    const d = (date: string) => new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

    useEffect(() => {
        if (isOpen && client) {
            generateMessage('formal')
        }
    }, [isOpen, client])

    const generateMessage = (msgType: 'formal' | 'friendly') => {
        if (!client) return;

        const total = client.totalAmount || 0;
        const count = client.loansCount || 1;
        const date = client.nextDate ? d(client.nextDate) : 'hoje';
        
        let msg = '';

        if (msgType === 'formal') {
            msg = `*AVISO DE COBRANÇA*\n\nPrezado(a) *${client.name}*,\n\nConsta em nosso sistema pendências financeiras no valor total de *${f(total)}*, referentes a ${count} contrato(s).\n\nVencimento ref: ${date}.\n\nSolicitamos que entre em contato para regularização.\nCaso já tenha efetuado o pagamento, desconsidere.`;
        } else {
            msg = `Oi ${client.name}, tudo bem?\n\nPassando só pra lembrar do vencimento dia ${date}.\nValor total: *${f(total)}*.\n\nConsegue me confirmar o pagamento? Obrigado! 👍`;
        }

        setType(msgType);
        setText(msg);
    }

    const handleSend = () => {
        if (!client.phone) return toast.error("Cliente sem telefone.");
        const cleanPhone = client.phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
        onClose();
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        toast.success("Texto copiado!");
    }

    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-[#09090b] border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl relative flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-900/20 rounded-full text-green-500">
                            <MessageCircle size={20} />
                        </div>
                        <h2 className="font-bold text-white">Enviar Cobrança</h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20}/></button>
                </div>

                {/* Seleção de Tipo */}
                <div className="flex p-2 gap-2 bg-zinc-900/50 border-b border-zinc-800">
                    <button 
                        onClick={() => generateMessage('formal')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'formal' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:bg-zinc-800/50'}`}
                    >
                        📄 Formal
                    </button>
                    <button 
                        onClick={() => generateMessage('friendly')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'friendly' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:bg-zinc-800/50'}`}
                    >
                        👋 Amigável
                    </button>
                </div>

                {/* Área de Texto */}
                <div className="p-4 bg-black relative group">
                    <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block flex items-center gap-2">
                        <User size={12}/> Mensagem para: <span className="text-zinc-300">{client.name}</span>
                    </label>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 focus:border-green-600 outline-none resize-none font-mono leading-relaxed"
                    />
                    <button onClick={handleCopy} className="absolute top-10 right-6 p-2 bg-zinc-800 text-zinc-400 rounded hover:text-white transition-colors opacity-0 group-hover:opacity-100" title="Copiar">
                        <Copy size={14} />
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-white font-bold text-sm">Cancelar</button>
                    <button onClick={handleSend} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-green-900/20 active:scale-95 transition-all">
                        <Send size={16} /> Enviar WhatsApp
                    </button>
                </div>
            </div>
        </div>
    )
}