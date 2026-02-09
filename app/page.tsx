'use client'

import { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { 
  FileText, TrendingUp, ShieldCheck, 
  ChevronDown, Calculator, DollarSign, HelpCircle,
  MessageCircle, Zap, Lock, ArrowRight, X, Loader2, Landmark, Check, Smartphone, Scale, AlertTriangle, FileKey, Ban
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import api from '@/src/services/api'
import Cookies from 'js-cookie'

// --- VARIANTES DE ANIMAÇÃO ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

export default function LandingPage() {
  const router = useRouter()
  
  // --- ESTADOS DO MODAL DE LOGIN ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: ''
  })

  // --- FUNÇÃO DE LOGIN / CADASTRO ---
  async function handleAuth(e: React.FormEvent) {
      e.preventDefault()
      setIsLoading(true)
      setAuthError('')

      try {
          if (isRegister) {
              await api.post('/users', {
                  name: formData.name,
                  email: formData.email,
                  password: formData.password
              })
              const session = await api.post('/sessions', { 
                  email: formData.email, 
                  password: formData.password 
              })
              Cookies.set('token', session.data.token, { expires: 7 })
              router.push('/dashboard')

          } else {
              const response = await api.post('/sessions', { 
                  email: formData.email, 
                  password: formData.password 
              })
              Cookies.set('token', response.data.token, { expires: 7 })
              router.push('/dashboard')
          }
      } catch (error: any) {
          console.error(error)
          setAuthError(error.response?.data?.message || "Erro ao autenticar. Verifique seus dados.")
      } finally {
          setIsLoading(false)
      }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Cred<span className="text-purple-500">fy</span></span>
          </div>
          <div className="flex gap-4">
            <button 
                onClick={() => { setIsRegister(false); setIsAuthModalOpen(true) }} 
                className="hidden md:block px-5 py-2 text-sm font-bold text-zinc-300 hover:text-white transition-colors"
            >
                Acessar Plataforma
            </button>
            <button 
                onClick={() => { setIsRegister(true); setIsAuthModalOpen(true) }} 
                className="px-5 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-purple-500 hover:text-white transition-all shadow-lg active:scale-95"
            >
                Começar
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-12 md:pb-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-6">
              <Landmark size={12} fill="currentColor" /> Sistema Profissional para Gestores
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
              A Gestão Inteligente do <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 animate-gradient">
                Seu Capital Próprio
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-base md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transforme sua operação. Formalize contratos, automatize a régua de cobrança no WhatsApp e gerencie sua carteira de recebíveis com segurança.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => { setIsRegister(true); setIsAuthModalOpen(true) }} 
                className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Criar Conta Grátis <ArrowRight size={20} />
              </button>
            </motion.div>

          </motion.div>
        </div>

        {/* --- ÁREA DO PRINT (MOCKUP) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 md:mt-24 max-w-6xl mx-auto relative perspective-1000"
        >
          <div className="relative z-10 bg-[#09090b] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-purple-900/20 ring-1 ring-white/10 group">
            <div className="h-8 md:h-10 bg-zinc-900/80 backdrop-blur border-b border-zinc-800 flex items-center px-4 gap-2 justify-between">
              <div className="flex gap-1.5 md:gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="bg-black/50 px-4 py-1 rounded-md text-[8px] md:text-[10px] text-zinc-500 font-mono flex items-center gap-2 border border-zinc-800">
                <Lock size={8} /> app.credfy.com.br/dashboard
              </div>
            </div>

            <div className="aspect-video bg-zinc-950 relative flex items-center justify-center overflow-hidden">
                {/* ATENÇÃO: Coloque sua imagem na pasta 'public' com o nome 'dashboard.png' 
                   e altere o src abaixo para '/dashboard.png' 
                */}
                <img 
                    src="https://placehold.co/1200x675/0a0a0a/333?text=Cole+o+Print+Aqui+(dashboard.png)" 
                    alt="Dashboard Credfy" 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-[1.01] transform" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
          <div className="absolute -bottom-10 left-10 right-10 h-20 bg-purple-600/20 blur-[60px] z-0" />
        </motion.div>
      </section>

      {/* --- FUNCIONALIDADES --- */}
      <section className="py-16 md:py-24 px-6 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Gestão de Alta Performance</h2>
            <p className="text-zinc-400">Ferramentas essenciais para ESCs, Factorings e Gestores de Ativos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<FileText className="text-blue-400" />}
              title="Formalização Jurídica"
              desc="Emissão automática de Contratos e Recibos (CCB/Mútuo). Garanta a validade jurídica de todas as suas operações."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-green-500" />}
              title="Análise de Carteira"
              desc="Classificação de risco de clientes e ranking de pagadores. Identifique bons clientes e proteja seu capital."
            />
            <FeatureCard 
              icon={<TrendingUp className="text-purple-400" />}
              title="Controle Financeiro"
              desc="Cálculo automático de juros simples e compostos, multas e amortizações. O sistema faz a matemática por você."
            />
            <FeatureCard 
              icon={<MessageCircle className="text-green-400" />}
              title="Cobrança WhatsApp"
              desc="Envie lembretes e cobranças com um clique direto para o WhatsApp do cliente. Reduza a inadimplência."
            />
            <FeatureCard 
              icon={<Smartphone className="text-red-500" />}
              title="100% Mobile"
              desc="Acesse sua carteira de qualquer lugar. Layout otimizado para celulares e tablets."
            />
             <FeatureCard 
              icon={<Lock className="text-yellow-400" />}
              title="Segurança Total"
              desc="Dados criptografados e backups diários. Sua operação financeira blindada contra perdas."
            />
          </div>
        </div>
      </section>

      {/* --- SEÇÃO LEGAL & COMPLIANCE (ROBUSTA) --- */}
      <section className="py-20 px-6 bg-[#050505] border-y border-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase mb-6">
                    <Scale size={14} /> Compliance Regulatório
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                    Transparência Jurídica Absoluta
                </h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                    Entenda os limites da nossa tecnologia e a sua responsabilidade como gestor de capital.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                
                {/* Card 1 - Natureza do Software */}
                <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex gap-6 items-start hover:bg-zinc-900/50 transition-colors">
                    <div className="p-4 bg-blue-900/20 rounded-xl text-blue-400 border border-blue-900/30">
                        <FileKey size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Provedor de Tecnologia (SaaS)</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            O <strong>Credfy</strong> é estritamente uma ferramenta de software para organização administrativa e fluxo de caixa. <strong>Não somos uma Instituição Financeira</strong>, não realizamos empréstimos, não captamos recursos de terceiros e não intermediamos transações financeiras.
                        </p>
                    </div>
                </div>

                {/* Card 2 - Responsabilidade do Usuário */}
                <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex gap-6 items-start hover:bg-zinc-900/50 transition-colors">
                    <div className="p-4 bg-yellow-900/20 rounded-xl text-yellow-500 border border-yellow-900/30">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Autonomia e Parametrização</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            O sistema é "agnóstico" em relação aos valores. Todas as taxas de juros, multas, prazos e condições contratuais são <strong>definidas e configuradas exclusivamente pelo usuário</strong>. O Credfy não sugere, impõe ou valida taxas de juros.
                        </p>
                    </div>
                </div>

                {/* Card 3 - Legislação */}
                <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex gap-6 items-start hover:bg-zinc-900/50 transition-colors">
                    <div className="p-4 bg-green-900/20 rounded-xl text-green-500 border border-green-900/30">
                        <Landmark size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Conformidade Legal</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            O uso do software não isenta o gestor de atuar em conformidade com o <strong>Código Civil Brasileiro</strong> e a <strong>Lei da Usura (Decreto nº 22.626/33)</strong>. Recomendamos que todas as operações sejam formalizadas através de contratos válidos (Mútuo/CCB).
                        </p>
                    </div>
                </div>

                {/* Card 4 - Não Intermediação */}
                <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex gap-6 items-start hover:bg-zinc-900/50 transition-colors">
                    <div className="p-4 bg-red-900/20 rounded-xl text-red-500 border border-red-900/30">
                        <Ban size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Vedação de Intermediação</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            O Credfy não toca no dinheiro. Todos os pagamentos e transferências ocorrem diretamente entre as contas bancárias das partes (Credor e Devedor), sem passar por contas da plataforma. Somos apenas o "caderno digital" da sua operação.
                        </p>
                    </div>
                </div>

            </div>
            
            {/* Aviso Destacado */}
            <div className="p-6 bg-zinc-900 border-l-4 border-purple-600 rounded-r-lg">
                <p className="text-zinc-300 text-sm italic">
                    "A tecnologia existe para organizar o caos, não para legitimar práticas ilegais. Utilize o Credfy com ética e responsabilidade fiscal."
                </p>
            </div>
        </div>
      </section>

      {/* --- CTA FORTE --- */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black z-0" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Pronto para profissionalizar?</h2>
            <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
                Abandone as planilhas inseguras. Junte-se a gestores que movimentam milhões com organização e segurança.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button 
                    onClick={() => { setIsRegister(true); setIsAuthModalOpen(true) }} 
                    className="px-10 py-5 bg-white text-black text-lg font-bold rounded-full hover:bg-zinc-200 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                >
                    Criar Conta Gratuita
                </button>
                <button 
                    onClick={() => { setIsRegister(false); setIsAuthModalOpen(true) }}
                    className="px-10 py-5 bg-transparent border border-zinc-700 text-white text-lg font-bold rounded-full hover:bg-zinc-900 transition-all"
                >
                    Já tenho conta
                </button>
            </div>
            <p className="mt-6 text-sm text-zinc-600">
                Não é necessário cartão de crédito para começar.
            </p>
        </div>
      </section>

      <section className="py-24 px-6 bg-black relative border-t border-zinc-900">
  <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Quanto você está deixando na mesa?</h2>
          <p className="text-zinc-400">Veja como a desorganização custa caro. Simule seu potencial.</p>
      </div>

      <RoiCalculator />
  </div>
</section>

{/* --- SEÇÃO: FAQ (QUEBRA DE OBJEÇÕES) --- */}
<section className="py-24 px-6 bg-zinc-950 border-t border-zinc-900">
  <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">Perguntas Frequentes</h2>
          <p className="text-zinc-400">Tire suas dúvidas antes de começar.</p>
      </div>
      
      <div className="space-y-4">
          <FaqItem 
              question="Preciso ter CNPJ para usar?" 
              answer="Não. O Credfy atende tanto Pessoas Físicas (CPF) quanto Jurídicas (CNPJ). O sistema se adapta ao seu perfil de gestão de capital próprio."
          />
          <FaqItem 
              question="O dinheiro passa pela conta do Credfy?" 
              answer="Jamais. Somos apenas a tecnologia de gestão. O pagamento do seu cliente vai direto para a sua conta bancária (PIX ou Transferência). Não tocamos no seu dinheiro."
          />
          <FaqItem 
              question="Posso cancelar quando quiser?" 
              answer="Sim. Não exigimos fidelidade. Você pode cancelar a assinatura a qualquer momento diretamente pelo painel, sem burocracia."
          />
          <FaqItem
              question="Os dados dos meus clientes estão seguros?" 
              answer="Sim. Utilizamos criptografia de ponta a ponta e servidores seguros. Nem mesmo nossa equipe tem acesso aos detalhes sensíveis dos seus contratos sem sua autorização."
          />
      </div>
  </div>
</section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-zinc-900 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                        <Zap size={14} className="text-white" fill="white" />
                    </div>
                    <span className="font-bold text-zinc-300">Credfy</span>
                </div>
                <p className="text-zinc-600 text-sm">© 2024 Todos os direitos reservados.</p>
                <div className="flex gap-6 text-zinc-500 text-sm">
                    <a href="#" className="hover:text-white transition-colors">Termos</a>
                    <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                    <a href="#" className="hover:text-white transition-colors">Suporte</a>
                </div>
            </div>
            
            {/* Aviso Legal de Rodapé */}
            <div className="border-t border-zinc-900 pt-8 text-center">
                <p className="text-zinc-700 text-[10px] md:text-xs leading-relaxed max-w-3xl mx-auto">
                    Aviso Legal: O Credfy é um software de gestão (SaaS). Não somos banco, financeira ou correspondente bancário. Não prometemos rentabilidade nem intermediamos valores. A responsabilidade legal e tributária sobre as operações geridas na plataforma é exclusiva do usuário contratante.
                </p>
            </div>
        </div>
      </footer>

      {/* MODAL DE LOGIN (MANTIDO) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-sm rounded-2xl p-8 shadow-2xl relative">
                <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                        <Zap size={24} className="text-white" fill="white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{isRegister ? 'Criar Conta Profissional' : 'Acessar Plataforma'}</h2>
                    <p className="text-zinc-400 text-sm mt-1">{isRegister ? 'Comece a gerenciar hoje.' : 'Bem-vindo de volta.'}</p>
                </div>
                <form onSubmit={handleAuth} className="space-y-4">
                    {isRegister && (
                        <div><input type="text" placeholder="Nome da Empresa / Gestor" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required={isRegister} /></div>
                    )}
                    <div><input type="email" placeholder="E-mail Corporativo" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                    <div><input type="password" placeholder="Senha" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
                    {authError && (<p className="text-red-500 text-xs text-center font-bold bg-red-500/10 p-2 rounded">{authError}</p>)}
                    <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2">{isLoading ? <Loader2 size={20} className="animate-spin" /> : (isRegister ? 'Cadastrar Grátis' : 'Acessar')}</button>
                </form>
                <div className="mt-6 text-center pt-6 border-t border-zinc-900">
                    <p className="text-zinc-500 text-sm">{isRegister ? 'Já tem conta?' : 'Novo por aqui?'} <button onClick={() => { setIsRegister(!isRegister); setAuthError('') }} className="text-purple-400 hover:text-purple-300 font-bold ml-1 transition-colors">{isRegister ? 'Fazer Login' : 'Criar agora'}</button></p>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

// SUB-COMPONENTES
function FeatureCard({ icon, title, desc }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="p-6 rounded-2xl bg-black border border-zinc-900 hover:border-purple-500/30 hover:bg-zinc-900/30 transition-all group">
      <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-zinc-800 group-hover:border-purple-500/20">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function RoiCalculator() {
    const [loanVolume, setLoanVolume] = useState(10000) // Começa com 10k
    const interestRate = 10 // Média de 10% a.m
    
    // Cálculos
    const revenue = loanVolume * (interestRate / 100)
    const lostRevenue = revenue * 0.20 // Estima que 20% se perde sem gestão (esquecimento, atraso sem multa)
    const systemCost = 97
    
    const profit = revenue - systemCost

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                
                {/* Controles */}
                <div className="space-y-8">
                    <div>
                        <label className="text-zinc-400 font-bold uppercase text-xs mb-4 block">Seu Capital na Rua (Hoje)</label>
                        <p className="text-4xl font-black text-white mb-4">
                            {loanVolume.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <input 
                            type="range" 
                            min="1000" 
                            max="500000" 
                            step="1000" 
                            value={loanVolume} 
                            onChange={(e) => setLoanVolume(Number(e.target.value))}
                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-500"
                        />
                        <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                            <span>R$ 1k</span>
                            <span>R$ 500k</span>
                        </div>
                    </div>

                    <div className="p-4 bg-black/40 rounded-xl border border-zinc-800">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                            <p className="text-sm text-zinc-400">
                                Sem gestão, estima-se que você perca <strong className="text-white">~R$ {lostRevenue.toLocaleString('pt-BR')}</strong> todo mês por esquecer de cobrar multas ou atrasos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resultados */}
                <div className="space-y-4">
                    <div className="bg-black border border-zinc-800 p-6 rounded-xl flex justify-between items-center">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">Retorno Mensal (Médio)</p>
                            <p className="text-2xl font-bold text-green-500">+{revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <TrendingUp className="text-green-900" size={32} />
                    </div>

                    <div className="bg-purple-900/10 border border-purple-500/30 p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl">CUSTO CREDFY</div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs text-purple-300 uppercase font-bold">Investimento no Sistema</p>
                            <p className="text-xl font-bold text-white">R$ {systemCost},00</p>
                        </div>
                        <div className="h-px bg-purple-500/20 my-4" />
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-zinc-300 font-bold">Seu Lucro Líquido:</p>
                            <p className="text-3xl font-black text-white">{profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <p className="text-[10px] text-center mt-4 text-purple-400">
                            * O sistema se paga com apenas {((systemCost / revenue) * 100).toFixed(1)}% do seu lucro.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FaqItem({ question, answer }: any) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden transition-all">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center p-5 text-left hover:bg-zinc-900/50 transition-colors"
            >
                <span className="font-bold text-zinc-200">{question}</span>
                <ChevronDown className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-5 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 animate-in slide-in-from-top-2">
                    {answer}
                </div>
            )}
        </div>
    )
}