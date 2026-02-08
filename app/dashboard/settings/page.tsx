'use client'

import { useState, useEffect } from 'react'
import api from '@/src/services/api'
import { Sidebar } from '@/src/components/Sidebar'
import { Save, Lock, User, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [formData, setFormData] = useState({ name: '', password: '', confirmPassword: '' })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        api.get('/me').then(res => {
            setUser(res.data.user)
            setFormData(prev => ({ ...prev, name: res.data.user.name }))
        }).catch(() => router.push('/'))
    }, [])

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        if (formData.password && formData.password !== formData.confirmPassword) {
            return toast.error("As senhas não coincidem.")
        }
        setLoading(true)
        try {
            await api.put('/me', {
                name: formData.name,
                password: formData.password || undefined
            })
            toast.success("Perfil atualizado!")
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
        } catch (err) {
            toast.error("Erro ao atualizar.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen bg-black font-sans text-zinc-100 overflow-hidden">
            <Sidebar user={user} debtors={[]} onLogout={() => { Cookies.remove('token'); router.replace('/') }} />
            
            <main className="flex-1 p-8 overflow-y-auto">
                <h1 className="text-3xl font-bold text-white mb-2">Configurações da Conta</h1>
                <p className="text-zinc-400 mb-8">Gerencie seus dados de acesso e identidade da empresa.</p>

                <div className="max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <form onSubmit={handleUpdate} className="space-y-6">
                        
                        {/* Nome da Empresa / Gestor */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-zinc-400 mb-2">
                                <Building2 size={16} /> Nome da Empresa / Gestor
                            </label>
                            <input 
                                type="text" 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className="h-[1px] bg-zinc-800 my-4" />

                        {/* Alterar Senha */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-zinc-400 mb-2">
                                <Lock size={16} /> Nova Senha (Opcional)
                            </label>
                            <input 
                                type="password" 
                                placeholder="Deixe em branco para manter a atual"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-zinc-900"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-2">
                                Confirmar Nova Senha
                            </label>
                            <input 
                                type="password" 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                            />
                        </div>

                        <button 
                            disabled={loading}
                            type="submit" 
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}