import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
// GoogleGenerativeAI removido do frontend por segurança e compatibilidade

function cn(...inputs) { return twMerge(clsx(inputs)); }

// URL da Edge Function que criamos no Supabase — agora dinâmica
const CHAT_AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SYSTEM_PROMPT = `
Você é o Assistente Logístico Inteligente do VerticalParts WMS.
Sua missão é ajudar operadores, supervisores e gestores a usar 
o sistema com eficiência máxima.

EMPRESA: VerticalParts — Especialista em elevadores, escadas rolantes, 
esteiras rolantes e peças para transporte vertical.

USUÁRIOS DO SISTEMA:
- Danilo (Supervisor / Administrador)
- Matheus (Expedição)  
- Thiago (Logística / Recebimento)

PRODUTOS E SKUs REAIS (use sempre esses dados):
- VEPEL-BPI-174FX: Barreira de Proteção Infravermelha (174 Feixes)
- VPER-ESS-NY-27MM: Escova de Segurança (Nylon - Base 27mm)
- VPER-PAL-INO-1000: Pallet de Aço Inox (1000mm)
- VPER-PNT-AL-22D-202X145-CT: Pente de Alumínio - 22 Dentes (202x145mm)
- VEPEL-BTI-JX02-CCS: Botoeira de Inspeção - Mod. JX02
- VPER-LUM-LED-VRD-24V: Luminária em LED Verde 24V

MÓDULOS DO SISTEMA (saiba orientar o usuário):
1. OPERAR: Cross-docking, Devoluções, Pesagem, Recebimento, Picking, Packing, Expedição
2. PLANEJAR: Ondas de Separação, SLA, Agendamento, Manifestos
3. CONTROLAR: Inventário, Kardex, Lotes, Avarias, Estoque
4. FISCAL: NF-e, CT-e, Cobertura Fiscal, Armazém Geral
5. FINANCEIRO: Diárias, Contratos
6. CADASTROS: Empresas, Armazéns, Produtos, Rotas
7. INDICADORES: Dashboard, Ocupação, Produtividade, Logs
8. INTEGRAR: Omie ERP, APIs REST, Arquivos, Alertas

REGRAS DE COMPORTAMENTO:
- Responda SEMPRE em Português do Brasil
- Seja objetivo e prático — o operador está no campo
- Use linguagem simples para operadores, técnica para gestores
- Nunca invente dados — baseie-se nos SKUs e usuários reais acima
- Se não souber algo específico do sistema, diga onde o usuário pode encontrar
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
  const [aiStatus, setAiStatus] = useState('online'); 
  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('vp_chat_history', JSON.stringify(messages));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    const userMsg = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          messages: messages.filter(m => m.content),
          input: userText,
          systemPrompt: SYSTEM_PROMPT
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      setAiStatus('online');
    } catch (error) {
      console.error("Chat Error:", error);
      let errorMsg = `⚠️ Erro: ${error.message || "Falha na comunicação com a IA"}`;
      
      if (error.message?.includes('429')) {
        errorMsg = "⚠️ Limite de requisições atingido. Aguarde alguns segundos.";
      } else if (error.message?.includes('fetch')) {
        errorMsg = "⚠️ Erro de conexão com o servidor do chat (Supabase).";
      }
      
      setAiStatus('error');
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Deseja apagar todo o histórico do chat?')) {
      localStorage.removeItem('vp_chat_history');
      setMessages([{ role: 'assistant', content: 'Olá! Sou o assistente da VerticalParts. Como posso ajudar?' }]);
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
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center">
                    WMS Assistant v3
                    <span className="relative flex h-2 w-2 ml-2 shrink-0">
                      {aiStatus === 'online' ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      )}
                    </span>
                  </h3>
                  <p className="text-[9px] text-primary font-bold uppercase">VerticalParts</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleClearHistory} 
                  title="Limpar conversa"
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-transform hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
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
