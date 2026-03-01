import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line
} from 'recharts';
import {
    Target,
    Layers,
    Box,
    TriangleAlert,
    ArrowUpRight,
    ArrowDownRight,
    Database
} from 'lucide-react';

const kpiData = [
    { label: 'Ocupação Total', value: '78.4%', change: '+2.1%', trend: 'up', icon: Database, color: 'primary' },
    { label: 'Módulos Vazios', value: '142', change: '-12', trend: 'down', icon: Layers, color: 'success' },
    { label: 'Pedidos Pendentes', value: '45', change: '+8', trend: 'up', icon: Box, color: 'warning' },
    { label: 'Divergências', value: '03', change: '-2', trend: 'down', icon: TriangleAlert, color: 'danger' },
];

const throughputData = [
    { name: '08:00', in: 120, out: 80 },
    { name: '10:00', in: 180, out: 140 },
    { name: '12:00', in: 150, out: 190 },
    { name: '14:00', in: 220, out: 160 },
    { name: '16:00', in: 190, out: 210 },
    { name: '18:00', in: 100, out: 110 },
];

const StatsCard = ({ label, value, change, trend, icon: Icon, color }) => (
    <div className="bg-white p-3 rounded-sm border border-[var(--vp-border)] hover:border-[var(--vp-primary)] transition-colors">
        <div className="flex justify-between items-start mb-2">
            <div className={`p-1.5 rounded-sm bg-gray-50 border border-gray-100`}>
                <Icon className={`w-4 h-4 text-black`} />
            </div>
            <div className={`badge-tech ${trend === 'up' ? 'badge-success' : 'badge-error'}`}>
                {trend === 'up' ? '▲' : '▼'} {change}
            </div>
        </div>
        <div>
            <p className="text-[10px] font-black text-[var(--vp-text-label)] uppercase tracking-widest mb-0.5">{label}</p>
            <h3 className="text-lg font-black text-black leading-tight tracking-tight">{value}</h3>
        </div>
    </div>
);

export default function Dashboard() {
    return (
        <div className="space-y-4 p-2">
            {/* Header Section - D365 Style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[var(--vp-border)]">
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-black rounded-sm">
                      <Database className="w-4 h-4 text-[var(--vp-primary)]" />
                   </div>
                   <div>
                        <h1 className="text-sm font-black tracking-tight text-black uppercase">Gestão à Vista</h1>
                        <p className="text-[10px] text-[var(--vp-text-label)] font-bold uppercase tracking-widest mt-0.5">Centro de Distribuição VerticalParts - Real Time Analytics</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-sm border border-[var(--vp-border)]">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    SISTEMA ONLINE - ATUALIZADO AGORA
                </div>
            </div>

            {/* KPI Grid - HIGH DENSITY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {kpiData.map((kpi) => (
                    <StatsCard key={kpi.label} {...kpi} />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white p-4 rounded-sm border border-[var(--vp-border)]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--vp-text-label)]">Fluxo de Movimentação (In/Out)</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 font-black text-[9px] text-[#1769ba]">
                                <div className="w-1.5 h-1.5 rounded-sm bg-[#1769ba]"></div> ENTRADA
                            </div>
                            <div className="flex items-center gap-1.5 font-black text-[9px] text-gray-300">
                                <div className="w-1.5 h-1.5 rounded-sm bg-gray-300"></div> SAÍDA
                            </div>
                        </div>
                    </div>
                    <div className="h-48 w-full font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={throughputData}>
                                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                                    dy={5}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: '2px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        padding: '8px'
                                    }}
                                />
                                <Bar dataKey="in" fill="#1769ba" radius={[1, 1, 0, 0]} barSize={16} />
                                <Bar dataKey="out" fill="#e2e8f0" radius={[1, 1, 0, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1A1A1A] p-4 rounded-sm border border-black flex flex-col justify-between overflow-hidden relative shadow-inner">
                    <div className="relative z-10 border-b border-gray-800 pb-3 mb-4">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-[#FFD700] mb-1">Indicador de Performance</h3>
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-3xl font-black text-white tracking-tighter">99.2%</h2>
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Acuracidade</span>
                        </div>
                        <p className="text-[9px] mt-2 text-gray-500 font-bold decoration-gray-600 underline underline-offset-4 cursor-pointer hover:text-[#FFD700]">AUDITAR RELATÓRIO FULL KARDEX</p>
                    </div>

                    <div className="relative z-10 space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-black text-white uppercase tracking-wider">
                                <span>Rua A / Mod 12</span>
                                <span className="text-[#FFD700]">100%</span>
                            </div>
                            <div className="h-1 w-full bg-gray-800 rounded-sm overflow-hidden border border-gray-700">
                                <div className="h-full bg-[#FFD700] w-full shadow-[0_0_8px_rgba(255,215,0,0.5)]"></div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-black text-white/70 uppercase tracking-wider">
                                <span>Rua B / Mod 05</span>
                                <span className="text-[#FFD700]">98.4%</span>
                            </div>
                            <div className="h-1 w-full bg-gray-800 rounded-sm overflow-hidden border border-gray-700">
                                <div className="h-full bg-[#FFD700] w-[98.4%]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative element (D365 Style Watermark) */}
                    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                        <Database className="w-24 h-24 text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
}
