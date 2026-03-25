import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
    Target, Layers, Box, TriangleAlert,
    Database, RefreshCw, Package, ArrowUpRight,
    DollarSign, TrendingUp, FileCheck,
} from 'lucide-react';
import StatsCard from '../components/ui/StatsCard';
import { useApp } from '../hooks/useApp';
import { useDashboardData } from '../hooks/useDashboardData';
import { supabase } from '../lib/supabaseClient';

// ─── SKELETON BLINDADO ───────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="vp-glass rounded-xl p-5 animate-pulse space-y-4 border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-white/5 rounded-md" />
                <div className="w-8 h-8 bg-white/10 rounded-lg" />
            </div>
            <div className="h-9 w-20 bg-white/10 rounded-md" />
            <div className="h-3 w-24 bg-white/5 rounded-md" />
        </div>
    );
}

// ─── CORES PARA O GRÁFICO ─────────────────────────────────────────────────────
const CHART_COLORS = ['#FFD700', '#00E5FF', '#AA00FF', '#FF6B35', '#00FF88', '#FF3CAC'];

// ─── DASHBOARD PREMIUM ────────────────────────────────────────────────────────
export default function Dashboard() {
    const { warehouseId } = useApp();
    const { kpis, loading, error, refetch, lastUpdated } = useDashboardData(warehouseId);

    // ── Ocupação por Área (dados reais do banco) ──────────────────────────────
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(true);

    const fetchOcupacaoPorArea = useCallback(async () => {
        if (!warehouseId) return;
        setChartLoading(true);
        try {
            // Busca áreas do armazém
            const { data: areas } = await supabase
                .from('areas_armazem')
                .select('id, name')
                .eq('warehouse_id', warehouseId)
                .eq('is_active', true)
                .limit(6);

            if (!areas || areas.length === 0) {
                setChartData([]);
                return;
            }

            // Para cada área, conta endereços ocupados vs livres
            const results = await Promise.all(
                areas.map(async (area, idx) => {
                    const { count: ocupados } = await supabase
                        .from('alocacao_estoque')
                        .select('id', { count: 'exact', head: true })
                        .eq('warehouse_id', warehouseId)
                        .eq('area_id', area.id);

                    const { count: total } = await supabase
                        .from('enderecos')
                        .select('id', { count: 'exact', head: true })
                        .eq('warehouse_id', warehouseId)
                        .eq('area_id', area.id);

                    const ocp = ocupados || 0;
                    const liv = Math.max(0, (total || 0) - ocp);

                    return {
                        name: (area.name || 'Área').substring(0, 4).toUpperCase(),
                        ocupados: ocp,
                        livres: liv,
                        color: CHART_COLORS[idx % CHART_COLORS.length],
                    };
                })
            );

            setChartData(results);
        } catch (e) {
            console.error('Erro ao buscar ocupação por área:', e);
            setChartData([]);
        } finally {
            setChartLoading(false);
        }
    }, [warehouseId]);

    useEffect(() => {
        fetchOcupacaoPorArea();
    }, [fetchOcupacaoPorArea]);

    const kpiCards = [
        {
            id: 'ocupacao',
            label: 'Ocupação Total',
            value: loading ? '…' : `${kpis.pctOcupacao}%`,
            change: loading ? '' : `${kpis.enderecosOcupados} de ${kpis.totalEnderecos}`,
            trend: 'up',
            icon: Database,
        },
        {
            id: 'vazio',
            label: 'Módulos Livres',
            value: loading ? '…' : String(kpis.modulosVazios),
            change: 'Prontos p/ receber',
            trend: 'none',
            icon: Layers,
        },
        {
            id: 'pedidos',
            label: 'Pedidos Pendentes',
            value: loading ? '…' : String(kpis.pedidosPendentes),
            change: `${kpis.expedicoesHoje} expedidos hj`,
            trend: 'down',
            icon: Box,
        },
        {
            id: 'skus',
            label: 'SKUs Ativos',
            value: loading ? '…' : String(kpis.totalSkusAtivos),
            change: 'Catálogo sincronizado',
            trend: 'up',
            icon: Package,
        },
    ];

    return (
        <main className="space-y-6 p-4 md:p-6 animate-fade-up">

            {/* ─── HEADER ─── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-black rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(255,215,0,0.1)] relative group overflow-hidden">
                        <Database className="w-5 h-5 text-[var(--vp-primary)] relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tighter text-white uppercase flex items-center gap-2">
                             Dashboard <span className="text-[var(--vp-primary)] italic">Analítico</span>
                             <span className="text-[9px] px-2 py-0.5 bg-white/5 rounded-full text-white/40 font-mono tracking-widest border border-white/10">WMS v2.0</span>
                        </h1>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">
                            Centro de Distribuição VerticalParts — Monitoramento em Tempo Real
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-[10px] font-black text-white px-4 py-2 vp-glass rounded-xl border-white/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                        <span className="tracking-widest opacity-60">
                            {lastUpdated ? `Sync: ${lastUpdated.toLocaleTimeString('pt-BR')}` : 'CONECTANDO...'}
                        </span>
                    </div>

                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="p-2.5 vp-glass rounded-xl text-white hover:border-[var(--vp-primary-vibrant)] hover:text-[var(--vp-primary)] transition-all active:scale-90 group"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                </div>
            </header>

            {/* ─── ERROR ALERT ─── */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold animate-pulse">
                    <TriangleAlert className="w-5 h-5 shrink-0" />
                    Erro de sincronização Supabase: {error}
                </div>
            )}

            {/* ─── KPI GRID ─── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : kpiCards.map((kpi) => (
                        <div key={kpi.id} className="vp-glass vp-glass-hover p-5 rounded-2xl relative overflow-hidden group transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 group-hover:text-white/60 transition-colors">
                                        {kpi.label}
                                    </p>
                                    <h3 className="text-3xl font-black text-white tracking-tighter">
                                        {kpi.value}
                                    </h3>
                                </div>
                                <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all">
                                    <kpi.icon className="w-5 h-5 text-[var(--vp-primary)]" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-wider">
                                <span className="px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5">{kpi.change}</span>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[var(--vp-primary)] opacity-5 blur-2xl rounded-full group-hover:opacity-10 transition-opacity" />
                        </div>
                    ))
                }
            </section>

            {/* ─── KPI FINANCEIRO ─── */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                    {
                        id: 'faturamento',
                        label: 'Faturamento Total',
                        value: loading ? '…' : kpis.faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                        change: 'Contas a receber (total)',
                        icon: DollarSign,
                    },
                    {
                        id: 'areceber',
                        label: 'A Receber',
                        value: loading ? '…' : kpis.aReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                        change: 'Status: aberto',
                        icon: TrendingUp,
                    },
                    {
                        id: 'nfe',
                        label: 'NF-e Emitidas',
                        value: loading ? '…' : String(kpis.notasEmitidas),
                        change: 'Notas fiscais emitidas',
                        icon: FileCheck,
                    },
                ].map((card) => (
                    <div key={card.id} className="vp-glass vp-glass-hover p-5 rounded-2xl relative overflow-hidden group transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 group-hover:text-white/60 transition-colors">
                                    {card.label}
                                </p>
                                <h3 className="text-3xl font-black text-[var(--vp-primary)] tracking-tighter">
                                    {card.value}
                                </h3>
                            </div>
                            <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all">
                                <card.icon className="w-5 h-5 text-[var(--vp-primary)]" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-wider">
                            <span className="px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5">{card.change}</span>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[var(--vp-primary)] opacity-5 blur-2xl rounded-full group-hover:opacity-10 transition-opacity" />
                    </div>
                ))}
            </section>

            {/* ─── CHARTS & PERFORMANCE ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart: Ocupação por Área (dados reais) */}
                <section className="lg:col-span-2 vp-glass rounded-2xl p-6 border-white/5 shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                     <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-white tracking-tighter">
                                Distribuição de <span className="text-[var(--vp-primary)]">Carga por Área</span>
                            </h2>
                            <p className="text-[9px] text-white/30 font-bold uppercase mt-1">Ocupação real por área do armazém</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-green-500">
                                <div className="w-2 h-2 rounded-sm bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> OCUPADO
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-white/20">
                                <div className="w-2 h-2 rounded-sm bg-white/10" /> VAZIO
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        {chartLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <RefreshCw className="w-6 h-6 text-white/20 animate-spin" />
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Sem áreas cadastradas</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 900 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 900 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{
                                            backgroundColor: '#0A0A0A',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            fontSize: '11px',
                                            fontWeight: '900',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                            color: '#FFF'
                                        }}
                                    />
                                    <Bar dataKey="ocupados" radius={[4, 4, 0, 0]} barSize={32} name="Ocupados">
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="livres" fill="rgba(255,255,255,0.05)" radius={[4, 4, 0, 0]} barSize={32} name="Livres" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </section>

                {/* Performance Card */}
                <section className="bg-black rounded-2xl border-2 border-[var(--vp-primary)]/10 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl group">
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(var(--vp-primary) 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
                    />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--vp-primary)]">
                                PERFORMANCE CD
                            </h2>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                        </div>

                        <div className="mb-8">
                            <p className="text-6xl font-black text-white tracking-tighter leading-none">
                                {loading ? '…' : `${kpis.pctOcupacao}`}
                                <span className="text-xl text-[var(--vp-primary)]">%</span>
                            </p>
                            <p className="text-[10px] font-black text-white/40 uppercase mt-2 tracking-widest">
                                Capacidade Operacional
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'SKUs Ativos', val: kpis.totalSkusAtivos, color: 'text-white' },
                                { label: 'Movimentos (24h)', val: kpis.movimentosHoje, color: 'text-white' },
                                { label: 'SLA Expedição', val: '98.5%', color: 'text-[var(--vp-primary)]' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{item.label}</span>
                                    <span className={`text-xs font-black ${item.color}`}>{loading ? '…' : item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-6">
                        <Link
                            to="/cadastros/produtos"
                            className="bg-[var(--vp-primary)] hover:bg-[var(--vp-primary-vibrant)] text-black font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_10px_20px_rgba(255,215,0,0.2)]"
                        >
                            <Package className="w-4 h-4" />
                            Gerenciar Catálogo
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[var(--vp-primary)] to-transparent animate-pulse" />
                </section>
            </div>

            {/* ─── FOOTER INFO ─── */}
            <footer className="pt-8 text-center">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
                    VerticalParts WMS — {new Date().getFullYear()} — {lastUpdated ? `Sync: ${lastUpdated.toLocaleTimeString('pt-BR')}` : 'Aguardando sync...'}
                </p>
            </footer>
        </main>
    );
}
