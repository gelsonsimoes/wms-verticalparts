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
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl bg-${color}/10 border border-${color}/20`}>
                <Icon className={`w-5 h-5 text-${color}`} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}>
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change}
            </div>
        </div>
        <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{value}</h3>
        </div>
    </div>
);

export default function Dashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight border-l-4 border-accent pl-4">Gestão à Vista</h1>
                    <p className="text-sm text-slate-500">Monitoramento em tempo real do CD VerticalParts</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    ATUALIZADO AGORA
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiData.map((kpi) => (
                    <StatsCard key={kpi.label} {...kpi} />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Fluxo de Movimentação (In/Out)</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 font-bold text-[10px] text-primary">
                                <div className="w-2 h-2 rounded-full bg-primary"></div> ENTRADA
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-[10px] text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div> SAÍDA
                            </div>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={throughputData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="in" fill="#1769ba" radius={[4, 4, 0, 0]} barSize={24} />
                                <Bar dataKey="out" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-primary p-6 rounded-2xl text-white flex flex-col justify-between overflow-hidden relative">
                    <div className="relative z-10">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Acuracidade de Estoque</h3>
                        <h2 className="text-4xl font-black">99.2%</h2>
                        <p className="text-xs mt-2 opacity-80 decoration-slate-200 underline underline-offset-4 cursor-pointer">Ver relatório detalhado</p>
                    </div>

                    <div className="relative z-10 space-y-4 mt-8">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span>Rua A / Mod 12</span>
                            <span>100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-full"></div>
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold opacity-80">
                            <span>Rua B / Mod 05</span>
                            <span>98.4%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-[98%]"></div>
                        </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Database className="w-32 h-32" />
                    </div>
                </div>
            </div>
        </div>
    );
}
