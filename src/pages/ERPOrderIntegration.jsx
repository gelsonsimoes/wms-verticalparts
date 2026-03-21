import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { RefreshCcw, Search, Filter, CheckCircle2, XCircle, Clock, Database } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── Mapeamento centralizado de status → badge ────────────────────────────────
const STATUS_CONFIG = {
  Importado:        { label: 'Importado',  icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  aguardando_expedicao: { label: 'Aguardando', icon: Clock,    className: 'bg-yellow-100 text-yellow-700' },
  pendente:         { label: 'Pendente',   icon: Clock,        className: 'bg-yellow-100 text-yellow-700' },
  cancelado:        { label: 'Cancelado',  icon: XCircle,      className: 'bg-red-100 text-red-700' },
  faturado:         { label: 'Faturado',   icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  erro:             { label: 'Falha',      icon: XCircle,      className: 'bg-red-100 text-red-700' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, icon: Clock, className: 'bg-slate-100 text-slate-600' };
  const Icon = cfg.icon;
  return (
    <span className={cn(
      'flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] w-max font-black uppercase tracking-widest',
      cfg.className
    )}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

// ─── Toast inline ─────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  return (
    <div role="alert" onClick={onClose}
      className={cn(
        'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border-2 animate-in slide-in-from-bottom-4 duration-300 cursor-pointer',
        type === 'erro'
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-green-50 text-green-700 border-green-200'
      )}>
      {type === 'erro' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      {msg}
    </div>
  );
}

export default function ERPOrderIntegration() {
  const { warehouseId } = useApp();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [syncing,  setSyncing]  = useState(false);
  const [lastSync, setLastSync] = useState('—');
  const [search,   setSearch]   = useState('');
  const [toast,    setToast]    = useState(null);
  const toastRef = useRef(null);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3500);
  };
  useEffect(() => () => clearTimeout(toastRef.current), []);

  // ── Fetch notas_saida ─────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notas_saida')
      .select('id, nf, cliente, situacao, total_itens, valor, created_at')
      .eq('warehouse_id', warehouseId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      console.error('[ERPOrderIntegration] fetch error:', error);
      showToast('Erro ao carregar pedidos.', 'erro');
    } else {
      setOrders(data || []);
      setLastSync(new Date().toLocaleString('pt-BR'));
    }
    setLoading(false);
  }, [warehouseId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSync = async () => {
    setSyncing(true);
    await fetchOrders();
    setSyncing(false);
    showToast('Sincronização concluída.');
  };

  // ── Estatísticas derivadas ─────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     orders.length,
    pendentes: orders.filter(o => o.situacao === 'pendente' || o.situacao === 'aguardando_expedicao').length,
    erros:     orders.filter(o => o.situacao === 'cancelado' || o.situacao === 'erro').length,
  }), [orders]);

  // ── Busca funcional ────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o =>
      (o.nf || '').toLowerCase().includes(q) ||
      (o.cliente || '').toLowerCase().includes(q)
    );
  }, [orders, search]);

  const actionGroups = [[
    { label: syncing ? 'Sincronizando...' : 'Sincronizar', icon: RefreshCcw, primary: true, onClick: handleSync, disabled: syncing || loading },
  ]];

  return (
    <EnterprisePageBase
      title="Sincronizar Ordens ERP"
      breadcrumbItems={[{ label: 'Integração' }]}
      actionGroups={actionGroups}
    >
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sub-header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Conector Direto com Omie / Outros ERPs</p>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Última Sincronização</p>
          <p className="text-sm font-bold text-slate-900">{lastSync}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full" aria-hidden="true"><Database className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
            <h3 className="text-2xl font-black text-slate-900">{String(stats.total).padStart(2, '0')}</h3>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full" aria-hidden="true"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendentes</p>
            <h3 className="text-2xl font-black text-slate-900">{String(stats.pendentes).padStart(2, '0')}</h3>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full" aria-hidden="true"><XCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Com Erro</p>
            <h3 className="text-2xl font-black text-slate-900">{String(stats.erros).padStart(2, '0')}</h3>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por NF ou cliente..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-[2rem] border-none text-sm font-bold focus:ring-2 focus:ring-[#ffcd00] outline-none"
            />
          </div>
          <button
            disabled
            title="Filtros avançados em desenvolvimento"
            className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-400 rounded-[2rem] font-bold text-sm cursor-not-allowed opacity-60"
          >
            <Filter className="w-4 h-4" aria-hidden="true" /> Filtros Avançados
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <RefreshCcw className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">NF</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Itens</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Valor</th>
                  <th className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-400 font-bold">
                      {search ? `Nenhuma NF encontrada para "${search}".` : 'Nenhuma nota de saída registrada.'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 text-sm font-black text-slate-900">{order.nf || '—'}</td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-500">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-600">{order.cliente || '—'}</td>
                      <td className="py-4 px-4 text-sm font-black text-slate-900">
                        {order.total_itens ?? 0} <span className="font-bold text-slate-400 text-xs">un</span>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-600">
                        {order.valor != null ? `R$ ${Number(order.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={order.situacao || 'pendente'} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </EnterprisePageBase>
  );
}
