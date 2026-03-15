import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  ArrowRightLeft, CheckCircle2, Clock, XCircle, ChevronRight,
  FileText, Boxes, Truck, Hash, Monitor, Tv, AlertTriangle, Printer,
  Info,
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { cn } from '../utils/cn';
import { MOCK_CROSS_DOCKING } from '../mock/crossDockingData';
import Tooltip from '../components/ui/Tooltip';

const BAR_COLORS = {
  amber:  'bg-amber-400',
  emerald: 'bg-emerald-500',
  slate:  'bg-slate-200',
};

const FILTROS = ['Pendente', 'Processada', 'Cancelada'];

const ProgressBar = ({ value, color = 'amber', label }) => (
  <div className="flex flex-col gap-1 w-full max-w-[120px]">
    <div className="flex justify-between items-center px-1">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[9px] font-black text-slate-700 dark:text-slate-300">{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
      <div 
        className={cn('h-full transition-all duration-700 rounded-full', BAR_COLORS[color] ?? BAR_COLORS.slate)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} 
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  </div>
);

export default function CrossDockingMonitoring() {
  const [filter, setFilter] = useState('Pendente');
  const [selectedNF, setSelectedNF] = useState(null);
  const [nfs, setNfs] = useState(MOCK_CROSS_DOCKING);

  // appCtx with safe fallback
  const appCtx = useApp?.() ?? {};
  const isTvMode = appCtx.isTvMode ?? false;
  const setIsTvMode = appCtx.setIsTvMode ?? (() => {});

  const detailRef = useRef(null);

  // Persist TV Mode preference
  useEffect(() => {
    const saved = localStorage.getItem('vp_tv_mode');
    if (saved !== null && JSON.parse(saved) !== isTvMode) {
      setIsTvMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vp_tv_mode', JSON.stringify(isTvMode));
  }, [isTvMode]);

  useEffect(() => {
    if (isTvMode) {
      const interval = setInterval(() => {
        if (detailRef.current) {
          detailRef.current.scrollTop += 1;
          if (detailRef.current.scrollTop + detailRef.current.clientHeight >= detailRef.current.scrollHeight) {
            detailRef.current.scrollTop = 0;
          }
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isTvMode, setIsTvMode, detailRef]); // Added detailRef to dependencies

  // Scroll to detail when selectedNF changes
  useEffect(() => {
    if (selectedNF && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      detailRef.current.focus();
    }
  }, [selectedNF, detailRef]); // Added detailRef to dependencies

  const filteredNFs = useMemo(() => nfs.filter(nf => nf.status === filter), [nfs, filter]);

  // KPIs derived from real data
  const stats = useMemo(() => ({
    pendentes: nfs.filter(n => n.status === 'Pendente').length,
    processadas: nfs.filter(n => n.status === 'Processada').length,
    slaCritico: nfs.filter(n => n.status === 'Pendente' && n.alocada < 100).length
  }), [nfs]);

  const handleSelectNF = (id) => {
    setSelectedNF(prev => prev === id ? null : id);
  };

  const handleRotaExpressa = (nfId, value) => {
    setNfs(prev => prev.map(n =>
      n.id === nfId ? { ...n, rotaExpressa: value, rotaExpressaDefinida: true } : n
    ));
  };

  const handlePrint = useCallback(() => window.print(), []);

  const selectedData = useMemo(() => nfs.find(n => n.id === selectedNF), [nfs, selectedNF]);

  return (
    <main className={cn('space-y-6 pb-20 transition-all duration-500', isTvMode && 'p-10 bg-slate-50 dark:bg-slate-950')}>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          <Tooltip text={isTvMode ? 'Sair da visualização ampliada' : 'Alternar para modo TV (Dashboard)'}>
            <button 
              onClick={() => setIsTvMode(!isTvMode)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95',
                isTvMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-800 text-white hover:bg-slate-700'
              )}
            >
              {isTvMode ? <Monitor className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
              {isTvMode ? 'Sair do Modo TV' : 'Modo TV'}
            </button>
          </Tooltip>
          
          <nav className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 p-1.5 rounded-2xl flex items-center shadow-sm">
            {FILTROS.map(s => (
              <Tooltip key={s} text={`Filtrar por status ${s}`}>
                <button 
                  onClick={() => { setFilter(s); setSelectedNF(null); }}
                  aria-pressed={filter === s}
                  className={cn(
                    'px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all',
                    filter === s ? 'bg-amber-400 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {s}
                </button>
              </Tooltip>
            ))}
          </nav>
        </div>
      </header>

      {/* KPIs modo TV */}
      {isTvMode && (
        <section aria-label="Resumo de indicadores" className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
          <button 
            onClick={() => setFilter('Pendente')}
            className="group bg-amber-500 p-8 rounded-[40px] shadow-2xl flex items-center gap-6 border-8 border-white transition-transform hover:scale-[1.02] text-left"
          >
            <AlertTriangle className="w-20 h-20 text-white shrink-0" />
            <div>
              <p className="text-white text-4xl font-black italic uppercase leading-tight">
                {stats.pendentes} NF{stats.pendentes !== 1 ? 's' : ''} Pendente{stats.pendentes !== 1 ? 's' : ''}
              </p>
              <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Aguardando Doca</p>
            </div>
          </button>
          
          <button 
            onClick={() => setFilter('Processada')}
            className="group bg-green-500 p-8 rounded-[40px] shadow-2xl flex items-center gap-6 border-8 border-white transition-transform hover:scale-[1.02] text-left"
          >
            <CheckCircle2 className="w-20 h-20 text-white shrink-0" />
            <div>
              <p className="text-white text-4xl font-black italic uppercase leading-tight">
                {stats.processadas} Processada{stats.processadas !== 1 ? 's' : ''}
              </p>
              <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Hoje</p>
            </div>
          </button>
          
          <div className="bg-red-600 p-8 rounded-[40px] shadow-2xl flex items-center gap-6 border-8 border-white relative group">
            <Clock className="w-20 h-20 text-white shrink-0" />
            <div>
              <p className="text-white text-4xl font-black italic uppercase leading-tight">
                {stats.slaCritico} SLA Crítico
              </p>
              <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Alocação incompleta</p>
            </div>
            <div className="absolute top-4 right-8">
              <Tooltip text="NFs pendentes com alocação abaixo de 100%">
                <Info className="w-6 h-6 text-white/40 hover:text-white transition-colors" />
              </Tooltip>
            </div>
          </div>
        </section>
      )}

      {/* Master table grid */}
      <section className={cn('bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl transition-all',
        isTvMode && 'border-4 border-amber-400')}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <caption className="sr-only">Lista de Notas Fiscais em Cross-Docking para status {filter}</caption>
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                {['Nota Fiscal','O.R. / Origem','Conferido','Fluxo Operacional','Nº Coleta',''].map((h,i) => (
                  <th key={i} scope="col" className={cn('p-6 text-left font-black text-slate-400 uppercase tracking-[0.2em]', isTvMode ? 'text-2xl py-10' : 'text-[10px]')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredNFs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-medium text-sm italic">
                    Nenhuma NF com status "{filter}" encontrada no sistema.
                  </td>
                </tr>
              )}
              {filteredNFs.map(nf => (
                <tr 
                  key={nf.id} 
                  onClick={() => handleSelectNF(nf.id)}
                  tabIndex="0"
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectNF(nf.id)}
                  className={cn(
                    'group cursor-pointer transition-all focus:outline-none focus:bg-amber-50/40',
                    selectedNF === nf.id ? 'bg-amber-50/60 dark:bg-amber-900/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30',
                    isTvMode && 'py-8'
                  )}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={cn('rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm', isTvMode ? 'w-16 h-16' : 'w-10 h-10')}>
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
                      <Tooltip text={nf.conferido ? 'NF Conferida com sucesso' : 'Aguardando conferência física'}>
                        {nf.conferido
                          ? <div className={cn('rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm', isTvMode ? 'w-14 h-14' : 'w-8 h-8')}><CheckCircle2 className={isTvMode ? 'w-9 h-9' : 'w-4 h-4'} /></div>
                          : <div className={cn('rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm', isTvMode ? 'w-14 h-14' : 'w-8 h-8')}><Clock className={isTvMode ? 'w-9 h-9' : 'w-4 h-4'} /></div>
                        }
                      </Tooltip>
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
      </section>

      {/* Detail panel */}
      {selectedData && (
        <article 
          ref={detailRef} 
          tabIndex="-1"
          className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 focus:outline-none scroll-mt-6"
        >
          <div className="absolute w-full h-1 bg-amber-400" />

          {/* Header detail */}
          <div className="px-8 py-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-6 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-amber-100 border border-amber-200 shadow-sm flex items-center justify-center">
                <Boxes className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Itens da Carga – <span className="text-amber-500">{selectedNF}</span></h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Monitor className="w-3 h-3" /> Doca: {selectedData.doca}&nbsp;·&nbsp;{selectedData.ordem}
                </p>
              </div>
            </div>

            {/* Validation Rota Expressa */}
            <div className="bg-slate-800 p-5 rounded-3xl border-4 border-amber-400/30 flex items-center gap-5 shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shrink-0 shadow-lg">
                <Truck className="w-6 h-6 text-slate-900" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Validação Rota Expressa
                </span>
                <p className="text-white font-black text-sm max-w-[200px] leading-tight">
                  O SKU desta NF irá diretamente para o <span className="text-amber-400 underline decoration-2">Cliente</span>?
                </p>
                {selectedData.rotaExpressaDefinida && (
                  <span className={cn('text-[10px] font-black animate-in fade-in', selectedData.rotaExpressa ? 'text-green-400' : 'text-slate-400')}>
                    {selectedData.rotaExpressa ? '✓ Rota expressa confirmada' : '✗ Armazenagem normal'}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Tooltip text="Entrega direta – Não armazenar">
                  <button
                    onClick={() => handleRotaExpressa(selectedNF, true)}
                    aria-pressed={selectedData.rotaExpressa === true}
                    className={cn('px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95',
                      selectedData.rotaExpressa === true 
                        ? 'bg-green-500 text-white ring-2 ring-green-300 shadow-green-500/20 shadow-lg' 
                        : 'bg-amber-400 text-slate-900 hover:bg-amber-500 shadow-amber-400/20 shadow-lg')}
                  >
                    Sim
                  </button>
                </Tooltip>
                <Tooltip text="Fluxo normal – Realizar armazenagem">
                  <button
                    onClick={() => handleRotaExpressa(selectedNF, false)}
                    aria-pressed={selectedData.rotaExpressa === false}
                    className={cn('px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-600',
                      selectedData.rotaExpressa === false 
                        ? 'bg-slate-500 text-white ring-2 ring-slate-300 shadow-lg' 
                        : 'bg-slate-700 text-white hover:bg-slate-600 shadow-lg')}
                  >
                    Não
                  </button>
                </Tooltip>
              </div>
            </div>

            <Tooltip text="Fechar detalhes da NF">
              <button 
                onClick={() => setSelectedNF(null)} 
                aria-label="Fechar painel de detalhes"
                className="p-3 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 transition-all hover:scale-110 shadow-lg active:scale-90"
              >
                <XCircle className="w-7 h-7" />
              </button>
            </Tooltip>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <caption className="sr-only">Itens contidos na Nota Fiscal {selectedNF}</caption>
              <thead>
                <tr className="text-[9px] uppercase font-black tracking-widest text-slate-400">
                  <th scope="col" className="px-6 py-2">Cód. / SKU</th>
                  <th scope="col" className="px-6 py-2">Descrição</th>
                  <th scope="col" className="px-6 py-2 text-center">Barras (EAN)</th>
                  <th scope="col" className="px-6 py-2 text-center">Solicitado</th>
                  <th scope="col" className="px-6 py-2 text-center">Atendido</th>
                  <th scope="col" className="px-6 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedData.itens.map(item => (
                  <tr key={item.sku} className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group/item">
                    <td className="px-6 py-4 border-y border-l border-slate-100 dark:border-slate-800 rounded-l-2xl">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-amber-400/50 group-hover/item:rotate-12 transition-transform" />
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
                      <span className={cn('px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors',
                        item.atendido >= item.solicitado 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-amber-100 text-amber-700 border-amber-200')}>
                        {item.atendido >= item.solicitado ? 'Completo' : 'Parcial'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer detail */}
          <footer className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Truck className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Status de Rota</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {selectedData.rotaExpressa === true ? 'Fluxo: Cross-Docking (Entrega Direta)' : selectedData.rotaExpressa === false ? `Fluxo: Armazenagem (Doca ${selectedData.doca})` : 'Destino: Pendente de Definição'}
                </span>
              </div>
            </div>
            
            <Tooltip text="Gerar e imprimir manifesto da NF selecionada">
              <button 
                onClick={handlePrint}
                className="px-6 py-3 bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl flex items-center gap-2 group"
              >
                <Printer className="w-4 h-4 group-hover:rotate-6 transition-transform" /> Imprimir Manifesto
              </button>
            </Tooltip>
          </footer>
        </article>
      )}
    </main>
  );
}

// Subcomponent info icon for Tooltip trigger helper
const Zap = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
