import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    DollarSign,
    TrendingUp,
    Clock,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';

// ====== DADOS ESTÁTICOS (gráficos que ainda não têm fonte real) ======
const billingHistory = [
    { month: 'Set', valor: 850000 },
    { month: 'Out', valor: 920000 },
    { month: 'Nov', valor: 1100000 },
    { month: 'Dez', valor: 980000 },
    { month: 'Jan', valor: 1150000 },
    { month: 'Fev', valor: 1258450 },
];

const serviceDistribution = [
    { name: 'Armazenagem', value: 45 },
    { name: 'Expedição', value: 25 },
    { name: 'Picking', value: 20 },
    { name: 'CrossDocking', value: 10 },
];

const COLORS = ['#FFD700', '#1A1A1A', '#4F4F4F', '#E0E0E0'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-black text-primary">
                    R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
            </div>
        );
    }
    return null;
};

const fmtBRL = (v) =>
    `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export default function FinancialDashboard() {
    const { warehouseId } = useApp();

    // KPIs dinâmicos
    const [totalPagar,       setTotalPagar]       = useState(null);
    const [totalReceber,     setTotalReceber]      = useState(null);
    const [vencidas,         setVencidas]          = useState(null);
    const [contratosAtivos,  setContratosAtivos]   = useState(null);
    const [loadingKpis,      setLoadingKpis]       = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoadingKpis(true);
            try {
                const today = new Date().toISOString().slice(0, 10);

                // Busca contas_pagar e contas_receber em paralelo
                const [resPagar, resReceber] = await Promise.all([
                    supabase.from('contas_pagar').select('valor, vencimento, status'),
                    supabase.from('contas_receber').select('valor, vencimento, status'),
                ]);

                const pagar    = resPagar.data    || [];
                const receber  = resReceber.data  || [];

                // KPI: Total a Pagar (status='aberto')
                const sumPagar = pagar
                    .filter(r => r.status === 'aberto')
                    .reduce((acc, r) => acc + Number(r.valor || 0), 0);

                // KPI: Total a Receber (status='aberto')
                const sumReceber = receber
                    .filter(r => r.status === 'aberto')
                    .reduce((acc, r) => acc + Number(r.valor || 0), 0);

                // KPI: Vencidas (vencimento < hoje AND status='aberto') — ambas as tabelas
                const vencPagar   = pagar.filter(r => r.status === 'aberto' && r.vencimento && r.vencimento < today).length;
                const vencReceber = receber.filter(r => r.status === 'aberto' && r.vencimento && r.vencimento < today).length;

                // KPI: Contratos Ativos (proxy = contas_receber com status='aberto')
                const ativos = receber.filter(r => r.status === 'aberto').length;

                setTotalPagar(sumPagar);
                setTotalReceber(sumReceber);
                setVencidas(vencPagar + vencReceber);
                setContratosAtivos(ativos);
            } catch (err) {
                console.error('[FinancialDashboard] fetch KPIs:', err.message);
            } finally {
                setLoadingKpis(false);
            }
        };
        load();
    }, [warehouseId]);

    // Monta array de KPIs dinamicamente com dados reais
    const kpiData = [
        {
            label: 'Total a Receber',
            value: loadingKpis ? '—' : fmtBRL(totalReceber),
            change: '+12.5%',
            trend: 'up',
            isPositiveChange: true,
            icon: DollarSign,
            color: '#FFD700',
        },
        {
            label: 'Total a Pagar',
            value: loadingKpis ? '—' : fmtBRL(totalPagar),
            change: '-2.4%',
            trend: 'down',
            isPositiveChange: true,
            icon: Wallet,
            color: '#000000',
        },
        {
            label: 'Títulos Vencidos',
            value: loadingKpis ? '—' : String(vencidas ?? 0),
            change: vencidas > 0 ? `+${vencidas}` : '0',
            trend: vencidas > 0 ? 'up' : 'down',
            isPositiveChange: vencidas === 0,
            icon: Clock,
            color: '#FFD700',
        },
        {
            label: 'Contratos Ativos',
            value: loadingKpis ? '—' : String(contratosAtivos ?? 0),
            change: '+3',
            trend: 'up',
            isPositiveChange: true,
            icon: FileText,
            color: '#000000',
        },
    ];

    return (
        <div className="space-y-8 p-6 animate-in fade-in duration-700 font-['Poppins',_sans-serif]">
            {/* ====== CABEÇALHO ====== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-secondary italic flex items-center gap-3">
                        <TrendingUp className="w-10 h-10 text-primary" aria-hidden="true" /> 8.1 Dashboard Financeiro
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic mt-1">Análise de Receita, Custos e Performance Financeira - VerticalParts</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Financial Data</span>
                </div>
            </div>

            {/* ====== KPI CARDS ====== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi) => (
                    <div key={kpi.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${kpi.color === '#FFD700' ? 'bg-primary/10 text-primary' : 'bg-secondary/5 text-secondary'} group-hover:scale-110 transition-transform`}>
                                <kpi.icon className="w-6 h-6" aria-hidden="true" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full ${
                                kpi.isPositiveChange ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                                {kpi.trend === 'up'
                                    ? <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                                    : <ArrowDownRight className="w-3 h-3" aria-hidden="true" />}
                                {kpi.change}
                            </div>
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{kpi.label}</p>
                            <h3 className="text-2xl font-black text-secondary leading-tight">{kpi.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* ====== GRÁFICOS ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Histórico de Faturamento */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-1">Evolução do Faturamento Mensal</h3>
                            <p className="text-[10px] text-slate-400 font-bold italic">Comparativo dos últimos 6 meses de operação</p>
                        </div>
                        <div className="bg-primary/10 px-4 py-2 rounded-xl">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Base: BRL (R$)</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={billingHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                    tickFormatter={(value) => `R$ ${(value / 1000)}k`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar
                                    dataKey="valor"
                                    fill="#FFD700"
                                    radius={[12, 12, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribuição por Serviço */}
                <div className="bg-secondary p-10 rounded-[2.5rem] border border-secondary shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 mb-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-1">Mix de Serviços</h3>
                        <p className="text-[10px] text-white/40 font-bold italic">Distribuição de Receita por Categoria</p>
                    </div>

                    <div className="h-[250px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={serviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {serviceDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total</p>
                            <p className="text-xl font-black text-white">100%</p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3 relative z-10">
                        {serviceDistribution.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[serviceDistribution.indexOf(item)] }} aria-hidden="true" />
                                    <span className="text-[11px] font-black text-white/70 uppercase tracking-wider">{item.name}</span>
                                </div>
                                <span className="text-[11px] font-black text-primary">{item.value}%</span>
                            </div>
                        ))}
                    </div>

                    {/* Watermark decorativa */}
                    <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none" aria-hidden="true">
                        <CreditCard className="w-48 h-48 text-white" />
                    </div>
                </div>
            </div>

            {/* ====== FOOTER / OBSERVAÇÕES ====== */}
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <TrendingUp className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500">
                        Os dados refletem o faturamento consolidado de peças (ex: <span className="text-secondary font-black italic">VPER-ESS-NY-27MM</span>) e serviços logísticos prestados a depositantes como <span className="text-secondary font-black italic">Danilo Simões</span> e <span className="text-secondary font-black italic">Matheus Expedição</span>.
                    </p>
                </div>
                <button
                    disabled
                    title="Exportação CFO em desenvolvimento"
                    className="bg-secondary text-primary px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Exportar Relatório CFO
                </button>
            </div>
        </div>
    );
}
