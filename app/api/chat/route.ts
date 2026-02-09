import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    // Verifica se a chave existe
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chave API não configurada' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { message } = await req.json();

    // --- AQUI ESTÁ A MUDANÇA: USAR "gemini-1.5-flash" ---
    // Adicionei também a "systemInstruction" que é o jeito certo de dar personalidade no Gemini 1.5
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "Você é o assistente virtual do Credfy, um sistema de gestão financeira. Ajude o usuário a criar mensagens de cobrança educadas, tirar dúvidas sobre juros e finanças. Seja breve, direto e profissional."
    });

    const chat = model.startChat({
      history: [
        // O histórico inicial pode ficar vazio agora que usamos systemInstruction,
        // mas você pode manter conversas anteriores aqui se quiser.
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("Erro Gemini:", error);
    return NextResponse.json({ error: 'Erro ao processar com Gemini' }, { status: 500 });
  }
}
