import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    ClipboardCheck,
    Search,
    MapPin,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    FileText,
    BarChart2,
    Filter,
    ArrowRightLeft
} from 'lucide-react';

export default function InventoryAudit() {
    const { inventory } = useApp();
    const [showReport, setShowReport] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Gestão de Inventário Cíclico</h1>
                    <p className="text-sm text-slate-500">Confronto entre saldo sistêmico (Omie) e contagem física</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <FileText className="w-4 h-4" /> RELATÓRIO PDF
                    </button>
                    <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                        <ClipboardCheck className="w-5 h-5" /> NOVA CONTAGEM
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-success/10 text-success">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Acuracidade Global</p>
                        <p className="text-2xl font-black">99.8%</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-danger/10 text-danger">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Divergências Críticas</p>
                        <p className="text-2xl font-black">02</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                        <ArrowRightLeft className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Pendentes de Validação</p>
                        <p className="text-2xl font-black">15</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Lista de Contagem - Amostragem de Hoje</h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input type="text" placeholder="Filtrar..." className="pl-8 pr-4 py-1.5 bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] outline-none" />
                        </div>
                        <button className="p-2 bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors">
                            <Filter className="w-3 h-3" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white dark:bg-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4">Produto (SKU)</th>
                                <th className="px-6 py-4">Endereço</th>
                                <th className="px-6 py-4 text-center">Saldo Sistêmico</th>
                                <th className="px-6 py-4 text-center">Contagem Física</th>
                                <th className="px-6 py-4 text-center">Divergência</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <p className="font-bold text-sm tracking-tight">{item.part}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.sku}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                            <MapPin className="w-3 h-3" /> RUA-12-04
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center font-black text-slate-400">{item.systemStock}</td>
                                    <td className="px-6 py-5 text-center">
                                        <input
                                            type="number"
                                            className="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2 text-center font-black focus:ring-2 focus:ring-primary/20 outline-none"
                                            defaultValue={item.countedStock}
                                        />
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`font-black ${item.divergence < 0 ? 'text-danger' : item.divergence > 0 ? 'text-success' : 'text-slate-300'}`}>
                                            {item.divergence > 0 && '+'}{item.divergence}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Validado' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
