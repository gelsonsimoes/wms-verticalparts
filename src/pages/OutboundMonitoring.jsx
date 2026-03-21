import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Filter, CheckCircle2, AlertCircle, Clock,
    Truck, ShoppingCart, Box, X, RefreshCw,
    List, PackageCheck, Scissors, FileSignature, Zap,
    Check, BarChart3, CalendarDays, ArrowUpRight,
} from 'lucide-react';
import { useApp }      from '../hooks/useApp';
import { useOutbound } from '../hooks/useOutbound';

// ── STATUS CONFIG PREMIUM ────────────────────────────────────────────────────
const SITUACOES = ['Todas', 'Pendentes', 'Processadas', 'Canceladas', 'Aguardando Formação Onda'];

const SITUACAO_STYLE = {
    'Processadas':              'bg-green-500/10 text-green-400 border-green-500/20',
    'Pendentes':                'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Canceladas':               'bg-red-500/10 text-red-400 border-red-500/20',
    'Aguardando Formação Onda': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Padrao':                   'bg-white/5 text-white/30 border-white/10',
};

// ── SKELETON BLINDADO ────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-b border-white/5 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <td key={i} className="p-6">
                    <div className="h-3 bg-white/5 rounded-full w-24" />
                </td>
            ))}
        </tr>
    );
}

