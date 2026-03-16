import React, { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import {
    ClipboardCheck,
    Search,
    MapPin,
    TrendingUp,
    AlertTriangle,
    FileText,
    Filter,
    ArrowRightLeft,
    CheckCircle2,
} from 'lucide-react';

// Mapeamento de status para classes Tailwind padrão
const STATUS_STYLE = {
    Validado: 'bg-green-500/10 text-green-600',
    Pendente: 'bg-yellow-500/10 text-yellow-600',
};

export default function InventoryAudit() {
    const { inventory } = useApp();

    // Estado local para contagens físicas controladas por input
    const [counts, setCounts] = useState(() =>
        Object.fromEntries(inventory.map(item => [item.id, item.countedStock ?? 0]))
    );

    // Filtro de busca
    const [filterQuery, setFilterQuery] = useState('');

    const filteredInventory = useMemo(() => {
        const q = filterQuery.trim().toLowerCase();
        if (!q) return inventory;
        return inventory.filter(item =>
            (item.part  ?? '').toLowerCase().includes(q) ||
            (item.sku   ?? '').toLowerCase().includes(q)
        );
    }, [inventory, filterQuery]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">4.1 Auditar Inventário</h1>
                    <p className="text-sm text-slate-500">Confronto entre saldo sistêmico (Omie) e contagem física</p>
                </div>
                <div className="flex gap-3">
                    {/* ⚠️ INTEGRAÇÃO NECESSÁRIA: GET /api/inventory/report/pdf */}
                    <button
                        aria-label="Gerar relatório PDF do inventário"
                        onClick={() => console.warn('Relatório PDF: INTEGRAÇÃO NECESSÁRIA')}
                        className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
                    >
                        <FileText className="w-4 h-4" aria-hidden="true" /> RELATÓRIO PDF
                    </button>
                    {/* ⚠️ INTEGRAÇÃO NECESSÁRIA: POST /api/inventory/count/new */}
                    <button
                        aria-label="Iniciar nova contagem de inventário"
                        onClick={() => console.warn('Nova Contagem: INTEGRAÇÃO NECESSÁRIA')}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <ClipboardCheck className="w-5 h-5" aria-hidden="true" /> NOVA CONTAGEM
                    </button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-green-500/10 text-green-600">
                        <TrendingUp className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Acuracidade Global</p>
                        <p className="text-2xl font-black">99.8%</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-red-500/10 text-red-500">
                        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Divergências Críticas</p>
                        <p className="text-2xl font-black">02</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                        <ArrowRightLeft className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Pendentes de Validação</p>
                        <p className="text-2xl font-black">15</p>
                    </div>
                </div>
            </div>

            {/* TABELA DE CONTAGEM */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Lista de Contagem — Amostragem de Hoje</h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Filtrar..."
                                value={filterQuery}
                                onChange={e => setFilterQuery(e.target.value)}
                                aria-label="Filtrar itens de inventário por produto ou SKU"
                                className="pr-8 pl-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-primary/30"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" aria-hidden="true" />
                        </div>
                        <button
                            aria-label="Abrir opções de filtro"
                            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors"
                        >
                            <Filter className="w-3 h-3" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white dark:bg-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th scope="col" className="px-6 py-4">Produto (SKU)</th>
                                <th scope="col" className="px-6 py-4">Endereço</th>
                                <th scope="col" className="px-6 py-4 text-center">Saldo Sistêmico</th>
                                <th scope="col" className="px-6 py-4 text-center">Contagem Física</th>
                                <th scope="col" className="px-6 py-4 text-center">Divergência</th>
                                <th scope="col" className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Nenhum item em contagem hoje
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((item) => {
                                    // Divergência calculada em tempo real a partir do input controlado
                                    const counted    = counts[item.id] ?? item.countedStock ?? 0;
                                    const divergence = counted - (item.systemStock ?? 0);

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-sm tracking-tight">{item.part ?? '—'}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{item.sku ?? '—'}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                                    <MapPin className="w-3 h-3" aria-hidden="true" /> {item.localizacao ?? 'RUA-12-04'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center font-black text-slate-400">
                                                {item.systemStock ?? 0}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                {/* Label visualmente oculto mas presente para leitores de tela */}
                                                <label htmlFor={`count-${item.id}`} className="sr-only">
                                                    Contagem física de {item.part ?? item.sku}
                                                </label>
                                                <input
                                                    id={`count-${item.id}`}
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={counted}
                                                    onChange={e => setCounts(prev => ({
                                                        ...prev,
                                                        [item.id]: Number(e.target.value)
                                                    }))}
                                                    className="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2 text-center font-black focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`font-black ${
                                                    divergence < 0 ? 'text-red-500'
                                                    : divergence > 0 ? 'text-green-600'
                                                    : 'text-slate-300'
                                                }`}>
                                                    {divergence > 0 && '+'}{divergence}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_STYLE[item.status] ?? 'bg-slate-100 text-slate-500'}`}>
                                                    {item.status ?? '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
