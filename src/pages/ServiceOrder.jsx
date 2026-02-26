import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  FilePlus, 
  ClipboardList, 
  Search, 
  Package, 
  Layers, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight,
  User,
  Calendar,
  Info,
  ArrowRightLeft,
  FileText,
  FlaskConical,
  ShieldAlert,
  Save,
  PlayCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ====== MOCK DATA ======

const MOCK_OS_LIST = [
  { id: 'OS-2026-001', tipo: 'Inspeção de Qualidade', peca: 'VP-ELE-PL99', data: '22/02/2026', repsonsavel: 'Danilo Silva', status: 'Pendente' },
  { id: 'OS-2026-002', tipo: 'Manutenção Leve', peca: 'VP-MOT-110V', data: '21/02/2026', repsonsavel: 'Ricardo M.', status: 'Em Execução' },
  { id: 'OS-2026-003', tipo: 'Desmembramento de Kit', peca: 'KIT-PAN-SERV', data: '20/02/2026', repsonsavel: 'Ana Paula', status: 'Finalizada' },
  { id: 'OS-2026-004', tipo: 'Mistura/Composição', peca: 'CMP-BRA-X2', data: '19/02/2026', repsonsavel: 'Marcos G.', status: 'Cancelada' },
];

const SERVICE_TYPES = [
  'Inspeção de Qualidade (Placas/Eletrônicos)',
  'Desmembramento de Kit',
  'Manutenção Leve / Limpeza',
  'Mistura / Recomposição de Lote',
  'Classificação Novo vs Avariado'
];

// ====== COMPONENTE PRINCIPAL ======

