import React, { useState } from 'react';
import { Search, Filter, HeadphonesIcon, AlertCircle, CheckCircle2, Clock, MessageSquarePlus, LifeBuoy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
function cn(...inputs) { return twMerge(clsx(inputs)); }

const MOCK_TICKETS = [
  { id: 'TKT-1082', titulo: 'Erro ao bipar SKU da Barreira no picking', cat: 'Operacional', prio: 'Alta', sol: 'Matheus', status: 'Aberto', data: '26/02/2026' },
  { id: 'TKT-1081', titulo: 'Impressora de etiquetas travando', cat: 'Hardware', prio: 'Média', sol: 'Thiago', status: 'Em Atendimento', data: '26/02/2026' },
  { id: 'TKT-1080', titulo: 'Solicitação de acesso módulo Financeiro', cat: 'Acessos', prio: 'Baixa', sol: 'Danilo', status: 'Resolvido', data: '26/02/2026' },
  { id: 'TKT-1079', titulo: 'Layout da NFe quebrando no monitor', cat: 'Sistema', prio: 'Média', sol: 'Matheus', status: 'Em Atendimento', data: '25/02/2026' },
];

export default function ServiceDesk() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Service Desk</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Central de Suporte WMS</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('list')}
            className={cn("px-4 py-2 font-bold text-sm transition-all rounded-[2rem]", activeTab === 'list' ? "bg-[#ffcd00] text-black" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}
          >
            Acompanhar Chamados
          </button>
          <button 
            onClick={() => setActiveTab('new')}
            className={cn("px-4 py-2 font-bold text-sm transition-all rounded-[2rem]", activeTab === 'new' ? "bg-[#ffcd00] text-black" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}
          >
            Abrir Chamado
          </button>
        </div>
      </div>

      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-full"><AlertCircle className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Abertos</p>
              <h3 className="text-2xl font-black text-slate-900">01</h3>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full"><Clock className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Em Atendimento</p>
              <h3 className="text-2xl font-black text-slate-900">02</h3>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-full"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolvidos Hoje</p>
              <h3 className="text-2xl font-black text-slate-900">05</h3>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'list' ? (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 min-h-[400px]">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar por ID ou Título do chamado..." className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold focus:ring-2 focus:ring-[#ffcd00]" />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors">
              <Filter className="w-4 h-4" /> Prioridade / Status
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Ticket</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Título do Chamado</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Categoria</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Prio.</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Solicitante</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status / Data</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TICKETS.map(ticket => (
                  <tr key={ticket.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4 text-sm font-black text-slate-900 border border-transparent group-hover:bg-slate-100 transition-colors rounded-l-[1rem]">
                       <span className="flex items-center gap-2"><HeadphonesIcon className="w-3 h-3 text-slate-400" /> {ticket.id}</span>
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-800 max-w-sm truncate">{ticket.titulo}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-500">{ticket.cat}</td>
                    <td className="py-4 px-4">
                      <span className={cn("px-2 py-0.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest",
                        ticket.prio === 'Alta' && 'bg-red-100 text-red-700',
                        ticket.prio === 'Média' && 'bg-yellow-100 text-yellow-700',
                        ticket.prio === 'Baixa' && 'bg-blue-100 text-blue-700',
                      )}>{ticket.prio}</span>
                    </td>
                    <td className="py-4 px-4 text-sm font-black text-slate-600 truncate">{ticket.sol}</td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-500">
                      <div><span className={cn("inline-block w-2 h-2 rounded-full mr-1.5", 
                         ticket.status === 'Aberto' ? 'bg-red-500' : 
                         ticket.status === 'Em Atendimento' ? 'bg-yellow-500' : 'bg-green-500' 
                      )} /> {ticket.status}</div>
                      <div className="mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {ticket.data}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
             <div>
                <h3 className="font-black text-slate-900 text-lg">Reportar Incidente</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descreva seu problema para o suporte</p>
             </div>
             <LifeBuoy className="w-8 h-8 text-slate-300" />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categoria</label>
                  <select className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00] outline-none">
                     <option>Sistema/Software WMS</option>
                     <option>Acessos e Permissões</option>
                     <option>Hardware/Coletores</option>
                     <option>Integração/ERP</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prioridade</label>
                  <select className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00] outline-none">
                     <option>Baixa (Dúvidas/Evoluções)</option>
                     <option>Média (Impede uma rotina específica)</option>
                     <option>Alta (Parada total / Sistema Offline)</option>
                  </select>
                </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resumo do Problema</label>
              <input type="text" placeholder="Ex: A tela de conferência cega não carrega os SKUs." className="w-full bg-slate-50 border-none rounded-[1rem] px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00]" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição Detalhada e Passos</label>
              <textarea rows={4} placeholder="O que você estava fazendo? Qual a mensagem exata de erro que aparece?" className="w-full bg-slate-50 border-none rounded-[1.5rem] p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#ffcd00] resize-none" />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button 
                onClick={() => setActiveTab('list')}
                className="px-6 py-3 bg-white text-slate-500 font-bold rounded-[2rem] text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
               >
                Cancelar
              </button>
              <button className="px-6 py-3 flex items-center gap-2 bg-[#ffcd00] text-black font-black rounded-[2rem] text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-yellow-500/20">
                <MessageSquarePlus className="w-4 h-4" /> Enviar Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
