import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRightLeft, CheckCircle2, Clock, XCircle, ChevronRight,
  FileText, Boxes, Truck, Hash, Monitor, Tv, AlertTriangle, Printer,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useApp } from '../context/AppContext';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── Paleta segura de cores (sem string interpolation em className) ───────────
const BAR_COLORS = {
  amber:  'bg-amber-400',
  emerald: 'bg-emerald-500',
  slate:  'bg-slate-200',
};

// ─── Dados mock ────────────────────────────────────────────────────────────────
// alocada = % do volume NF que foi separado para o dock de cross-docking
// expedida = % do volume alocado que já foi carregado/expedido
const MOCK_CROSS_DOCKING = [
  {
    id: 'NF-10292', ordem: 'OR-55920', status: 'Pendente', conferido: true,
    alocada: 80, expedida: 0, coleta: '--',
    doca: 'Doca 08',
    itens: [
      { sku: 'VEPEL-BPI-174FX',  desc: 'Barreira de Proteção Infravermelha (174 Feixes)', ean: '789123456001', solicitado: 10, atendido: 8 },
      { sku: 'VPER-ESS-NY-27MM', desc: 'Escova de Segurança (Nylon, Base 27mm)',           ean: '7891149108718', solicitado: 5,  atendido: 5 },
    ],
    rotaExpressaDefinida: false,
    rotaExpressa: null, // null = não definido ainda
  },
  {
    id: 'NF-10295', ordem: 'OR-55925', status: 'Pendente', conferido: true,
    alocada: 100, expedida: 45, coleta: 'COL-882',
    doca: 'Doca 12',
    itens: [
      { sku: 'VPER-PAL-INO-1000', desc: 'Pallet de Aço Inox (1000mm)', ean: '789123456003', solicitado: 50, atendido: 50 },
    ],
    rotaExpressaDefinida: true,
    rotaExpressa: true,
  },
  {
    id: 'NF-10300', ordem: 'OR-55930', status: 'Processada', conferido: true,
    alocada: 100, expedida: 100, coleta: 'COL-900',
    doca: 'Doca 05',
    itens: [
      { sku: 'VPER-INC-ESQ', desc: 'InnerCap (Esquerdo) — Ref. VERTICALPARTS', ean: '7890000000001', solicitado: 100, atendido: 100 },
    ],
    rotaExpressaDefinida: true,
    rotaExpressa: false,
  },
  {
    id: 'NF-9982', ordem: 'OR-55800', status: 'Cancelada', conferido: false,
    alocada: 0, expedida: 0, coleta: '--',
    doca: '--',
    itens: [
      { sku: 'VPER-AIR-FLOW', desc: 'Filtro de Ar VP-FLOW', ean: '7890000000002', solicitado: 200, atendido: 0 },
    ],
    rotaExpressaDefinida: false,
    rotaExpressa: null,
  },
];

// Status corretos: singular (estado da NF)
const FILTROS = ['Pendente', 'Processada', 'Cancelada'];

