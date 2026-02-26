import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronRight,
  Package,
  FileText,
  Boxes,
  Truck,
  Hash,
  ChevronDown,
  LayoutList,
  Monitor,
  Tv,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useApp } from '../context/AppContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ====== MOCK DATA ======
const MOCK_CROSS_DOCKING = [
  { 
    id: 'NF-10292', 
    ordem: 'OR-55920', 
    status: 'Pendente',
    conferido: true,
    alocada: 85,
    expedida: 0,
    coleta: '--',
    itens: [
      { sku: 'VEPEL-BPI-174FX', desc: 'Barreira de Proteção Infravermelha (174 Feixes)', ean: '789123456001', solicitado: 10, atendido: 8 },
      { sku: 'VPER-ESS-NY-27MM', desc: 'Escova de Segurança (Nylon - Base 27mm)', ean: '7891149108718', solicitado: 5, atendido: 5 },
    ]
  },
  { 
    id: 'NF-10295', 
    ordem: 'OR-55925', 
    status: 'Pendente',
    conferido: true,
    alocada: 100,
    expedida: 45,
    coleta: 'COL-882',
    itens: [
      { sku: 'VPER-PAL-INO-1000', desc: 'Pallet de Aço Inox (1000mm)', ean: '789123456003', solicitado: 50, atendido: 50 },
    ]
  },
  { 
    id: 'NF-10300', 
    ordem: 'OR-55930', 
    status: 'Processadas',
    conferido: true,
    alocada: 100,
    expedida: 100,
    coleta: 'COL-900',
    itens: [
      { sku: 'VPER-INC-ESQ', desc: 'InnerCap (Esquerdo) - Ref.: VERTICALPARTS', ean: '7890000000001', solicitado: 100, atendido: 100 },
    ]
  },
  { 
    id: 'NF-9982', 
    ordem: 'OR-55800', 
    status: 'Canceladas',
    conferido: false,
    alocada: 0,
    expedida: 0,
    coleta: '--',
    itens: [
      { sku: 'VPER-AIR-FLOW', desc: 'Filtro de Ar VP-FLOW', ean: '7890000000002', solicitado: 200, atendido: 0 },
    ]
  }
];

const ProgressBar = ({ value, label, color = "secondary" }) => (
  <div className="flex flex-col gap-1 w-full max-w-[120px]">
    <div className="flex justify-between items-center px-1">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[9px] font-black text-slate-900 dark:text-slate-300">{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
      <div 
        className={cn("h-full transition-all duration-1000 rounded-full", `bg-${color}`)} 
        style={{ width: `${value}%` }} 
      />
    </div>
  </div>
);

