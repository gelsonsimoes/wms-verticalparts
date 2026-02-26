import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCw, 
  Filter, 
  ChevronRight, 
  Package, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X,
  FileText,
  Boxes,
  Activity,
  ArrowRightLeft,
  Settings2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ====== MOCK DATA ======

const MOCK_ORDERS = {
  OPA: [
    { id: 'ERP-OPA-9102', data: '22/02/2026 10:30', depositante: 'VerticalParts Matriz', itens: 12, status: 'Importado', refWMS: 'REC-2026-001' },
    { id: 'ERP-OPA-9105', data: '22/02/2026 14:15', depositante: 'AutoParts Express', itens: 5, status: 'Pendente', refWMS: null },
    { id: 'ERP-OPA-8890', data: '21/02/2026 16:00', depositante: 'VParts Import Export', itens: 45, status: 'Falha', refWMS: null },
    { id: 'ERP-OPA-8811', data: '21/02/2026 09:45', depositante: 'VerticalParts Matriz', itens: 8, status: 'Importado', refWMS: 'REC-2026-002' },
  ],
  OF: [
    { id: 'ERP-OF-5501', data: '22/02/2026 11:00', depositante: 'VerticalParts Matriz', itens: 3, status: 'Importado', refWMS: 'OND-2026-044' },
    { id: 'ERP-OF-5508', data: '22/02/2026 15:30', depositante: 'Logística Global', itens: 20, status: 'Pendente', refWMS: null },
    { id: 'ERP-OF-5490', data: '22/02/2026 16:45', depositante: 'AutoParts Express', itens: 1, status: 'Cancelado no ERP', refWMS: null },
    { id: 'ERP-OF-5422', data: '21/02/2026 13:10', depositante: 'VParts Import Export', itens: 15, status: 'Importado', refWMS: 'OND-2026-042' },
  ]
};

const MOCK_ORDER_ITEMS = {
  'ERP-OPA-9102': [
    { sku: 'VP-ELE-PL99', de: 'Placa Elevador V1', qtd: 5, vinculado: true, ref: 'OC-001' },
    { sku: 'VP-ELE-CAB02', de: 'Cabo Blindado 2m', qtd: 7, vinculado: true, ref: 'OC-001' },
  ],
  'ERP-OF-5501': [
    { sku: 'VP-MOT-110V', de: 'Motor Indutivo 110V', qtd: 1, vinculado: true, ref: 'OS-992' },
    { sku: 'VP-BTT-60A', de: 'Bateria 60Ah', qtd: 2, vinculado: true, ref: 'OS-992' },
  ],
  'ERP-OPA-9105': [
    { sku: 'VP-FLT-OIL', de: 'Filtro de Óleo', qtd: 5, vinculado: false, ref: null },
  ]
};

// ====== COMPONENTE PRINCIPAL ======

