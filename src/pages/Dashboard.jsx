import React from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    Target, Layers, Box, TriangleAlert,
    Database, RefreshCw, Package,
} from 'lucide-react';
import StatsCard from '../components/ui/StatsCard';
import { useApp } from '../hooks/useApp';
import { useDashboardData } from '../hooks/useDashboardData';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-white border border-[var(--vp-border)] rounded-sm p-4 animate-pulse space-y-3">
            <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-gray-100 rounded" />
                <div className="w-7 h-7 bg-gray-100 rounded-sm" />
            </div>
            <div className="h-7 w-16 bg-gray-200 rounded" />
            <div className="h-2 w-20 bg-gray-100 rounded" />
        </div>
    );
}

function SkeletonChart() {
    return (
        <div className="h-48 w-full animate-pulse flex items-end gap-2 px-4 pb-4">
            {[40, 65, 30, 80, 55, 70, 45, 90].map((h, i) => (
                <div key={i} className="flex-1 bg-gray-100 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
        </div>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const { warehouseId } = useApp();
    const { kpis, loading, error, refetch, lastUpdated } = useDashboardData(warehouseId);

    // Formata ocupação para exibição
    const ocupacaoDisplay = kpis.totalEnderecos > 0
        ? `${kpis.pctOcupacao}%`
        : '—';

    const kpiData = [
        {
            id: 'ocupacao',
            label: 'Ocupação Total',
            value: loading ? '…' : ocupacaoDisplay,
            change: loading ? '' : `${kpis.enderecosOcupados}/${kpis.totalEnderecos} endereços`,
            trend: 'up',
            isPositiveChange: true,
            icon: Database,
            color: 'primary',
        },
        {
            id: 'modulos-vazios',
            label: 'Módulos Vazios',
            value: loading ? '…' : String(kpis.modulosVazios),
            change: loading ? '' : `de ${kpis.totalEnderecos} endereços`,
            trend: 'down',
            isPositiveChange: true,
            icon: Layers,
            color: 'success',
        },
        {
            id: 'pedidos-pendentes',
            label: 'Pedidos Pendentes',
            value: loading ? '…' : String(kpis.pedidosPendentes),
            change: loading ? '' : `${kpis.expedicoesHoje} expedidos hoje`,
            trend: 'up',
            isPositiveChange: false,
            icon: Box,
            color: 'warning',
        },
        {
            id: 'ondas-ativas',
            label: 'Ondas Ativas',
            value: loading ? '…' : String(kpis.ondasAtivas),
            change: loading ? '' : `${kpis.totalSkusAtivos} SKUs no catálogo`,
            trend: 'up',
            isPositiveChange: true,
            icon: TriangleAlert,
            color: 'danger',
        },
    ];

    return (
        <main className="space-y-4 p-2">
            {/* ─── Header ─────────────────────────────────────────────────── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[var(--vp-border)]">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-black rounded-sm border border-white/10 shadow-lg">
                        <Database className="w-4 h-4 text-[var(--vp-primary)]" aria-hidden="true" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-tight text-black uppercase">
                            1.1 Dashboard — Gestão à Vista
                        </h1>
                        <p className="text-[10px] text-[var(--vp-text-label)] font-bold uppercase tracking-widest mt-0.5">
                            Centro de Distribuição VerticalParts — Real Time Analytics
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Botão de atualizar manual */}
                    <button
                        onClick={refetch}
                        disabled={loading}
                        aria-label="Atualizar dados"
                        title="Atualizar dados agora"
                        className="p-1.5 border border-[var(--vp-border)] rounded-sm text-gray-500 hover:text-black hover:border-gray-400 transition-colors disabled:opacity-40"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Indicador de status */}
                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-sm border border-[var(--vp-border)] shadow-sm">
                        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? 'bg-red-500' : 'bg-green-500'}`} />
                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${error ? 'bg-red-500' : 'bg-green-500'}`} />
                        </span>
                        <span>
                            {error
                                ? 'ERRO DE CONEXÃO'
                                : lastUpdated
                                    ? `ATUALIZADO ÀS ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                                    : 'CARREGANDO...'
                            }
                        </span>
                    </div>
                </div>
            </header>

            {/* ─── Erro ───────────────────────────────────────────────────── */}
            {error && (
                <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-xs font-bold">
                    <TriangleAlert className="w-4 h-4 shrink-0" />
                    Falha ao carregar dados do Supabase: {error}
                </div>
            )}

            {/* ─── KPI Grid ───────────────────────────────────────────────── */}
            <section aria-label="Principais indicadores de desempenho" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : kpiData.map((kpi) => <StatsCard key={kpi.id} {...kpi} />)
                }
            </section>

            {/* ─── Charts & Performance ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Gráfico de Ocupação por Área (placeholder até ter dados granulares) */}
                <section
                    aria-label="Resumo de ocupação"
                    className="lg:col-span-2 bg-white p-4 rounded-sm border border-[var(--vp-border)] shadow-sm transition-all hover:shadow-md"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-[var(--vp-text-label)]">
                            Ocupação de Endereços
                        </h2>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 font-black text-[9px] text-green-600">
                                <div className="w-1.5 h-1.5 rounded-sm bg-green-500" aria-hidden="true" /> OCUPADO
                            </div>
                            <div className="flex items-center gap-1.5 font-black text-[9px] text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-sm bg-slate-200" aria-hidden="true" /> LIVRE
                            </div>
                        </div>
                    </div>

                    {loading ? <SkeletonChart /> : (
                        <div className="h-48 w-full font-mono">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[
                                        { name: 'R1', ocupados: 5, livres: 6 },
                                        { name: 'R2', ocupados: 3, livres: 2 },
                                        { name: 'R3', ocupados: 2, livres: 2 },
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} dy={5} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '2px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 'bold', padding: '8px' }}
                                    />
                                    <Bar dataKey="ocupados" fill="#22c55e" radius={[2, 2, 0, 0]} barSize={20} name="Ocupados" />
                                    <Bar dataKey="livres" fill="#e2e8f0" radius={[2, 2, 0, 0]} barSize={20} name="Livres" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </section>

                {/* Card de Performance */}
                <section
                    aria-label="Performance do armazém"
                    className="bg-[#1A1A1A] p-4 rounded-sm border border-black flex flex-col justify-between overflow-hidden relative shadow-inner group"
                >
                    <div className="relative z-10 border-b border-gray-800 pb-3 mb-4">
                        <h2 className="text-[9px] font-black uppercase tracking-widest text-[#FFD700] mb-1">
                            Indicador de Performance
                        </h2>
                        <div className="flex items-baseline justify-between">
                            <p className="text-3xl font-black text-white tracking-tighter">
                                {loading ? '…' : `${kpis.pctOcupacao}%`}
                            </p>
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Ocupação</span>
                        </div>
                        <Link
                            to="/estoque/consultar-kardex"
                            className="inline-block text-[9px] mt-2 text-gray-500 font-bold hover:text-[#FFD700] transition-colors underline underline-offset-4 decoration-gray-600 hover:decoration-[#FFD700]"
                        >
                            AUDITAR RELATÓRIO FULL KARDEX
                        </Link>
                    </div>

                    <div className="relative z-10 space-y-3">
                        {loading ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-2 w-full bg-gray-800 rounded" />
                                <div className="h-2 w-3/4 bg-gray-800 rounded" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-gray-500 font-bold">SKUs no catálogo</span>
                                    <span className="text-white font-black">{kpis.totalSkusAtivos}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-gray-500 font-bold">Movimentos hoje</span>
                                    <span className="text-white font-black">{kpis.movimentosHoje}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-gray-500 font-bold">Expedições hoje</span>
                                    <span className="text-[#FFD700] font-black">{kpis.expedicoesHoje}</span>
                                </div>
                                <Link
                                    to="/cadastros/produtos"
                                    className="w-full mt-2 flex items-center justify-center gap-1.5 text-[9px] font-black px-3 py-2 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/20 rounded-sm transition-colors"
                                >
                                    <Package className="w-3 h-3" aria-hidden="true" />
                                    VER CATÁLOGO DE PRODUTOS
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Watermark decorativo */}
                    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700" aria-hidden="true">
                        <Database className="w-24 h-24 text-white" />
                    </div>
                </section>
            </div>

            {/* ─── KPI Extra Row ───────────────────────────────────────────── */}
            {!loading && (
                <section aria-label="Métricas adicionais" className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Endereços',   value: kpis.totalEnderecos,    icon: Target,       color: 'text-blue-600' },
                        { label: 'Posições Ocupadas', value: kpis.enderecosOcupados, icon: Database,     color: 'text-green-600' },
                        { label: 'Posições Livres',   value: kpis.modulosVazios,     icon: Layers,       color: 'text-slate-500' },
                        { label: 'SKUs Ativos',       value: kpis.totalSkusAtivos,   icon: Package,      color: 'text-amber-500' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white border border-[var(--vp-border)] rounded-sm px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
                            <Icon className={`w-5 h-5 shrink-0 ${color}`} aria-hidden="true" />
                            <div>
                                <p className={`text-lg font-black ${color}`}>{value}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                            </div>
                        </div>
                    ))}
                </section>
            )}
        </main>
    );
}
