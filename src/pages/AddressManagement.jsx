import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Filter, Plus, MapPin, Edit2, Trash2,
    ChevronLeft, ChevronRight, Package, AlertTriangle,
    CheckCircle, XCircle, X, Save, AlertCircle,
} from 'lucide-react';

// ─── Constantes de Domínio ───────────────────────────────────────────────────
// Altere APENAS aqui se o armazém expandir. Nunca repita esses valores.

const STREETS = ['R1', 'R2', 'R3'];

/** Porta-paletes válidos por rua. Fonte única de verdade para modal E filtros. */
const PP_MAP = {
    R1: ['PP1', 'PP2'],
    R2: ['PP3', 'PP4'],
    R3: ['PP5'],
};

const LEVELS = [
    { key: 'A', name: 'Piso' },
    { key: 'B', name: 'Nível 2' },
    { key: 'C', name: 'Nível 3' },
    { key: 'D', name: 'Topo' },
];

/** Mapa nível key → nome. Fonte única para geração e CRUD. */
const LEVEL_NAME = Object.fromEntries(LEVELS.map(l => [l.key, l.name]));

const TYPES = ['Picking', 'Pulmão', 'Expedição', 'Armazenagem'];

const STATUSES = ['Ocupado', 'Vazio', 'Alerta'];

const LAST_UPDATES = ['Agora', '5 min atrás', '30 min atrás', '1h atrás', '3h atrás', 'Hoje', 'Ontem'];

/** Posições por porta-palete */
const MAX_POSITION = 20;

const PAGE_SIZE = 20;

// ─── Geração dos 400 Endereços (Math.random substituindo LCG desnecessário) ──
/*
  Dados puramente mock para desenvolvimento. Em produção serão
  substituídos por uma chamada REST, então não há razão para
  pseudo-aleatoriedade determinística complexa.
*/
const generateAddresses = () => {
    const addresses = [];
    let id = 1;

    for (const street of STREETS) {
        for (const pp of PP_MAP[street]) {
            for (const level of LEVELS) {
                for (let pos = 1; pos <= MAX_POSITION; pos++) {
                    // Status e occupation acoplados: evita "Alerta" com 5% ou "Vazio" com 80%
                    const statusRoll = Math.random();
                    let status, occupation;

                    if (statusRoll < 0.12) {
                        status = 'Vazio';
                        occupation = 0;
                    } else if (statusRoll < 0.26) {
                        status = 'Alerta';
                        occupation = Math.floor(Math.random() * 10) + 90; // 90-100%
                    } else {
                        status = 'Ocupado';
                        occupation = Math.floor(Math.random() * 89) + 1; // 1-89%
                    }

                    addresses.push({
                        id,
                        code: `${street}_${pp}_${level.key}${pos}`,
                        street,
                        pp,
                        level: level.key,
                        levelName: LEVEL_NAME[level.key], // única fonte de verdade
                        position: pos,
                        type: TYPES[Math.floor(Math.random() * TYPES.length)],
                        status,
                        occupation,
                        items: Math.floor(occupation / 8),
                        lastUpdate: LAST_UPDATES[Math.floor(Math.random() * LAST_UPDATES.length)],
                    });
                    id++;
                }
            }
        }
    }
    return addresses;
};

const INITIAL_DATA = generateAddresses();

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    Ocupado: { cls: 'bg-green-100 text-green-700 border border-green-200', icon: <CheckCircle className="w-3 h-3" aria-hidden="true" /> },
    Vazio:   { cls: 'bg-slate-100 text-slate-500 border border-slate-200', icon: <XCircle className="w-3 h-3" aria-hidden="true" /> },
    Alerta:  { cls: 'bg-red-100 text-red-600 border border-red-200',   icon: <AlertTriangle className="w-3 h-3" aria-hidden="true" /> },
};

