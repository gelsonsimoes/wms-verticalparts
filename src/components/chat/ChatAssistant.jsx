import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenerativeAI } from "@google/generative-ai";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
Você é o Consultor Logístico Inteligente do VerticalParts WMS. 
Responda de forma profissional e eficiente.

CONHECIMENTO DE TELAS:
- Cross-Docking: Monitora mercadorias sem armazenagem longa. Informe NF ou Pedido para bipar.
- Inventário: Garante estoque físico. Bipe endereço e produto.

GERENCIAL:
- Movimentação: Verifique 'Kardex' ou 'Relatórios de Movimentação'.
- Agendamentos: Verifique 'Painel de Gestão de Agendas' no Planejamento.
`;

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('vp_chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: 'Olá! Sou o assistente da VerticalParts. Como posso ajudar?' }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('vp_chat_history', JSON.stringify(messages));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Usando gemini-1.5-flash sem systemInstruction na inicialização (mais compatível)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: "Contexto do seu comportamento: " + SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: "Entendido. Sou o assistente do WMS." }] },
          ...messages.slice(1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }))
        ]
      });

      const result = await chat.sendMessage(input);
      const text = result.response.text();
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      let errorMsg = "O Google ainda não ativou totalmente o modelo para sua chave. Tente novamente em alguns minutos (o delay de propagação é normal).";
      if (error.message.includes('404')) errorMsg = "Erro 404: Modelo não encontrado. Verifique se o projeto selecionado no Cloud Console é o 'VerticalParts-WMS'.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end">
        {isOpen && (
          <div className="mb-4 w-80 md:w-[420px] h-[600px] bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl border-2 border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-slate-900 p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest">WMS Assistant</h3>
                  <p className="text-[9px] text-primary font-bold uppercase">VerticalParts</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-transform hover:rotate-90"><X className="w-5 h-5" /></button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-3xl text-[12px] font-bold shadow-sm",
                    msg.role === 'user' ? "bg-primary text-slate-950" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border dark:border-slate-800"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Como preencher o Cross-docking?"
                className="flex-1 bg-slate-100 dark:bg-slate-950 border-none rounded-xl px-4 py-2 text-[12px] font-bold outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="bg-primary text-slate-950 p-3 rounded-xl shadow-lg active:scale-95 transition-all">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-16 h-16 rounded-[1.8rem] bg-slate-900 text-primary shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-2 border-primary/20",
            isOpen && "rotate-90 bg-primary text-slate-900 border-none"
          )}
        >
          {isOpen ? <X className="w-7 h-7" /> : <Bot className="w-8 h-8" />}
        </button>
      </div>
    </div>
  );
}
