import React, { useState, useMemo, useCallback } from 'react';
import {
    Search, Filter, Package, MapPin, AlertTriangle,
    RefreshCw, ChevronDown, X, Check, Minus, Plus,
    Layers, Database, BarChart2,
} from 'lucide-react';
import { useApp }       from '../hooks/useApp';
import { useInventory } from '../hooks/useInventory';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const RUAS = ['Todas', 'R1', 'R2', 'R3'];
const NIVEIS_ESTOQUE = ['Todos', 'Normal', 'Crítico', 'Vazio'];

const NIVEL_CONFIG = {
    Normal:  { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    Crítico: { badge: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
    Vazio:   { badge: 'bg-slate-100 text-slate-500', dot: 'bg-slate-300' },
};

// ─── MODAL DE AJUSTE DE ESTOQUE ───────────────────────────────────────────────
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
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl border-2 border-slate-200 w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{row.sku ?? '—'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{row.produto ?? 'Endereço vazio'}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Info do endereço */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{row.endereco}</span>
                    <span className="text-slate-300">·</span>
                    <span>{row.tipo_endereco ?? '—'}</span>
                    <span className="ml-auto font-black text-slate-800">
                        Atual: <span className="text-blue-600">{row.quantidade ?? 0}</span> {row.unidade ?? 'PC'}
                    </span>
                </div>

                {/* Formulário */}
                <div className="px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Nova Quantidade
                        </label>
                        {/* Stepper */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setNovaQtd(v => String(Math.max(0, Number(v) - 1)))}
                                className="w-9 h-9 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-slate-400 transition-colors"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                                type="number"
                                min="0"
                                value={novaQtd}
                                onChange={e => { setNovaQtd(e.target.value); setErr(''); }}
                                className="flex-1 text-center text-2xl font-black border-2 border-slate-200 focus:border-amber-400 rounded-xl py-2 outline-none transition-colors"
                            />
                            <button
                                onClick={() => setNovaQtd(v => String(Number(v) + 1))}
                                className="w-9 h-9 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-slate-400 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Diff badge */}
                        {isOk && diff !== 0 && (
                            <div className={`text-center text-[11px] font-black py-1 rounded-lg ${diff > 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                                {diff > 0 ? `+${diff}` : diff} {row.unidade ?? 'PC'} (ajuste {diff > 0 ? 'entrada' : 'saída'})
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Motivo do Ajuste <span className="font-normal">(opcional)</span>
                        </label>
                        <input
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            placeholder="Ex: Contagem de inventário, avaria, etc."
                            className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 focus:border-amber-400 rounded-xl text-sm outline-none transition-colors"
                        />
                    </div>

                    {err && (
                        <p className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> {err}
                        </p>
                    )}

                    {/* Aviso automação */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-[9px] text-blue-700 font-bold flex items-start gap-1.5">
                        <BarChart2 className="w-3 h-3 shrink-0 mt-0.5" />
                        O saldo em <strong>produtos</strong> será atualizado automaticamente via Trigger SQL.
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border-2 border-slate-200 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isOk || diff === 0 || saving}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                        {saving
                            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Salvando...</>
                            : <><Check className="w-3.5 h-3.5" />Confirmar Ajuste</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-t border-slate-100 animate-pulse">
            {[80, 160, 120, 80, 70, 90, 80].map((w, i) => (
                <td key={i} className="p-3">
                    <div className="h-3 bg-slate-100 rounded" style={{ width: w }} />
                </td>
            ))}
        </tr>
    );
}

// ─── INVENTORY MANAGEMENT ─────────────────────────────────────────────────────
export default function InventoryManagement() {
    const { warehouseId, currentUser } = useApp();
    const { rows, loading, error, stats, adjusting, refetch, ajustarEstoque } = useInventory(warehouseId);

    // ── Filtros ────────────────────────────────────────────────────────────────
    const [search,        setSearch]        = useState('');
    const [ruaFiltro,     setRuaFiltro]     = useState('Todas');
    const [nivelFiltro,   setNivelFiltro]   = useState('Todos');
    const [apenasOcup,    setApenasOcup]    = useState(false);

    // ── Modal de ajuste ────────────────────────────────────────────────────────
    const [modalRow, setModalRow] = useState(null);
    const [toast,    setToast]    = useState(null);

    const showToast = useCallback((msg, type = 'success') => {
        const id = Date.now();
        setToast({ id, msg, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const handleAjustar = useCallback(async ({ novaQuantidade, motivo }) => {
        if (!modalRow) return;
        const res = await ajustarEstoque({
            produtoId:       modalRow.produto_id,
            enderecoId:      modalRow.endereco_id,
            sku:             modalRow.sku,
            descricao:       modalRow.produto,
            novaQuantidade,
            quantidadeAtual: modalRow.quantidade,
            operadorId:      currentUser?.id ?? null,
            motivo,
        });
        if (res.error) {
            showToast(res.error, 'error');
        } else {
            showToast(`Estoque de ${modalRow.sku} ajustado para ${novaQuantidade} ${modalRow.unidade ?? 'PC'}.`);
            setModalRow(null);
        }
    }, [modalRow, ajustarEstoque, currentUser, showToast]);

    // ── Dados filtrados ────────────────────────────────────────────────────────
    const filtrados = useMemo(() => {
        const q = search.toLowerCase();
        return rows.filter(r => {
            if (apenasOcup && !r.sku) return false;
            if (ruaFiltro !== 'Todas' && r.rua !== ruaFiltro) return false;
            if (nivelFiltro !== 'Todos' && r.nivel_estoque !== nivelFiltro) return false;
            if (q && !(
                (r.sku ?? '').toLowerCase().includes(q) ||
                (r.produto ?? '').toLowerCase().includes(q) ||
                (r.endereco ?? '').toLowerCase().includes(q) ||
                (r.familia ?? '').toLowerCase().includes(q)
            )) return false;
            return true;
        });
    }, [rows, search, ruaFiltro, nivelFiltro, apenasOcup]);

    return (
        <main className="space-y-4 p-2">
            {/* ─── Header ─────────────────────────────────────────────── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[var(--vp-border)]">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-black rounded-sm border border-white/10 shadow-lg">
                        <Layers className="w-4 h-4 text-[var(--vp-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-tight text-black uppercase">
                            4.3 Análise de Estoque — Mapa de Posições
                        </h1>
                        <p className="text-[10px] text-[var(--vp-text-label)] font-bold uppercase tracking-widest mt-0.5">
                            CD Central Guarulhos · Realtime · Powered by Gemini Triggers
                        </p>
                    </div>
                </div>
                <button
                    onClick={refetch}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-black border border-[var(--vp-border)] px-3 py-1.5 rounded-sm hover:border-slate-400 transition-all disabled:opacity-40"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </button>
            </header>

            {/* ─── KPI Row ────────────────────────────────────────────── */}
            <section aria-label="Resumo do estoque" className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Total Endereços', value: stats.totalEnderecos, icon: Database,      color: 'text-blue-600' },
                    { label: 'Ocupados',         value: stats.ocupados,       icon: Package,       color: 'text-green-600' },
                    { label: 'Vazios',           value: stats.vazios,         icon: Layers,        color: 'text-slate-500' },
                    { label: 'SKUs Distintos',   value: stats.totalSkus,      icon: BarChart2,     color: 'text-amber-500' },
                    { label: 'Nível Crítico',    value: stats.criticos,       icon: AlertTriangle, color: stats.criticos > 0 ? 'text-red-600' : 'text-slate-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white border border-[var(--vp-border)] rounded-sm px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
                        <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                        <div>
                            <p className={`text-xl font-black ${color}`}>{loading ? '…' : value}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* ─── Filtros ────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2 items-center bg-white border border-[var(--vp-border)] rounded-sm px-4 py-3">
                {/* Busca */}
                <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar SKU, produto, endereço..."
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border-2 border-slate-200 focus:border-amber-400 rounded-xl text-xs font-medium outline-none transition-colors w-56"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Filtro Rua */}
                <div className="flex items-center gap-1" role="group" aria-label="Filtrar por rua">
                    <Filter className="w-3 h-3 text-slate-400" />
                    {RUAS.map(r => (
                        <button
                            key={r}
                            onClick={() => setRuaFiltro(r)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black border-2 transition-all ${ruaFiltro === r
                                ? 'border-amber-400 bg-amber-50 text-amber-700'
                                : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                {/* Filtro Nível */}
                <div className="flex items-center gap-1" role="group" aria-label="Filtrar por nível de estoque">
                    {NIVEIS_ESTOQUE.map(n => {
                        const cfg = NIVEL_CONFIG[n];
                        return (
                            <button
                                key={n}
                                onClick={() => setNivelFiltro(n)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black border-2 transition-all flex items-center gap-1 ${nivelFiltro === n
                                    ? (cfg ? cfg.badge + ' border-current' : 'border-slate-800 bg-slate-800 text-white')
                                    : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200'
                                }`}
                            >
                                {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                                {n}
                            </button>
                        );
                    })}
                </div>

                {/* Toggle apenas ocupados */}
                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 cursor-pointer ml-auto">
                    <input
                        type="checkbox"
                        checked={apenasOcup}
                        onChange={e => setApenasOcup(e.target.checked)}
                        className="rounded border-slate-300 accent-amber-500"
                    />
                    Apenas ocupados
                </label>

                <span className="text-[9px] text-slate-400 font-medium">
                    {filtrados.length} endereço(s)
                </span>
            </div>

            {/* ─── Erro ───────────────────────────────────────────────── */}
            {error && (
                <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}

            {/* ─── Tabela ─────────────────────────────────────────────── */}
            <div className="bg-white border border-[var(--vp-border)] rounded-sm overflow-hidden shadow-sm">
                <table className="w-full text-sm" role="grid">
                    <thead>
                        <tr className="bg-slate-50 border-b-2 border-slate-100">
                            {['Endereço', 'Rua / PP / Nível', 'SKU', 'Produto', 'Família', 'Qtd', 'Nível', 'Ação'].map(h => (
                                <th key={h} className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                            : filtrados.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-slate-400 text-xs font-bold">
                                            Nenhum endereço encontrado para os filtros selecionados.
                                        </td>
                                    </tr>
                                )
                                : filtrados.map(row => {
                                    const cfg = NIVEL_CONFIG[row.nivel_estoque] ?? NIVEL_CONFIG.Vazio;
                                    return (
                                        <tr
                                            key={row.endereco_id}
                                            className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                                        >
                                            {/* Endereço */}
                                            <td className="p-3">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <span className="font-mono text-xs font-black text-slate-700">{row.endereco}</span>
                                                </div>
                                            </td>

                                            {/* Localização */}
                                            <td className="p-3 text-[10px] text-slate-500 font-bold font-mono">
                                                {row.rua} · {row.porta_palete} · {row.nivel}
                                            </td>

                                            {/* SKU */}
                                            <td className="p-3">
                                                {row.sku
                                                    ? <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">{row.sku}</span>
                                                    : <span className="text-[9px] text-slate-300 italic">vazio</span>
                                                }
                                            </td>

                                            {/* Produto */}
                                            <td className="p-3 text-xs font-bold text-slate-700 max-w-[200px] truncate">
                                                {row.produto ?? '—'}
                                            </td>

                                            {/* Família */}
                                            <td className="p-3">
                                                {row.familia
                                                    ? <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-bold">{row.familia}</span>
                                                    : <span className="text-[9px] text-slate-300">—</span>
                                                }
                                            </td>

                                            {/* Quantidade */}
                                            <td className="p-3">
                                                <span className={`text-sm font-black ${row.quantidade == null ? 'text-slate-300' : row.nivel_estoque === 'Crítico' ? 'text-red-600' : 'text-slate-800'}`}>
                                                    {row.quantidade != null ? row.quantidade.toLocaleString('pt-BR') : '—'}
                                                </span>
                                                {row.unidade && row.quantidade != null && (
                                                    <span className="text-[8px] text-slate-400 font-bold ml-1">{row.unidade}</span>
                                                )}
                                            </td>

                                            {/* Nível */}
                                            <td className="p-3">
                                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${cfg.badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {row.nivel_estoque}
                                                </span>
                                            </td>

                                            {/* Ação */}
                                            <td className="p-3">
                                                <button
                                                    onClick={() => setModalRow(row)}
                                                    disabled={!row.sku}
                                                    title={row.sku ? 'Ajustar estoque' : 'Endereço vazio — sem produto para ajustar'}
                                                    className="flex items-center gap-1 text-[9px] font-black px-2.5 py-1.5 rounded-lg border-2 border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <ChevronDown className="w-3 h-3" />
                                                    Ajustar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                        }
                    </tbody>
                </table>
            </div>

            {/* ─── Modal ──────────────────────────────────────────────── */}
            {modalRow && (
                <ModalAjuste
                    row={modalRow}
                    saving={adjusting}
                    onClose={() => setModalRow(null)}
                    onSave={handleAjustar}
                />
            )}

            {/* ─── Toast ──────────────────────────────────────────────── */}
            {toast && (
                <div
                    role="status"
                    className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl border-2 text-sm font-bold animate-in slide-in-from-bottom-4 duration-300 ${
                        toast.type === 'error'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                    }`}
                >
                    {toast.type === 'error'
                        ? <AlertTriangle className="w-4 h-4 shrink-0" />
                        : <Check className="w-4 h-4 shrink-0" />
                    }
                    {toast.msg}
                </div>
            )}
        </main>
    );
}
