import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  Calendar, 
  Filter, 
  Plus, 
  X, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  FileCode,
  ArrowRightLeft,
  Building2,
  Package,
  History,
  Info
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ====== MOCK DATA ======

const MOCK_STOCK_FISCAL = [
  { id: 1, depositante: 'VerticalParts Matriz', nfOriginal: 'NF-88291', dataEntrada: '15/02/2026', produto: 'VP-FR4429-X', desc: 'Pastilha de Freio Cerâmica', qtdFisica: 1000, qtdCoberta: 1000, saldo: 0, status: 'Totalmente Coberto' },
  { id: 2, depositante: 'VParts Import Export', nfOriginal: 'NF-90212', dataEntrada: '18/02/2026', produto: 'VPER-ESS-NY', desc: 'Escova de Segurança Nylon', qtdFisica: 500, qtdCoberta: 200, saldo: 300, status: 'Parcialmente Coberto' },
  { id: 3, depositante: 'VerticalParts AutoPeças', nfOriginal: 'NF-11234', dataEntrada: '20/02/2026', produto: 'VP-DF882-M', desc: 'Disco de Freio Ventilado', qtdFisica: 200, qtdCoberta: 0, saldo: 200, status: 'Descoberto' },
  { id: 4, depositante: 'VerticalParts Matriz', nfOriginal: 'NF-88300', dataEntrada: '21/02/2026', produto: 'VP-WPR-99', desc: 'Palheta Limpador Silicone', qtdFisica: 300, qtdCoberta: 300, saldo: 0, status: 'Totalmente Coberto' },
];

const MOCK_COVERAGE_NOTES = {
  1: [
    { id: 101, nf: 'RS-10021', data: '16/02/2026', tipo: 'Retorno Simbólico', qtd: 1000, valor: 'R$ 15.000,00' }
  ],
  2: [
    { id: 201, nf: 'CO-5512', data: '19/02/2026', tipo: 'Conta e Ordem', qtd: 200, valor: 'R$ 4.200,00' }
  ],
  3: [],
  4: [
    { id: 401, nf: 'RS-10025', data: '22/02/2026', tipo: 'Retorno Simbólico', qtd: 300, valor: 'R$ 2.100,00' }
  ]
};

// ====== COMPONENTE PRINCIPAL ======

