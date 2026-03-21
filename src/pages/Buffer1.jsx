// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️  LAYOUT PROTEGIDO — NÃO SIMPLIFICAR / NÃO REVERTER  ⚠️
// Página 2.17 — Buffer 1 (Zona de Entrada / Recebimento)
// Layout profissional com grade de posições, TV Mode e filtros visuais.
// Restaurado de v4.3.25.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { supabase } from '../lib/supabaseClient';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import { Search, Monitor, X, ArrowRight, Layers, Box, CheckCircle2, XCircle } from 'lucide-react';

// ─── Toast inline ────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
    const bg =
        type === 'erro' ? 'bg-red-600 border-red-400' :
        type === 'warn' ? 'bg-amber-500 border-amber-300' :
        'bg-green-600 border-green-400';
    return (
        <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border-2 text-white cursor-pointer ${bg}`}
            onClick={onClose}
            role="alert"
        >
            {type === 'erro' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {msg}
        </div>
    );
}

const ROWS = [1, 2, 3, 4, 5, 6, 7];
const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
const TOTAL_POSITIONS = ROWS.length * COLS.length; // 98

const Buffer1 = () => {
    const location = useLocation();
    const { warehouseId } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredPos, setHoveredPos] = useState(null);
    const [ocupados, setOcupados] = useState([]); // [{ endereco_id, sku, item }]
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
        const fetch = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('alocacao_estoque')
                .select('endereco_id, quantidade, produto_id, produtos(sku, nome)')
                .eq('warehouse_id', warehouseId)
                .like('endereco_id', 'B1_%')
                .gt('quantidade', 0);
            if (error) {
                showToast('Erro ao carregar Buffer 1.', 'erro');
                setLoading(false);
                return;
            }
            setOcupados((data || []).map(r => ({
                endereco_id: r.endereco_id,
                sku: r.produtos?.sku || r.produto_id || '',
                item: r.produtos?.nome || '',
                quantidade: r.quantidade,
            })));
            setLoading(false);
        };
        fetch();

        const channel = supabase
            .channel('buffer1-rt')
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'alocacao_estoque',
                filter: `warehouse_id=eq.${warehouseId}`,
            }, fetch)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [warehouseId]);

    const getAddressData = (linha, coluna) => {
        const address = `B1_${linha}${coluna}`;
        return ocupados.find(d => d.endereco_id === address);
    };

    const StatusBox = ({ linha, coluna }) => {
        const data = getAddressData(linha, coluna);
        const occupied = !!data;
        const address = `B1_${linha}${coluna}`;

        const isSelected = searchTerm &&
            (address.toLowerCase().includes(searchTerm.toLowerCase()) ||
             data?.sku?.toLowerCase().includes(searchTerm.toLowerCase()));

        return (
            <div
                onMouseEnter={() => setHoveredPos({ linha, coluna, data, address })}
                onMouseLeave={() => setHoveredPos(null)}
                className={`
                    group relative w-10 h-10 flex items-center justify-center rounded-sm transition-all duration-300
                    border border-blue-400/50
                    ${occupied
                        ? 'bg-red-600/90 border-red-400 scale-[0.98] shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                        : 'bg-blue-500/25 text-blue-300 hover:bg-blue-400/40 hover:border-blue-300/70 hover:scale-110 hover:z-10 cursor-pointer'
                    }
                    ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black z-20 scale-110 !border-white' : ''}
                `}
            >
                {occupied ? (
                    <X size={24} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                ) : (
                    <span className="text-[9px] font-semibold text-white/70 group-hover:text-white">{linha}{coluna}</span>
                )}
            </div>
        );
    };

    return (
        <EnterprisePageBase
            title="2.17 Buffer 1 - Área de Caixas Grandes"
            subtitle="Monitoramento visual de área de piso (7m x 14m)"
            actions={
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#ffcd00]" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar SKU ou Endereço (ex: B1_1A)..."
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
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

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

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 bg-[#0a0a0a] rounded-2xl border border-white/5 p-6 flex flex-wrap gap-8 items-center justify-between">
                        <div className="flex gap-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Ocupação Total</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black text-blue-500">
                                        {loading ? '…' : `${Math.round((ocupados.length / TOTAL_POSITIONS) * 100)}%`}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Posições Livres</span>
                                <span className="text-3xl font-black text-white">{loading ? '…' : TOTAL_POSITIONS - ocupados.length}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Área Útil</span>
                                <span className="text-xl font-black text-white/60">98 m²</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl border bg-blue-500/10 border-blue-500/20 shadow-lg shadow-blue-500/5">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-black uppercase text-blue-400 font-black">Buffer 1</span>
                                    <span className="text-[8px] font-bold text-white/40">Zona de Recebimento</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-600/5 border border-red-600/20 rounded-2xl p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <X className="text-red-500" size={20} />
                            <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded uppercase">Atenção</span>
                        </div>
                        <h4 className="text-xs font-black text-white uppercase tracking-tight mb-1">Armazenagem Piso</h4>
                        <p className="text-[10px] text-white/50 leading-tight">Proibido empilhamento acima de 1.5m nesta área por questões de segurança e visibilidade das câmeras.</p>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="relative">
                    {/* Tooltip */}
                    {hoveredPos && (
                        <div
                            className="fixed z-[100] bg-black/90 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-2xl pointer-events-none animate-in fade-in zoom-in duration-200"
                            style={{
                                left: `${Math.min(window.innerWidth - 250, 20)}px`,
                                bottom: '20px'
                            }}
                        >
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                    <span className="text-[10px] font-black text-blue-400 tracking-widest">{hoveredPos.address}</span>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${hoveredPos.data ? 'bg-red-600' : 'bg-green-600'} text-white uppercase`}>
                                        {hoveredPos.data ? 'OCUPADO' : 'LIVRE'}
                                    </span>
                                </div>
                                {hoveredPos.data ? (
                                    <>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-bold text-white/40 uppercase">Produto / SKU</span>
                                            <span className="text-xs font-black text-white leading-tight">{hoveredPos.data.item || '—'}</span>
                                            <span className="text-[10px] font-mono text-blue-400/80">{hoveredPos.data.sku}</span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-bold text-white/40 uppercase">Qtd</span>
                                                <span className="text-xs font-black text-white">{hoveredPos.data.quantidade}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] font-bold text-white/40 uppercase">Tipo</span>
                                                <span className="text-xs font-black text-white">BOX</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-[10px] text-white/60 italic">Espaço disponível para alocação de caixa.</span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-6 overflow-x-auto pb-10 custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-blue-500/20">
                                    1
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                        Buffer 1
                                    </h2>
                                    <p className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                        Área de Caixas Grandes <ArrowRight size={14} className="text-white/20" /> 7m × 14m <ArrowRight size={14} className="text-white/20" /> 98 posições
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1 bg-black rounded-lg border border-white/5 text-[10px] font-black text-white/60">COLUNAS: A a N</div>
                                <div className="px-3 py-1 bg-black rounded-lg border border-white/5 text-[10px] font-black text-white/60">LINHAS: 1 a 7</div>
                            </div>
                        </div>

                        <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-8 relative shadow-2xl">
                            {/* Legenda */}
                            <div className="flex gap-5 mb-6 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-sm bg-blue-500/25 border border-blue-400/50" />
                                    <span className="text-xs text-slate-300">Livre</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-sm bg-red-600/90 border border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                                    <span className="text-xs text-slate-300">Ocupado</span>
                                </div>
                                {loading && (
                                    <span className="text-xs text-blue-400 animate-pulse">Carregando dados...</span>
                                )}
                                {!loading && ocupados.length === 0 && (
                                    <span className="text-xs text-white/40 italic">Nenhuma posição ocupada neste buffer.</span>
                                )}
                            </div>
                             {/* CSS Grid for perfect Excel-like alignment */}
                             <div className="grid grid-cols-[40px_repeat(14,1fr)] gap-2">
                                {/* Header: Column Labels */}
                                <div className="w-10" />
                                {COLS.map(col => (
                                    <div key={col} className="text-center text-xs font-black text-white/20 uppercase">
                                        {col}
                                    </div>
                                ))}

                                {/* Grid content by rows */}
                                {ROWS.map(row => (
                                    <React.Fragment key={row}>
                                        {/* Row label */}
                                        <div className="flex items-center justify-center text-xs font-black text-white/20 border-r border-white/5">
                                            {row}
                                        </div>
                                        {/* Row cells */}
                                        {COLS.map(col => (
                                            <div key={`${row}-${col}`} className="flex justify-center items-center">
                                                <StatusBox linha={row} coluna={col} />
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.4); }
            `}} />
        </EnterprisePageBase>
    );
};

export default Buffer1;
