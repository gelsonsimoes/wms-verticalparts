import React, { useState, useMemo, useCallback } from 'react';
import {
    Search, Filter, Package, MapPin, AlertTriangle,
    RefreshCw, ChevronDown, X, Check, Minus, Plus,
    Layers, Database, BarChart2,
} from 'lucide-react';
import { useApp }       from '../hooks/useApp';
import { useInventory } from '../hooks/useInventory';

// ─── CONFIGURAÇÕES PREMIUM ──────────────────────────────────────────────────
const RUAS = ['Todas', 'R1', 'R2', 'R3'];
const NIVEIS_ESTOQUE = ['Todos', 'Normal', 'Crítico', 'Vazio'];

const NIVEL_CONFIG = {
    Normal:  { badge: 'bg-green-500/10 text-green-400 border-green-500/20', dot: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' },
    Crítico: { badge: 'bg-red-500/10 text-red-400 border-red-500/20',     dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
    Vazio:   { badge: 'bg-white/5 text-white/30 border-white/10',         dot: 'bg-white/20' },
};

// ─── MODAL PREMIUM DE AJUSTE ───────────────────────────────────────────────
function ModalAjuste({ row, onClose, onSave, saving }) {
    const [novaQtd, setNovaQtd] = useState(String(row.quantidade ?? 0));
    const [motivo,  setMotivo]  = useState('');
    const [err,     setErr]     = useState('');

    const qtdNum = Number(novaQtd);
    const diff   = qtdNum - (row.quantidade ?? 0);
    const isOk   = !isNaN(qtdNum) && qtdNum >= 0 && novaQtd !== '';

    const handleSave = () => {
        if (!isOk) { setErr('Informe uma quantidade válida (≥ 0).'); return; }
        if (diff === 0) { setErr('A quantidade não foi alterada.'); return; }
        onSave({ novaQuantidade: qtdNum, motivo });
    };

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
            <div className="relative bg-[#0F0F0F] rounded-2xl border border-white/10 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden scale-in-center animate-out duration-200">
                {/* Header Modal */}
                <div className="px-6 py-5 border-b border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--vp-primary)]/10 flex items-center justify-center border border-[var(--vp-primary)]/20">
                        <Package className="w-5 h-5 text-[var(--vp-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-white truncate uppercase tracking-tighter">{row.sku ?? 'Sem SKU'}</h4>
                        <p className="text-[10px] text-white/30 truncate uppercase font-bold tracking-widest">{row.produto ?? 'Endereço vazio'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub-header Contexto */}
                <div className="px-6 py-3 bg-white/3 border-b border-white/5 flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest">
                    <MapPin className="w-3.5 h-3.5 text-[var(--vp-primary)]" />
                    <span className="font-mono text-[var(--vp-primary)]">{row.endereco}</span>
                    <span className="text-white/10">|</span>
                    <span>ATUAL: <span className="text-white">{row.quantidade ?? 0}</span> {row.unidade ?? 'PC'}</span>
                </div>

                {/* Estépper e Campos */}
                <div className="px-6 py-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                            Nova Quantidade Operacional
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setNovaQtd(v => String(Math.max(0, Number(v) - 1)))}
                                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white active:scale-90"
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <input
                                type="number"
                                value={novaQtd}
                                onChange={e => { setNovaQtd(e.target.value); setErr(''); }}
                                className="flex-1 text-center text-4xl font-black bg-transparent text-white border-b-2 border-white/10 focus:border-[var(--vp-primary)] py-2 outline-none transition-all placeholder:text-white/5"
                                placeholder="0"
                            />
                            <button
                                onClick={() => setNovaQtd(v => String(Number(v) + 1))}
                                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white active:scale-90"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        {isOk && diff !== 0 && (
                            <div className={`text-center py-2 rounded-lg text-[10px] font-black tracking-widest ${diff > 0 ? 'text-green-400 bg-green-500/5' : 'text-red-400 bg-red-500/5'}`}>
                                {diff > 0 ? `+${diff}` : diff} {row.unidade ?? 'PC'} — AJUSTE DE {diff > 0 ? 'ENTRADA' : 'SAÍDA'}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                            Motivo do Registro
                        </label>
                        <input
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            placeholder="EX: INVENTÁRIO CÍCLICO, AVARIA, ETC"
                            className="w-full px-4 py-3 bg-white/3 border border-white/5 focus:border-[var(--vp-primary)] rounded-xl text-xs font-medium text-white outline-none transition-all placeholder:text-white/10"
                        />
                    </div>

                    {err && (
                        <p className="text-[10px] text-red-400 font-black flex items-center gap-1.5 uppercase tracking-wider">
                            <AlertTriangle className="w-4 h-4" /> {err}
                        </p>
                    )}

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-[9px] text-blue-300 font-bold flex gap-3 leading-relaxed">
                        <BarChart2 className="w-5 h-5 shrink-0 text-blue-400" />
                        A transação será registrada no <strong>Kardex</strong> e o saldo do produto será recalculado via **Trigger SQL**.
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="px-6 py-5 bg-white/3 border-t border-white/5 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isOk || diff === 0 || saving}
                        className="flex-1 py-3 bg-[var(--vp-primary)] hover:bg-[var(--vp-primary-vibrant)] disabled:opacity-20 text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,215,0,0.2)] active:scale-95"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {saving ? 'Processando...' : 'Confirmar Ajuste'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── SKELETON BLINDADO ───────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-b border-white/5 animate-pulse">
            {[100, 160, 120, 200, 100, 80, 120, 80].map((w, i) => (
                <td key={i} className="p-4">
                    <div className="h-3 bg-white/5 rounded-full" style={{ width: w }} />
                </td>
            ))}
        </tr>
    );
}

// ─── PÁGINA DE INVENTÁRIO — PREMIUM VIEW ──────────────────────────────────────
export default function InventoryManagement() {
    const { warehouseId, currentUser } = useApp();
    const { rows, loading, error, stats, adjusting, refetch, ajustarEstoque } = useInventory(warehouseId);

    const [search,        setSearch]        = useState('');
    const [ruaFiltro,     setRuaFiltro]     = useState('Todas');
    const [nivelFiltro,   setNivelFiltro]   = useState('Todos');
    const [apenasOcup,    setApenasOcup]    = useState(false);
    const [modalRow,      setModalRow]      = useState(null);
    const [toast,         setToast]         = useState(null);

    const showToast = useCallback((msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const handleAjustar = useCallback(async ({ novaQuantidade, motivo }) => {
        const res = await ajustarEstoque({
            produtoId: modalRow.produto_id,
            enderecoId: modalRow.endereco_id,
            sku: modalRow.sku,
            descricao: modalRow.produto,
            novaQuantidade,
            quantidadeAtual: modalRow.quantidade,
            operadorId: currentUser?.id,
            motivo,
        });
        if (res.error) showToast(res.error, 'error');
        else {
            showToast(`Inventário atualizado para ${novaQuantidade} unidades.`);
            setModalRow(null);
        }
    }, [modalRow, ajustarEstoque, currentUser, showToast]);

    const filtrados = useMemo(() => {
        const q = search.toLowerCase();
        return rows.filter(r => {
            if (apenasOcup && !r.sku) return false;
            if (ruaFiltro !== 'Todas' && r.rua !== ruaFiltro) return false;
            if (nivelFiltro !== 'Todos' && r.nivel_estoque !== nivelFiltro) return false;
            if (q && !(
                (r.sku ?? '').toLowerCase().includes(q) ||
                (r.produto ?? '').toLowerCase().includes(q) ||
                (r.endereco ?? '').toLowerCase().includes(q)
            )) return false;
            return true;
        });
    }, [rows, search, ruaFiltro, nivelFiltro, apenasOcup]);

    return (
        <main className="space-y-6 p-4 md:p-6 animate-fade-up">
            
            {/* Header Blindado */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-black rounded-2xl border border-white/10 shadow-lg">
                        <Layers className="w-5 h-5 text-[var(--vp-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tighter text-white uppercase flex items-center gap-2">
                             Inventário <span className="text-[var(--vp-primary)] italic">Geográfico</span>
                             <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full font-mono border border-green-500/20">LIVE</span>
                        </h1>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mt-1">
                            Mapa de Posições — CD Central Guarulhos — Injeção Realtime
                        </p>
                    </div>
                </div>
                <button
                    onClick={refetch}
                    className="flex items-center gap-2 text-[10px] font-black text-white px-5 py-2.5 vp-glass rounded-xl border-white/10 hover:border-[var(--vp-primary)] transition-all active:scale-95 group"
                >
                    <RefreshCw className={`w-3.5 h-3.5 text-[var(--vp-primary)] ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
                    SINCRONIZAR KARDEX
                </button>
            </header>

            {/* KPI Row Premium */}
            <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'LOCAÇÕES', value: stats.totalEnderecos, ic: Database, col: 'text-blue-500' },
                    { label: 'OCUPADAS', value: stats.ocupados, ic: Package, col: 'text-green-500' },
                    { label: 'LIVRES', value: stats.vazios, ic: Layers, col: 'text-white/20' },
                    { label: 'SKUS UNICOS', value: stats.totalSkus, ic: BarChart2, col: 'text-[var(--vp-primary)]' },
                    { label: 'CRÍTICO', value: stats.criticos, ic: AlertTriangle, col: stats.criticos > 0 ? 'text-red-500' : 'text-white/10' },
                ].map(({ label, value, ic: Icon, col }) => (
                    <div key={label} className="vp-glass p-5 rounded-2xl relative group overflow-hidden border-white/5 transition-all hover:scale-[1.02]">
                        <Icon className={`w-5 h-5 absolute -right-3 -bottom-3 opacity-10 group-hover:scale-150 transition-transform ${col}`} />
                        <p className={`text-2xl font-black ${col}`}>{loading ? '…' : value}</p>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em] mt-1">{label}</p>
                    </div>
                ))}
            </section>

            {/* Filtros Glassmorphism */}
            <div className="vp-glass rounded-2xl p-4 flex flex-wrap gap-4 items-center border-white/5 shadow-2xl">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="w-4 h-4 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="BUSCAR POR SKU, PRODUTO OU ENDEREÇO..."
                        className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/5 focus:border-[var(--vp-primary)] rounded-xl text-xs font-bold text-white outline-none transition-all placeholder:text-white/10 uppercase tracking-wider"
                    />
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/5 rounded-xl">
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

                <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/5 rounded-xl">
                    {NIVEIS_ESTOQUE.map(n => (
                        <button
                            key={n}
                            onClick={() => setNivelFiltro(n)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${nivelFiltro === n
                                ? 'bg-white text-black'
                                : 'text-white/20 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${apenasOcup ? 'bg-green-500' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${apenasOcup ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={apenasOcup} onChange={e => setApenasOcup(e.target.checked)} />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-white">Apenas Ocupados</span>
                </label>
            </div>

            {/* Tabela de Alta Fidelidade */}
            <div className="vp-glass rounded-2xl overflow-hidden border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/3 border-b border-white/5">
                                {['ENDEREÇO', 'MAPA R/P/N', 'SKU IDENT', 'PRODUTO / FAMÍLIA', 'SALDO', 'STATUS', 'AÇÃO'].map(h => (
                                    <th key={h} className="p-5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading
                                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                : filtrados.map(row => {
                                    const cfg = NIVEL_CONFIG[row.nivel_estoque] ?? NIVEL_CONFIG.Vazio;
                                    return (
                                        <tr key={row.endereco_id} className="vp-table-row group">
                                            {/* Endereço */}
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/3 flex items-center justify-center border border-white/5 group-hover:border-[var(--vp-primary)]/40 transition-colors">
                                                        <MapPin className="w-3.5 h-3.5 text-white/20 group-hover:text-[var(--vp-primary)]" />
                                                    </div>
                                                    <span className="font-mono text-xs font-black text-white group-hover:text-[var(--vp-primary)] transition-colors tracking-tighter">{row.endereco}</span>
                                                </div>
                                            </td>

                                            {/* Mapa Geo */}
                                            <td className="p-5">
                                                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest font-mono">
                                                    {row.rua} <span className="text-white/5">/</span> {row.porta_palete} <span className="text-white/5">/</span> {row.nivel}
                                                </div>
                                            </td>

                                            {/* SKU */}
                                            <td className="p-5">
                                                {row.sku ? (
                                                    <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black font-mono border border-blue-500/20">
                                                        {row.sku}
                                                    </span>
                                                ) : <span className="text-[9px] text-white/10 uppercase italic font-bold">Vazio</span>}
                                            </td>

                                            {/* Produto / Família */}
                                            <td className="p-5 max-w-[280px]">
                                                <div className="text-xs font-black text-white truncate group-hover:text-[var(--vp-primary)] transition-colors uppercase tracking-tight">{row.produto ?? 'Ponto disponível'}</div>
                                                <div className="text-[9px] text-white/20 font-bold uppercase mt-1 tracking-widest">{row.familia ?? '—'}</div>
                                            </td>

                                            {/* Saldo Operacional */}
                                            <td className="p-5">
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`text-lg font-black tracking-tighter ${row.quantidade == null ? 'text-white/10' : 'text-white'}`}>
                                                        {row.quantidade != null ? row.quantidade.toLocaleString('pt-BR') : '—'}
                                                    </span>
                                                    {row.unidade && <span className="text-[8px] font-black text-white/20 uppercase">{row.unidade}</span>}
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="p-5">
                                                <span className={`vp-badge flex items-center gap-2 border w-fit px-3 py-1.5 ${cfg.badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {row.nivel_estoque}
                                                </span>
                                            </td>

                                            {/* Ação Operacional */}
                                            <td className="p-5">
                                                <button
                                                    onClick={() => setModalRow(row)}
                                                    disabled={!row.sku}
                                                    className="p-3 bg-white/5 hover:bg-[var(--vp-primary)] hover:text-black hover:border-transparent text-white/40 border border-white/5 rounded-xl transition-all active:scale-90 disabled:opacity-5 flex items-center gap-2 group/btn"
                                                >
                                                    <ChevronDown className="w-4 h-4 group-hover/btn:rotate-180 transition-transform" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Ajuste</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Toasts e Modais aparecem aqui via Portal ou Componentização superior */}
            {modalRow && <ModalAjuste row={modalRow} saving={adjusting} onClose={() => setModalRow(null)} onSave={handleAjustar} />}
            
            {toast && (
                <div role="status" className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl border-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-white/10 flex items-center gap-4 animate-in slide-in-from-bottom-10 backdrop-blur-2xl ${
                    toast.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-[#00F59B10] text-[#00F59B]'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Check className="w-5 h-5 shadow-[0_0_10px_rgba(0,245,155,0.5)]" />}
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{toast.msg}</span>
                </div>
            )}
        </main>
    );
}
