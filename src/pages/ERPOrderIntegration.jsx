import React, { useState, useEffect } from 'react';
import { RefreshCcw, Search, Filter, CheckCircle2, XCircle, Clock, PackageSearch, Database } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
function cn(...inputs) { return twMerge(clsx(inputs)); }

const MOCK_ORDERS = [
  { erpId: 'PED-99824', date: '26/02/2026', depositor: 'VerticalParts Matriz', items: 12, status: 'Importado', wmsRef: 'WMS-7712' },
  { erpId: 'PED-99825', date: '26/02/2026', depositor: 'VerticalParts Matriz', items: 3, status: 'Erro', wmsRef: '-' },
  { erpId: 'PED-99826', date: '26/02/2026', depositor: 'VerticalParts Matriz', items: 105, status: 'Pendente', wmsRef: '-' },
  { erpId: 'PED-99827', date: '26/02/2026', depositor: 'VerticalParts Matriz', items: 1, status: 'Importado', wmsRef: 'WMS-7714' },
  { erpId: 'PED-99828', date: '26/02/2026', depositor: 'VerticalParts Matriz', items: 45, status: 'Importado', wmsRef: 'WMS-7715' },
];

export default function ERPOrderIntegration() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('26/02/2026 14:02:15');

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date().toLocaleString('pt-BR'));
    }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sincronizar Ordens ERP</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Conector Direto com Omie / Outros ERPs</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Última Sincronização</p>
            <p className="text-sm font-bold text-slate-900">{lastSync}</p>
          </div>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className={cn("flex items-center gap-2 px-6 py-3 font-black rounded-[2rem] text-sm shadow-lg transition-all", syncing ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#ffcd00] text-black hover:scale-105 active:scale-95 shadow-yellow-500/20")}
          >
            <RefreshCcw className={cn("w-5 h-5", syncing && "animate-spin")} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Database className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Hoje</p>
            <h3 className="text-2xl font-black text-slate-900">142</h3>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendentes</p>
            <h3 className="text-2xl font-black text-slate-900">18</h3>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full"><XCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Com Erro</p>
            <h3 className="text-2xl font-black text-slate-900">03</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por ID ERP ou Ref WMS..." className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold focus:ring-2 focus:ring-[#ffcd00]" />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-colors">
             <Filter className="w-4 h-4" /> Filtros Avançados
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Ordem ERP</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Data</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Depositante</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Acessos/Itens</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status</th>
                <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Ref WMS</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ORDERS.map(order => (
                <tr key={order.erpId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 text-sm font-black text-slate-900 flex items-center gap-2">
                    {order.erpId}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-500">{order.date}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-600">{order.depositor}</td>
                  <td className="py-4 px-4 text-sm font-black text-slate-900">{order.items} <span className="font-bold text-slate-400 text-xs">un</span></td>
                  <td className="py-4 px-4">
                    {order.status === 'Importado' && <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] w-max font-black uppercase tracking-widest"><CheckCircle2 className="w-3 h-3" /> Importado</span>}
                    {order.status === 'Pendente' && <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] w-max font-black uppercase tracking-widest"><Clock className="w-3 h-3" /> Pendente</span>}
                    {order.status === 'Erro' && <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] w-max font-black uppercase tracking-widest"><XCircle className="w-3 h-3" /> Falha</span>}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-500">{order.wmsRef}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