function StatusBadge({ status }) {
    const { cls, icon } = STATUS_CONFIG[status] || STATUS_CONFIG.Vazio;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${cls}`}>
            {icon} {status}
        </span>
    );
}

// ─── Modal de Confirmação de Exclusão ─────────────────────────────────────────
function DeleteModal({ code, onConfirm, onClose }) {
    // Foco automático no botão de cancelar para evitar exclusão acidental por Enter
    const cancelRef = useRef(null);
    useEffect(() => { cancelRef.current?.focus(); }, []);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 id="delete-title" className="font-black text-slate-900 text-sm">
                            Excluir endereço?
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">{code}</p>
                    </div>
                </div>
                <p className="text-xs text-slate-500">
                    Esta ação não pode ser desfeita. O endereço será removido permanentemente do armazém.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        ref={cancelRef}
                        onClick={onClose}
                        className="py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition-colors"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Modal de Cadastro / Edição ───────────────────────────────────────────────
function AddressModal({ addr, existingCodes, onSave, onClose }) {
    const isEdit = !!addr?.id;

    const [form, setForm] = useState(
        isEdit
            ? { ...addr }
            : { street: 'R1', pp: 'PP1', level: 'A', position: 1, type: 'Picking', status: 'Vazio', occupation: 0, items: 0, lastUpdate: 'Agora' }
    );
    const [codeError, setCodeError] = useState('');

    // PP válidos derivados do ppMap canônico — nunca duplicado
    const availablePP = PP_MAP[form.street] || ['PP1'];

    const handleStreetChange = (e) => {
        const newStreet = e.target.value;
        setForm(f => ({ ...f, street: newStreet, pp: PP_MAP[newStreet][0] }));
    };

    // levelName derivado do mapa canônico — nunca inline hardcoded
    const generatedCode = `${form.street}_${form.pp}_${form.level}${form.position}`;

    const handleSave = () => {
        // Validação de duplicata (ignora o próprio endereço ao editar)
        const isDuplicate = existingCodes.some(
            c => c.code === generatedCode && c.id !== addr?.id
        );
        if (isDuplicate) {
            setCodeError(`O endereço "${generatedCode}" já existe no armazém.`);
            return;
        }
        setCodeError('');
        onSave({
            ...form,
            code: generatedCode,
            levelName: LEVEL_NAME[form.level], // sempre derivado do mapa canônico
            id: addr?.id,
        });
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-yellow-600" aria-hidden="true" />
                        </div>
                        <h2 id="modal-title" className="font-black text-slate-900">
                            {isEdit ? 'Editar Endereço' : 'Novo Endereço'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Fechar modal"
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                {/* Campos */}
                <div className="p-6 grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="field-street" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Rua
                        </label>
                        <select
                            id="field-street"
                            value={form.street}
                            onChange={handleStreetChange}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        >
                            {STREETS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="field-pp" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Porta-Palete
                        </label>
                        <select
                            id="field-pp"
                            value={form.pp}
                            onChange={e => setForm(f => ({ ...f, pp: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        >
                            {availablePP.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="field-level" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Nível
                        </label>
                        <select
                            id="field-level"
                            value={form.level}
                            onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        >
                            {LEVELS.map(l => (
                                <option key={l.key} value={l.key}>{l.key} — {l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="field-position" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Posição (1–{MAX_POSITION})
                        </label>
                        <input
                            id="field-position"
                            type="number"
                            min="1"
                            max={MAX_POSITION}
                            value={form.position}
                            onChange={e => setForm(f => ({ ...f, position: Math.min(MAX_POSITION, Math.max(1, parseInt(e.target.value) || 1)) }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="field-type" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Tipo
                        </label>
                        <select
                            id="field-type"
                            value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        >
                            {TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="field-status" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Status
                        </label>
                        <select
                            id="field-status"
                            value={form.status}
                            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        >
                            {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Código Gerado
                        </label>
                        <div className={`border rounded-lg px-4 py-2.5 text-sm font-black tracking-tight transition-colors ${
                            codeError
                                ? 'bg-red-50 border-red-300 text-red-600'
                                : 'bg-slate-50 border-slate-200 text-yellow-600'
                        }`}>
                            {generatedCode}
                        </div>
                        {codeError && (
                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                                {codeError}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 text-sm font-bold bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 outline-none"
                    >
                        <Save className="w-4 h-4" aria-hidden="true" />
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Paginação com números intermediários ─────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    // Gera array de páginas visíveis: sempre mostra primeira, última e janela de ±2
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '…') {
            pages.push('…');
        }
    }

    return (
        <nav aria-label="Paginação" className="flex items-center gap-1">
            <button
                onClick={() => onPageChange(1)}
                disabled={page === 1}
                aria-label="Primeira página"
                className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                «
            </button>
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                aria-label="Página anterior"
                className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>

            {pages.map((p, i) =>
                p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-slate-300 text-[10px] select-none">…</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        aria-current={p === page ? 'page' : undefined}
                        className={`w-7 h-7 text-[11px] font-black rounded-lg transition-colors ${
                            p === page
                                ? 'bg-yellow-400 text-slate-900'
                                : 'text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                aria-label="Próxima página"
                className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={page === totalPages}
                aria-label="Última página"
                className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                »
            </button>
        </nav>
    );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function AddressManagement() {
    const [data, setData] = useState(INITIAL_DATA);
    const [search, setSearch] = useState('');
    const [filterStreet, setFilterStreet] = useState('');
    const [filterPP, setFilterPP] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null); // null | 'add' | addressObject
    const [deleteTarget, setDeleteTarget] = useState(null); // null | addressObject
    const [showFilters, setShowFilters] = useState(false);

    // ── Filtro — sem useMemo: 400 items × string ops = ~0.1ms, overhead menor que memo
    const q = search.toLowerCase().trim();
    const filtered = data.filter(a =>
        (!q || a.code.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)) &&
        (!filterStreet || a.street.toLowerCase().includes(filterStreet.toLowerCase())) &&
        (!filterPP || a.pp.toLowerCase().includes(filterPP.toLowerCase())) &&
        (!filterLevel || a.level.toLowerCase().includes(filterLevel.toLowerCase())) &&
        (!filterStatus || a.status.toLowerCase().includes(filterStatus.toLowerCase()))
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    // Sincronizar page quando filtro reduz totalPages — estado real corrigido, não só UI
    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setTimeout(() => setPage(totalPages), 0);
        }
    }, [totalPages, page]);

    const currentPage = Math.min(page, Math.max(1, totalPages));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // ── Estatísticas (sem useMemo, dados globais, não dependem de filtros)
    const stats = {
        total:   data.length,
        ocupado: data.filter(a => a.status === 'Ocupado').length,
        vazio:   data.filter(a => a.status === 'Vazio').length,
        alerta:  data.filter(a => a.status === 'Alerta').length,
    };

    // ── PP disponíveis nos filtros — derivado de PP_MAP, sem duplicação
    const ppOptions = filterStreet
        ? PP_MAP[filterStreet] || []
        : Object.values(PP_MAP).flat();

    // ── CRUD ─────────────────────────────────────────────────────────────────
    const handleSave = (addr) => {
        if (addr.id) {
            setData(d => d.map(a => a.id === addr.id ? { ...a, ...addr } : a));
        } else {
            const newId = Math.max(0, ...data.map(a => a.id)) + 1;
            setData(d => [...d, { ...addr, id: newId }]);
        }
        setModal(null);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setData(d => d.filter(a => a.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    const resetFilters = () => {
        setSearch('');
        setFilterStreet('');
        setFilterPP('');
        setFilterLevel('');
        setFilterStatus('');
        setPage(1);
    };

    const hasActiveFilters = !!(filterStreet || filterPP || filterLevel || filterStatus);

    // Para passar ao modal de edição: lista de {id, code} para validação de duplicata
    const existingCodes = data.map(a => ({ id: a.id, code: a.code }));

    return (
        <div className="space-y-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">7.3 Gestão de Endereços</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Armazém VerticalParts &mdash; Sistema R_PP_NívelPosição
                    </p>
                </div>
                <button
                    onClick={() => setModal('add')}
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-yellow-400/20 self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 outline-none"
                >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    NOVO ENDEREÇO
                </button>
            </div>

            {/* ── Cards de Estatísticas ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total',     value: stats.total,   border: 'border-l-4 border-l-slate-300',  icon: <MapPin className="w-5 h-5 text-slate-400" />,     desc: 'endereços cadastrados' },
                    { label: 'Ocupados',  value: stats.ocupado, border: 'border-l-4 border-l-green-500',  icon: <CheckCircle className="w-5 h-5 text-green-500" />, desc: `${Math.round((stats.ocupado / stats.total) * 100)}% do armazém` },
                    { label: 'Vazios',    value: stats.vazio,   border: 'border-l-4 border-l-slate-200',  icon: <Package className="w-5 h-5 text-slate-300" />,     desc: 'disponíveis' },
                    { label: 'Em Alerta', value: stats.alerta,  border: 'border-l-4 border-l-red-500',    icon: <AlertTriangle className="w-5 h-5 text-red-500" />, desc: 'acima de 90% de capacidade' },
                ].map(({ label, value, border, icon, desc }) => (
                    <div key={label} className={`bg-white rounded-2xl border border-slate-200 p-5 flex items-start justify-between shadow-sm ${border}`}>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                            <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
                            <p className="text-[10px] text-slate-400 mt-1.5">{desc}</p>
                        </div>
                        <div className="mt-1" aria-hidden="true">{icon}</div>
                    </div>
                ))}
            </div>

            {/* ── Barra de Busca e Filtros ───────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[240px] relative">
                        <input
                            type="search"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Buscar por código (ex: R1_PP1) ou tipo..."
                            aria-label="Buscar endereços"
                            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-400/30 transition-all"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        aria-expanded={showFilters}
                        aria-controls="filter-panel"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg border transition-colors ${
                            showFilters || hasActiveFilters
                                ? 'bg-yellow-400 border-yellow-400 text-slate-900'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Filter className="w-4 h-4" aria-hidden="true" />
                        FILTROS
                        {hasActiveFilters && (
                            <span className="bg-slate-900 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center" aria-label="filtros ativos">
                                {[filterStreet, filterPP, filterLevel, filterStatus].filter(Boolean).length}
                            </span>
                        )}
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                            aria-label="Limpar todos os filtros"
                        >
                            <X className="w-3 h-3" aria-hidden="true" /> Limpar filtros
                        </button>
                    )}
                </div>

                {/* Filtros expandidos */}
                {showFilters && (
                    <div id="filter-panel" className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
                        {/* Rua */}
                        <div>
                            <label htmlFor="flt-street" className="text-[9px] font-black text-slate-400 uppercase block mb-1">Rua</label>
                            <input
                                id="flt-street"
                                type="text"
                                value={filterStreet}
                                onChange={e => { setFilterStreet(e.target.value); setFilterPP(''); setPage(1); }}
                                placeholder="Ex: R1, ALMOX..."
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-950 bg-white outline-none focus:ring-2 focus:ring-yellow-400/20 w-32"
                            />
                        </div>

                        {/* Porta-Palete */}
                        <div>
                            <label htmlFor="flt-pp" className="text-[9px] font-black text-slate-400 uppercase block mb-1">Porta-Palete</label>
                            <input
                                id="flt-pp"
                                type="text"
                                value={filterPP}
                                onChange={e => { setFilterPP(e.target.value); setPage(1); }}
                                placeholder="Ex: PP1, ARM01..."
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-950 bg-white outline-none focus:ring-2 focus:ring-yellow-400/20 w-32"
                            />
                        </div>

                        {/* Nível */}
                        <div>
                            <label htmlFor="flt-level" className="text-[9px] font-black text-slate-400 uppercase block mb-1">Nível</label>
                            <input
                                id="flt-level"
                                type="text"
                                value={filterLevel}
                                onChange={e => { setFilterLevel(e.target.value); setPage(1); }}
                                placeholder="Ex: A, N1, Topo..."
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-950 bg-white outline-none focus:ring-2 focus:ring-yellow-400/20 w-32"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label htmlFor="flt-status" className="text-[9px] font-black text-slate-400 uppercase block mb-1">Status</label>
                            <input
                                id="flt-status"
                                type="text"
                                value={filterStatus}
                                onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                                placeholder="Ex: Vazio, Ocupado..."
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-950 bg-white outline-none focus:ring-2 focus:ring-yellow-400/20 w-36"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Tabela de Endereços ────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left" aria-label={`${filtered.length} endereços encontrados`}>
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                <th className="px-5 py-3">Endereço</th>
                                <th className="px-5 py-3">Rua / PP</th>
                                <th className="px-5 py-3">Nível</th>
                                <th className="px-5 py-3">Tipo</th>
                                <th className="px-5 py-3">Ocupação</th>
                                <th className="px-5 py-3">Itens</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Atualizado</th>
                                <th className="px-5 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-5 py-12 text-center text-slate-400 text-sm">
                                        Nenhum endereço encontrado com os filtros aplicados.
                                    </td>
                                </tr>
                            ) : paginated.map(addr => (
                                <tr key={addr.id} className="hover:bg-slate-50/60 transition-colors group">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-3.5 h-3.5 text-yellow-600" aria-hidden="true" />
                                            </div>
                                            <span className="font-black text-sm tracking-tight text-slate-800">{addr.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-slate-600 font-semibold">
                                        {addr.street} / {addr.pp}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-xs font-bold text-slate-500">
                                            {addr.level} — {addr.levelName}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-slate-600">{addr.type}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2 min-w-[90px]">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={addr.occupation} aria-valuemin={0} aria-valuemax={100} aria-label={`Ocupação ${addr.occupation}%`}>
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        addr.occupation >= 90
                                                            ? 'bg-red-500'
                                                            : addr.occupation >= 60
                                                            ? 'bg-yellow-400'
                                                            : 'bg-green-500'
                                                    }`}
                                                    style={{ width: `${addr.occupation}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 w-8 text-right">
                                                {addr.occupation}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-slate-500 font-medium">{addr.items}</td>
                                    <td className="px-5 py-3">
                                        <StatusBadge status={addr.status} />
                                    </td>
                                    <td className="px-5 py-3 text-xs text-slate-400">{addr.lastUpdate}</td>
                                    <td className="px-5 py-3">
                                        {/* Visível a teclado via focus-within; visível ao mouse via group-hover */}
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setModal(addr)}
                                                aria-label={`Editar ${addr.code}`}
                                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-yellow-400 outline-none"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(addr)}
                                                aria-label={`Excluir ${addr.code}`}
                                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-400 outline-none"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Paginação ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-[11px] text-slate-400 font-semibold">
                        Mostrando{' '}
                        <span className="text-slate-600 font-black">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}</span>
                        –
                        <span className="text-slate-600 font-black">{Math.min(page * PAGE_SIZE, filtered.length)}</span>
                        {' '}de{' '}
                        <span className="text-slate-600 font-black">{filtered.length}</span> endereços
                    </p>

                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>

            {/* ── Modais ──────────────────────────────────────────────────────── */}
            {modal !== null && (
                <AddressModal
                    addr={modal === 'add' ? null : modal}
                    existingCodes={existingCodes}
                    onSave={handleSave}
                    onClose={() => setModal(null)}
                />
            )}

            {deleteTarget && (
                <DeleteModal
                    code={deleteTarget.code}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
