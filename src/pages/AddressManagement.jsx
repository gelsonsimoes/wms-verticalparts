import React, { useState, useMemo } from 'react';
import {
    Search, Filter, Plus, MapPin, Edit2, Trash2,
    ChevronLeft, ChevronRight, Package, AlertTriangle,
    CheckCircle, XCircle, X, Save
} from 'lucide-react';

// ─── Geração Determinística dos 400 Endereços ────────────────────────────────
// R1 → PP1, PP2 | R2 → PP3, PP4 | R3 → PP5
// Níveis: A=Piso, B=Nível 2, C=Nível 3, D=Topo
// Posições: 1 a 20
// Total: 5 porta-paletes × 4 níveis × 20 posições = 400 endereços
const generateAddresses = () => {
    const streetPP = [
        { street: 'R1', pp: 'PP1' },
        { street: 'R1', pp: 'PP2' },
        { street: 'R2', pp: 'PP3' },
        { street: 'R2', pp: 'PP4' },
        { street: 'R3', pp: 'PP5' },
    ];
    const levels = [
        { key: 'A', name: 'Piso' },
        { key: 'B', name: 'Nível 2' },
        { key: 'C', name: 'Nível 3' },
        { key: 'D', name: 'Topo' },
    ];
    const types = ['Picking', 'Pulmão', 'Expedição', 'Armazenagem'];
    const updates = ['Agora', '5 min atrás', '30 min atrás', '1h atrás', '3h atrás', 'Hoje', 'Ontem'];

    // LCG com semente fixa — dados determinísticos sem Math.random()
    let seed = 73856;
    const rand = () => {
        seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
        return seed / 0x7fffffff;
    };

    const addresses = [];
    let id = 1;

    for (const { street, pp } of streetPP) {
        for (const { key: level, name: levelName } of levels) {
            for (let pos = 1; pos <= 20; pos++) {
                const code = `${street}_${pp}_${level}${pos}`;
                const occ = Math.floor(rand() * 101);
                const status = occ === 0 ? 'Vazio' : occ >= 90 ? 'Alerta' : 'Ocupado';
                const type = types[Math.floor(rand() * types.length)];
                const lastUpdate = updates[Math.floor(rand() * updates.length)];
                const items = Math.floor(occ / 8);

                addresses.push({
                    id,
                    code,
                    street,
                    pp,
                    level,
                    levelName,
                    position: pos,
                    type,
                    status,
                    occupation: occ,
                    items,
                    lastUpdate,
                });
                id++;
            }
        }
    }
    return addresses;
};