const ProgressBar = ({ value, color = 'amber', label }) => (
  <div className="flex flex-col gap-1 w-full max-w-[120px]">
    <div className="flex justify-between items-center px-1">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[9px] font-black text-slate-700 dark:text-slate-300">{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
      <div className={cn('h-full transition-all duration-700 rounded-full', BAR_COLORS[color] ?? BAR_COLORS.slate)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  </div>
);

export default function CrossDockingMonitoring() {
  const [filter,     setFilter]     = useState('Pendente');
  const [selectedNF, setSelectedNF] = useState(null);
  const [nfs,        setNfs]        = useState(MOCK_CROSS_DOCKING);

  // isTvMode com fallback seguro
  const appCtx = useApp?.() ?? {};
  const isTvMode    = appCtx.isTvMode    ?? false;
  const setIsTvMode = appCtx.setIsTvMode ?? (() => {});

  const detailRef = useRef(null);

  const filteredNFs = useMemo(() => nfs.filter(nf => nf.status === filter), [nfs, filter]);

  // KPIs derivados de dados reais
  const kpiPendentes   = nfs.filter(n => n.status === 'Pendente').length;
  const kpiProcessadas = nfs.filter(n => n.status === 'Processada').length;
  const kpiSLACritico  = nfs.filter(n => n.status === 'Pendente' && n.alocada < 100).length;

  const handleSelectNF = (id) => {
    setSelectedNF(prev => prev === id ? null : id);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const handleRotaExpressa = (nfId, value) => {
    setNfs(prev => prev.map(n =>
      n.id === nfId ? { ...n, rotaExpressa: value, rotaExpressaDefinida: true } : n
    ));
  };

  const handlePrint = useCallback(() => window.print(), []);

  const selectedData = nfs.find(n => n.id === selectedNF);

  return (
    <div className={cn('space-y-6 pb-20', isTvMode && 'p-10')}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={cn('font-black tracking-tight flex items-center gap-3', isTvMode ? 'text-5xl mb-3' : 'text-2xl')}>
            <ArrowRightLeft className={cn('text-amber-400', isTvMode ? 'w-14 h-14' : 'w-8 h-8')} />
            2.1 Cruzar Docas — Acompanhamento Cross-Docking por NF
          </h1>
          <p className={cn('text-slate-500 font-medium italic', isTvMode ? 'text-xl' : 'text-sm')}>
            Monitoramento ágil de transbordo e expedição direta
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Botão modo TV — sem pulse (distração em galpão) */}
          <button onClick={() => setIsTvMode(!isTvMode)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg',
              isTvMode
                ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
                : 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95'
            )}>
            {isTvMode ? <Monitor className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
            {isTvMode ? 'Sair do Modo TV' : 'Modo TV'}
          </button>
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 p-1.5 rounded-2xl flex items-center shadow-sm">
            {FILTROS.map(s => (
              <button key={s} onClick={() => { setFilter(s); setSelectedNF(null); }}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all',
                  filter === s ? 'bg-amber-400 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50')}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs modo TV — derivados de dados reais, sem animações bounce */}
      {isTvMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-amber-500 p-8 rounded-[40px] shadow-2xl flex items-center gap-6 border-8 border-white">
            <AlertTriangle className="w-20 h-20 text-white shrink-0" />
            <div>
              <p className="text-white text-4xl font-black italic uppercase leading-tight">
                {kpiPendentes} NF{kpiPendentes !== 1 ? 's' : ''} Pendente{kpiPendentes !== 1 ? 's' : ''}
              </p>
              <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Aguardando Doca</p>
            </div>
          </div>
          <div className="bg-green-500 p-8 rounded-[40px] shadow-2xl flex items-center gap-6 border-8 border-white">
            <CheckCircle2 className="w-20 h-20 text-white shrink-0" />
            <div>
              <p className="text-white text-4xl font-black italic uppercase leading-tight">
                {kpiProcessadas} Processada{kpiProcessadas !== 1 ? 's' : ''}
              </p>
              <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Hoje</p>
            </div>
          </div>
          <div className="bg-red-600 p-8 rounded-[40px] shadow-2xl flex items-center gap-6 border-8 border-white">
            <Clock className="w-20 h-20 text-white shrink-0" />
            <div>
              <p className="text-white text-4xl font-black italic uppercase leading-tight">
                {kpiSLACritico} SLA Crítico
              </p>
              <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Alocação incompleta</p>
            </div>
          </div>
        </div>
      )}

      {/* Master grid */}
      <div className={cn('bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl',
        isTvMode && 'border-4 border-amber-400')}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                {['Nota Fiscal','O.R. / Origem','Conferido','Fluxo Operacional','Nº Coleta',''].map((h,i) => (
                  <th key={i} className={cn('p-6 text-left font-black text-slate-400 uppercase tracking-[0.2em]', isTvMode ? 'text-2xl py-10' : 'text-[10px]')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredNFs.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-medium text-sm">
                  Nenhuma NF com status "{filter}".
                </td></tr>
              )}
              {filteredNFs.map(nf => (
                <tr key={nf.id} onClick={() => handleSelectNF(nf.id)}
                  className={cn('group cursor-pointer transition-all',
                    selectedNF === nf.id ? 'bg-amber-50/60 dark:bg-amber-900/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30',
                    isTvMode && 'py-8')}>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={cn('rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0', isTvMode ? 'w-16 h-16' : 'w-10 h-10')}>
                        <FileText className={cn('text-slate-500', isTvMode ? 'w-9 h-9' : 'w-5 h-5')} />
                      </div>
                      <span className={cn('font-black text-slate-900 dark:text-white uppercase', isTvMode ? 'text-3xl' : 'text-sm')}>{nf.id}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className={cn('font-black text-amber-500 font-mono', isTvMode ? 'text-2xl' : 'text-xs')}>{nf.ordem}</span>
                      <span className={cn('font-bold text-slate-400 uppercase tracking-widest', isTvMode ? 'text-lg mt-1' : 'text-[10px]')}>Doca-Recebimento</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center">
                      {nf.conferido
                        ? <div className={cn('rounded-full bg-green-100 flex items-center justify-center text-green-600', isTvMode ? 'w-14 h-14' : 'w-8 h-8')}><CheckCircle2 className={isTvMode ? 'w-9 h-9' : 'w-4 h-4'} /></div>
                        : <div className={cn('rounded-full bg-slate-100 flex items-center justify-center text-slate-400', isTvMode ? 'w-14 h-14' : 'w-8 h-8')}><Clock className={isTvMode ? 'w-9 h-9' : 'w-4 h-4'} /></div>
                      }
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-5">
                      <ProgressBar value={nf.alocada}  color="amber"   label="Alocada" />
                      <ProgressBar value={nf.expedida} color="emerald" label="Expedida" />
                    </div>
                  </td>
                  <td className={cn('p-6 font-mono font-black text-slate-500', isTvMode ? 'text-3xl' : 'text-xs')}>{nf.coleta}</td>
                  <td className="p-6 text-right">
                    <ChevronRight className={cn('transition-transform duration-300',
                      selectedNF === nf.id ? 'rotate-90 text-amber-500' : 'text-slate-300',
                      isTvMode ? 'w-9 h-9' : 'w-5 h-5'
                    )} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel — com scrollIntoView e aria */}
      {selectedData && (
        <div ref={detailRef} className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-200 shadow-2xl overflow-hidden">
          <div className="absolute w-full h-1 bg-amber-400" />

          {/* Header detail */}
          <div className="px-8 py-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-6 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-amber-100 flex items-center justify-center">
                <Boxes className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-black">Itens – <span className="text-amber-500">{selectedNF}</span></h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Doca: {selectedData.doca}&nbsp;·&nbsp;{selectedData.ordem}
                </p>
              </div>
            </div>

            {/* Validação de Rota Expressa — botões funcionais */}
            <div className="bg-slate-800 p-5 rounded-3xl border-4 border-amber-400/30 flex items-center gap-5 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-slate-900" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Validação de Rota Expressa</span>
                <p className="text-white font-black text-sm max-w-[200px] leading-tight">
                  O SKU desta NF irá diretamente para o <span className="text-amber-400 underline decoration-2">Cliente</span>?
                </p>
                {selectedData.rotaExpressaDefinida && (
                  <span className={cn('text-[10px] font-black', selectedData.rotaExpressa ? 'text-green-400' : 'text-slate-400')}>
                    {selectedData.rotaExpressa ? '✓ Rota expressa confirmada' : '✗ Armazenagem normal'}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRotaExpressa(selectedNF, true)}
                  aria-pressed={selectedData.rotaExpressa === true}
                  className={cn('px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95',
                    selectedData.rotaExpressa === true ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-amber-400 text-slate-900 hover:bg-amber-500')}>
                  Sim
                </button>
                <button
                  onClick={() => handleRotaExpressa(selectedNF, false)}
                  aria-pressed={selectedData.rotaExpressa === false}
                  className={cn('px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-600',
                    selectedData.rotaExpressa === false ? 'bg-slate-500 text-white ring-2 ring-slate-300' : 'bg-slate-700 text-white hover:bg-slate-600')}>
                  Não
                </button>
              </div>
            </div>

            <button onClick={() => setSelectedNF(null)} aria-label="Fechar painel"
              className="p-3 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 transition-all hover:scale-110 shadow-lg">
              <XCircle className="w-7 h-7" />
            </button>
          </div>

          {/* Tabela de itens */}
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[9px] uppercase font-black tracking-widest text-slate-400">
                  <th className="px-6 py-2">Cód. / SKU</th>
                  <th className="px-6 py-2">Descrição</th>
                  <th className="px-6 py-2 text-center">Barras (EAN)</th>
                  <th className="px-6 py-2 text-center">Solicitado</th>
                  <th className="px-6 py-2 text-center">Atendido</th>
                  <th className="px-6 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedData.itens.map(item => (
                  <tr key={item.sku} className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    <td className="px-6 py-4 border-y border-l border-slate-100 dark:border-slate-800 rounded-l-2xl">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-amber-400/50" />
                        <span className="text-xs font-black text-amber-600 font-mono">{item.sku}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-y border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.desc}</span>
                    </td>
                    <td className="px-6 py-4 border-y border-slate-100 text-center">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{item.ean}</span>
                    </td>
                    <td className="px-6 py-4 border-y border-slate-100 text-center">
                      <span className="text-sm font-black text-slate-400">{item.solicitado}</span>
                    </td>
                    <td className="px-6 py-4 border-y border-slate-100 text-center">
                      <span className="text-sm font-black text-amber-500">{item.atendido}</span>
                    </td>
                    <td className="px-6 py-4 border-y border-r border-slate-100 dark:border-slate-800 rounded-r-2xl text-right">
                      <span className={cn('px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest',
                        item.atendido >= item.solicitado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                        {item.atendido >= item.solicitado ? 'Completo' : 'Parcial'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Destino: {selectedData.rotaExpressa === true ? 'Cross-Docking — Entrega Direta ao Cliente' : selectedData.rotaExpressa === false ? `Armazém — ${selectedData.doca}` : 'Destino não definido'}
              </span>
            </div>
            <button onClick={handlePrint} title="Imprimir manifesto de cross-docking"
              className="px-5 py-2 bg-amber-400 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 active:scale-95 transition-all shadow-md flex items-center gap-2">
              <Printer className="w-4 h-4" /> Imprimir Manifesto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
