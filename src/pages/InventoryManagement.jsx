import React, { useState, useMemo, useCallback } from 'react';
import {
    Search, Filter, Package, MapPin, AlertTriangle,
    RefreshCw, ChevronDown, X, Check, Minus, Plus,
    Layers, Database, BarChart2,
} from 'lucide-react';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import { useApp }       from '../hooks/useApp';
import { useInventory } from '../hooks/useInventory';

// ─── CONFIGURAÇÕES ──────────────────────────────────────────────────────────
const RUAS = ['Todas', 'R1', 'R2', 'R3'];
const NIVEL_CONFIG = {
    Normal:  { badge: 'bg-green-500/10 text-green-400 border-green-500/20', dot: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' },
    Crítico: { badge: 'bg-red-500/10 text-red-400 border-red-500/20',     dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
    Vazio:   { badge: 'bg-white/5 text-white/30 border-white/10',         dot: 'bg-white/20' },
};

// ─── PÁGINA DE ANÁLISE — PREMIUM VIEW ──────────────────────────────────────
export default function InventoryManagement() {
    const { warehouseId } = useApp();
    const { rows, loading, stats, refetch } = useInventory(warehouseId);

    const [search,        setSearch]        = useState('');
    const [ruaFiltro,     setRuaFiltro]     = useState('Todas');
    const [apenasOcup,    setApenasOcup]    = useState(false);

    const filtrados = useMemo(() => {
        const q = search.toLowerCase();
        return rows.filter(r => {
            if (apenasOcup && !r.sku) return false;
            if (ruaFiltro !== 'Todas' && r.rua !== ruaFiltro) return false;
            if (q && !(
                (r.sku ?? '').toLowerCase().includes(q) ||
                (r.produto ?? '').toLowerCase().includes(q) ||
                (r.endereco ?? '').toLowerCase().includes(q)
            )) return false;
            return true;
        });
    }, [rows, search, ruaFiltro, apenasOcup]);

    return (
        <EnterprisePageBase 
            title="Análise Geográfica de Estoque"
            breadcrumbItems={[{ label: 'Estoque', path: '/estoque' }]}
        >
            <main className="space-y-6 animate-in fade-in duration-500">
                
                {/* KPI Row Premium */}
                <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: 'LOCAÇÕES', value: stats.totalEnderecos, ic: Database, col: 'text-blue-500' },
                        { label: 'OCUPADAS', value: stats.ocupados, ic: Package, col: 'text-green-500' },
                        { label: 'LIVRES', value: stats.vazios, ic: Layers, col: 'text-white/20' },
                        { label: 'SKUS UNICOS', value: stats.totalSkus, ic: BarChart2, col: 'text-[var(--vp-primary)]' },
                        { label: 'CRÍTICO', value: stats.criticos, ic: AlertTriangle, col: stats.criticos > 0 ? 'text-red-500' : 'text-white/10' },
                    ].map(({ label, value, ic: Icon, col }) => (
                        <div key={label} className="bg-white/3 border border-white/5 p-5 rounded-2xl relative group overflow-hidden transition-all hover:bg-white/5">
                            <Icon className={`w-5 h-5 absolute -right-3 -bottom-3 opacity-10 group-hover:scale-150 transition-transform ${col}`} />
                            <p className={`text-2xl font-black ${col}`}>{loading ? '…' : value}</p>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em] mt-1">{label}</p>
                        </div>
                    ))}
                </section>

                {/* Filtros */}
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4 flex flex-wrap gap-4 items-center shadow-2xl">
                    <div className="relative flex-1 min-w-[280px]">
                        <Search className="w-4 h-4 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="BUSCAR POR SKU, PRODUTO OU ENDEREÇO..."
                            className="w-full pl-12 pr-4 h-12 bg-black/40 border border-white/10 focus:border-[var(--vp-primary)] rounded-xl text-xs font-bold text-white outline-none transition-all placeholder:text-white/10 uppercase tracking-wider"
                        />
                    </div>

                    <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/10 rounded-xl">
                        {RUAS.map(r => (
                            <button
                                key={r}
                                onClick={() => setRuaFiltro(r)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${ruaFiltro === r
                                    ? 'bg-[var(--vp-primary)] text-black'
                                    : 'text-white/20 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={refetch}
                        className="h-12 flex items-center gap-2 text-[10px] font-black text-white px-5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95 group"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-[var(--vp-primary)] ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
                        SINCRONIZAR
                    </button>
                </div>

                {/* Tabela de Analítica */}
                <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    {['ENDEREÇO', 'MAPA R/P/N', 'SKU IDENT', 'PRODUTO / FAMÍLIA', 'SALDO', 'STATUS'].map(h => (
                                        <th key={h} className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtrados.map(r => {
                                    const cfg = NIVEL_CONFIG[r.nivel_estoque] ?? NIVEL_CONFIG.Vazio;
                                    return (
                                        <tr key={r.id || r.endereco_id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="w-3.5 h-3.5 text-white/20 group-hover:text-[var(--vp-primary)] transition-colors" />
                                                    <span className="font-mono text-xs font-black text-white group-hover:text-[var(--vp-primary)] transition-colors tracking-tighter uppercase">{r.endereco}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-[10px] font-black text-white/30 uppercase tracking-widest font-mono">
                                                {r.rua} / {r.porta_palete} / {r.nivel}
                                            </td>
                                            <td className="p-5">
                                                {r.sku ? (
                                                    <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black font-mono border border-blue-500/20">
                                                        {r.sku}
                                                    </span>
                                                ) : <span className="text-[9px] text-white/10 uppercase italic font-bold">Vazio</span>}
                                            </td>
                                            <td className="p-5 max-w-[280px]">
                                                <div className="text-xs font-black text-white truncate uppercase tracking-tight">{r.produto ?? 'Disponível'}</div>
                                                <div className="text-[9px] text-white/20 font-bold uppercase mt-1 tracking-widest">{r.familia ?? '—'}</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`text-lg font-black tracking-tighter ${r.quantidade == null ? 'text-white/10' : 'text-white'}`}>
                                                        {r.quantidade != null ? r.quantidade.toLocaleString('pt-BR') : '—'}
                                                    </span>
                                                    {r.unidade && <span className="text-[8px] font-black text-white/20 uppercase">{r.unidade}</span>}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`flex items-center gap-2 border w-fit px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {r.nivel_estoque}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </EnterprisePageBase>
    );
}