const INITIAL_DATA = generateAddresses();
const PAGE_SIZE = 20;

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const config = {
        Ocupado: { cls: 'bg-green-100 text-green-700 border border-green-200', icon: <CheckCircle className="w-3 h-3" /> },
        Vazio:   { cls: 'bg-slate-100 text-slate-500 border border-slate-200', icon: <XCircle className="w-3 h-3" /> },
        Alerta:  { cls: 'bg-red-100 text-red-600 border border-red-200', icon: <AlertTriangle className="w-3 h-3" /> },
    };
    const { cls, icon } = config[status] || config.Vazio;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${cls}`}>
            {icon} {status}
        </span>
    );
}

// ─── Modal de Cadastro / Edição ───────────────────────────────────────────────
function AddressModal({ addr, onSave, onClose }) {
    const [form, setForm] = useState(
        addr
            ? { ...addr }
            : { street: 'R1', pp: 'PP1', level: 'A', position: 1, type: 'Picking', status: 'Vazio', occupation: 0, items: 0, lastUpdate: 'Agora' }
    );

    // PP válidos por rua
    const ppMap = { R1: ['PP1', 'PP2'], R2: ['PP3', 'PP4'], R3: ['PP5'] };
    const availablePP = ppMap[form.street] || ['PP1'];

    const handleStreetChange = (e) => {
        const newStreet = e.target.value;
        const pps = ppMap[newStreet];
        setForm(f => ({ ...f, street: newStreet, pp: pps[0] }));
    };

    const generatedCode = `${form.street}_${form.pp}_${form.level}${form.position}`;

    const handleSave = () => {
        onSave({ ...form, code: generatedCode, id: addr?.id });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-yellow-600" />
                        </div>
                        <h2 className="font-black text-slate-900">{addr ? 'Editar Endereço' : 'Novo Endereço'}</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                {/* Campos */}
                <div className="p-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Rua</label>
                        <select
                            value={form.street}
                            onChange={handleStreetChange}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        >
                            <option>R1</option>
                            <option>R2</option>
                            <option>R3</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Porta-Palete</label>
                        <select
                            value={form.pp}
                            onChange={e => setForm(f => ({ ...f, pp: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        >
                            {availablePP.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nível</label>
                        <select
                            value={form.level}
                            onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        >
                            <option value="A">A — Piso</option>
                            <option value="B">B — Nível 2</option>
                            <option value="C">C — Nível 3</option>
                            <option value="D">D — Topo</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Posição (1–20)</label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={form.position}
                            onChange={e => setForm(f => ({ ...f, position: Math.min(20, Math.max(1, parseInt(e.target.value) || 1)) }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tipo</label>
                        <select
                            value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        >
                            <option>Picking</option>
                            <option>Pulmão</option>
                            <option>Expedição</option>
                            <option>Armazenagem</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                        <select
                            value={form.status}
                            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-yellow-400/20 outline-none"
                        >
                            <option>Ocupado</option>
                            <option>Vazio</option>
                            <option>Alerta</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Código Gerado</label>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-black text-yellow-600 tracking-tight">
                            {generatedCode}
                        </div>
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
                        className="px-5 py-2 text-sm font-bold bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl flex items-center gap-2 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        Salvar
                    </button>
                </div>
            </div>
        </div>
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
    const [showFilters, setShowFilters] = useState(false);

    // ── Dados filtrados ──────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return data.filter(a =>
            (!q || a.code.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)) &&
            (!filterStreet || a.street === filterStreet) &&
            (!filterPP || a.pp === filterPP) &&
            (!filterLevel || a.level === filterLevel) &&
            (!filterStatus || a.status === filterStatus)
        );
    }, [data, search, filterStreet, filterPP, filterLevel, filterStatus]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // ── Estatísticas ─────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: data.length,
        ocupado: data.filter(a => a.status === 'Ocupado').length,
        vazio: data.filter(a => a.status === 'Vazio').length,
        alerta: data.filter(a => a.status === 'Alerta').length,
    }), [data]);

    // ── CRUD ─────────────────────────────────────────────────────────────────
    const handleSave = (addr) => {
        if (addr.id) {
            setData(d => d.map(a => a.id === addr.id ? { ...a, ...addr } : a));
        } else {
            const newId = Math.max(0, ...data.map(a => a.id)) + 1;
            setData(d => [...d, { ...addr, id: newId, levelName: { A: 'Piso', B: 'Nível 2', C: 'Nível 3', D: 'Topo' }[addr.level] }]);
        }
        setModal(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Confirma a exclusão deste endereço?')) {
            setData(d => d.filter(a => a.id !== id));
        }
    };

    const resetFilters = () => {
        setSearch('');
        setFilterStreet('');
        setFilterPP('');
        setFilterLevel('');
        setFilterStatus('');
        setPage(1);
    };

    const hasActiveFilters = filterStreet || filterPP || filterLevel || filterStatus;

    // PP disponíveis baseados na rua selecionada
    const ppOptions = filterStreet === 'R1' ? ['PP1', 'PP2']
        : filterStreet === 'R2' ? ['PP3', 'PP4']
        : filterStreet === 'R3' ? ['PP5']
        : ['PP1', 'PP2', 'PP3', 'PP4', 'PP5'];

    return (
        <div className="space-y-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">Gestão de Endereços</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Armazém VerticalParts &mdash; Sistema R_PP_NívelPosição
                    </p>
                </div>
                <button
                    onClick={() => setModal('add')}
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-yellow-400/20 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    NOVO ENDEREÇO
                </button>
            </div>

            {/* ── Cards de Estatísticas ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Total',
                        value: stats.total,
                        border: 'border-l-4 border-l-slate-300',
                        icon: <MapPin className="w-5 h-5 text-slate-400" />,
                        desc: 'endereços cadastrados',
                    },
                    {
                        label: 'Ocupados',
                        value: stats.ocupado,
                        border: 'border-l-4 border-l-green-500',
                        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
                        desc: `${Math.round((stats.ocupado / stats.total) * 100)}% do armazém`,
                    },
                    {
                        label: 'Vazios',
                        value: stats.vazio,
                        border: 'border-l-4 border-l-slate-200',
                        icon: <Package className="w-5 h-5 text-slate-300" />,
                        desc: 'disponíveis',
                    },
                    {
                        label: 'Em Alerta',
                        value: stats.alerta,
                        border: 'border-l-4 border-l-red-500',
                        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
                        desc: 'acima de 90% de capacidade',
                    },
                ].map(({ label, value, border, icon, desc }) => (
                    <div
                        key={label}
                        className={`bg-white rounded-2xl border border-slate-200 p-5 flex items-start justify-between shadow-sm ${border}`}
                    >
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                            <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
                            <p className="text-[10px] text-slate-400 mt-1.5">{desc}</p>
                        </div>
                        <div className="mt-1">{icon}</div>
                    </div>
                ))}
            </div>

            {/* ── Barra de Busca e Filtros ───────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[240px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Buscar por código (ex: R1_PP1) ou tipo (ex: Picking)..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-400/30 transition-all"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg border transition-colors ${
                            showFilters || hasActiveFilters
                                ? 'bg-yellow-400 border-yellow-400 text-slate-900'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        FILTROS
                        {hasActiveFilters && (
                            <span className="bg-slate-900 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                                {[filterStreet, filterPP, filterLevel, filterStatus].filter(Boolean).length}
                            </span>
                        )}
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                        >
                            <X className="w-3 h-3" /> Limpar filtros
                        </button>
                    )}
                </div>

                {/* Filtros expandidos */}
                {showFilters && (
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Rua</p>
                            <select
                                value={filterStreet}
                                onChange={e => { setFilterStreet(e.target.value); setFilterPP(''); setPage(1); }}
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-yellow-400/20"
                            >
                                <option value="">Todas</option>
                                <option>R1</option>
                                <option>R2</option>
                                <option>R3</option>
                            </select>
                        </div>

                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Porta-Palete</p>
                            <select
                                value={filterPP}
                                onChange={e => { setFilterPP(e.target.value); setPage(1); }}
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-yellow-400/20"
                            >
                                <option value="">Todos</option>
                                {ppOptions.map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>

                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Nível</p>
                            <select
                                value={filterLevel}
                                onChange={e => { setFilterLevel(e.target.value); setPage(1); }}
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-yellow-400/20"
                            >
                                <option value="">Todos</option>
                                <option value="A">A — Piso</option>
                                <option value="B">B — Nível 2</option>
                                <option value="C">C — Nível 3</option>
                                <option value="D">D — Topo</option>
                            </select>
                        </div>

                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                            <select
                                value={filterStatus}
                                onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-yellow-400/20"
                            >
                                <option value="">Todos</option>
                                <option>Ocupado</option>
                                <option>Vazio</option>
                                <option>Alerta</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Tabela de Endereços ────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
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
                                                <MapPin className="w-3.5 h-3.5 text-yellow-600" />
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
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setModal(addr)}
                                                title="Editar"
                                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(addr.id)}
                                                title="Excluir"
                                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
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
                        Mostrando <span className="text-slate-600 font-black">{Math.min((safePage - 1) * PAGE_SIZE + 1, filtered.length)}</span>–<span className="text-slate-600 font-black">{Math.min(safePage * PAGE_SIZE, filtered.length)}</span> de <span className="text-slate-600 font-black">{filtered.length}</span> endereços
                    </p>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(1)}
                            disabled={safePage === 1}
                            className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            «
                        </button>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </button>

                        <span className="text-[11px] font-black text-slate-600 px-3">
                            {safePage} / {totalPages}
                        </span>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={safePage === totalPages}
                            className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            »
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Modal ──────────────────────────────────────────────────────── */}
            {modal !== null && (
                <AddressModal
                    addr={modal === 'add' ? null : modal}
                    onSave={handleSave}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}