export default function ERPOrderIntegration() {
  const [activeTab, setActiveTab] = useState('OPA'); // 'OPA' (Compra) ou 'OF' (Venda)
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');

  const filteredOrders = useMemo(() => {
    let list = MOCK_ORDERS[activeTab];
    if (filterStatus !== 'Todos') {
      list = list.filter(o => o.status === filterStatus);
    }
    return list;
  }, [activeTab, filterStatus]);

  const selectedOrder = useMemo(() => 
    MOCK_ORDERS[activeTab].find(o => o.id === selectedOrderId), 
    [activeTab, selectedOrderId]
  );

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Sincronização com ERP concluída! 5 novas ordens importadas.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
           <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
                 <ArrowRightLeft className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                 <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-none">Integração de Ordens ERP</h1>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Conciliação de Documentos de Entrada e Saída (ERP vs WMS)</p>
              </div>
           </div>
        </div>

        <div className="flex flex-wrap gap-3">
           <button 
             onClick={handleSync}
             disabled={isSyncing}
             className={cn(
               "flex items-center gap-3 px-8 py-4 bg-primary text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all",
               isSyncing && "opacity-70 cursor-not-allowed"
             )}
           >
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
              {isSyncing ? 'Sincronizando...' : 'Forçar Sincronização'}
           </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-[28px] w-fit">
         <button 
           onClick={() => { setActiveTab('OPA'); setSelectedOrderId(null); }}
           className={cn(
             "flex items-center gap-3 px-8 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all",
             activeTab === 'OPA' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-300"
           )}
         >
            <ArrowDownCircle className="w-4 h-4" /> Ordens de Compra (OPA)
         </button>
         <button 
           onClick={() => { setActiveTab('OF'); setSelectedOrderId(null); }}
           className={cn(
             "flex items-center gap-3 px-8 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all",
             activeTab === 'OF' ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" : "text-slate-500 hover:text-slate-300"
           )}
         >
            <ArrowUpCircle className="w-4 h-4" /> Pedidos de Venda (OF)
         </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* GRID PRINCIPAL (MASTER) - Col 1-8 */}
        <div className="xl:col-span-8 space-y-4">
           {/* FILTROS DO GRID */}
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-[32px] mb-2">
              <div className="relative w-full md:w-80">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                 <input 
                   type="text"
                   placeholder="Código do ERP..."
                   className="w-full bg-slate-850 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold outline-none focus:border-primary transition-all"
                 />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Status:</p>
                 <select 
                   value={filterStatus}
                   onChange={e => setFilterStatus(e.target.value)}
                   className="bg-slate-850 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:border-primary transition-all text-slate-300 flex-1 md:flex-none"
                 >
                    <option>Todos</option>
                    <option>Pendente</option>
                    <option>Importado</option>
                    <option>Falha</option>
                    <option>Cancelado no ERP</option>
                 </select>
              </div>
           </div>

           {/* TABLE GRID */}
           <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto text-sm">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-800/30 border-b border-slate-800">
                          <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Código ERP</th>
                          <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Importação / Cliente</th>
                          <th className="p-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Itens</th>
                          <th className="p-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="p-6 text-right w-12"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                       {filteredOrders.map(order => (
                         <tr 
                           key={order.id}
                           onClick={() => setSelectedOrderId(order.id)}
                           className={cn(
                             "group cursor-pointer transition-all",
                             selectedOrderId === order.id ? "bg-primary/5" : "hover:bg-slate-850/50"
                           )}
                         >
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                    activeTab === 'OPA' ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-500"
                                  )}>
                                     {activeTab === 'OPA' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                                  </div>
                                  <span className="text-xs font-black text-white">{order.id}</span>
                               </div>
                            </td>
                            <td className="p-6">
                               <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-200">{order.depositante}</span>
                                  <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">{order.data}</span>
                               </div>
                            </td>
                            <td className="p-6 text-center font-mono text-xs font-black text-slate-500">
                               {order.itens < 10 ? `0${order.itens}` : order.itens} Un.
                            </td>
                            <td className="p-6 text-center">
                               <span className={cn(
                                 "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                 order.status === 'Importado' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                 order.status === 'Pendente' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                 order.status === 'Falha' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                 "bg-slate-700/30 text-slate-500 border border-slate-700/20"
                               )}>
                                  {order.status}
                               </span>
                            </td>
                            <td className="p-6 text-right">
                               <ChevronRight className={cn(
                                 "w-4 h-4 transition-all",
                                 selectedOrderId === order.id ? "text-primary translate-x-1" : "text-slate-800 opacity-0 group-hover:opacity-100"
                               )} />
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* PAINEL DE DETALHES (DETAIL) - Col 9-12 */}
        <div className="xl:col-span-4 h-full">
           <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 h-full min-h-[500px] flex flex-col shadow-sm sticky top-8">
              {!selectedOrderId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30 select-none">
                   <div className="p-6 bg-slate-800 rounded-full">
                      <FileText className="w-12 h-12 text-slate-600" />
                   </div>
                   <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Detalhamento da Ordem</h4>
                      <p className="text-[10px] font-bold text-slate-500 mt-2">Selecione uma linha no grid para<br/>auditoria dos itens e conexões.</p>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right duration-500">
                   {/* HEADER DO DETAIL */}
                   <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-800">
                      <div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Referência ERP</p>
                         <h3 className="text-xl font-black text-white">{selectedOrder.id}</h3>
                         <div className="flex items-center gap-2 mt-3">
                            {selectedOrder.refWMS ? (
                               <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-[9px] font-black uppercase">
                                  <CheckCircle2 className="w-3 h-3" /> Vinculado ao WMS: {selectedOrder.refWMS}
                               </span>
                            ) : (
                               <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-[9px] font-black uppercase">
                                  <AlertCircle className="w-3 h-3 text-amber-500" /> Aguardando Fluxo WMS
                               </span>
                            )}
                         </div>
                      </div>
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                         <Database className="w-6 h-6 text-slate-600" />
                      </div>
                   </div>

                   {/* LISTA DE ITENS */}
                   <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800 mb-8">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                         <Boxes className="w-3.5 h-3.5" /> SKUs da Ordem Corporativa
                      </p>
                      
                      {MOCK_ORDER_ITEMS[selectedOrderId] ? MOCK_ORDER_ITEMS[selectedOrderId].map((item, i) => (
                         <div key={i} className="bg-slate-850/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
                                  <Package className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
                               </div>
                               <div>
                                  <p className="text-xs font-black text-white leading-none mb-1">{item.sku}</p>
                                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">{item.de}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-primary">{item.qtd} Un</p>
                               <span className={cn(
                                 "text-[7px] font-black uppercase tracking-tighter",
                                 item.vinculado ? "text-green-500" : "text-slate-600"
                               )}>
                                  {item.vinculado ? 'Conciliado' : 'Não Conciliado'}
                               </span>
                            </div>
                         </div>
                      )) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center italic opacity-30">
                           <Activity className="w-8 h-8 mb-2 animate-pulse" />
                           <p className="text-[10px] font-bold">Carregando Itens do Repositório ERP...</p>
                        </div>
                      )}
                   </div>

                   {/* RODAPÉ DO DETAIL / AÇÕES ESPECÍFICAS */}
                   <div className="space-y-3 pt-6 border-t border-slate-800">
                      <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                         <FileText className="w-4 h-4" /> Visualizar JSON/XML Original
                      </button>
                      <button 
                        disabled={selectedOrder.status === 'Importado'}
                        className="w-full py-4 bg-primary text-secondary disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                      >
                         <Settings2 className="w-4 h-4" /> Processar Manualmente
                      </button>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

    </div>
  );
}
