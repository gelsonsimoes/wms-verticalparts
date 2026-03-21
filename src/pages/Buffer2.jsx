// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💎 LAYOUT BLINDADO — DESIGN PREMIUM VERTICALPARTS 💎
// Página 2.18 — Buffer 2 (Zona de Saída / Expedição)
// Monitoramento de alta performance com Glassmorphism e Real-time.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { supabase } from '../lib/supabaseClient';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import { Search, Monitor, X, ArrowRight, Layers, Box, CheckCircle2, XCircle, Grid3X3, Info } from 'lucide-react';

// ─── Toast Premium ──────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
    const bg =
        type === 'erro' ? 'bg-red-500/20 border-red-500/50 text-red-100' :
        type === 'warn' ? 'bg-amber-500/20 border-amber-500/50 text-amber-100' :
        'bg-emerald-500/20 border-emerald-500/50 text-emerald-100';
    return (
        <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 text-sm font-bold border ${bg} animate-fade-up animate-duration-300`}
            onClick={onClose}
            role="alert"
        >
            {type === 'erro' ? <XCircle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {msg}
        </div>
    );
}

const ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];
const TOTAL_POSITIONS = ROWS.length * COLS.length; // 60

const Buffer2 = () => {
    const location = useLocation();
    const { warehouseId } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredPos, setHoveredPos] = useState(null);
    const [ocupados, setOcupados] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const toastRef = useRef(null);

    const showToast = (msg, type = 'ok') => {
        setToast({ msg, type });
        clearTimeout(toastRef.current);
        toastRef.current = setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => () => clearTimeout(toastRef.current), []);

    useEffect(() => {
        if (!warehouseId) return;
        const fetchData = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('alocacao_estoque')
                .select('endereco_id, quantidade, produto_id, produtos(sku, descricao)')
                .eq('warehouse_id', warehouseId)
                .like('endereco_id', 'B2_%')
                .gt('quantidade', 0);

            if (error) {
                console.error('Erro Buffer2:', error);
                showToast('Falha na comunicação com o banco de dados.', 'erro');
                setLoading(false);
                return;
            }

            setOcupados((data || []).map(r => ({
                endereco_id: r.endereco_id,
                sku: r.produtos?.sku || r.produto_id || 'PENDENTE',
                item: r.produtos?.descricao || 'Produto não identificado',
                quantidade: r.quantidade,
            })));
            setLoading(false);
        };

        fetchData();

        const channel = supabase
            .channel('buffer2-rt')
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'alocacao_estoque',
                filter: `warehouse_id=eq.${warehouseId}`,
            }, fetchData)
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [warehouseId]);

    const getAddressData = (linha, coluna) => {
        const address = `B2_${linha}${coluna}`;
        return ocupados.find(d => d.endereco_id === address);
    };

    const StatusBox = ({ linha, coluna }) => {
        const data = getAddressData(linha, coluna);
        const occupied = !!data;
        const address = `B2_${linha}${coluna}`;

        const isSelected = searchTerm &&
            (address.toLowerCase().includes(searchTerm.toLowerCase()) ||
             data?.sku?.toLowerCase().includes(searchTerm.toLowerCase()));

        return (
            <div
                onMouseEnter={() => setHoveredPos({ linha, coluna, data, address })}
                onMouseLeave={() => setHoveredPos(null)}
                className={`
                    group relative w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-300
                    border
                    ${occupied
                        ? 'bg-red-500/20 border-red-500/50 shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]'
                        : 'bg-white/[0.03] border-white/10 text-white/30 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-400 cursor-pointer'
                    }
                    ${isSelected ? 'scale-110 !border-[#ffcd00] shadow-[0_0_20px_rgba(255,205,0,0.3)] z-20' : ''}
                `}
            >
                {occupied ? (
                    <Box size={20} className="text-red-500 animate-pulse" />
                ) : (
                    <span className="text-[10px] font-black">{linha}{coluna}</span>
                )}
            </div>
        );
    };

    return (
        <EnterprisePageBase
            title="SISTEMA DE BUFFER #2"
            subtitle="Monitoramento Ativo de Área de Expedição"
            actions={
                <div className="flex items-center gap-4">
                    <div className="relative vp-glass rounded-xl overflow-hidden min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input
                            type="text"
                            placeholder="LOCALIZAR SKU OU ENDEREÇO..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent pl-12 pr-4 py-3 text-sm font-bold text-white focus:outline-none w-full placeholder:text-white/20"
                        />
                    </div>
                    <button className="vp-button-primary px-6 py-3 flex items-center gap-2">
                        <Monitor size={18} />
                        <span>MODO TV</span>
                    </button>
                </div>
            }
        >
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <div className="space-y-8 animate-fade-in animate-duration-500">
                {/* Navigation Links - Premium Style */}
                <div className="flex items-center p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl w-fit mx-auto">
                    {[
                        { to: '/operacao/mapa-visual', label: 'MAPA GERAL', icon: Layers, color: 'emerald' },
                        { to: '/operacao/buffer-1', label: 'BUFFER 1', icon: Box, color: 'blue' },
                        { to: '/operacao/buffer-2', label: 'BUFFER 2', icon: Box, color: 'purple' },
                    ].map((btn) => (
                        <Link
                            key={btn.to}
                            to={btn.to}
                            className={`
                                flex items-center gap-3 px-8 py-3 rounded-xl font-black text-xs tracking-widest transition-all
                                ${location.pathname === btn.to
                                    ? `bg-${btn.color}-500 text-white shadow-xl shadow-${btn.color}-500/20`
                                    : 'text-white/40 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <btn.icon size={16} />
                            {btn.label}
                        </Link>
                    ))}
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 vp-glass p-8 rounded-3xl flex items-center justify-between border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                        <div className="flex gap-16">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">OCUPAÇÃO EXPEDIÇÃO</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-purple-500 tracking-tighter">
                                        {loading ? '---' : `${Math.round((ocupados.length / TOTAL_POSITIONS) * 100)}%`}
                                    </span>
                                    <span className="text-xl font-black text-white/20 uppercase">Capacidade</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">SLOTS DISPONÍVEIS</span>
                                <span className="text-5xl font-black text-white tracking-tighter">
                                    {loading ? '---' : TOTAL_POSITIONS - ocupados.length}
                                </span>
                            </div>
                            <div className="flex flex-col gap-2 border-l border-white/10 pl-16">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">FLUXO DE SAÍDA</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-500 animate-ping" />
                                    <span className="text-xl font-black text-white">ATIVO</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-4 bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl">
                            <Grid3X3 className="text-purple-500" size={32} />
                            <div>
                                <h3 className="text-sm font-black text-white">GRID EXPEDIÇÃO</h3>
                                <p className="text-[10px] font-bold text-purple-400">POSIÇÕES 1A A 10F</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                             <XCircle size={100} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <Info className="text-purple-500" size={24} />
                            <span className="text-[10px] font-black bg-purple-500 text-white px-3 py-1 rounded-full uppercase tracking-widest leading-none">ESTRATÉGICO</span>
                        </div>
                        <h4 className="text-sm font-black text-white uppercase mb-2 tracking-tight">CONSOLIDAÇÃO DE CARGA</h4>
                        <p className="text-xs text-white/40 font-medium leading-relaxed">Prioridade para pedidos com embarque previsto em menos de 2h.</p>
                    </div>
                </div>

                {/* Grid Container */}
                <div className="relative vp-glass p-10 rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.01]" />
                    
                    {loading && (
                        <div className="absolute inset-0 z-50 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                            <span className="text-[10px] font-black text-purple-500 tracking-[0.4em] uppercase">Sincronizando...</span>
                        </div>
                    )}

                    {/* Dashboard Grid Labels */}
                    <div className="flex flex-col gap-2 min-w-max">
                        {/* Header Row */}
                        <div className="flex gap-2 mb-2">
                            <div className="w-12" />
                            {COLS.map(col => (
                                <div key={col} className="w-12 text-center text-[10px] font-black text-white/20">
                                    {col}
                                </div>
                            ))}
                        </div>

                        {/* Data Rows */}
                        {ROWS.map(row => (
                            <div key={row} className="flex gap-2">
                                <div className="w-12 h-12 flex items-center justify-center text-[10px] font-black text-white/20 border-r border-white/5 pr-2">
                                    {row}
                                </div>
                                {COLS.map(col => (
                                    <StatusBox key={`${row}-${col}`} linha={row} coluna={col} />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Floating Info Tooltip */}
                    {hoveredPos && (
                        <div className="fixed bottom-10 left-10 z-[200] max-w-sm animate-fade-up">
                            <div className="vp-glass p-6 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-3xl bg-black/60">
                                <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                                    <div>
                                        <h3 className="text-3xl font-black text-white leading-none">{hoveredPos.address}</h3>
                                        <p className="text-[10px] font-black text-purple-500 mt-1 uppercase tracking-widest">EXPEDIÇÃO ATIVA</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${hoveredPos.data ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
                                        {hoveredPos.data ? 'OCUPADO' : 'LIVRE'}
                                    </div>
                                </div>
                                
                                {hoveredPos.data ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Carga em Expedição</span>
                                            <span className="text-sm font-black text-white leading-tight uppercase">{hoveredPos.data.item}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">SKU</span>
                                                <span className="text-xs font-mono font-bold text-purple-400">{hoveredPos.data.sku}</span>
                                            </div>
                                            <div className="flex flex-col items-end text-right">
                                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Volume</span>
                                                <span className="text-xl font-black text-white leading-none">{hoveredPos.data.quantidade} <small className="text-[10px] opacity-30">UN</small></span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-white/40 italic font-medium">Slot livre para consolidação de carga.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Legend */}
                <div className="flex gap-8 justify-center py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest underline decoration-purple-500/50 underline-offset-4">ESPAÇO LIVRE</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest underline decoration-red-500/50 underline-offset-4">POSIÇÃO OCUPADA</span>
                    </div>
                </div>
            </div>
        </EnterprisePageBase>
    );
};

export default Buffer2;
