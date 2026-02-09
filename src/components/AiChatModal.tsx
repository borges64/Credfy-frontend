'use client'

import { useState } from 'react';
import { X, Send, Bot, Loader2 } from 'lucide-react';

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiChatModal({ isOpen, onClose }: AiChatModalProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Olá! Sou a IA do Credfy. Precisa de ajuda para escrever uma cobrança ou calcular algo?' }
  ]);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Desculpe, tive um erro de conexão.' }]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#09090b] border border-zinc-800 w-full max-w-md h-[600px] rounded-2xl flex flex-col shadow-2xl relative">

        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <Bot size={24} className="text-white" />
            </div>
            <div>
                <h3 className="font-bold text-white">Credfy AI</h3>
                <span className="text-xs text-green-500 flex items-center gap-1">Online</span>
            </div>
          </div>
          <button onClick={onClose}><X className="text-zinc-500 hover:text-white" /></button>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none'
                  : 'bg-zinc-800 text-zinc-300 rounded-tl-none border border-zinc-700'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-zinc-800 p-3 rounded-xl rounded-tl-none border border-zinc-700">
                  <Loader2 size={16} className="animate-spin text-purple-500" />
               </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 rounded-b-2xl flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua dúvida..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-white focus:border-purple-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
