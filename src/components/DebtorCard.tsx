import { ChevronRight, AlertCircle, CheckCircle2, User, FileText, Calendar, DollarSign, MessageCircle, Pencil, Fingerprint } from 'lucide-react'

interface DebtorSummary {
    debtorId: string;
    name: string;
    document?: string;
    phone?: string; // Adicionado telefone para o botão funcionar
    loansCount: number;
    totalAmount: number;
    isPaid: boolean;
    hasLate: boolean;
    nextDate: string;
}

interface DebtorCardProps {
    data: DebtorSummary;
    onOpenDetails: (data: DebtorSummary) => void;
    onEditClient: (id: string) => void; // Nova prop para editar
    onMessage: (data: DebtorSummary) => void;
}

export function DebtorCard({ data, onOpenDetails, onEditClient, onMessage }: DebtorCardProps) {
  
  const statusColor = data.isPaid ? 'text-green-500' : data.hasLate ? 'text-red-500' : 'text-zinc-400';
  const borderColor = data.isPaid ? 'border-green-900/30' : data.hasLate ? 'border-red-900/50' : 'border-zinc-800';
  const bgColor = data.isPaid ? 'bg-green-950/5' : data.hasLate ? 'bg-red-950/10' : 'bg-zinc-900/50';
  const stripeColor = data.isPaid ? 'bg-green-500' : data.hasLate ? 'bg-red-600' : 'bg-zinc-600';

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const formatDate = (dateStr: string) => {
      if(!dateStr) return '--/--';
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }

  

  // Ação rápida de WhatsApp (Mensagem genérica)
  const handleQuickWhatsapp = (e: React.MouseEvent) => {
      e.stopPropagation(); 
      onMessage(data); // <--- CHAMA O MODAL NO DASHBOARD
  }


  // Ação rápida de Editar
  const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEditClient(data.debtorId); 
  }

  return (
    <div 
        onClick={() => onOpenDetails(data)}
        className={`relative ${bgColor} border ${borderColor} rounded-xl p-5 hover:border-purple-500/50 hover:bg-zinc-900 transition-all cursor-pointer group overflow-hidden shadow-lg`}
    >
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${stripeColor}`} />

        {/* HEADER */}
        <div className="flex justify-between items-start mb-4 pl-3">
            <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-lg truncate">{data.name}</h3>
                    {data.isPaid && <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />}
                    {data.hasLate && <AlertCircle size={18} className="text-red-500 flex-shrink-0 animate-pulse" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                    <Fingerprint size={12} />
                    {data.document ? <span className="text-zinc-400">{data.document}</span> : <span>Sem Documento</span>}
                </div>
            </div>
            
            {/* BOTÕES RÁPIDOS (Volta dos botões perdidos) */}
            <div className="flex gap-1">
                <button onClick={handleEdit} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-blue-400 transition-colors" title="Editar Cadastro">
                    <Pencil size={16} />
                </button>
                {/* Botão de Mensagem */}
                <button onClick={handleQuickWhatsapp} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-green-500 transition-colors" title="Enviar Mensagem">
                    <MessageCircle size={16} />
                </button>
            </div>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-2 gap-4 pl-3 mb-4 border-t border-b border-zinc-800/50 py-3">
            <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1 flex items-center gap-1"><DollarSign size={10}/> Total Devedor</p>
                <p className={`text-xl font-mono font-bold ${data.isPaid ? 'text-green-500 line-through decoration-2' : 'text-white'}`}>{formatCurrency(data.totalAmount)}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1 flex items-center justify-end gap-1"><Calendar size={10}/> {data.isPaid ? 'Último Pagto' : 'Próx Vencimento'}</p>
                <p className={`text-sm font-mono mt-1 ${data.hasLate ? 'text-red-400 font-bold bg-red-950/30 px-2 py-0.5 rounded inline-block' : 'text-zinc-300'}`}>{formatDate(data.nextDate)}</p>
            </div>
        </div>

        {/* FOOTER */}
        <div className="pl-3 flex justify-between items-center">
            <span className="text-xs font-medium text-zinc-400 bg-black/40 border border-zinc-800 px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                <FileText size={12} /> {data.loansCount} {data.loansCount > 1 ? 'Contratos' : 'Contrato'}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-500 group-hover:text-purple-400 transition-colors uppercase tracking-wider">
                Ver Parcelas <ChevronRight size={14} />
            </div>
        </div>
    </div>
  )
}