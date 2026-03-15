import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useWarehouseMap } from '../hooks/useWarehouseMap';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import { Box, Layers, MapPin, Search, Monitor, X, Info, Filter, ArrowRight, Loader2 } from 'lucide-react';

const WarehouseVisualMap = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { isTvMode } = useApp();
    const [searchTerm, setSearchTerm] = useState(() => searchParams.get('endereco') || '');
    const [selectedAisle, setSelectedAisle] = useState('ALL');
    const [hoveredPos, setHoveredPos] = useState(null);

    // Sincroniza busca se o parâmetro da URL mudar (ex: via busca global)
    useEffect(() => {
        const addr = searchParams.get('endereco');
        if (addr) setSearchTerm(addr);
    }, [searchParams]);

    // Conecta com o Supabase Realtime
    const { slots, loading, error } = useWarehouseMap();

    const aisles = [
        { id: 'R1', name: 'Rua 1', color: 'emerald', bg: 'bg-emerald-500/25', border: 'border-emerald-400/50', hoverBg: 'hover:bg-emerald-400/40', hoverBorder: 'hover:border-emerald-300/70', text: 'text-emerald-300', label: 'bg-emerald-500', zone: 'Alta Rotatividade (Picking)' },
        { id: 'R2', name: 'Rua 2', color: 'amber', bg: 'bg-amber-500/25', border: 'border-amber-400/50', hoverBg: 'hover:bg-amber-400/40', hoverBorder: 'hover:border-amber-300/70', text: 'text-amber-300', label: 'bg-amber-500', zone: 'Pulmão Médio' },
        { id: 'R3', name: 'Rua 3', color: 'rose', bg: 'bg-rose-500/25', border: 'border-rose-400/50', hoverBg: 'hover:bg-rose-400/40', hoverBorder: 'hover:border-rose-300/70', text: 'text-rose-300', label: 'bg-rose-500', zone: 'Estocagem Longa (Aéreo)' }
    ];

    const getPpsForAisle = (aisleId) => {
        if (aisleId === 'R1') return ['PP1', 'PP2'];
        if (aisleId === 'R2') return ['PP3', 'PP4'];
        return ['PP5'];
    };

    const levels = ['D', 'C', 'B', 'A'];
    const positionNums = Array.from({ length: 20 }, (_, i) => i + 1);

    // Cálculos de KPI baseados nos dados reais
    const stats = useMemo(() => {
        const total = Object.keys(slots).length || 400; // Total de endereços
        const ocupados = Object.values(slots).filter(s => s.status === 'ocupado').length;
        const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
        return { total, ocupados, livres: total - ocupados, ocupacao };
    }, [slots]);

    const getAddressData = (rua, pp, nivel, pos) => {
        const id = `${rua}_${pp}_${nivel}${String(pos).padStart(2, '0')}`;
        return slots[id];
    };

    const StatusBox = ({ aisleId, pp, level, pos, isOdd }) => {
        const data = getAddressData(aisleId, pp, level, pos);
        const occupied = data?.status === 'ocupado';
        const aisle = aisles.find(a => a.id === aisleId);
        
        const isSelected = searchTerm && 
            (`${aisleId}_${pp}_${level}${String(pos).padStart(2, '0')}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
             data?.sku?.toLowerCase().includes(searchTerm.toLowerCase()));

        return (
            <div 
                onMouseEnter={() => setHoveredPos({ aisleId, pp, level, pos, data })}
                onMouseLeave={() => setHoveredPos(null)}
                className={`
                    group relative w-10 h-10 flex items-center justify-center rounded-sm transition-all duration-300
                    border ${aisle.border}
                    ${occupied
                        ? 'bg-red-600/90 border-red-400 scale-[0.98] shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                        : `${aisle.bg} ${aisle.text} ${aisle.hoverBg} ${aisle.hoverBorder} hover:scale-110 hover:z-10 cursor-pointer`
                    }
                    ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black z-20 scale-110 !border-white' : ''}
                `}
            >
                {occupied ? (
                    <X size={24} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                ) : (
                    <span className="text-[9px] font-semibold text-white/70 group-hover:text-white">{String(pos).padStart(2, '0')}</span>
                )}
            </div>
        );
    };

    return (
        <EnterprisePageBase
            title="2.16 Mapa Visual de Alocação"
            subtitle="Representação digital 2D da ocupação física dos Porta Paletes"
            actions={
                <div className="flex items-center gap-3">
                    {loading && <Loader2 className="w-4 h-4 text-[#ffcd00] animate-spin" />}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#ffcd00]" size={16} />
                        <input 
                            type="text"
                            placeholder="Buscar SKU ou Endereço (ex: R1_PP1)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#ffcd00] w-64 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#ffcd00] text-black rounded-lg font-black text-xs hover:bg-[#ffe066] transition-all shadow-lg active:scale-95">
                        <Monitor size={14} />
                        TV DASHBOARD
                    </button>
                </div>
            }
        >
            <div className="space-y-8 pb-20">
                {/* Navigation Buttons */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <Link 
                        to="/operacao/mapa-visual"
                        className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all
                        ${location.pathname === '/operacao/mapa-visual' 
                            ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' 
                            : 'bg-white/5 text-white/60 hover:bg-white/10'}
                        `}
                    >
                        <Layers size={16} />
                        MAPA VISUAL
                    </Link>
                    
                    <Link 
                        to="/operacao/buffer-1"
                        className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all
                        ${location.pathname === '/operacao/buffer-1' 
                            ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/20' 
                            : 'bg-white/5 text-white/60 hover:bg-white/10'}
                        `}
                    >
                        <Box size={16} />
                        BUFFER 1
                    </Link>
                    
                    <Link 
                        to="/operacao/buffer-2"
                        className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all
                        ${location.pathname === '/operacao/buffer-2' 
                            ? 'bg-purple-500 text-white scale-110 shadow-lg shadow-purple-500/20' 
                            : 'bg-white/5 text-white/60 hover:bg-white/10'}
                        `}
                    >
                        <Box size={16} />
                        BUFFER 2
                    </Link>
                </div>

                {/* Dashboard Stats / Info */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 bg-[#0a0a0a] rounded-2xl border border-white/5 p-6 flex flex-wrap gap-8 items-center justify-between">
                        <div className="flex gap-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Ocupação Total</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black text-[#ffcd00]">{stats.ocupacao}%</span>
                                    <span className="text-xs font-bold text-green-500 mb-1">↑ 0.0%</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Posições Livres</span>
                                <span className="text-3xl font-black text-white">{stats.livres}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Próximo Inventário</span>
                                <span className="text-xl font-black text-white/60">12/MAR</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {aisles.map(a => (
                                <button 
                                    key={a.id}
                                    onClick={() => setSelectedAisle(selectedAisle === a.id ? 'ALL' : a.id)}
                                    className={`
                                        flex items-center gap-3 px-4 py-2 rounded-xl border transition-all
                                        ${selectedAisle === a.id ? `${a.bg} ${a.border}` : 'bg-transparent border-white/5 opacity-50 gray-scale'}
                                    `}
                                >
                                    <div className={`w-2 h-2 rounded-full ${a.label} ${selectedAisle === a.id ? 'animate-pulse' : ''}`} />
                                    <div className="flex flex-col items-start">
                                        <span className={`text-[10px] font-black uppercase ${selectedAisle === a.id ? a.text : 'text-white'}`}>{a.name}</span>
                                        <span className="text-[8px] font-bold text-white/40">{a.zone}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-red-600/5 border border-red-600/20 rounded-2xl p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <X className="text-red-500" size={20} />
                            <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded uppercase">Urgente</span>
                        </div>
                        <h4 className="text-xs font-black text-white uppercase tracking-tight mb-1">Cuidado com Bloqueios</h4>
                        <p className="text-[10px] text-white/50 leading-tight">Posições marcadas com X estão fisicamente ocupadas. A alocação por operador via coletor resultará em erro de integridade.</p>
                    </div>
                </div>

                {/* Warehouse Map */}
                <div className="relative">
                    {/* Tooltip flutuante (Estética Premium) */}
                    {hoveredPos && (
                        <div 
                            className="fixed z-[100] bg-black/90 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-2xl pointer-events-none animate-in fade-in zoom-in duration-200"
                            style={{ 
                                left: `${Math.min(window.innerWidth - 200, 20)}px`,
                                bottom: '20px'
                            }}
                        >
                            <div className="flex flex-col gap-2 min-w-[180px]">
                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                    <span className="text-[10px] font-black text-[#ffcd00] tracking-widest">{hoveredPos.aisleId}_{hoveredPos.pp}_{hoveredPos.level}{String(hoveredPos.pos).padStart(2, '0')}</span>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${hoveredPos.data?.status === 'ocupado' ? 'bg-red-600' : 'bg-green-600'} text-white uppercase`}>
                                        {hoveredPos.data?.status === 'ocupado' ? 'OCUPADO' : 'LIVRE'}
                                    </span>
                                </div>
                                {hoveredPos.data?.status === 'ocupado' ? (
                                    <>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-bold text-white/40 uppercase">Produto / SKU</span>
                                            <span className="text-xs font-black text-white leading-tight">{hoveredPos.data.produto || 'Item Desconhecido'}</span>
                                            <span className="text-[10px] font-mono text-[#ffcd00]/80">{hoveredPos.data.sku}</span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-bold text-white/40 uppercase">Qtd</span>
                                                <span className="text-xs font-black text-white">{hoveredPos.data.quantidade} UN</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] font-bold text-white/40 uppercase">Lote</span>
                                                <span className="text-xs font-black text-white">{hoveredPos.data.lote || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-[10px] text-white/60 italic">Nenhum palete detectado nesta posição.</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Legenda global */}
                    <div className="flex gap-5 mb-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-sm bg-emerald-500/25 border border-emerald-400/50" />
                            <span className="text-xs text-slate-300">Livre (R1)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-sm bg-amber-500/25 border border-amber-400/50" />
                            <span className="text-xs text-slate-300">Livre (R2)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-sm bg-rose-500/25 border border-rose-400/50" />
                            <span className="text-xs text-slate-300">Livre (R3)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-sm bg-red-600/90 border border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                            <span className="text-xs text-slate-300">Ocupado</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-12 overflow-x-auto pb-10 custom-scrollbar">
                        {aisles.filter(a => selectedAisle === 'ALL' || a.id === selectedAisle).map(aisle => (
                            <div key={aisle.id} className="flex flex-col gap-6">
                                {/* Header da Rua */}
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-black ${aisle.label}`}>
                                            {aisle.id.replace('R', '')}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                                {aisle.name} 
                                                <ArrowRight size={16} className="text-white/20" />
                                                <span className="text-[#ffcd00] opacity-80">{aisle.zone}</span>
                                            </h3>
                                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Fluxo Operacional Principal</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1 bg-black rounded-lg border border-white/5 text-[10px] font-black text-white/60">COLUNAS: 01 a 40</div>
                                        <div className="px-3 py-1 bg-black rounded-lg border border-white/5 text-[10px] font-black text-white/60">NÍVEIS: A-D</div>
                                    </div>
                                </div>

                                {/* Aisle Layout: Vertical stacks separated by aisle road */}
                                <div className="flex flex-col gap-4">
                                    {getPpsForAisle(aisle.id).map((pp, idx) => (
                                        <React.Fragment key={pp}>
                                            <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 relative overflow-hidden group/pp shadow-2xl">
                                                {/* PP Background ID decoration */}
                                                <div className="absolute -right-4 -top-8 text-6xl font-black text-white/[0.02] select-none pointer-events-none">{pp}</div>
                                                
                                                <div className="flex items-center gap-2 mb-6">
                                                    <div className={`w-1.5 h-6 rounded-full ${aisle.label}`} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{pp} - Porta Palete</span>
                                                        <span className="text-[8px] font-bold text-[#ffcd00] uppercase">{idx % 2 === 0 ? 'Lateral Ímpar (01, 03...)' : 'Lateral Par (02, 04...)'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    {levels.map(level => (
                                                        <div key={level} className="flex items-center gap-2">
                                                            <div className="w-8 h-10 flex items-center justify-center font-black text-sm text-white/20 border-r border-white/5 mr-2">
                                                                {level}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {positionNums.map(num => {
                                                                    const pos = idx % 2 === 0 ? (num * 2 - 1) : (num * 2);
                                                                    if (pos > 40) return null;
                                                                    return <StatusBox key={pos} aisleId={aisle.id} pp={pp} level={level} pos={pos} isOdd={idx % 2 === 0} />;
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Corredor entre PPs (Apenas na Rua 1 e 2 onde tem 2 PPs) */}
                                            {idx === 0 && getPpsForAisle(aisle.id).length > 1 && (
                                                <div className="h-16 relative flex items-center justify-center group overflow-hidden">
                                                    <div className="absolute inset-x-0 h-px bg-sky-500/20 top-0" />
                                                    <div className="absolute inset-x-0 h-px bg-sky-500/20 bottom-0" />
                                                    <div className="w-full flex justify-between px-20">
                                                        {[...Array(15)].map((_, i) => (
                                                            <div key={i} className="w-10 h-1 bg-white/5 rounded-full" />
                                                        ))}
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="bg-[#0a0a0a] px-6 py-1 border border-sky-500/30 rounded-full flex items-center gap-3">
                                                            <div className="flex gap-1">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                                                                <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                                            </div>
                                                            <span className="text-[9px] font-black text-sky-400 tracking-[0.4em] uppercase">Corredor Logístico {aisle.name}</span>
                                                            <div className="flex gap-1 rotate-180">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                                                                <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 205, 0, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 205, 0, 0.4);
                }
                .gray-scale {
                    filter: grayscale(100%) brightness(0.5);
                }
            `}} />
        </EnterprisePageBase>
    );
};

export default WarehouseVisualMap;
