import React, { useState, useEffect, useCallback, useId } from 'react';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Edit2,
  Activity,
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Box,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Save,
  MapPin,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import FastTab from '../components/ui/FastTab';
import DataGrid from '../components/ui/DataGrid';
import { useLocation } from 'react-router-dom';
import { appRoutes } from '../routes';
import { useApp } from '../hooks/useApp';
import { supabase } from '../lib/supabaseClient';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const VIEWS = Object.freeze({ MASTER: 'master', MONITOR: 'monitor' });

// ─── Modal de Ajuste de Quantidade ────────────────────────────────
function AjusteModal({ item, onClose, onSave }) {
  const [qty,     setQty]     = useState(String(item.qty ?? 0));
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const uid = useId();

  const handle = async () => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n < 0) { setError('Quantidade inválida.'); return; }
    setSaving(true);
    try {
      await onSave(item.id, n);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-amber-600 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Edit2 className="w-5 h-5 text-white" />
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Inventário</p>
              <h2 className="text-base font-black text-white uppercase">Ajuste de Saldo</h2>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 space-y-5">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase">SKU</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">{item.sku}</p>
            <p className="text-xs text-slate-500">{item.name}</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${uid}-qty`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nova Quantidade *</label>
            <input id={`${uid}-qty`} type="number" min={0} value={qty} onChange={e => { setQty(e.target.value); setError(''); }}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-center outline-none focus:border-amber-400 transition-all" />
            {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase">Cancelar</button>
            <button onClick={handle} disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-amber-600 text-white text-sm font-black hover:opacity-90 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 uppercase">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Transferência (move endereço) ────────────────────────
function TransfModal({ item, onClose, onSave }) {
  const [endereco, setEndereco] = useState(item.location ?? '');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const uid = useId();

  const handle = async () => {
    if (!endereco.trim()) { setError('Informe o endereço de destino.'); return; }
    setSaving(true);
    try {
      await onSave(item.id, endereco.trim());
      onClose();
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-blue-600 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-white" />
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Inventário</p>
              <h2 className="text-base font-black text-white uppercase">Mover Produto</h2>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 space-y-5">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase">SKU</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">{item.sku}</p>
            <p className="text-[9px] text-slate-400">Endereço atual: <strong>{item.location}</strong></p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${uid}-end`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Novo Endereço *</label>
            <input id={`${uid}-end`} value={endereco} onChange={e => { setEndereco(e.target.value); setError(''); }}
              placeholder="Ex: R1_PP1_CL001_N001"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-blue-400 transition-all" />
            {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase">Cancelar</button>
            <button onClick={handle} disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-black hover:opacity-90 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 uppercase">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Mover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InventoryManagement() {
  const { warehouseId } = useApp();
  const [view,                setView]                = useState(VIEWS.MASTER);
  const [searchTerm,          setSearchTerm]          = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [stockData,           setStockData]           = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [toast,               setToast]               = useState(null);
  const [modalAjuste,         setModalAjuste]         = useState(null); // item | null
  const [modalTransf,         setModalTransf]         = useState(null); // item | null

  const location    = useLocation();
  const currentRoute = appRoutes.find(r => r.path === location.pathname);
  const pageTitle   = currentRoute?.meta ? `${currentRoute.meta.codigo} ${currentRoute.meta.titulo}` : 'Gerenciamento de Estoque';
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Estoque', path: location.pathname },
    { label: currentRoute?.meta?.titulo || 'Gerenciamento', path: null },
  ];

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── fetch alocacao_estoque + produtos ────────────────────────────
  const fetchStock = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alocacao_estoque')
        .select('*, produtos(sku, descricao, unidade_medida)')
        .eq('warehouse_id', warehouseId);

      if (error) throw error;

      if (!data || data.length === 0) {
        const { data: prods } = await supabase
          .from('produtos')
          .select('id, sku, descricao, unidade_medida')
          .limit(4);

        if (prods && prods.length > 0) {
          const seeds = prods.map((p, i) => ({
            warehouse_id: warehouseId,
            produto_id:   p.id,
            endereco_id:  `R${i + 1}_PP1_CL001_N00${i + 1}`,
            quantidade:   (i + 1) * 60,
          }));
          await supabase.from('alocacao_estoque').insert(seeds);
          return fetchStock();
        }
      }

      const normalized = (data || []).map(r => ({
        id:        r.id,
        sku:       r.produtos?.sku             ?? '—',
        name:      r.produtos?.descricao       ?? '—',
        location:  r.endereco_id               ?? '—',
        qty:       r.quantidade                ?? 0,
        available: r.quantidade                ?? 0,
        unit:      r.produtos?.unidade_medida  ?? 'UN',
        updated:   r.updated_at
          ? new Date(r.updated_at).toLocaleString('pt-BR')
          : '—',
        _rawId: r.id,
      }));
      setStockData(normalized);
    } catch (err) {
      showToast(`Erro ao carregar estoque: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [warehouseId, showToast]);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  // ── CRUD: ajuste de quantidade ────────────────────────────────────
  const handleAjusteQty = useCallback(async (id, novaQtd) => {
    const { error } = await supabase
      .from('alocacao_estoque')
      .update({ quantidade: novaQtd })
      .eq('id', id);
    if (error) throw error;
    showToast('Saldo ajustado com sucesso!');
    await fetchStock();
  }, [fetchStock, showToast]);

  // ── CRUD: mover endereço ──────────────────────────────────────────
  const handleMoverEndereco = useCallback(async (id, novoEndereco) => {
    const { error } = await supabase
      .from('alocacao_estoque')
      .update({ endereco_id: novoEndereco })
      .eq('id', id);
    if (error) throw error;
    showToast('Produto movido com sucesso!');
    await fetchStock();
  }, [fetchStock, showToast]);

  const stockColumns = [
    { header: 'SKU',            accessor: 'sku',      render: (v) => <span className="font-bold text-black">{v}</span> },
    { header: 'Descrição',      accessor: 'name' },
    { header: 'Localização',    accessor: 'location', render: (v) => <span className="font-mono text-[var(--vp-text-label)]">{v}</span> },
    { header: 'Qtd Total',      accessor: 'qty',      render: (v) => <span className="font-bold">{v}</span> },
    { header: 'Disponível',     accessor: 'available',render: (v) => <span className="font-bold text-green-700">{v}</span> },
    { header: 'Unidade',        accessor: 'unit' },
    { header: 'Última Atu.',    accessor: 'updated',  render: (v) => <span className="text-[11px] text-gray-500">{v}</span> },
    {
      header: 'Ações',
      accessor: '_rawId',
      render: (_, row) => (
        <div className="flex gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); setModalAjuste(row); }}
            className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-black hover:bg-amber-200 transition-all uppercase"
          >Ajustar</button>
          <button
            onClick={(e) => { e.stopPropagation(); setModalTransf(row); }}
            className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-black hover:bg-blue-200 transition-all uppercase"
          >Mover</button>
        </div>
      ),
    },
  ];

  const filteredData = stockData.filter(i => {
    const q = searchTerm.toLowerCase();
    return (
      i.sku.toUpperCase().includes(searchTerm.toUpperCase()) ||
      i.name.toLowerCase().includes(q) ||
      (i.location ?? '').toLowerCase().includes(q)
    );
  });

  // ── KPIs ─────────────────────────────────────────────────────────
  const totalQty      = stockData.reduce((s, i) => s + (i.qty ?? 0), 0);
  const totalSkus     = stockData.length;
  const ocupacao      = totalSkus > 0 ? Math.min(((totalQty / (totalSkus * 500)) * 100).toFixed(1), 100) : 0;

  const actions = [
    [
      { label: 'Atualizar Dados', primary: true, icon: RefreshCw, onClick: fetchStock },
    ],
    [
      { label: 'Monitorar Real-Time', icon: Activity, onClick: () => setView(VIEWS.MONITOR) },
    ],
    [
      { label: 'Relatórios', icon: BarChart3, onClick: () => showToast('Relatórios em desenvolvimento.', 'error') },
    ],
  ];

  if (view === VIEWS.MONITOR) {
    return (
      <div className="p-6 bg-[var(--vp-bg-alt)] min-h-screen font-sans">
        {toast && (
          <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-4 duration-300">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 text-white ${
              toast.type === 'success' ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <p className="text-sm font-bold">{toast.message}</p>
              <button onClick={() => setToast(null)} className="ml-4 hover:bg-black/10 p-1 rounded-full" aria-label="Fechar"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}
        <button onClick={() => setView(VIEWS.MASTER)} aria-label="Voltar para Gestão de Estoque"
          className="flex items-center gap-2 text-xs font-black text-[var(--vp-text-label)] hover:text-[var(--vp-primary)] mb-6 uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} aria-hidden="true"/> Voltar para {pageTitle}
        </button>
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[var(--vp-text-data)] flex items-center gap-3 tracking-tight">
            <Activity className="text-[var(--vp-primary)]" size={28}/> MONITORAMENTO EM TEMPO REAL
          </h1>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1 tracking-wider">Acompanhamento de movimentações e críticas de inventário</p>
        </div>
        {loading
          ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--vp-primary)]" /></div>
          : <DataGrid columns={stockColumns} data={filteredData} />
        }
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--vp-bg-alt)] font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-4 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 text-white ${
            toast.type === 'success' ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <p className="text-sm font-bold">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-4 hover:bg-black/10 p-1 rounded-full" aria-label="Fechar"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Modais */}
      {modalAjuste && (
        <AjusteModal
          item={modalAjuste}
          onClose={() => setModalAjuste(null)}
          onSave={handleAjusteQty}
        />
      )}
      {modalTransf && (
        <TransfModal
          item={modalTransf}
          onClose={() => setModalTransf(null)}
          onSave={handleMoverEndereco}
        />
      )}

      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-[var(--vp-border)]">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center gap-3 mt-2">
          <div className="bg-[var(--vp-secondary)] p-2 rounded-sm shadow-sm">
            <Box className="text-[var(--vp-primary)]" size={20}/>
          </div>
          <h1 className="text-2xl font-black text-[var(--vp-text-data)] leading-tight tracking-tight uppercase">{pageTitle}</h1>
        </div>
      </div>

      <ActionPane title="Operações de Inventário" groups={actions} />

      <div className="p-6 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-l-4 border-l-[var(--vp-primary)]">
            <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest">Ocupação Estimada</label>
            <div className="text-2xl font-black text-[var(--vp-text-data)]">{loading ? '—' : `${ocupacao}%`}</div>
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-1 uppercase">
              <TrendingUp size={10}/> Estável
            </div>
          </div>
          <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-l-4 border-l-blue-600">
            <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest">SKUs Ativos</label>
            <div className="text-2xl font-black text-blue-600">{loading ? '—' : totalSkus}</div>
            <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase">No armazém</div>
          </div>
          <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-l-4 border-l-green-600">
            <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest">Qty. Total</label>
            <div className="text-2xl font-black text-green-700">{loading ? '—' : totalQty.toLocaleString('pt-BR')}</div>
            <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Unidades</div>
          </div>
          <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-l-4 border-l-amber-500">
            <label className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest">Baixo Estoque</label>
            <div className="text-2xl font-black text-amber-600">{loading ? '—' : stockData.filter(i => i.qty < 10).length}</div>
            <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Itens {'<'} 10 un.</div>
          </div>
        </div>

        <FastTab title="Visão Geral do Estoque Disponível" defaultOpen={true}>
          <div className="mb-4 flex gap-3">
            <div className="flex-1 relative">
              <label htmlFor="search-inventory" className="sr-only">Buscar produto por SKU, Localização ou Descrição</label>
              <input id="search-inventory" type="text" placeholder="Buscar por SKU, Localização ou Descrição..."
                className="w-full pr-10 pl-4 py-2 border border-[var(--vp-border)] rounded-sm text-sm focus:border-[var(--vp-primary)] outline-none font-medium"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} aria-hidden="true"/>
            </div>
            <button onClick={() => setShowAdvancedFilters(prev => !prev)} aria-expanded={showAdvancedFilters}
              aria-controls="advanced-filters-panel"
              className="btn-secondary p-2 flex items-center gap-2">
              <Filter size={16} aria-hidden="true"/>
              <span className="text-[10px] font-bold uppercase">Filtros Avançados</span>
            </button>
          </div>

          {showAdvancedFilters && (
            <div id="advanced-filters-panel" role="region" aria-label="Filtros avançados"
              className="mb-4 flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-sm text-xs font-bold text-yellow-700 animate-in fade-in duration-200">
              Filtros avançados por status, localização e data disponíveis em breve.
              <button onClick={() => setShowAdvancedFilters(false)} className="ml-auto text-yellow-600 hover:text-yellow-800" aria-label="Fechar filtros avançados">
                <X size={14} aria-hidden="true"/>
              </button>
            </div>
          )}

          {loading
            ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[var(--vp-primary)]" /></div>
            : <DataGrid columns={stockColumns} data={filteredData} />
          }
        </FastTab>
      </div>
    </div>
  );
}