export default function ServiceOrder() {
  const [activeTab, setActiveTab] = useState('abertura'); // 'abertura' ou 'acompanhamento'
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [selectedOS, setSelectedOS] = useState(null);
  
  // States do Formulário
  const [formData, setFormData] = useState({
    tipo: '',
    peca: '',
    lote: '',
    qtd: '',
    instrucoes: ''
  });

  const handleCreateOS = (e) => {
    e.preventDefault();
    alert('Ordem de Serviço Gerada com Sucesso!');
    setFormData({ tipo: '', peca: '', lote: '', qtd: '', instrucoes: '' });
    setActiveTab('acompanhamento');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div>
           <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                 <Wrench className="w-8 h-8 text-primary" />
              </div>
              <div>
                 <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-none">Ordem de Serviço e Classificação</h1>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Gestão de Processos Específicos e Controle de Qualidade</p>
              </div>
           </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-3xl w-fit">
         <button 
           onClick={() => setActiveTab('abertura')}
           className={cn(
             "flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
             activeTab === 'abertura' ? "bg-primary text-secondary shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
           )}
         >
            <FilePlus className="w-4 h-4" /> Abertura de O.S.
         </button>
         <button 
           onClick={() => setActiveTab('acompanhamento')}
           className={cn(
             "flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
             activeTab === 'acompanhamento' ? "bg-primary text-secondary shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
           )}
         >
            <ClipboardList className="w-4 h-4" /> Acompanhamento
         </button>
      </div>

      {activeTab === 'abertura' ? (
        /* ABA 1: ABERTURA DE O.S. */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-left duration-500">
           <form onSubmit={handleCreateOS} className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[40px] p-8 md:p-10 space-y-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Serviço</label>
                    <select 
                      value={formData.tipo}
                      onChange={e => setFormData({...formData, tipo: e.target.value})}
                      className="w-full bg-slate-850 border-2 border-slate-700 rounded-2xl py-3.5 px-4 text-xs font-bold outline-none focus:border-primary transition-all appearance-none"
                      required
                    >
                       <option value="">Selecione o Serviço...</option>
                       {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Código da Peça / Produto</label>
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                       <input 
                         type="text"
                         placeholder="Lupa de busca..."
                         value={formData.peca}
                         onChange={e => setFormData({...formData, peca: e.target.value})}
                         className="w-full bg-slate-850 border-2 border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none focus:border-primary transition-all"
                         required
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lote do Fabricante / Interno</label>
                    <input 
                      type="text"
                      placeholder="Ex: LOT-2026-X4"
                      value={formData.lote}
                      onChange={e => setFormData({...formData, lote: e.target.value})}
                      className="w-full bg-slate-850 border-2 border-slate-700 rounded-2xl py-3.5 px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                      required
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantidade Afetada</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={formData.qtd}
                      onChange={e => setFormData({...formData, qtd: e.target.value})}
                      className="w-full bg-slate-850 border-2 border-slate-700 rounded-2xl py-3.5 px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                      required
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instruções Técnicas / Observações</label>
                 <textarea 
                   rows={4}
                   placeholder="Descreva o procedimento necessário..."
                   value={formData.instrucoes}
                   onChange={e => setFormData({...formData, instrucoes: e.target.value})}
                   className="w-full bg-slate-850 border-2 border-slate-700 rounded-2xl py-3.5 px-4 text-xs font-bold outline-none focus:border-primary transition-all resize-none"
                 />
              </div>

              <div className="pt-4">
                 <button 
                   type="submit"
                   className="w-full md:w-fit px-12 py-5 bg-primary text-secondary rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                 >
                    <Save className="w-5 h-5" /> Gerar Ordem de Serviço
                 </button>
              </div>
           </form>

           <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-4">
                 <div className="flex items-center gap-3 text-primary mb-2">
                    <Info className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Aviso Importante</span>
                 </div>
                 <p className="text-xs text-slate-400 font-medium leading-relaxed">
                   A abertura de uma O.S. segregará automaticamente a quantidade informada do saldo disponível para venda, alocando-a em status de "Operação Interna" até a finalização do laudo técnico.
                 </p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 space-y-6 overflow-hidden relative">
                 <FlaskConical className="absolute -bottom-6 -right-6 w-32 h-32 text-primary opacity-10 rotate-12" />
                 <h4 className="text-base font-black uppercase tracking-tight text-primary">Resumo da Peça</h4>
                 {formData.peca ? (
                   <div className="space-y-4 relative z-10">
                      <div>
                         <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SKU Digitado</p>
                         <p className="text-sm font-black text-white">{formData.peca}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-green-500">
                         <CheckCircle2 className="w-3.5 h-3.5" /> SKU Validado na Master
                      </div>
                   </div>
                 ) : (
                   <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Aguardando preenchimento...</p>
                 )}
              </div>
           </div>
        </div>
      ) : (
        /* ABA 2: ACOMPANHAMENTO */
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
           {/* TOOLBAR INTEGRADA NO GRID */}
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-[32px]">
              <div className="flex items-center gap-2">
                 <button 
                   disabled={!selectedOS || selectedOS.status !== 'Pendente'}
                   className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-200 transition-all flex items-center gap-2"
                 >
                    <PlayCircle className="w-4 h-4" /> Assumir O.S.
                 </button>
                 <button 
                   onClick={() => setShowFinalizeModal(true)}
                   disabled={!selectedOS || selectedOS.status !== 'Em Execução'}
                   className="px-6 py-3 bg-secondary text-primary hover:bg-secondary/90 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                 >
                    <CheckCircle2 className="w-4 h-4" /> Finalizar Serviço
                 </button>
              </div>

              <div className="relative w-full md:w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input 
                   type="text"
                   placeholder="Filtrar Nº O.S. ou Peça..."
                   className="w-full bg-slate-850 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold outline-none focus:border-primary transition-all"
                 />
              </div>
           </div>

           {/* GRID MASTER */}
           <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                 <table className="w-full border-collapse">
                    <thead>
                       <tr className="bg-slate-800/30 border-b border-slate-700">
                          <th className="p-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Nº O.S.</th>
                          <th className="p-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Serviço</th>
                          <th className="p-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Peça / Produto</th>
                          <th className="p-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Data / Responsável</th>
                          <th className="p-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="p-6 text-right w-12"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {MOCK_OS_LIST.map((os) => (
                         <tr 
                           key={os.id}
                           onClick={() => setSelectedOS(os)}
                           className={cn(
                             "group cursor-pointer transition-all",
                             selectedOS?.id === os.id ? "bg-primary/5" : "hover:bg-slate-850"
                           )}
                         >
                            <td className="p-6">
                               <span className="text-xs font-black text-white">{os.id}</span>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                  <Layers className="w-4 h-4 text-slate-600" />
                                  <span className="text-xs font-bold text-slate-300">{os.tipo}</span>
                               </div>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-primary/40" />
                                  <span className="text-xs font-black text-primary uppercase">{os.peca}</span>
                               </div>
                            </td>
                            <td className="p-6">
                               <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-200 mb-1">
                                     <User className="w-3 h-3 text-slate-500" /> {os.repsonsavel}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                                     <Calendar className="w-3 h-3" /> {os.data}
                                  </div>
                               </div>
                            </td>
                            <td className="p-6 text-center">
                               <span className={cn(
                                 "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                 os.status === 'Finalizada' ? "bg-green-500/10 text-green-500" :
                                 os.status === 'Em Execução' ? "bg-amber-500/10 text-amber-500" :
                                 os.status === 'Pendente' ? "bg-slate-700/30 text-slate-400" : "bg-danger/10 text-danger"
                               )}>
                                  {os.status}
                               </span>
                            </td>
                            <td className="p-6 text-right">
                               <ChevronRight className={cn(
                                 "w-4 h-4 transition-all",
                                 selectedOS?.id === os.id ? "text-primary translate-x-1" : "text-slate-700 group-hover:text-slate-500"
                               )} />
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: FINALIZAR SERVIÇO */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-full h-3 bg-secondary" />
              
              <div className="p-8 md:p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center border-4 border-slate-800 shadow-xl">
                          <CheckCircle2 className="w-8 h-8 text-primary" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Finalizar Serviço</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Laudo e Classificação Final</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setShowFinalizeModal(false)}
                      className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-danger transition-all"
                    >
                       <X className="w-6 h-6" />
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Para onde vai o material?</label>
                       <div className="grid grid-cols-2 gap-4">
                          <button className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-green-500/20 bg-green-500/5 text-green-600 font-black text-[10px] uppercase tracking-widest hover:bg-green-500/10 transition-all">
                             <CheckCircle2 className="w-4 h-4" /> Estoque Bom
                          </button>
                          <button className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-danger/20 bg-danger/5 text-danger font-black text-[10px] uppercase tracking-widest hover:bg-danger/10 transition-all">
                             <ShieldAlert className="w-4 h-4" /> Segregado / Avaria
                          </button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Laudo Técnico / Observações Finais</label>
                       <textarea 
                         rows={4}
                         placeholder="Descreva o resultado do serviço e estado final da peça..."
                         className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-4 text-xs font-bold outline-none focus:border-primary transition-all resize-none dark:text-white"
                       />
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={() => setShowFinalizeModal(false)}
                      className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                       Cancelar
                    </button>
                    <button 
                      className="flex-[2] py-5 bg-primary text-secondary rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                       <Save className="w-5 h-5" /> Salvar Laudo e Finalizar
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
