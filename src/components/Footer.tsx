import { Scale } from 'lucide-react'

export function Footer() {
  return (
    // ALTERAÇÃO: Mudei de 'mt-auto' para 'mt-16' para forçar o distanciamento
    <footer className="w-full py-8 mt-16 border-t border-zinc-800 bg-black text-zinc-400">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Lado Esquerdo: Identidade Visual "Jurídica" */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900/20 rounded-lg text-purple-500">
            <Scale size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-200">Credfy</span>
            <span className="text-xs text-zinc-500">© 2024 - Todos os direitos reservados.</span>
          </div>
        </div>

        {/* Lado Direito: A Frase de Efeito */}
        <div className="text-center md:text-right">
          <p className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase mb-1">
            FRASE DO DIA
          </p>
          <p className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-purple-400 to-white hover:scale-105 transition-transform cursor-help">
            "Não importa o quão devagar você vá, contanto que não pare."
          </p>
        </div>

      </div>
    </footer>
  )
}