export default function FiscalCoverage() {
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterCnpj, setFilterCnpj] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const filteredData = useMemo(() => {
    return MOCK_STOCK_FISCAL.filter(item => {
      const matchStatus = filterStatus === 'Todos' || item.status === filterStatus;
      const matchCnpj = item.depositante.toLowerCase().includes(filterCnpj.toLowerCase());
      return matchStatus && matchCnpj;
    });
  }, [filterStatus, filterCnpj]);

  const selectedItem = MOCK_STOCK_FISCAL.find(i => i.id === selectedId);
  const coverageNotes = selectedId ? MOCK_COVERAGE_NOTES[selectedId] || [] : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 space-y-6 animate-in fade-in duration-700">
      
      {/* ====== HEADER ====== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Cobertura Fiscal e Conta e Ordem</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">Gestão de Remessa para Armazenagem e Retornos Simbólicos de Terceiros</p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-4 bg-primary text-secondary rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Vincular Cobertura Fiscal
        </button>
      </div>

      {/* ====== FILTROS ====== */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 bg-slate-900/50 border border-slate-800 rounded-[32px] shadow-sm">
        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Depositante / CNPJ</label>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar por nome..."
                value={filterCnpj}
                onChange={(e) => setFilterCnpj(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:border-primary transition-all"
              />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Período de Entrada</label>
           <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Ex: Últimos 30 dias"
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:border-primary transition-all"
              />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status da Cobertura</label>
           <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:border-primary transition-all appearance-none"
              >
                 <option>Todos</option>
                 <option>Totalmente Coberto</option>
                 <option>Parcialmente Coberto</option>
                 <option>Descoberto</option>
              </select>
           </div>
        </div>

        <div className="flex items-end flex-1">
           <div className="flex gap-2 w-full">
             <div className="flex-1 bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Saldo Total Descoberto</p>
                   <p className="text-base font-black text-danger">500 Peças</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-danger/50" />
             </div>
           </div>
        </div>
      </div>

      {/* ====== GRID MASTER ====== */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Depositante</th>
                <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Origial / Entrada</th>
                <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Peça / SKU</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtde Física</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtde Coberta</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo a Cobrir</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredData.map((item) => (
                <tr 
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "group cursor-pointer transition-all",
                    selectedId === item.id ? "bg-primary/5" : "hover:bg-slate-800/30"
                  )}
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                       <Building2 className="w-4 h-4 text-slate-500" />
                       <span className="text-xs font-bold">{item.depositante}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-200">{item.nfOriginal}</span>
                       <span className="text-[10px] font-bold text-slate-500 uppercase">{item.dataEntrada}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                       <Package className="w-4 h-4 text-primary/40" />
                       <span className="text-xs font-black text-primary uppercase">{item.produto}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center font-mono text-xs font-bold">{item.qtdFisica}</td>
                  <td className="p-5 text-center font-mono text-xs font-bold text-green-500">{item.qtdCoberta}</td>
                  <td className="p-5 text-center font-mono text-xs font-bold text-danger">{item.saldo}</td>
                  <td className="p-5 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      item.status === 'Totalmente Coberto' ? "bg-green-500/10 text-green-500" :
                      item.status === 'Parcialmente Coberto' ? "bg-amber-500/10 text-amber-500" : "bg-danger/10 text-danger"
                    )}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== DETAIL PANEL (INFERIOR) ====== */}
      <div className={cn(
        "transition-all duration-500 overflow-hidden",
        selectedId ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
              <History className="w-48 h-48" />
           </div>

           <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                    <ArrowRightLeft className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                    <h3 className="text-base font-black uppercase tracking-wider">Notas de Cobertura Associadas</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Vínculos por Retorno Simbólico ou Conta e Ordem</p>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedId(null)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
           </div>

           {coverageNotes.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coverageNotes.map(note => (
                  <div key={note.id} className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col gap-3 group hover:border-primary/30 transition-all">
                     <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-primary text-secondary text-[8px] font-black uppercase rounded">{note.tipo}</span>
                        <FileText className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" />
                     </div>
                     <div>
                        <p className="text-base font-black text-slate-200">{note.nf}</p>
                        <p className="text-[9px] font-bold text-slate-500">{note.data}</p>
                     </div>
                     <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-700/50">
                        <div>
                           <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Quantidade</p>
                           <p className="text-xs font-bold text-slate-300">{note.qtd} pçs</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Valor Total</p>
                           <p className="text-xs font-bold text-slate-300">{note.valor}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center border border-dashed border-slate-700">
                   <Info className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nenhuma nota de cobertura vinculada a este lote.</p>
                <button 
                  onClick={() => setShowModal(true)}
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                >
                  Vincular Agora
                </button>
             </div>
           )}
        </div>
      </div>

      {/* ====== MODAL: VINCULAR COBERTURA ====== */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-full h-3 bg-primary" />
              
              <div className="p-8 md:p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center border-4 border-slate-800 shadow-xl">
                          <FileCode className="w-8 h-8 text-primary" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Vincular Cobertura Fiscal</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Busca de XML e Abatimento de Saldo</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-danger hover:scale-110 transition-all"
                    >
                       <X className="w-6 h-6" />
                    </button>
                 </div>

                 {/* UPLOAD XML AREA */}
                 <div className="p-10 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px] flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 transition-all cursor-pointer group">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 flex items-center justify-center transition-all">
                       <Download className="w-10 h-10 text-slate-300 group-hover:text-primary animate-bounce-slow" />
                    </div>
                    <div>
                       <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Clique ou arraste o XML da nota</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Padrão Nacional 4.00 · Retorno Simbólico / Conta e Ordem</p>
                    </div>
                 </div>

                 {/* SELECIONAR LOTE PARA ABATIMENTO */}
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                       <Info className="w-4 h-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Dados para Abatimento</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Peça Selecionada</p>
                          <div className="bg-white dark:bg-slate-900 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                             <span className="text-xs font-black text-primary">{selectedItem?.produto || 'NENHUMA'}</span>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Saldo Restante</p>
                          <div className="bg-white dark:bg-slate-900 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                             <span className="text-xs font-black text-danger">{selectedItem?.saldo || 0} pçs</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-mono"
                    >
                       Cancelar
                    </button>
                    <button 
                      className="flex-[2] py-5 bg-secondary text-primary rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                       <CheckCircle2 className="w-5 h-5" /> Confirmar Vínculo (XML)
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
