import React, { useState } from 'react';
import { 
  AlertCircle, 
  FileWarning, 
  Settings, 
  Download, 
  Search, 
  Clock, 
  Filter, 
  Mail, 
  Bell, 
  Users, 
  CheckCircle2, 
  X,
  FileCode,
  Terminal,
  Database,
  ArrowRight,
  ShieldAlert,
  Save,
  Trash2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ====== MOCK DATA ======

const MOCK_ERROR_LOGS = [
  { id: 1, data: '22/02/2026 14:45', tipo: 'XML NF-e', depositante: 'VerticalParts Matriz', arquivo: 'nfe_352302...000199.xml', erro: 'Estrutura Inválida: Tag <total> não encontrada ou vazia.' },
  { id: 2, data: '22/02/2026 13:20', tipo: 'TXT Pedido', depositante: 'AutoParts Express', arquivo: 'PED_99212.txt', erro: 'Erro de Layout: Posição 120-135 (SKU) contém caracteres não numéricos.' },
  { id: 3, data: '21/02/2026 18:05', tipo: 'XML CT-e', depositante: 'Logística Global', arquivo: 'cte_998122.xml', erro: 'Falha de Assinatura: Certificado Digital expirado ou revogado.' },
  { id: 4, data: '21/02/2026 09:15', tipo: 'TXT Estoque', depositante: 'VParts Import Export', arquivo: 'EST_VPARTS_001.txt', erro: 'Timeout: Servidor FTP do parceiro não respondeu na porta 21.' },
];

const MOCK_USERS_ALERTS = [
  { id: 1, nome: 'Danilo Silva (TI)', cargo: 'Supervisor', selecionado: true },
  { id: 2, nome: 'Ricardo M. (Infra)', cargo: 'Analista Sr', selecionado: true },
  { id: 3, nome: 'Ana Paula (Fiscal)', cargo: 'Coordenadora', selecionado: false },
  { id: 4, nome: 'Marcos G. (Suporte)', cargo: 'Técnico', selecionado: true },
];

// ====== COMPONENTE PRINCIPAL ======

export default function IntegrationAlerts() {
  const [activeTab, setActiveTab] = useState('erros'); // 'erros' ou 'config'
  const [filterQuery, setFilterQuery] = useState('');

  const handleDownload = (filename) => {
    alert(`Iniciando download do arquivo problemático: ${filename}\n(Simulação de ambiente técnico)`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 space-y-6 animate-in fade-in duration-700 font-mono">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden">
        <div>
           <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-lg shadow-red-500/5">
                 <Terminal className="w-8 h-8 text-red-500" />
              </div>
              <div>
                 <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-none">Monitoramento de Alertas e Integrações</h1>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Central de Diagnóstico de Falhas de Intercâmbio (EDI/API)</p>
              </div>
           </div>
        </div>

        {/* INDICADORES RÁPIDOS */}
        <div className="flex gap-4">
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                 <FileWarning className="w-5 h-5 text-red-500" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Erros (24h)</p>
                 <p className="text-lg font-black text-red-500">24 Falhas</p>
              </div>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                 <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Recuperados</p>
                 <p className="text-lg font-black text-green-500">92%</p>
              </div>
           </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-[24px] w-fit">
         <button 
           onClick={() => setActiveTab('erros')}
           className={cn(
             "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
             activeTab === 'erros' ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-slate-500 hover:text-slate-300"
           )}
         >
            <ShieldAlert className="w-4 h-4" /> Arquivos com Erro
         </button>
         <button 
           onClick={() => setActiveTab('config')}
           className={cn(
             "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
             activeTab === 'config' ? "bg-primary text-secondary shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
           )}
         >
            <Settings className="w-4 h-4" /> Configuração de Alertas
         </button>
      </div>

      {activeTab === 'erros' ? (
        /* ABA 1: ARQUIVOS COM ERRO */
        <div className="space-y-6 animate-in slide-in-from-left duration-500">
           
           {/* SEARCH & FILTERS */}
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input 
                   type="text"
                   placeholder="Filtrar por nome de arquivo ou depositante..."
                   className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:border-red-500/50 transition-all"
                 />
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                    <Filter className="w-5 h-5" />
                 </button>
                 <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-700 transition-all">
                    Reprocessar Todos
                 </button>
              </div>
           </div>

           {/* LOG GRID */}
           <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-800/50 border-b border-slate-800">
                          <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data / Hora</th>
                          <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Interface / Origem</th>
                          <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Arquivo</th>
                          <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição do Incidente</th>
                          <th className="p-5 text-right"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                       {MOCK_ERROR_LOGS.map(log => (
                         <tr key={log.id} className="hover:bg-red-500/[0.02] transition-colors group">
                            <td className="p-5">
                               <div className="flex flex-col">
                                  <span className="text-xs font-black text-slate-200">{log.data}</span>
                                  <span className="text-[9px] font-bold text-slate-600 uppercase">GMT -03:00</span>
                               </div>
                            </td>
                            <td className="p-5">
                               <div className="p-2 bg-slate-850 border border-slate-800 rounded-lg inline-block">
                                  <p className="text-[10px] font-black text-primary uppercase leading-tight">{log.tipo}</p>
                                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{log.depositante}</p>
                               </div>
                            </td>
                            <td className="p-5 max-w-[200px]">
                               <p className="text-xs font-bold text-slate-400 truncate">{log.arquivo}</p>
                            </td>
                            <td className="p-5">
                               <div className="flex items-start gap-3">
                                  <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                  <p className="text-xs font-bold text-red-500 leading-relaxed font-mono italic">
                                     {log.erro}
                                  </p>
                               </div>
                            </td>
                            <td className="p-5 text-right">
                               <button 
                                 onClick={() => handleDownload(log.arquivo)}
                                 className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                               >
                                  <Download className="w-3.5 h-3.5" /> Baixar Origem
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      ) : (
        /* ABA 2: CONFIGURAÇÃO DE ALERTAS */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right duration-500">
           
           {/* FORMULÁRIO DE GATILHOS */}
           <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8">
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-primary/10 rounded-2xl">
                    <Bell className="w-6 h-6 text-primary" />
                 </div>
                 <h3 className="text-xl font-black uppercase text-white">Novo Gatilho de Alerta</h3>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Erro Crítico</label>
                       <select className="w-full bg-slate-850 border-2 border-slate-800 rounded-2xl py-3.5 px-4 text-xs font-bold outline-none focus:border-primary transition-all appearance-none text-slate-300">
                          <option>Parada Total de Importação</option>
                          <option>Layout de Arquivo Inválido</option>
                          <option>Erro de Autenticação API</option>
                          <option>Depositante Sem Configuração</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tolerância (Minutos)</label>
                       <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input type="number" placeholder="5" className="w-full bg-slate-850 border-2 border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none focus:border-primary transition-all text-white" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Modalidade de Notificação</label>
                    <div className="grid grid-cols-2 gap-4">
                       <button className="flex items-center justify-center gap-3 p-5 rounded-[24px] border-2 border-primary/20 bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 transition-all">
                          <Mail className="w-4 h-4" /> E-mail Técnico
                       </button>
                       <button className="flex items-center justify-center gap-3 p-5 rounded-[24px] border-2 border-slate-800 bg-slate-850 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:border-slate-700 transition-all">
                          <AlertCircle className="w-4 h-4" /> Pop-up Sistema
                       </button>
                    </div>
                 </div>

                 <div className="pt-6">
                    <button className="w-full py-5 bg-primary text-secondary rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                       <Save className="w-5 h-5" /> Salvar Configuração de Monitoramento
                    </button>
                 </div>
              </div>
           </div>

           {/* SELEÇÃO DE USUÁRIOS */}
           <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-2xl">
                       <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase text-white">Público Alvo</h3>
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Quem receberá este alerta</p>
                    </div>
                 </div>
                 <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    3 Selecionados
                 </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
                 {MOCK_USERS_ALERTS.map(user => (
                    <div key={user.id} className={cn(
                       "p-5 rounded-3xl border-2 transition-all flex items-center justify-between cursor-pointer group",
                       user.selecionado ? "bg-primary/5 border-primary/20" : "bg-slate-850 border-slate-800 hover:border-slate-700"
                    )}>
                       <div className="flex items-center gap-4">
                          <div className={cn(
                             "w-11 h-11 rounded-2xl flex items-center justify-center transition-colors",
                             user.selecionado ? "bg-primary text-secondary" : "bg-slate-800 text-slate-600"
                          )}>
                             <span className="text-xs font-black">{user.nome.substring(0,2).toUpperCase()}</span>
                          </div>
                          <div>
                             <p className="text-xs font-black text-white leading-none mb-1">{user.nome}</p>
                             <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{user.cargo}</p>
                          </div>
                       </div>
                       <div className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                          user.selecionado ? "bg-primary border-primary text-secondary" : "border-slate-700 group-hover:border-slate-500"
                       )}>
                          {user.selecionado && <CheckCircle2 className="w-4 h-4" />}
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-800/50">
                 <div className="flex items-center gap-3 text-slate-600 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                    <Info className="w-5 h-5 shrink-0" />
                    <p className="text-[9px] font-bold leading-relaxed italic">
                       * Alertas enviados via e-mail consumirão 1 integração do pacote SMTP. Alertas via sistema são ilimitados.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
