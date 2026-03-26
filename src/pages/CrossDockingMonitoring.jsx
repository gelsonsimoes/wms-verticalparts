import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Clock, XCircle, ChevronRight,
  FileText, Boxes, Truck, Hash, Monitor, Tv, AlertTriangle, Printer,
  RefreshCw, Plus, Trash2, Save,
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabaseClient'; // Realtime subscription (mantém supabase direto — necessário para channel/subscribe)
import { crossDockingService } from '../services/crossDockingService';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import Tooltip from '../components/ui/Tooltip';

const BAR_COLORS = { amber: 'bg-amber-400', emerald: 'bg-emerald-500', slate: 'bg-slate-200' };
const FILTROS    = ['Pendente', 'Processada', 'Cancelada'];
const STATUS_OPT = ['Pendente', 'Processada', 'Cancelada'];

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
      <div className={cn('h-full transition-all duration-700 rounded-full', BAR_COLORS[color] ?? BAR_COLORS.slate)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100" />
    </div>
  </div>
);

const ITEM_VAZIO = () => ({ _id: crypto.randomUUID(), sku: '', descricao: '', ean: '', quantidade_solicitada: 1, quantidade_atendida: 0 });
const FORM_VAZIO = () => ({
  numero_nf: '', ordem_referencia: '', doca: '', numero_coleta: '',
  status: 'Pendente', conferido: false,
  perc_alocada: 0, perc_expedida: 0,
  itens: [ITEM_VAZIO()],
});

