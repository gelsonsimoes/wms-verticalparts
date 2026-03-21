import React, { useState, useEffect } from 'react';
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
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const { warehouseId } = useApp();

    const [ocupacao,         setOcupacao]         = useState(null);
    const [pedidosPendentes, setPedidosPendentes] = useState(null);
    const [ondasAtivas,      setOndasAtivas]      = useState(null);
    const [modulosVazios,    setModulosVazios]    = useState(null);
    const [loading,          setLoading]          = useState(true);

    // Chart: notas expedidas por hora de hoje
    const [throughputData, setThroughputData] = useState([]);

    useEffect(() => {
        if (!warehouseId) return;

        async function loadKPIs() {
            setLoading(true);

            // ── Ocupação: alocados / total endereços ──────────────────────────
            const [{ count: alocados }, { count: totalEnd }] = await Promise.all([
                supabase
                    .from('alocacao_estoque')
                    .select('*', { count: 'exact', head: true })
                    .eq('warehouse_id', warehouseId),
                supabase
                    .from('enderecos')
                    .select('*', { count: 'exact', head: true })
                    .eq('warehouse_id', warehouseId),
            ]);

            if (totalEnd > 0) {
                const pct = ((alocados ?? 0) / totalEnd) * 100;
                setOcupacao(pct.toFixed(1) + '%');
            } else {
                setOcupacao('—');
            }

            // Módulos vazios = endereços sem alocação
            setModulosVazios(totalEnd != null && alocados != null ? totalEnd - alocados : 0);

            // ── Pedidos Pendentes ───────────────────────────────────────────────────
            // Enum real: 'Pendentes', 'Aguardando Formação Onda', 'Processadas', 'Canceladas'
            const { count: pendCount } = await supabase
                .from('notas_saida')
                .select('*', { count: 'exact', head: true })
                .eq('warehouse_id', warehouseId)
                .in('situacao', ['Pendentes', 'Aguardando Formação Onda']);

            setPedidosPendentes(pendCount ?? 0);

            // ── Ondas Ativas ─────────────────────────────────────────────────────
            // warehouse_id é coluna direta em tarefas (não dentro do JSONB detalhes)
            const { count: ondasCount } = await supabase
                .from('tarefas')
                .select('*', { count: 'exact', head: true })
                .eq('tipo', 'separacao')
                .eq('warehouse_id', warehouseId)
                .in('status', ['pendente', 'em_execucao']);

            setOndasAtivas(ondasCount ?? 0);

            // ── Throughput: expedidas hoje por hora ──────────────────────────────
            // Enum real de situacao: 'Processadas' = expedida/concluída
            const today = new Date().toISOString().slice(0, 10);
            const { data: expedidas } = await supabase
                .from('notas_saida')
                .select('created_at')
                .eq('warehouse_id', warehouseId)
                .eq('situacao', 'Processadas')
                .gte('created_at', `${today}T00:00:00`)
                .lte('created_at', `${today}T23:59:59`);

            if (expedidas && expedidas.length > 0) {
                const byHour = {};
                expedidas.forEach(n => {
                    const h = new Date(n.created_at).getHours();
                    const key = `${String(h).padStart(2, '0')}:00`;
                    byHour[key] = (byHour[key] ?? 0) + 1;
                });
                const chartData = Object.entries(byHour)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([name, out]) => ({ name, in: 0, out }));
                setThroughputData(chartData);
            } else {
                setThroughputData([]);
            }

            setLoading(false);
        }

        loadKPIs();
    }, [warehouseId]);

    const kpiData = [
        {
            id: 'ocupacao',
            label: 'Ocupação Total',
            value: loading ? '…' : (ocupacao ?? '—'),
            change: '',
            trend: 'up',
            isPositiveChange: true,
            icon: Database,
            color: 'primary',
        },
        {
            id: 'modulos-vazios',
            label: 'Módulos Vazios',
            value: loading ? '…' : String(modulosVazios ?? 0),
            change: '',
            trend: 'down',
            isPositiveChange: true,
            icon: Layers,
            color: 'success',
        },
        {
            id: 'pedidos-pendentes',
            label: 'Pedidos Pendentes',
            value: loading ? '…' : String(pedidosPendentes ?? 0),
            change: '',
            trend: 'up',
            isPositiveChange: false,
            icon: Box,
            color: 'warning',
        },
        {
            id: 'ondas-ativas',
            label: 'Ondas Ativas',
            value: loading ? '…' : String(ondasAtivas ?? 0),
            change: '',
            trend: 'up',
            isPositiveChange: true,
            icon: TriangleAlert,
            color: 'danger',
        },
    ];

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
                            Fluxo de Expedição — Hoje (por hora)
                        </h2>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 font-black text-[9px] text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-sm bg-slate-400" aria-hidden="true" /> SAÍDA
                            </div>
                        </div>
                    </div>
                    <div className="h-48 w-full font-mono">
                        {throughputData.length === 0 && !loading ? (
                            <div className="h-full flex items-center justify-center text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                Nenhuma expedição registrada hoje
                            </div>
                        ) : (
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
                                    <Bar dataKey="out" fill="#94a3b8" radius={[2, 2, 0, 0]} barSize={16} name="Saída" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </section>

                {/* Card de Performance */}
                <section aria-label="Performance do armazém" className="bg-[#1A1A1A] p-4 rounded-sm border border-black flex flex-col justify-between overflow-hidden relative shadow-inner group">
                    <div className="relative z-10 border-b border-gray-800 pb-3 mb-4">
                        <h2 className="text-[9px] font-black uppercase tracking-widest text-[#FFD700] mb-1">
                            Indicador de Performance
                        </h2>
                        <div className="flex items-baseline justify-between">
                            <p className="text-3xl font-black text-white tracking-tighter">—</p>
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
                        <div className="text-[10px] text-white/40 font-bold text-center uppercase tracking-wider py-4">
                            Acuracidade disponível via Kardex
                        </div>
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