// ── MONITORAMENTO DE SAÍDA (100% REAL & PREMIUM) ──────────────────────────────
export default function OutboundMonitoring() {
    const { warehouseId } = useApp();
    const { orders, loading, error, refetch, fetchOrderItems } = useOutbound(warehouseId);

    const [search,        setSearch]        = useState('');
    const [situacao,      setSituacao]      = useState('Todas');
    const [periodo,       setPeriodo]       = useState('Hoje');
    const [selectedRows,  setSelectedRows]  = useState([]);
    const [drawerOpen,    setDrawerOpen]    = useState(false);
    const [drawerItems,   setDrawerItems]   = useState([]);
    const [activeOrder,   setActiveOrder]   = useState(null);
    const [loadingItems,  setLoadingItems]  = useState(false);

    // ── Filtro de Pesquisa e Situação ──
    const filteredData = useMemo(() => {
        const q = search.toLowerCase();
        return orders.filter(item => {
            if (situacao !== 'Todas' && item.situacao !== situacao) return false;
            if (q && !(
                (item.nf ?? '').toLowerCase().includes(q) ||
                (item.cliente ?? '').toLowerCase().includes(q)
            )) return false;
            return true;
        });
    }, [orders, search, situacao]);

    // ── Abrir Detalhe Real ──
    const openOrderDetail = async (order) => {
        setActiveOrder(order);
        setDrawerOpen(true);
        setLoadingItems(true);
        const items = await fetchOrderItems(order.id);
        setDrawerItems(items);
        setLoadingItems(false);
    };

    const toggleRow = (id) =>
        setSelectedRows(p => p.includes(id) ? p.filter(r => r !== id) : [...p, id]);

    return (
        <main className="space-y-6 p-4 md:p-6 animate-fade-up">
            
            {/* ── HEADER PREMIUM ── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-black rounded-2xl border border-white/10 shadow-lg">
                        <Truck className="w-5 h-5 text-[var(--vp-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tighter text-white uppercase flex items-center gap-2">
                             Monitoramento de <span className="text-[var(--vp-primary)] italic">Saída</span>
                             <span className="text-[9px] px-2 py-0.5 bg-white/5 rounded-full text-white/40 font-mono tracking-widest border border-white/10">COCKPIT</span>
                        </h1>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mt-1">
                            Expedição Geográfica — Rastreamento de Movimentação em Tempo Real
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="flex items-center gap-2 text-[10px] font-black text-white px-5 py-2.5 vp-glass rounded-xl border-white/10 hover:border-[var(--vp-primary)] transition-all active:scale-95"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-[var(--vp-primary)] ${loading ? 'animate-spin' : ''}`} />
                        RESYNC CLOUD
                    </button>
                </div>
            </header>

            {/* ── FILTROS "BLINDADOS" ── */}
            <div className="vp-glass rounded-2xl p-4 flex flex-wrap gap-4 items-center border-white/5 shadow-2xl">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="w-4 h-4 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="BUSCAR NOTA FISCAL OU CLIENTE..."
                        className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/5 focus:border-[var(--vp-primary)] rounded-xl text-xs font-bold text-white outline-none transition-all placeholder:text-white/10 uppercase tracking-wider"
                    />
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/5 rounded-xl">
                    <select
                        value={situacao}
                        onChange={e => setSituacao(e.target.value)}
                        className="bg-transparent text-[10px] font-black text-white px-4 outline-none border-none uppercase tracking-widest"
                    >
                        {SITUACOES.map(s => <option key={s} value={s} className="bg-[#0F0F0F]">{s}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/5 rounded-xl">
                    {['Hoje', '3 dias', '7 dias'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriodo(p)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${periodo === p
                                ? 'bg-[var(--vp-primary)] text-black'
                                : 'text-white/20 hover:text-white'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── GRID DE EXPEDIÇÃO PREMIUM ── */}
            <div className="vp-glass rounded-3xl overflow-hidden border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/3 border-b border-white/5">
                                <th className="p-5 w-12" />
                                <th className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Nota / Serie</th>
                                <th className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Status Operacional</th>
                                <th className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Progresso Batch</th>
                                <th className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Destinatário</th>
                                <th className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && orders.length === 0
                                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                                : filteredData.map(order => {
                                    const stClass = SITUACAO_STYLE[order.situacao] || SITUACAO_STYLE.Padrao;
                                    return (
                                        <tr key={order.id} className="vp-table-row group">
                                            <td className="p-5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(order.id)}
                                                    onChange={() => toggleRow(order.id)}
                                                    className="w-4 h-4 rounded-md accent-[var(--vp-primary)]"
                                                />
                                            </td>
                                            <td className="p-5">
                                                <div className="text-lg font-black text-white tracking-tighter group-hover:text-[var(--vp-primary)] transition-colors">
                                                    {order.nf} <span className="text-[10px] text-white/20 italic ml-1">/{order.serie}</span>
                                                </div>
                                                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-0.5">
                                                    {order.total_itens} SKU(s) • R$ {Number(order.valor).toLocaleString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`vp-badge flex items-center gap-2 border w-fit px-3 py-1.5 ${stClass}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${order.situacao === 'Processadas' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`} />
                                                    {order.situacao}
                                                </span>
                                            </td>
                                            <td className="p-5 min-w-[200px]">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/30">
                                                        <span>{order.pct_separacao}% Separação</span>
                                                        <span className="text-white/60">{order.qtd_total_separada}/{order.qtd_total_planejada} ITENS</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-[var(--vp-primary)] to-amber-500 transition-all duration-700" style={{ width: `${order.pct_separacao}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 max-w-[240px]">
                                                <div className="text-xs font-black text-white truncate uppercase tracking-tight">{order.cliente}</div>
                                                <div className="text-[9px] text-white/30 font-bold uppercase mt-1 tracking-widest">
                                                    {order.last_update ? new Date(order.last_update).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button
                                                    onClick={() => openOrderDetail(order)}
                                                    className="p-3 bg-white/5 hover:bg-[var(--vp-primary)] hover:text-black hover:border-transparent text-white/40 border border-white/5 rounded-xl transition-all active:scale-90 flex items-center gap-2 ml-auto group/btn"
                                                >
                                                    <List className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Detalhes</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── GAVETA LATERAL PREMIUM (REAL) ── */}
            {drawerOpen && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDrawerOpen(false)} />
                    <aside className="w-full max-w-lg bg-[#0A0A0A] border-l border-white/10 relative z-[110] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-500">
                        {/* Header Gaveta */}
                        <div className="p-8 bg-black relative border-b border-white/5">
                            <button onClick={() => setDrawerOpen(false)} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-5 mt-4">
                                <div className="p-4 bg-[var(--vp-primary)]/10 rounded-2xl border border-[var(--vp-primary)]/20">
                                    <ShoppingCart className="w-8 h-8 text-[var(--vp-primary)] shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tighter">Itens da <span className="text-[var(--vp-primary)]">NF #{activeOrder?.nf}</span></h2>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{activeOrder?.cliente}</p>
                                </div>
                            </div>
                        </div>

                        {/* Conteúdo Gaveta */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {loadingItems ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                                ))
                            ) : drawerItems.length === 0 ? (
                                <div className="text-center py-20">
                                    <Box className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Nenhum item cadastrado para esta Nota</p>
                                </div>
                            ) : drawerItems.map(item => (
                                <div key={item.id} className="p-6 vp-glass rounded-2xl border-white/5 hover:border-[var(--vp-primary)]/20 transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="min-w-0">
                                            <p className="font-black text-sm text-white truncate group-hover:text-[var(--vp-primary)] transition-colors uppercase tracking-tight">{item.desc}</p>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1 font-mono">SKU: {item.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-white tracking-tighter leading-none">{item.separado}</p>
                                            <p className="text-[10px] font-black text-white/20 uppercase mt-1">de {item.total} {item.unidade}</p>
                                        </div>
                                    </div>
                                    {/* Progress Mini */}
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[var(--vp-primary)] transition-all duration-700" 
                                            style={{ width: `${(item.separado/item.total)*100}%` }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Gaveta */}
                        <div className="p-8 border-t border-white/5 bg-black/40">
                             <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-4 bg-white/3 rounded-xl border border-white/5">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Status Conferência</p>
                                    <p className="text-lg font-black text-white">{activeOrder?.pct_conferencia}%</p>
                                </div>
                                <div className="p-4 bg-white/3 rounded-xl border border-white/5">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Total Volumes</p>
                                    <p className="text-lg font-black text-white">{activeOrder?.total_itens}</p>
                                </div>
                             </div>
                             <button
                                onClick={() => setDrawerOpen(false)}
                                className="w-full py-4 bg-[var(--vp-primary)] hover:bg-[var(--vp-primary-vibrant)] text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                             >
                                <CheckCircle2 className="w-4 h-4" />
                                Fechar Detalhamento
                             </button>
                        </div>
                    </aside>
                </div>
            )}
        </main>
    );
}
