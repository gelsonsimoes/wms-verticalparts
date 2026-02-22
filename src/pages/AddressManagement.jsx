import React, { useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    MapPin,
    Package,
    ArrowRight,
    TrendingUp,
    ChevronRight
} from 'lucide-react';

const addressData = [
    { id: 1, code: 'RUA A-12-04', type: 'Picking', status: 'Ocupado', occupation: '85%', items: 12, lastUpdate: '10 min atrás' },
    { id: 2, code: 'RUA A-12-05', type: 'Pulmão', status: 'Vazio', occupation: '0%', items: 0, lastUpdate: '2 dias atrás' },
    { id: 3, code: 'RUA B-05-01', type: 'Picking', status: 'Ocupado', occupation: '40%', items: 4, lastUpdate: '1 hora atrás' },
    { id: 4, code: 'RUA B-05-02', type: 'Picking', status: 'Alerta', occupation: '95%', items: 25, lastUpdate: 'Agora' },
    { id: 5, code: 'EXP-01', type: 'Expedição', status: 'Ocupado', occupation: '60%', items: 8, lastUpdate: '30 min atrás' },
];

export default function AddressManagement() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Gestão de Endereços</h1>
                    <p className="text-sm text-slate-500">Controle e auditoria de posições no armazém</p>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5" />
                    NOVO ENDEREÇO
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[240px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filtrar por código ou tipo..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
                    <Filter className="w-4 h-4" />
                    FILTROS
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                <th className="px-6 py-4">Endereço</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Ocupação</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Última Movimentação</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {addressData.map((addr) => (
                                <tr key={addr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                                                <MapPin className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="font-bold text-sm tracking-tight">{addr.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-slate-500">{addr.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 min-w-[120px]">
                                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${parseInt(addr.occupation) > 90 ? 'bg-danger' :
                                                            parseInt(addr.occupation) > 70 ? 'bg-warning' : 'bg-success'
                                                        }`}
                                                    style={{ width: addr.occupation }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{addr.occupation}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${addr.status === 'Vazio' ? 'bg-slate-100 text-slate-500' :
                                                addr.status === 'Alerta' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                                            }`}>
                                            {addr.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-slate-400">{addr.lastUpdate}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Mostrando 5 de 1,240 endereços</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-50" disabled>ANTERIOR</button>
                        <button className="px-3 py-1 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors">PRÓXIMO</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
