import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Printer,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import FastTab from '../components/ui/FastTab';
import DataGrid from '../components/ui/DataGrid';
import { supabase } from '../lib/supabaseClient';

// ─── helpers ───────────────────────────────────────────────────────────────

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('pt-BR');
};

const fmtBRL = (v) => {
  if (v == null) return '—';
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Map an ordens_saida row to the shape the grid expects.
 * Priority is derived from status: 'Em Separação' → Alta, anything else → Normal.
 */
const mapRow = (r) => ({
  _raw:       r,
  id:         r.numero        || r.id,
  customer:   r.cliente       || '—',
  date:       fmtDate(r.data_referencia),
  itemsCount: r.qtd_itens     ?? '—',
  total:      fmtBRL(r.valor),
  status:     r.status        || 'Pendente',
  priority:   r.status === 'Em Separação' ? 'Alta' : 'Normal',
});

// Seed rows inserted only when the table is empty
const SEED_ROWS = [
  { numero: 'SO-2026-001', cliente: 'Elevadores Atlas SP',      data_referencia: '2026-02-26', valor: 4500.00,  status: 'Em Separação' },
  { numero: 'SO-2026-002', cliente: 'Condomínio Solar',         data_referencia: '2026-02-26', valor: 850.00,   status: 'Pendente'     },
  { numero: 'SO-2026-003', cliente: 'Manutenção Predial Silva', data_referencia: '2026-02-25', valor: 12300.00, status: 'Concluído'    },
  { numero: 'SO-2026-004', cliente: 'Shopping Center Norte',    data_referencia: '2026-02-26', valor: 2100.00,  status: 'Pendente'     },
  { numero: 'SO-2026-005', cliente: 'Elevadores Otis Ltda',     data_referencia: '2026-03-01', valor: 7800.00,  status: 'Em Separação' },
  { numero: 'SO-2026-006', cliente: 'Condomínio Jardins',       data_referencia: '2026-03-05', valor: 1200.00,  status: 'Concluído'    },
];

// ─── component ─────────────────────────────────────────────────────────────

export default function OrderManagement() {
  const [searchTerm, setSearchTerm]   = useState('');
  const [toast, setToast]             = useState(null);
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);

  // ── Toast auto-dismiss ──────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Fetch + seed ────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ordens_saida')
        .select('*')
        .order('data_referencia', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Seed demo data
        const { error: seedErr } = await supabase
          .from('ordens_saida')
          .insert(SEED_ROWS);

        if (seedErr) console.warn('Seed ordens_saida:', seedErr.message);

        const { data: fresh } = await supabase
          .from('ordens_saida')
          .select('*')
          .order('data_referencia', { ascending: false });

        setOrders((fresh || []).map(mapRow));
      } else {
        setOrders(data.map(mapRow));
      }
    } catch (err) {
      console.error('OrderManagement fetch:', err);
      setToast({ message: `Erro ao carregar pedidos: ${err.message}`, color: 'bg-red-600 text-white' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel('ordens_saida_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens_saida' }, fetchOrders)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchOrders]);

  // ── KPIs derived from real data ─────────────────────────────────────────
  const totalAberto = orders
    .filter(o => o.status !== 'Concluído')
    .reduce((acc, o) => acc + (o._raw?.valor ?? 0), 0);

  const atrasadas = orders.filter(o => o.status === 'Em Separação').length;

  const taxaLib = orders.length
    ? ((orders.filter(o => o.status === 'Concluído').length / orders.length) * 100).toFixed(1)
    : '0.0';

  // ── Grid columns ────────────────────────────────────────────────────────
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Operação', path: null },
    { label: 'Gerenciamento de Pedidos', path: null },
  ];

  const orderGroups = [
    [
      { label: 'Novo Pedido',      primary: true, icon: Plus,        onClick: () => setToast({ message: 'Funcionalidade "Novo Pedido" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
      { label: 'Liberar para WMS',               icon: CheckCircle2, onClick: () => setToast({ message: 'Funcionalidade "Liberar para WMS" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
    ],
    [
      { label: 'Bloquear Ordem',                 icon: AlertCircle,  onClick: () => setToast({ message: 'Funcionalidade "Bloquear Ordem" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
      { label: 'Cancelar',                        icon: Clock,        onClick: () => setToast({ message: 'Funcionalidade "Cancelar Ordem" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
    ],
    [
      { label: 'Imprimir Etiquetas',              icon: Printer,      onClick: () => setToast({ message: 'Funcionalidade "Imprimir Etiquetas" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
      { label: 'Exportar XML/CSV',                icon: Download,     onClick: () => setToast({ message: 'Funcionalidade "Exportar XML/CSV" em desenvolvimento.', color: 'bg-amber-500 text-white' }) },
    ],
  ];

  const orderColumns = [
    { header: 'Ordem', accessor: 'id', render: (v) => <span className="font-black text-black">{v}</span> },
    { header: 'Cliente / Destinatário', accessor: 'customer', render: (v) => (
      <div className="flex flex-col">
        <span className="font-bold text-gray-900">{v}</span>
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Consumidor Final</span>
      </div>
    )},
    { header: 'Data Pedido', accessor: 'date' },
    { header: 'Itens',       accessor: 'itemsCount', render: (v) => <span className="font-bold">{v}</span> },
    { header: 'Total (BRL)', accessor: 'total',      render: (v) => <span className="font-mono font-bold">R$ {v}</span> },
    {
      header: 'Status WMS',
      accessor: 'status',
      render: (v) => {
        const styles = {
          'Pendente':      'bg-yellow-100 text-yellow-800',
          'Em Separação':  'bg-blue-100 text-blue-800',
          'Concluído':     'bg-green-100 text-green-800',
        };
        return (
          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest ${styles[v] || 'bg-gray-100 text-gray-800'}`}>
            {v}
          </span>
        );
      },
    },
    { header: 'Prioridade', accessor: 'priority', render: (v) => (
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${v === 'Alta' || v === 'Urgente' ? 'bg-red-600 animate-pulse' : 'bg-gray-400'}`} />
        <span className={`text-[11px] font-bold uppercase ${v === 'Alta' || v === 'Urgente' ? 'text-red-600' : 'text-gray-600'}`}>{v}</span>
      </div>
    )},
  ];

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase())      ||
    o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--vp-bg-alt)] font-sans">

      {/* Toast */}
      {toast && (
        <div role="alert" className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl text-sm font-bold ${toast.color} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Fechar notificação" className="ml-1 opacity-70 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-[var(--vp-border)]">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center gap-3 mt-2">
          <div className="bg-[var(--vp-secondary)] p-2 rounded-sm shadow-sm">
            <ShoppingCart className="text-[var(--vp-primary)]" size={20}/>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-[var(--vp-text)] leading-tight tracking-tight uppercase">2.22 Gerenciamento de Pedidos</h1>
            <p className="text-[10px] font-bold text-[var(--vp-label)] uppercase mt-1 tracking-widest flex items-center gap-2">
              <FileText size={12} aria-hidden="true"/> Controle de Carteira e Liberação de Ordens
            </p>
          </div>
          <button
            onClick={fetchOrders}
            title="Recarregar pedidos"
            aria-label="Recarregar lista de pedidos"
            className="p-2 rounded-sm hover:bg-[var(--vp-bg-alt)] text-[var(--vp-label)] transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <ActionPane title="Operações de Venda" groups={orderGroups} />

      <div className="p-6 space-y-4">

        {/* Carteira de Pedidos */}
        <FastTab title="Carteira de Pedidos Ativos" defaultOpen={true}>
          <div className="mb-4 flex gap-3">
            <div className="flex-1 relative">
              <label htmlFor="search-order" className="sr-only">Buscar pedidos por ordem, cliente ou status</label>
              <input
                id="search-order"
                type="text"
                placeholder="Filtrar por Ordem, Cliente ou Status..."
                className="w-full pr-10 pl-4 py-2 border border-[var(--vp-border)] rounded-sm text-sm focus:border-[var(--vp-primary)] outline-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} aria-hidden="true"/>
            </div>
            <button
              className="btn-secondary px-4 flex items-center gap-2"
              aria-label="Abrir filtros avançados de pedidos"
              onClick={() => setToast({ message: 'Filtros avançados — funcionalidade em desenvolvimento.', color: 'bg-amber-500 text-white' })}
            >
              <Filter size={16} aria-hidden="true"/> <span className="text-[10px] font-bold uppercase">Filtros</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-[var(--vp-label)]">
              <Loader2 size={20} className="animate-spin"/>
              <span className="text-sm font-bold uppercase tracking-widest">Carregando pedidos…</span>
            </div>
          ) : (
            <DataGrid columns={orderColumns} data={filtered} />
          )}
        </FastTab>

        {/* KPIs */}
        <FastTab title="Indicadores de Performance da Carteira" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-t-4 border-t-[var(--vp-secondary)]">
              <label className="text-[10px] font-black text-[var(--vp-label)] uppercase tracking-widest">Total em Aberto</label>
              <div className="text-xl font-black text-[var(--vp-text)] mt-1">
                R$ {fmtBRL(totalAberto)}
              </div>
              <div className="text-[10px] text-gray-400 font-bold mt-2 uppercase flex items-center gap-1">
                {orders.filter(o => o.status !== 'Concluído').length} ordens pendentes
              </div>
            </div>

            <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-t-4 border-t-red-600">
              <label className="text-[10px] font-black text-[var(--vp-label)] uppercase tracking-widest">Em Separação</label>
              <div className="text-xl font-black text-red-600 mt-1">{atrasadas} {atrasadas === 1 ? 'Ordem' : 'Ordens'}</div>
              <div className="text-[10px] text-gray-400 font-bold mt-2 uppercase">Ação imediata requerida</div>
            </div>

            <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-t-4 border-t-green-600">
              <label className="text-[10px] font-black text-[var(--vp-label)] uppercase tracking-widest">Taxa de Conclusão</label>
              <div className="text-xl font-black text-green-700 mt-1">{taxaLib}%</div>
              <div className="text-[10px] text-gray-400 font-bold mt-2 uppercase">
                {orders.filter(o => o.status === 'Concluído').length} de {orders.length} concluídas
              </div>
            </div>

            <div className="bg-white p-4 border border-[var(--vp-border)] rounded-sm shadow-sm border-t-4 border-t-blue-600">
              <label className="text-[10px] font-black text-[var(--vp-label)] uppercase tracking-widest">Tempo Médio (SLA)</label>
              <div className="text-xl font-black text-blue-600 mt-1">1.2 hrs</div>
              <div className="text-[10px] text-gray-400 font-bold mt-2 uppercase">Picking p/ Packing</div>
            </div>
          </div>
        </FastTab>

      </div>
    </div>
  );
}