// ── Modal Nova / Editar NF ────────────────────────────────────────────────────
function ModalNF({ aberto, onFechar, onSalvar, salvando }) {
  const [form, setForm] = useState(FORM_VAZIO());
  const [toast, setToast] = useState(null);

  useEffect(() => { if (aberto) setForm(FORM_VAZIO()); }, [aberto]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const setItem = (idx, k, v) =>
    setForm(p => ({ ...p, itens: p.itens.map((it, i) => i === idx ? { ...it, [k]: v } : it) }));

  const addItem    = () => setForm(p => ({ ...p, itens: [...p.itens, ITEM_VAZIO()] }));
  const removeItem = (idx) => setForm(p => ({ ...p, itens: p.itens.filter((_, i) => i !== idx) }));

  const handleSalvar = () => {
    if (!form.numero_nf.trim()) { setToast({ message: 'Informe o número da NF.', color: 'bg-amber-500 text-white' }); return; }
    if (form.itens.some(it => !it.sku.trim())) { setToast({ message: 'Todos os itens precisam de SKU.', color: 'bg-amber-500 text-white' }); return; }
    onSalvar(form);
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-sm shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Toast inline no modal */}
        {toast && (
          <div role="alert" className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-bold ${toast.color} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} aria-label="Fechar notificação" className="ml-1 opacity-70 hover:opacity-100 transition-opacity">✕</button>
          </div>
        )}

        {/* Header modal */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-amber-400 flex items-center justify-center">
              <Plus className="w-4 h-4 text-slate-900" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Nova Nota Fiscal — Cross-Docking</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Preencha os dados e adicione os itens da carga</p>
            </div>
          </div>
          <button onClick={onFechar} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Cabeçalho da NF */}
          <section>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dados da NF</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Nº NF *',            key: 'numero_nf',        placeholder: 'NF-10001' },
                { label: 'Ordem / Ref.',         key: 'ordem_referencia', placeholder: 'OR-55920' },
                { label: 'Doca',                 key: 'doca',             placeholder: 'Doca 08' },
                { label: 'Nº Coleta',            key: 'numero_coleta',    placeholder: 'COL-001' },
              ].map(f => (
                <label key={f.key} className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{f.label}</span>
                  <input
                    value={form[f.key]}
                    onChange={e => setField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="border border-slate-200 dark:border-slate-700 rounded-sm px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </label>
              ))}
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</span>
                <select value={form.status} onChange={e => setField('status', e.target.value)}
                  className="border border-slate-200 dark:border-slate-700 rounded-sm px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {STATUS_OPT.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">% Alocada</span>
                <input type="number" min="0" max="100" value={form.perc_alocada}
                  onChange={e => setField('perc_alocada', Number(e.target.value))}
                  className="border border-slate-200 dark:border-slate-700 rounded-sm px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">% Expedida</span>
                <input type="number" min="0" max="100" value={form.perc_expedida}
                  onChange={e => setField('perc_expedida', Number(e.target.value))}
                  className="border border-slate-200 dark:border-slate-700 rounded-sm px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </label>
            </div>

            <label className="flex items-center gap-2 mt-3 cursor-pointer w-fit">
              <input type="checkbox" checked={form.conferido} onChange={e => setField('conferido', e.target.checked)}
                className="w-4 h-4 rounded accent-amber-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">NF Conferida</span>
            </label>
          </section>

          {/* Itens da carga */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens da Carga</p>
              <button onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-colors">
                <Plus className="w-3 h-3" /> Adicionar Item
              </button>
            </div>

            <div className="space-y-2">
              {form.itens.map((item, idx) => (
                <div key={item._id} className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-sm border border-slate-100 dark:border-slate-700">
                  <div className="col-span-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">SKU *</span>
                    <input value={item.sku} onChange={e => setItem(idx, 'sku', e.target.value.toUpperCase())}
                      placeholder="VPER-ESS-NY-27MM"
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-sm px-2 py-1.5 text-xs font-mono font-bold bg-white dark:bg-slate-900 text-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-400" />
                  </div>
                  <div className="col-span-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Descrição</span>
                    <input value={item.descricao} onChange={e => setItem(idx, 'descricao', e.target.value)}
                      placeholder="Escova de Segurança Nylon 27mm"
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-sm px-2 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-400" />
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">EAN</span>
                    <input value={item.ean} onChange={e => setItem(idx, 'ean', e.target.value)}
                      placeholder="7891234560001"
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-sm px-2 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400" />
                  </div>
                  <div className="col-span-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Solicit.</span>
                    <input type="number" min="1" value={item.quantidade_solicitada}
                      onChange={e => setItem(idx, 'quantidade_solicitada', Number(e.target.value))}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-sm px-2 py-1.5 text-xs font-black text-center bg-white dark:bg-slate-900 text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400" />
                  </div>
                  <div className="col-span-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Atend.</span>
                    <input type="number" min="0" value={item.quantidade_atendida}
                      onChange={e => setItem(idx, 'quantidade_atendida', Number(e.target.value))}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-sm px-2 py-1.5 text-xs font-black text-center bg-white dark:bg-slate-900 text-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-400" />
                  </div>
                  <div className="col-span-1 flex items-end justify-center pb-1">
                    <button onClick={() => removeItem(idx)} disabled={form.itens.length === 1}
                      className="p-1.5 text-slate-300 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer modal */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
          <span className="text-[10px] text-slate-400 font-bold">{form.itens.length} item{form.itens.length !== 1 ? 's' : ''} adicionado{form.itens.length !== 1 ? 's' : ''}</span>
          <div className="flex gap-3">
            <button onClick={onFechar}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 text-[10px] font-black uppercase tracking-widest transition-colors">
              Cancelar
            </button>
            <button onClick={handleSalvar} disabled={salvando}
              className="flex items-center gap-2 px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow">
              {salvando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {salvando ? 'Salvando...' : 'Salvar NF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function CrossDockingMonitoring() {
  const { warehouseId, isTvMode, setIsTvMode } = useApp();
  const [filter, setFilter]         = useState('Pendente');
  const [selectedNF, setSelectedNF] = useState(null);
  const [nfs, setNfs]               = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando]     = useState(false);
  const [toast, setToast]           = useState(null);
  const detailRef                   = useRef(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Buscar dados ──────────────────────────────────────────────────────────
  const fetchNFs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await crossDockingService.getWithItemsByWarehouse(warehouseId);
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

  // ── Salvar nova NF ────────────────────────────────────────────────────────
  const handleSalvarNF = async (form) => {
    setSalvando(true);
    try {
      const { data: nfData, error: nfErr } = await crossDockingService.insert({
        warehouse_id:      warehouseId,
        numero_nf:         form.numero_nf.trim(),
        ordem_referencia:  form.ordem_referencia.trim() || null,
        doca:              form.doca.trim() || null,
        numero_coleta:     form.numero_coleta.trim() || null,
        status:            form.status,
        conferido:         form.conferido,
        perc_alocada:      form.perc_alocada,
        perc_expedida:     form.perc_expedida,
      });

      if (nfErr) throw nfErr;

      const itens = form.itens
        .filter(it => it.sku.trim())
        .map(it => ({
          cross_docking_id:      nfData.id,
          sku:                   it.sku.trim(),
          descricao:             it.descricao.trim() || null,
          ean:                   it.ean.trim() || null,
          quantidade_solicitada: it.quantidade_solicitada,
          quantidade_atendida:   it.quantidade_atendida,
        }));

      if (itens.length > 0) {
        const { error: itensErr } = await crossDockingService.insertItems(itens);
        if (itensErr) throw itensErr;
      }

      setModalAberto(false);
      setFilter(form.status);
      await fetchNFs();
    } catch (err) {
      setToast({ message: 'Erro ao salvar: ' + err.message, color: 'bg-red-600 text-white' });
    } finally {
      setSalvando(false);
    }
  };

  // ── Rota Expressa ─────────────────────────────────────────────────────────
  const handleRotaExpressa = async (nfId, value) => {
    await crossDockingService.update(nfId, { rota_expressa: value, rota_expressa_definida: true });
    await fetchNFs();
  };

  const handlePrint = useCallback(() => window.print(), []);

  // ── Barra de ações ────────────────────────────────────────────────────────
  const actionGroups = [
    [
      { label: 'Nova NF',   icon: Plus,      primary: true, onClick: () => setModalAberto(true) },
      { label: 'Atualizar', icon: RefreshCw,               onClick: fetchNFs },
      { label: 'Imprimir',  icon: Printer,                 onClick: handlePrint },
      {
        label: isTvMode ? 'Sair Modo TV' : 'Modo TV',
        icon: isTvMode ? Monitor : Tv,
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
      {/* Toast */}
      {toast && (
        <div role="alert" className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-bold ${toast.color} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Fechar notificação" className="ml-1 opacity-70 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      {/* Modal Nova NF */}
      <ModalNF aberto={modalAberto} onFechar={() => setModalAberto(false)} onSalvar={handleSalvarNF} salvando={salvando} />

      <div className={cn('space-y-6 pb-20 transition-all duration-500', isTvMode && 'p-6 bg-slate-50 dark:bg-slate-950')}>

        {/* Filtros */}
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

        {/* KPIs — Modo TV */}
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
                  <tr><td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <FileText className="w-10 h-10 opacity-30" />
                      <p className="text-sm italic">Nenhuma NF com status "{filter}" registrada.</p>
                      {filter === 'Pendente' && (
                        <button onClick={() => setModalAberto(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-colors mt-1">
                          <Plus className="w-3 h-3" /> Registrar primeira NF
                        </button>
                      )}
                    </div>
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
