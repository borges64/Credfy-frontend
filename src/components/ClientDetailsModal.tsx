import { X, Trash2, Check, Calendar, Gavel, MessageCircle } from 'lucide-react'
import api from '@/src/services/api'
import { toast } from 'sonner'
import { useState } from 'react'
import { ConfirmModal } from './ConfirmModal' // <--- IMPORTAMOS O MODAL NOVO
import { PenaltyModal } from './PenalityModal'

export function ClientDetailsModal({ client, loans, onClose, onUpdate }: any) {
    
    // States para controlar os modais
    const [penaltyLoanId, setPenaltyLoanId] = useState<string | null>(null)
    const [deleteLoanId, setDeleteLoanId] = useState<string | null>(null) // <--- STATE PARA O DELETE

    // Filtra e ordena as parcelas
    const clientLoans = loans.filter((l: any) => l.debtorId === client.debtorId)
                             .sort((a: any, b: any) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime())

    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

    // --- AÇÕES ---

    // 1. Ao clicar na lixeira, apenas salvamos o ID e abrimos o modal (sem deletar ainda)
    const handleDeleteClick = (loanId: string) => {
        setDeleteLoanId(loanId)
    }

    // 2. Função que realmente deleta (chamada pelo Modal de Confirmação)
    const confirmDelete = async () => {
        if (!deleteLoanId) return;
        try {
            await api.delete(`/loans/${deleteLoanId}`)
            toast.success("Parcela removida com sucesso.")
            setDeleteLoanId(null) // Fecha o modal
            onUpdate() // Atualiza a lista
        } catch (e) { 
            toast.error("Erro ao deletar.") 
        }
    }

    const handleToggle = async (loanId: string) => {
        try { await api.patch(`/loans/${loanId}/toggle`); onUpdate(); } 
        catch (e) { toast.error("Erro ao atualizar status.") }
    }

    const handleConfirmPenalty = async (amount: number) => {
        if (!penaltyLoanId) return;
        try {
            await api.patch(`/loans/${penaltyLoanId}/penalty`, { amount });
            toast.success("Multa aplicada!");
            setPenaltyLoanId(null);
            onUpdate();
        } catch(e) { toast.error("Erro ao aplicar multa.") }
    }

    const handleWhatsApp = (loan: any) => {
        if (!client.phone) return toast.error("Cliente sem telefone.");
        const cleanPhone = client.phone.replace(/\D/g, '');
        
        const interestVal = loan.amount * (loan.interest / 100);
        const total = loan.amount + interestVal + loan.penalty;
        
        const msg = `Olá ${client.name}.
Lembrete da parcela vencida em ${formatDate(loan.paymentDate)}.
Valor Base: ${formatCurrency(loan.amount)}
Total com encargos: *${formatCurrency(total)}*
Podemos confirmar o pagamento?`;

        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    const totalOpen = clientLoans.filter((l:any) => !l.isPaid).reduce((acc:number, l:any) => {
        return acc + l.amount + (l.amount * (l.interest / 100)) + l.penalty;
    }, 0);

    return (
        <>
            {/* MODAL PRINCIPAL (LISTA DE PARCELAS) */}
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
                <div className="bg-[#09090b] border border-zinc-800 w-full max-w-3xl h-[85vh] rounded-2xl flex flex-col shadow-2xl relative">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 rounded-t-2xl">
                        <div>
                            <h2 className="text-2xl font-bold text-white uppercase">{client.name}</h2>
                            <div className="flex gap-4 text-sm mt-1">
                                <span className="text-zinc-400 font-mono">{client.document || 'S/ Doc'}</span>
                                <span className="text-zinc-400 font-mono">{client.phone || 'S/ Tel'}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"><X size={24}/></button>
                    </div>

                    {/* Lista */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {clientLoans.map((loan: any) => {
                            const isLate = !loan.isPaid && new Date(loan.paymentDate) < new Date();
                            const interestValue = loan.amount * (loan.interest / 100);
                            const total = loan.amount + interestValue + loan.penalty;
                            
                            return (
                                <div key={loan.id} className={`flex flex-col lg:flex-row items-center justify-between p-4 rounded-xl border transition-all ${loan.isPaid ? 'border-green-900/30 bg-green-950/10 opacity-60' : isLate ? 'border-red-900/50 bg-red-950/10' : 'border-zinc-800 bg-zinc-900/40'}`}>
                                    
                                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-4 lg:mb-0">
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Vencimento</p>
                                            <div className={`flex items-center gap-1 font-mono text-sm ${isLate ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>
                                                <Calendar size={12}/> {formatDate(loan.paymentDate)}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Base</p>
                                            <div className="text-zinc-300 font-mono text-sm">{formatCurrency(loan.amount)}</div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Juros/Multa</p>
                                            <div className="text-purple-400 font-mono text-xs flex items-center gap-1">
                                                +{formatCurrency(interestValue)}
                                                {loan.penalty > 0 && <span className="text-red-400 font-bold ml-1">(+{loan.penalty})</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Total</p>
                                            <div className={`font-mono font-bold text-sm ${loan.isPaid ? 'text-green-500 line-through' : 'text-white'}`}>
                                                {formatCurrency(total)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pl-4 border-l border-zinc-800">
                                        {!loan.isPaid && (
                                            <>
                                                <button onClick={() => handleWhatsApp(loan)} className="p-2 rounded-lg bg-green-900/20 text-green-500 hover:bg-green-600 hover:text-white transition-all" title="WhatsApp"><MessageCircle size={18}/></button>
                                                <button onClick={() => setPenaltyLoanId(loan.id)} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 transition-all" title="Aplicar Multa"><Gavel size={18}/></button>
                                            </>
                                        )}
                                        <button onClick={() => handleToggle(loan.id)} className={`p-2 rounded-lg transition-all ${loan.isPaid ? 'bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600' : 'bg-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white'}`} title={loan.isPaid ? "Reabrir" : "Baixar"}><Check size={18}/></button>
                                        
                                        {/* BOTÃO DE DELETAR AGORA CHAMA O HANDLER DO MODAL */}
                                        <button onClick={() => handleDeleteClick(loan.id)} className="p-2 rounded-lg bg-zinc-800 text-zinc-500 hover:bg-red-600 hover:text-white transition-all" title="Apagar"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="p-4 border-t border-zinc-800 bg-zinc-950 rounded-b-2xl flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Total Aberto:</span>
                        <strong className="text-red-500 text-2xl font-mono">{formatCurrency(totalOpen)}</strong>
                    </div>
                </div>
            </div>

            {/* --- MODAIS DE AÇÃO --- */}

            {/* Modal de Multa */}
            <PenaltyModal
                isOpen={!!penaltyLoanId} 
                onClose={() => setPenaltyLoanId(null)} 
                onConfirm={handleConfirmPenalty} 
            />

            {/* Modal de Confirmação de Exclusão (NOVO) */}
            <ConfirmModal 
                isOpen={!!deleteLoanId}
                onClose={() => setDeleteLoanId(null)}
                onConfirm={confirmDelete}
                title="Excluir Parcela?"
                description="Essa ação removerá o registro financeiro permanentemente. Tem certeza que deseja continuar?"
            />
        </>
    )
}