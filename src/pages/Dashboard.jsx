import React from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    Target,
    Layers,
    Box,
    TriangleAlert,
    Database,
} from 'lucide-react';
import StatsCard from '../components/ui/StatsCard';

// ─── KPI data ─────────────────────────────────────────────────────────────────
const kpiData = [
    {
        id: 'ocupacao',
        label: 'Ocupação Total',
        value: '78.4%',
        change: '+2.1%',
        trend: 'up',
        isPositiveChange: true,
        icon: Database,
        color: 'primary',
    },
    {
        id: 'modulos-vazios',
        label: 'Módulos Vazios',
        value: '142',
        change: '-12',
        trend: 'down',
        isPositiveChange: true,
        icon: Layers,
        color: 'success',
    },
    {
        id: 'pedidos-pendentes',
        label: 'Pedidos Pendentes',
        value: '45',
        change: '+8',
        trend: 'up',
        isPositiveChange: false,
        icon: Box,
        color: 'warning',
    },
    {
        id: 'divergencias',
        label: 'Divergências',
        value: '03',
        change: '-2',
        trend: 'down',
        isPositiveChange: true,
        icon: TriangleAlert,
        color: 'danger',
    },
];

const throughputData = [
    { name: '08:00', in: 120, out:  80 },
    { name: '10:00', in: 180, out: 140 },
    { name: '12:00', in: 150, out: 190 },
    { name: '14:00', in: 220, out: 160 },
    { name: '16:00', in: 190, out: 210 },
    { name: '18:00', in: 100, out: 110 },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
    return (
        <main className="space-y-4 p-2">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[var(--vp-border)]">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-black rounded-sm border border-white/10 shadow-lg">
                        <Database className="w-4 h-4 text-[var(--vp-primary)]" aria-hidden="true" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-tight text-black uppercase">1.1 Dashboard — Gestão à Vista</h1>
                        <p className="text-[10px] text-[var(--vp-text-label)] font-bold uppercase tracking-widest mt-0.5">
                            Centro de Distribuição VerticalParts — Real Time Analytics
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-sm border border-[var(--vp-border)] shadow-sm">
                    <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                    <span>SISTEMA ONLINE — ATUALIZADO AGORA</span>
                </div>
            </header>

            {/* KPI Grid */}
            <section aria-label="Principais indicadores de desempenho" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {kpiData.map((kpi) => (
                    <StatsCard key={kpi.id} {...kpi} />
                ))}
            </section>

            {/* Charts and Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Gráfico In/Out */}
                <section aria-label="Gráficos de fluxo" className="lg:col-span-2 bg-white p-4 rounded-sm border border-[var(--vp-border)] shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-[var(--vp-text-label)]">
                            Fluxo de Movimentação (In/Out)
                        </h2>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 font-black text-[9px] text-[#1769ba]">
                                <div className="w-1.5 h-1.5 rounded-sm bg-[#1769ba]" aria-hidden="true" /> ENTRADA
                            </div>
                            <div className="flex items-center gap-1.5 font-black text-[9px] text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-sm bg-slate-400" aria-hidden="true" /> SAÍDA
                            </div>
                        </div>
                    </div>
                    <div className="h-48 w-full font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={throughputData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                                    dy={5}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: '2px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        padding: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="in"  fill="#1769ba" radius={[2, 2, 0, 0]} barSize={16} name="Entrada" />
                                <Bar dataKey="out" fill="#94a3b8" radius={[2, 2, 0, 0]} barSize={16} name="Saída" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Card de Performance */}
                <section aria-label="Performance do armazém" className="bg-[#1A1A1A] p-4 rounded-sm border border-black flex flex-col justify-between overflow-hidden relative shadow-inner group">
                    <div className="relative z-10 border-b border-gray-800 pb-3 mb-4">
                        <h2 className="text-[9px] font-black uppercase tracking-widest text-[#FFD700] mb-1">
                            Indicador de Performance
                        </h2>
                        <div className="flex items-baseline justify-between">
                            <p className="text-3xl font-black text-white tracking-tighter">99.2%</p>
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Acuracidade</span>
                        </div>
                        
                        <Link
                            to="/estoque/consultar-kardex"
                            className="inline-block text-[9px] mt-2 text-gray-500 font-bold hover:text-[#FFD700] transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-[#FFD700]"
                        >
                            AUDITAR RELATÓRIO FULL KARDEX
                        </Link>
                    </div>

                    <div className="relative z-10 space-y-3">
                        {[
                            { label: 'Rua A / Mod 12', pct: 100 },
                            { label: 'Rua B / Mod 05', pct: 98.4 },
                        ].map(({ label, pct }) => (
                            <div key={label} className="space-y-1.5 focus-within:ring-1 focus-within:ring-amber-400 rounded-sm p-1 transition-all">
                                <div className="flex justify-between items-center text-[10px] font-bold text-white/70 uppercase tracking-wider">
                                    <span>{label}</span>
                                    <span className="text-[#FFD700] font-black">{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
                                    <div
                                        className="h-full bg-[#FFD700] transition-all duration-1000 ease-out"
                                        style={{ 
                                            width: `${pct}%`, 
                                            boxShadow: pct === 100 ? '0 0 12px rgba(255,215,0,0.3)' : 'none' 
                                        }}
                                        role="progressbar"
                                        aria-valuenow={pct}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Watermark decorativo */}
                    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700" aria-hidden="true">
                        <Database className="w-24 h-24 text-white" />
                    </div>
                </section>
            </div>
        </main>
    );
}
