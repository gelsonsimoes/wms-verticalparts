import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  RefreshCcw, Search, Filter, CheckCircle2, XCircle, Clock,
  Database, AlertTriangle, ShoppingCart, Zap, ChevronDown,
  ChevronRight, MapPin, Package, Loader2, Webhook,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabaseClient';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── Status configs ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pendente:           { label: 'Pendente',      icon: Clock,         bg: 'bg-yellow-100 text-yellow-700' },
  reservado:          { label: 'Reservado',      icon: CheckCircle2,  bg: 'bg-blue-100 text-blue-700' },
  reservado_parcial:  { label: 'Parcial',        icon: AlertTriangle, bg: 'bg-amber-100 text-amber-700' },
  em_separacao:       { label: 'Separando',      icon: ShoppingCart,  bg: 'bg-purple-100 text-purple-700' },
  separado:           { label: 'Separado',       icon: CheckCircle2,  bg: 'bg-green-100 text-green-700' },
  conferencia:        { label: 'Conferência',    icon: Clock,         bg: 'bg-indigo-100 text-indigo-700' },
  despachado:         { label: 'Despachado',     icon: CheckCircle2,  bg: 'bg-emerald-100 text-emerald-700' },
  cancelado:          { label: 'Cancelado',      icon: XCircle,       bg: 'bg-red-100 text-red-700' },
  sem_estoque:        { label: 'Sem Estoque',    icon: XCircle,       bg: 'bg-red-100 text-red-700' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status ?? '—', icon: Database, bg: 'bg-slate-100 text-slate-500' };
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] w-max font-black uppercase tracking-widest', cfg.bg)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Row expandida com itens do pedido ────────────────────────────────────────
function PedidoRow({ pedido, onReservar, reservando }) {
  const [open, setOpen] = useState(false);
  const [itens, setItens] = useState([]);
  const [loadingItens, setLoadingItens] = useState(false);

  const toggleItens = async () => {
    if (!open && itens.length === 0) {
      setLoadingItens(true);
      const { data } = await supabase
        .from('itens_pedido_omie')
        .select('*')
        .eq('pedido_id', pedido.id)
        .order('criado_em');
      setItens(data ?? []);
      setLoadingItens(false);
    }
    setOpen(v => !v);
  };

  const podePedirReserva = pedido.status === 'pendente';
  const temItens = (pedido._itens_count ?? 0) > 0;

  return (
    <>
      <tr
        className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
        onClick={toggleItens}
      >
        <td className="py-3.5 px-4 w-8">
          {open
            ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
        </td>
        <td className="py-3.5 px-4 text-sm font-black text-slate-900">{pedido.numero_pedido}</td>
        <td className="py-3.5 px-4 text-sm font-bold text-slate-500">
          {pedido.data_pedido
            ? new Date(pedido.data_pedido + 'T00:00:00').toLocaleDateString('pt-BR')
            : '—'}
        </td>
        <td className="py-3.5 px-4 text-sm font-bold text-slate-600 max-w-[160px] truncate">
          {pedido.cliente_nome ?? '—'}
        </td>
        <td className="py-3.5 px-4 text-sm font-black text-slate-900">
          {pedido._itens_count ?? 0} <span className="font-bold text-slate-400 text-xs">it</span>
        </td>
        <td className="py-3.5 px-4 text-sm font-bold text-slate-600">
          {pedido.valor_total != null
            ? `R$ ${Number(pedido.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : '—'}
        </td>
        <td className="py-3.5 px-4"><StatusBadge status={pedido.status} /></td>
        <td className="py-3.5 px-4 text-right">
          {podePedirReserva && temItens && (
            <button
              onClick={e => { e.stopPropagation(); onReservar(pedido.id); }}
              disabled={reservando === pedido.id}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all',
                reservando === pedido.id
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-[#ffcd00] text-black hover:brightness-105 active:scale-95'
              )}
            >
              {reservando === pedido.id
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Zap className="w-3 h-3" />}
              {reservando === pedido.id ? 'Reservando…' : 'Reservar Estoque'}
            </button>
          )}
        </td>
      </tr>

      {/* Expandido: itens do pedido */}
      {open && (
        <tr>
          <td colSpan={8} className="bg-slate-50/80 px-8 pb-4 pt-0">
            {loadingItens ? (
              <div className="flex items-center gap-2 py-4 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando itens…
              </div>
            ) : itens.length === 0 ? (
              <p className="py-4 text-xs text-slate-400 italic">Nenhum item cadastrado neste pedido.</p>
            ) : (
              <div className="mt-2 space-y-1.5">
                <div className="grid grid-cols-[1fr_2fr_80px_80px_120px_100px] gap-2 px-3 py-1">
                  {['SKU','Descrição','Qtd','Unid','Endereço','Status'].map(h => (
                    <span key={h} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
                  ))}
                </div>
                {itens.map(it => (
                  <div key={it.id} className="grid grid-cols-[1fr_2fr_80px_80px_120px_100px] gap-2 items-center bg-white border border-slate-100 rounded-xl px-3 py-2">
                    <code className="text-[10px] font-black text-slate-700 truncate">{it.sku}</code>
                    <span className="text-xs font-medium text-slate-600 truncate">{it.descricao ?? '—'}</span>
                    <span className="text-xs font-black text-slate-900">{it.quantidade}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{it.unidade ?? 'UN'}</span>
                    <div className="flex items-center gap-1">
                      {it.endereco_reservado
                        ? <><MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            <code className="text-[10px] font-black text-blue-700">{it.endereco_reservado}</code></>
                        : <span className="text-[10px] text-slate-300 italic">Não reservado</span>}
                    </div>
                    <StatusBadge status={it.status} />
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── COMPONENT PRINCIPAL ─────────────────────────────────────────────────────
export default function ERPOrderIntegration() {
  const [pedidos,    setPedidos]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [syncing,    setSyncing]    = useState(false);
  const [reservando, setReservando] = useState(null); // pedido.id sendo reservado
  const [search,     setSearch]     = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [showFiltros,  setShowFiltros]  = useState(false);
  const [webhookLogs,  setWebhookLogs]  = useState([]);
  const [lastSync,     setLastSync]     = useState(null);
  const [toastMsg,     setToastMsg]     = useState(null);
  const toastRef = useRef(null);

  const toast = useCallback((msg, type = 'success') => {
    setToastMsg({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToastMsg(null), 3500);
  }, []);

  // ── Carrega pedidos com contagem de itens ─────────────────────────────────
  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos_venda_omie')
        .select(`
          id, numero_pedido, numero_pedido_omie, cliente_nome,
          data_pedido, data_previsao, status, valor_total, criado_em, atualizado_em,
          itens_pedido_omie(id)
        `)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      const enriched = (data ?? []).map(p => ({
        ...p,
        _itens_count: p.itens_pedido_omie?.length ?? 0,
      }));
      setPedidos(enriched);
      setLastSync(new Date());
    } catch (err) {
      toast(`Erro ao carregar pedidos: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ── Carrega últimos webhook logs ──────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    const { data } = await supabase
      .from('omie_webhook_logs')
      .select('id, evento, processado, erro, criado_em')
      .order('criado_em', { ascending: false })
      .limit(5);
    setWebhookLogs(data ?? []);
  }, []);

  useEffect(() => { fetchPedidos(); fetchLogs(); }, [fetchPedidos, fetchLogs]);

  // ── Realtime: novo pedido ou atualização ──────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel('erp-integration-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos_venda_omie' },
        () => fetchPedidos())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetchPedidos]);

  // ── Reservar estoque via stored procedure ─────────────────────────────────
  const handleReservar = useCallback(async (pedidoId) => {
    setReservando(pedidoId);
    try {
      const { data, error } = await supabase.rpc('reservar_estoque_pedido', { p_pedido_id: pedidoId });
      if (error) throw error;
      const r = data ?? {};
      if (r.reservados > 0 && r.faltas === 0) {
        toast(`✅ ${r.reservados} item(ns) reservado(s) com sucesso!`);
      } else if (r.reservados > 0) {
        toast(`⚠️ ${r.reservados} reservado(s), ${r.faltas} sem estoque`, 'warning');
      } else {
        toast(`❌ Nenhum item com estoque disponível`, 'error');
      }
      fetchPedidos();
    } catch (err) {
      toast(`Erro: ${err.message}`, 'error');
    } finally {
      setReservando(null);
    }
  }, [fetchPedidos, toast]);

  // ── Sync simulado (força refresh) ────────────────────────────────────────
  const handleSync = async () => {
    setSyncing(true);
    await fetchPedidos();
    await fetchLogs();
    setSyncing(false);
    toast('Sincronização concluída');
  };

  // ── Filtros ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pedidos.filter(p => {
      const matchSearch = !q
        || (p.numero_pedido ?? '').toLowerCase().includes(q)
        || (p.cliente_nome ?? '').toLowerCase().includes(q);
      const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
      return matchSearch && matchStatus;
    });
  }, [pedidos, search, filtroStatus]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      pedidos.length,
    pendentes:  pedidos.filter(p => p.status === 'pendente').length,
    reservados: pedidos.filter(p => p.status === 'reservado' || p.status === 'reservado_parcial').length,
    separados:  pedidos.filter(p => p.status === 'separado').length,
    erros:      pedidos.filter(p => p.status === 'sem_estoque' || p.status === 'cancelado').length,
  }), [pedidos]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Toast */}
      {toastMsg && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold transition-all animate-in slide-in-from-bottom-4',
          toastMsg.type === 'error'   ? 'bg-red-600 text-white' :
          toastMsg.type === 'warning' ? 'bg-amber-500 text-white' :
                                        'bg-green-600 text-white'
        )}>
          {toastMsg.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">9.2 Sincronizar Ordens ERP</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Conector Omie → WMS · Reserva FIFO por Rua
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Última Atualização</p>
            <p className="text-sm font-bold text-slate-900">
              {lastSync ? lastSync.toLocaleTimeString('pt-BR') : '—'}
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className={cn(
              'flex items-center gap-2 px-6 py-3 font-black rounded-[2rem] text-sm shadow-lg transition-all',
              syncing
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#ffcd00] text-black hover:scale-105 active:scale-95 shadow-yellow-500/20'
            )}
          >
            <RefreshCcw className={cn('w-5 h-5', syncing && 'animate-spin')} />
            {syncing ? 'Sincronizando…' : 'Sincronizar'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total',      value: stats.total,      icon: Database,     color: 'blue'   },
          { label: 'Pendentes',  value: stats.pendentes,  icon: Clock,        color: 'yellow' },
          { label: 'Reservados', value: stats.reservados, icon: CheckCircle2, color: 'blue'   },
          { label: 'Separados',  value: stats.separados,  icon: Package,      color: 'green'  },
          { label: 'Problemas',  value: stats.erros,      icon: XCircle,      color: 'red'    },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className={`p-2.5 rounded-full bg-${color}-50 text-${color}-600`}><Icon className="w-5 h-5" /></div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
              <p className="text-xl font-black text-slate-900">{String(value).padStart(2, '0')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de pedidos */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por Nº Pedido ou Cliente…"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 rounded-[2rem] border-none text-sm font-bold focus:ring-2 focus:ring-[#ffcd00] outline-none"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFiltros(v => !v)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-[2rem] font-bold text-sm hover:bg-slate-100 transition-all"
            >
              <Filter className="w-4 h-4" />
              {filtroStatus === 'todos' ? 'Todos Status' : (STATUS_CONFIG[filtroStatus]?.label ?? filtroStatus)}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showFiltros && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-1 min-w-[160px]">
                {['todos', ...Object.keys(STATUS_CONFIG)].map(s => (
                  <button
                    key={s}
                    onClick={() => { setFiltroStatus(s); setShowFiltros(false); }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-all',
                      filtroStatus === s ? 'text-yellow-600' : 'text-slate-600'
                    )}
                  >
                    {s === 'todos' ? 'Todos' : (STATUS_CONFIG[s]?.label ?? s)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-bold">Carregando pedidos do Supabase…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 w-8" />
                  {['Nº Pedido','Data','Cliente','Itens','Valor','Status','Ação'].map(h => (
                    <th key={h} className="pb-3 px-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-sm text-slate-400 font-bold">
                      {search ? `Nenhum pedido para "${search}".` : 'Nenhum pedido encontrado.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <PedidoRow
                      key={p.id}
                      pedido={p}
                      onReservar={handleReservar}
                      reservando={reservando}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Webhook Logs */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Webhook className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">Últimos Eventos Webhook Omie</h2>
        </div>
        {webhookLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            Nenhum webhook recebido ainda. Configure o endpoint no painel Omie.
          </p>
        ) : (
          <div className="space-y-2">
            {webhookLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between py-2 px-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={cn('w-2 h-2 rounded-full', log.processado ? 'bg-green-500' : log.erro ? 'bg-red-500' : 'bg-yellow-500')} />
                  <span className="text-xs font-bold text-slate-700">{log.evento ?? 'evento.desconhecido'}</span>
                </div>
                <div className="flex items-center gap-3">
                  {log.erro && <span className="text-[9px] text-red-500 font-bold truncate max-w-[200px]">{log.erro}</span>}
                  <span className="text-[9px] text-slate-400 font-medium">
                    {log.criado_em ? new Date(log.criado_em).toLocaleString('pt-BR') : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-[9px] text-slate-300 mt-4 font-medium">
          Endpoint para configurar no Omie: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
            https://clakkpyzinuheubkhdep.supabase.co/functions/v1/omie-webhook
          </code>
        </p>
      </div>
    </div>
  );
}