export default function CrossDockingMonitoring() {
  const [filter, setFilter] = useState('Pendente');
  const [selectedNF, setSelectedNF] = useState(null);
  const [nfs, setNfs] = useState(MOCK_CROSS_DOCKING);
  const { isTvMode, setIsTvMode } = useApp();

  const filteredNFs = nfs.filter(nf => nf.status === filter);

  return (
    <div className={cn(
      "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20",
      isTvMode && "p-10 scale-110 origin-top"
    )}>
      {/* ====== HEADER ====== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={cn(
            "font-black tracking-tight flex items-center gap-3",
            isTvMode ? "text-6xl mb-4" : "text-2xl"
          )}>
            <ArrowRightLeft className={cn("text-secondary", isTvMode ? "w-16 h-16" : "w-8 h-8")} /> Acompanhamento Cross-Docking por NF
          </h1>
          <p className={cn("text-slate-500 font-medium italic text-balance", isTvMode ? "text-2xl" : "text-sm")}>
            Monitoramento ágil de transbordo e expedição direta
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* BOTÃO MODO TV - DIRETRIZ 5 */}
          <button
            onClick={() => setIsTvMode(!isTvMode)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl",
              isTvMode 
                ? "bg-danger text-white hover:bg-red-600 animate-pulse" 
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {isTvMode ? <Monitor className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
            {isTvMode ? "Sair do Modo TV" : "Modo TV"}
          </button>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 p-1.5 rounded-2xl flex items-center shadow-sm">
            {['Pendente', 'Processadas', 'Canceladas'].map((s) => (
              <button
                key={s}
                onClick={() => { setFilter(s); setSelectedNF(null); }}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all",
                  filter === s 
                    ? "bg-secondary text-primary shadow-lg shadow-black/10" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ALERTAS VISUAIS MODO TV */}
      {isTvMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-bounce-slow">
           <div className="bg-amber-500 p-8 rounded-[40px] shadow-2xl flex items-center gap-6 border-8 border-white">
              <AlertTriangle className="w-20 h-20 text-white" />
              <div>
                <p className="text-white text-4xl font-black italic uppercase leading-tight">12 NFs Pendentes</p>
                <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Aguardando Doca</p>
              </div>
           </div>
           <div className="bg-green-500 p-8 rounded-[40px] shadow-2xl flex items-center gap-6 border-8 border-white">
              <CheckCircle2 className="w-20 h-20 text-white" />
              <div>
                <p className="text-white text-4xl font-black italic uppercase leading-tight">45 Coletas Hoje</p>
                <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Ritmo Elevado</p>
              </div>
           </div>
           <div className="bg-primary p-8 rounded-[40px] shadow-2xl flex items-center gap-6 border-8 border-white">
              <Clock className="w-20 h-20 text-secondary" />
              <div>
                <p className="text-white text-4xl font-black italic uppercase leading-tight">SLA Crítico</p>
                <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Doca 12 e 14</p>
              </div>
           </div>
        </div>
      )}

      {/* ====== MASTER GRID ====== */}
      <div className={cn(
        "bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl",
        isTvMode && "border-4 border-primary"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className={cn("p-6 text-left font-black text-slate-400 uppercase tracking-[0.2em]", isTvMode ? "text-2xl py-12" : "text-[10px]")}>Nota Fiscal</th>
                <th className={cn("p-6 text-left font-black text-slate-400 uppercase tracking-[0.2em]", isTvMode ? "text-2xl py-12" : "text-[10px]")}>O.R. / Origem</th>
                <th className={cn("p-6 text-center font-black text-slate-400 uppercase tracking-[0.2em]", isTvMode ? "text-2xl py-12" : "text-[10px]")}>Conferido</th>
                <th className={cn("p-6 text-left font-black text-slate-400 uppercase tracking-[0.2em]", isTvMode ? "text-2xl py-12" : "text-[10px]")}>Fluxo Operacional</th>
                <th className={cn("p-6 text-left font-black text-slate-400 uppercase tracking-[0.2em]", isTvMode ? "text-2xl py-12" : "text-[10px]")}>Nº Coleta</th>
                <th className="p-6 text-right w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredNFs.map((nf) => (
                <tr 
                   key={nf.id} 
                   onClick={() => setSelectedNF(selectedNF === nf.id ? null : nf.id)}
                   className={cn(
                     "group cursor-pointer transition-all",
                     selectedNF === nf.id ? "bg-secondary/5 dark:bg-secondary/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30",
                     isTvMode && "py-10"
                   )}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={cn("rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700", isTvMode ? "w-20 h-20" : "w-10 h-10")}>
                        <FileText className={cn("text-slate-500", isTvMode ? "w-10 h-10" : "w-5 h-5")} />
                      </div>
                      <span className={cn("font-black text-slate-900 dark:text-white uppercase tracking-tight", isTvMode ? "text-4xl" : "text-sm")}>{nf.id}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className={cn("font-black text-primary font-mono", isTvMode ? "text-3xl" : "text-xs")}>{nf.ordem}</span>
                      <span className={cn("font-bold text-slate-400 uppercase tracking-widest px-1", isTvMode ? "text-xl mt-2" : "text-[10px]")}>Doca-Recebimento</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center">
                      {nf.conferido ? (
                        <div className={cn("rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 border border-green-200 dark:border-green-800", isTvMode ? "w-16 h-16" : "w-8 h-8")}>
                          <CheckCircle2 className={isTvMode ? "w-10 h-10" : "w-4 h-4"} />
                        </div>
                      ) : (
                        <div className={cn("rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-200 dark:border-slate-700", isTvMode ? "w-16 h-16" : "w-8 h-8")}>
                          <Clock className={isTvMode ? "w-10 h-10" : "w-4 h-4"} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-6">
                      <ProgressBar value={nf.alocada} label="ALOCADA" color="primary" />
                      <ProgressBar value={nf.expedida} label="EXPEDIDA" color="secondary" />
                    </div>
                  </td>
                  <td className={cn("p-6 font-mono font-black text-slate-500", isTvMode ? "text-4xl" : "text-xs")}>
                    {nf.coleta}
                  </td>
                  <td className="p-6 text-right">
                    <div className={cn(
                      "transition-transform duration-300",
                      selectedNF === nf.id ? "rotate-90 text-secondary" : "text-slate-300"
                    )}>
                      <ChevronRight className={isTvMode ? "w-10 h-10" : "w-5 h-5"} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== DETAIL PANEL ====== */}
      {selectedNF && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-500 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-secondary/20 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary" />
            
            <div className="px-8 py-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-inner">
                     <Boxes className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Itens da Nota Fiscal <span className="text-secondary ml-1">{selectedNF}</span></h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detalhamento de conferência e atendimento</p>
                  </div>
               </div>

               {/* PERGUNTA DESTAQUE - DIRETRIZ 4 */}
               <div className="bg-primary p-6 rounded-3xl border-4 border-secondary/30 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -rotate-12 translate-x-12 -translate-y-8 pointer-events-none" />
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <Truck className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-1">Validação de Rota Expressa</span>
                    <p className="text-white font-black text-sm leading-tight max-w-[200px]">O SKU desta Nota Fiscal irá diretamente para o <span className="text-secondary underline decoration-2 underline-offset-4">Cliente</span>?</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-5 py-3 bg-secondary text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg">Sim</button>
                    <button className="px-5 py-3 bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-600 transition-all border border-slate-600">Não</button>
                  </div>
               </div>

               <button 
                 onClick={() => setSelectedNF(null)}
                 className="p-4 text-slate-400 hover:text-danger bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all hover:scale-110 shadow-lg"
               >
                 <XCircle className="w-8 h-8" />
               </button>
            </div>

            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[9px] uppercase font-black tracking-widest text-slate-400">
                    <th className="px-6 py-2">Cód. Produto / SKU</th>
                    <th className="px-6 py-2">Descrição</th>
                    <th className="px-6 py-2 text-center">Barras (EAN)</th>
                    <th className="px-6 py-2 text-center">Solocitado</th>
                    <th className="px-6 py-2 text-center">Atendido</th>
                    <th className="px-6 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {nfs.find(nf => nf.id === selectedNF)?.itens.map((item, idx) => (
                    <tr key={idx} className="bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      <td className="px-6 py-4 border-y border-l border-slate-100 dark:border-slate-800 first:rounded-l-2xl">
                        <div className="flex items-center gap-3">
                          <Hash className="w-4 h-4 text-secondary/50" />
                          <span className="text-xs font-black text-primary font-mono">{item.sku}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-y border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.desc}</span>
                      </td>
                      <td className="px-6 py-4 border-y border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{item.ean}</span>
                      </td>
                      <td className="px-6 py-4 border-y border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-sm font-black text-slate-400">{item.solicitado}</span>
                      </td>
                      <td className="px-6 py-4 border-y border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-sm font-black text-secondary">{item.atendido}</span>
                      </td>
                      <td className="px-6 py-4 border-y border-r border-slate-100 dark:border-slate-800 last:rounded-r-2xl text-right">
                        <span className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                          item.atendido >= item.solicitado ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {item.atendido >= item.solicitado ? 'Completo' : 'Parcial'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-secondary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Destino: Cross-Docking Externo (Doca 12)</span>
               </div>
               <div className="flex items-center gap-2">
                 <button className="px-6 py-2 bg-secondary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10">Imprimir Manifesto</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
