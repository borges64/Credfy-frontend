import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, description }: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-[#09090b] border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative ring-1 ring-white/10">
                
                {/* Botão Fechar */}
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={20}/>
                </button>

                {/* Ícone e Texto */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mb-4 border border-red-900/30 text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Botões de Ação */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={onClose} 
                        className="py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold hover:bg-zinc-800 hover:text-white transition-all text-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }} 
                        className="py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all active:scale-95 text-sm"
                    >
                        Sim, Excluir
                    </button>
                </div>
            </div>
        </div>
    )
}