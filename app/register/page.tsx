'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // Para criar o link de voltar pro login
import api from '@/src/services/api'

export default function Register() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/register', {
        name,
        email,
        password
      })

      alert('Usuário criado com sucesso! Faça login.')
      router.push('/') // Manda o usuário ir fazer login
      
    } catch (error) {
      console.error(error)
      alert('Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 text-white p-4">
      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4 p-8 bg-zinc-800 rounded-xl border border-zinc-700">
        <h1 className="text-2xl font-bold text-center">Crie sua Conta</h1>
        
        {/* Campo NOME (Novo) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name">Nome Completo</label>
          <input 
            id="name"
            type="text" 
            className="p-3 rounded bg-zinc-900 border border-zinc-700 focus:border-blue-500 outline-none transition-colors"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Silva"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email">E-mail</label>
          <input 
            id="email"
            type="email" 
            className="p-3 rounded bg-zinc-900 border border-zinc-700 focus:border-blue-500 outline-none transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password">Senha</label>
          <input 
            id="password"
            type="password" 
            className="p-3 rounded bg-zinc-900 border border-zinc-700 focus:border-blue-500 outline-none transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Cadastrar'}
        </button>

        <div className="text-center mt-4">
            <Link href="/" className="text-zinc-400 hover:text-white text-sm">
                Já tem conta? Faça login
            </Link>
        </div>
      </form>
    </main>
  )
}