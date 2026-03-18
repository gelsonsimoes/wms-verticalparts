import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Clock, XCircle, ChevronRight,
  FileText, Boxes, Truck, Hash, Monitor, Tv, AlertTriangle, Printer,
  RefreshCw, Plus,
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabaseClient';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import Tooltip from '../components/ui/Tooltip';

const BAR_COLORS = { amber: 'bg-amber-400', emerald: 'bg-emerald-500', slate: 'bg-slate-200' };
const FILTROS = ['Pendente', 'Processada', 'Cancelada'];

const Zap = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

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
        role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100"
      />
    </div>
  </div>
);

export default function CrossDockingMonitoring() {
  const { warehouseId, isTvMode, setIsTvMode } = useApp();
  const [filter, setFilter]         = useState('Pendente');
  const [selectedNF, setSelectedNF] = useState(null);
  const [nfs, setNfs]               = useState([]);
  const [loading, setLoading]       = useState(true);
  const detailRef                   = useRef(null);

  // ── Buscar dados do Supabase ──────────────────────────────────────────────
  const fetchNFs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cross_docking')
      .select('*, cross_docking_itens(*)')
      .eq('warehouse_id', warehouseId)
      .order('created_at', { ascending: false });
    if (!error && data) setNfs(data);
    setLoading(false);
  }, [warehouseId]);

  useEffect(() => { fetchNFs(); }, [fetchNFs]);

  // ── Realtime ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('cross_docking_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cross_docking' }, fetchNFs)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchNFs]);

  // ── TV Mode auto-scroll ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isTvMode) return;
    const interval = setInterval(() => {
      if (detailRef.current) {
        detailRef.current.scrollTop += 1;
        if (detailRef.current.scrollTop + detailRef.current.clientHeight >= detailRef.current.scrollHeight)
          detailRef.current.scrollTop = 0;
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isTvMode]);

  useEffect(() => {
    if (selectedNF && detailRef.current)
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedNF]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    pendentes:   nfs.filter(n => n.status === 'Pendente').length,
    processadas: nfs.filter(n => n.status === 'Processada').length,
    slaCritico:  nfs.filter(n => n.status === 'Pendente' && n.perc_alocada < 100).length,
  }), [nfs]);

  const filteredNFs  = useMemo(() => nfs.filter(nf => nf.status === filter), [nfs, filter]);
  const selectedData = useMemo(() => nfs.find(n => n.id === selectedNF), [nfs, selectedNF]);

  // ── Rota Expressa salva no Supabase ───────────────────────────────────────
  const handleRotaExpressa = async (nfId, value) => {
    await supabase
      .from('cross_docking')
      .update({ rota_expressa: value, rota_expressa_definida: true })
      .eq('id', nfId);
  };

  const handlePrint = useCallback(() => window.print(), []);

  // ── Barra de ações (formato: array de arrays) ─────────────────────────────
  const actionGroups = [
    [
      { label: 'Nova NF',   icon: <Plus className="w-4 h-4" />,      primary: true,  onClick: () => alert('Formulário nova NF — a implementar') },
      { label: 'Atualizar', icon: <RefreshCw className="w-4 h-4" />,                 onClick: fetchNFs },
      { label: 'Imprimir',  icon: <Printer className="w-4 h-4" />,                   onClick: handlePrint },
      {
        label: isTvMode ? 'Sair Modo TV' : 'Modo TV',
        icon: isTvMode ? <Monitor className="w-4 h-4" /> : <Tv className="w-4 h-4" />,
        onClick: () => setIsTvMode(!isTvMode),
      },
    ],
  ];

  return (
    <EnterprisePageBase
      title="2.1 Cruzar Docas"
      breadcrumbItems={[{ label: 'OPERAR', path: '/operacao' }]}
      actionGroups={actionGroups}
    >
      <div className={cn('space-y-6 pb-20 transition-all duration-500', isTvMode && 'p-6 bg-slate-50 dark:bg-slate-950')}>

        {/* Subtítulo + filtros */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className={cn('text-slate-500 font-medium italic', isTvMode ? 'text-xl' : 'text-sm')}>
            Monitoramento de transbordo e expedição direta
          </p>
          <nav className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1 rounded-sm flex items-center shadow-sm">
            {FILTROS.map(s => (
              <button key={s} onClick={() => { setFilter(s); setSelectedNF(null); }} aria-pressed={filter === s}
                className={cn('px-4 py-2 rounded-sm text-[10px] font-black tracking-widest uppercase transition-all',
                  filter === s ? 'bg-amber-400 text-slate-900 shadow' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700')}>
                {s}
              </button>
            ))}
          </nav>
        </div>

        {/* KPIs — só no Modo TV */}
        {isTvMode && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
            <button onClick={() => setFilter('Pendente')}
              className="bg-amber-500 p-8 rounded-sm shadow-2xl flex items-center gap-6 border-8 border-white hover:scale-[1.02] transition-transform text-left">
              <AlertTriangle className="w-20 h-20 text-white shrink-0" />
              <div>
                <p className="text-white text-4xl font-black italic uppercase">{stats.pendentes} NF{stats.pendentes !== 1 ? 's' : ''} Pendente{stats.pendentes !== 1 ? 's' : ''}</p>
                <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Aguardando Doca</p>
              </div>
            </button>
            <button onClick={() => setFilter('Processada')}
              className="bg-green-500 p-8 rounded-sm shadow-2xl flex items-center gap-6 border-8 border-white hover:scale-[1.02] transition-transform text-left">
              <CheckCircle2 className="w-20 h-20 text-white shrink-0" />
              <div>
                <p className="text-white text-4xl font-black italic uppercase">{stats.processadas} Processada{stats.processadas !== 1 ? 's' : ''}</p>
                <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Hoje</p>
              </div>
            </button>
            <div className="bg-red-600 p-8 rounded-sm shadow-2xl flex items-center gap-6 border-8 border-white">
              <Clock className="w-20 h-20 text-white shrink-0" />
              <div>
                <p className="text-white text-4xl font-black italic uppercase">{stats.slaCritico} SLA Crítico</p>
                <p className="text-white/80 text-xl font-bold uppercase tracking-widest">Alocação incompleta</p>
              </div>
            </div>
          </section>
        )}

        {/* Tabela principal */}
        <section className={cn('bg-white dark:bg-slate-900/50 rounded-sm border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl',
          isTvMode && 'border-4 border-amber-400')}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <caption className="sr-only">NFs em Cross-Docking — {filter}</caption>
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  {['Nota Fiscal', 'O.R. / Origem', 'Conferido', 'Fluxo Operacional', 'Nº Coleta', ''].map((h, i) => (
                    <th key={i} scope="col"
                      className={cn('p-4 text-left font-black text-slate-400 uppercase tracking-[0.15em]', isTvMode ? 'text-2xl py-8' : 'text-[10px]')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading && (
                  <tr><td colSpan={6} className="p-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto" />
                  </td></tr>
                )}
                {!loading && filteredNFs.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-slate-400 text-sm italic">
                    Nenhuma NF com status "{filter}" registrada.
                  </td></tr>
                )}
                {filteredNFs.map(nf => (
                  <tr key={nf.id}
                    onClick={() => setSelectedNF(p => p === nf.id ? null : nf.id)}
                    tabIndex="0"
                    onKeyDown={e => e.key === 'Enter' && setSelectedNF(p => p === nf.id ? null : nf.id)}
                    className={cn('group cursor-pointer transition-all focus:outline-none',
                      selectedNF === nf.id ? 'bg-amber-50/60 dark:bg-amber-900/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30')}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200', isTvMode ? 'w-14 h-14' : 'w-9 h-9')}>
                          <FileText className={cn('text-slate-500', isTvMode ? 'w-8 h-8' : 'w-4 h-4')} />
                        </div>
                        <span className={cn('font-black text-slate-900 dark:text-white uppercase', isTvMode ? 'text-3xl' : 'text-sm')}>{nf.numero_nf}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn('font-black text-amber-500 font-mono block', isTvMode ? 'text-2xl' : 'text-xs')}>{nf.ordem_referencia || '—'}</span>
                      <span className={cn('font-bold text-slate-400 uppercase tracking-widest', isTvMode ? 'text-lg' : 'text-[10px]')}>Doca-Recebimento</span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        {nf.conferido
                          ? <div className={cn('rounded-full bg-green-100 flex items-center justify-center text-green-600', isTvMode ? 'w-14 h-14' : 'w-8 h-8')}><CheckCircle2 className={isTvMode ? 'w-8 h-8' : 'w-4 h-4'} /></div>
                          : <div className={cn('rounded-full bg-slate-100 flex items-center justify-center text-slate-400', isTvMode ? 'w-14 h-14' : 'w-8 h-8')}><Clock className={isTvMode ? 'w-8 h-8' : 'w-4 h-4'} /></div>
                        }
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <ProgressBar value={nf.perc_alocada}  color="amber"   label="Alocada" />
                        <ProgressBar value={nf.perc_expedida} color="emerald" label="Expedida" />
                      </div>
                    </td>
                    <td className={cn('p-4 font-mono font-black text-slate-500', isTvMode ? 'text-2xl' : 'text-xs')}>{nf.numero_coleta || '—'}</td>
                    <td className="p-4 text-right">
                      <ChevronRight className={cn('transition-transform duration-300',
                        selectedNF === nf.id ? 'rotate-90 text-amber-500' : 'text-slate-300',
                        isTvMode ? 'w-8 h-8' : 'w-5 h-5')} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Painel de detalhe */}
        {selectedData && (
          <article ref={detailRef} tabIndex="-1"
            className="bg-white dark:bg-slate-900 rounded-sm border-2 border-amber-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 scroll-mt-6 focus:outline-none">

            {/* Header detalhe */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-sm bg-amber-100 border border-amber-200 flex items-center justify-center">
                  <Boxes className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Itens da Carga – <span className="text-amber-500">{selectedData.numero_nf}</span></h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Doca: {selectedData.doca || '—'} · {selectedData.ordem_referencia || '—'}
                  </p>
                </div>
              </div>

              {/* Rota Expressa */}
              <div className="bg-slate-800 px-4 py-3 rounded-sm border border-amber-400/30 flex items-center gap-3 shadow">
                <div className="w-9 h-9 rounded-sm bg-amber-400 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-slate-900" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Rota Expressa
                  </span>
                  <p className="text-white font-bold text-xs">SKU vai direto ao <span className="text-amber-400 underline">Cliente</span>?</p>
                  {selectedData.rota_expressa_definida && (
                    <span className={cn('text-[10px] font-black', selectedData.rota_expressa ? 'text-green-400' : 'text-slate-400')}>
                      {selectedData.rota_expressa ? '✓ Rota expressa confirmada' : '✗ Armazenagem normal'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 ml-2">
                  <Tooltip text="Entrega direta — Não armazenar">
                    <button onClick={() => handleRotaExpressa(selectedData.id, true)}
                      className={cn('px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all active:scale-95',
                        selectedData.rota_expressa === true ? 'bg-green-500 text-white ring-1 ring-green-300' : 'bg-amber-400 text-slate-900 hover:bg-amber-500')}>
                      Sim
                    </button>
                  </Tooltip>
                  <Tooltip text="Fluxo normal — Armazenar">
                    <button onClick={() => handleRotaExpressa(selectedData.id, false)}
                      className={cn('px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-600',
                        selectedData.rota_expressa === false ? 'bg-slate-500 text-white ring-1 ring-slate-300' : 'bg-slate-700 text-white hover:bg-slate-600')}>
                      Não
                    </button>
                  </Tooltip>
                </div>
              </div>

              <button onClick={() => setSelectedNF(null)}
                className="p-2 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-sm border border-slate-200 transition-all shadow self-start">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Tabela de itens */}
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-[9px] uppercase font-black tracking-widest text-slate-400">
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2">Descrição</th>
                    <th className="px-4 py-2 text-center">EAN</th>
                    <th className="px-4 py-2 text-center">Solicitado</th>
                    <th className="px-4 py-2 text-center">Atendido</th>
                    <th className="px-4 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedData.cross_docking_itens || []).length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400 text-xs italic">Nenhum item registrado.</td></tr>
                  )}
                  {(selectedData.cross_docking_itens || []).map(item => (
                    <tr key={item.id} className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-all">
                      <td className="px-4 py-3 border-y border-l border-slate-100 dark:border-slate-800 rounded-l-sm">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3 text-amber-400/50" />
                          <span className="text-xs font-black text-amber-600 font-mono">{item.sku}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-y border-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300">{item.descricao}</td>
                      <td className="px-4 py-3 border-y border-slate-100 text-center text-[10px] font-mono text-slate-400">{item.ean || '—'}</td>
                      <td className="px-4 py-3 border-y border-slate-100 text-center text-sm font-black text-slate-400">{item.quantidade_solicitada}</td>
                      <td className="px-4 py-3 border-y border-slate-100 text-center text-sm font-black text-amber-500">{item.quantidade_atendida}</td>
                      <td className="px-4 py-3 border-y border-r border-slate-100 dark:border-slate-800 rounded-r-sm text-right">
                        <span className={cn('px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border',
                          item.quantidade_atendida >= item.quantidade_solicitada
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200')}>
                          {item.quantidade_atendida >= item.quantidade_solicitada ? 'Completo' : 'Parcial'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer detalhe */}
            <footer className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {selectedData.rota_expressa === true
                    ? 'Fluxo: Cross-Docking (Entrega Direta)'
                    : selectedData.rota_expressa === false
                      ? `Fluxo: Armazenagem (Doca ${selectedData.doca || '—'})`
                      : 'Destino: Pendente de Definição'}
                </span>
              </div>
              <button onClick={handlePrint}
                className="px-4 py-2 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow flex items-center gap-2">
                <Printer className="w-4 h-4" /> Imprimir Manifesto
              </button>
            </footer>
          </article>
        )}
      </div>
    </EnterprisePageBase>
  );
}
