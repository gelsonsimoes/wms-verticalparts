import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';
import { Search, Monitor, X, ArrowRight, Layers, Box } from 'lucide-react';

const ROWS = [1, 2, 3, 4, 5];
const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
const TOTAL = ROWS.length * COLS.length;

const CorredorFundos = () => {
    const location = useLocation();
    useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredPos, setHoveredPos] = useState(null);

    const getAddressData = () => null;

    const StatusBox = ({ linha, coluna }) => {
        const data = getAddressData(linha, coluna);
        const occupied = data?.ocupado ?? false;
        const address = `CF_${linha}${coluna}`;

        const isSelected = searchTerm &&
            (address.toLowerCase().includes(searchTerm.toLowerCase()) ||
             data?.sku?.toLowerCase().includes(searchTerm.toLowerCase()));

        return (
            <div
                onMouseEnter={() => setHoveredPos({ linha, coluna, data, address })}
                onMouseLeave={() => setHoveredPos(null)}
                className={`
                    group relative w-10 h-10 flex items-center justify-center rounded-sm transition-all duration-300
                    border border-teal-500/20
                    ${occupied
                        ? 'bg-red-600/90 border-red-400 scale-[0.98] shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]'
                        : 'bg-teal-500/10 text-teal-400 hover:scale-110 hover:z-10 cursor-pointer'
                    }
                    ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black z-20 scale-110 !border-white' : ''}
                `}
            >
                {occupied ? (
                    <X size={24} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                ) : (
                    <span className="text-[9px] font-black opacity-30 group-hover:opacity-100">{linha}{coluna}</span>
                )}
            </div>
        );
    };

    return (
        <EnterprisePageBase
            title="2.20 Corredor Fundos"
            subtitle="Monitoramento visual do corredor de fundos"
            actions={
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Buscar SKU ou Endereço (ex: CF_1A)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black border border-white/10 rounded-lg pr-10 pl-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#ffcd00] w-64 transition-all"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#ffcd00]" size={16} />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#ffcd00] text-black rounded-lg font-black text-xs hover:bg-[#ffe066] transition-all shadow-lg active:scale-95">
                        <Monitor size={14} />
                        TV DASHBOARD
                    </button>
                </div>
            }
        >
            <div className="space-y-8 pb-20">
                {/* Navigation */}
                <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
                    <Link to="/operacao/mapa-visual" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${location.pathname === '/operacao/mapa-visual' ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}><Layers size={15} />MAPA VISUAL</Link>
                    <Link to="/operacao/buffer-1" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${location.pathname === '/operacao/buffer-1' ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}><Box size={15} />BUFFER 1</Link>
                    <Link to="/operacao/buffer-2" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${location.pathname === '/operacao/buffer-2' ? 'bg-purple-500 text-white scale-110 shadow-lg shadow-purple-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}><Box size={15} />BUFFER 2</Link>
                    <Link to="/operacao/producao" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${location.pathname === '/operacao/producao' ? 'bg-orange-500 text-white scale-110 shadow-lg shadow-orange-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}><Box size={15} />PRODUÇÃO</Link>
                    <Link to="/operacao/corredor-fundos" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${location.pathname === '/operacao/corredor-fundos' ? 'bg-teal-500 text-white scale-110 shadow-lg shadow-teal-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}><ArrowRight size={15} />CORREDOR FUNDOS</Link>
                    <Link to="/operacao/suporte-guias" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${location.pathname === '/operacao/suporte-guias' ? 'bg-violet-500 text-white scale-110 shadow-lg shadow-violet-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}><Box size={15} />SUPORTE GUIAS</Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 bg-[#0a0a0a] rounded-2xl border border-white/5 p-6 flex flex-wrap gap-8 items-center justify-between">
                        <div className="flex gap-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Ocupação Total</span>
                                <span className="text-3xl font-black text-teal-500">0%</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Posições Livres</span>
                                <span className="text-3xl font-black text-white">{TOTAL}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Área Útil</span>
                                <span className="text-xl font-black text-white/60">{TOTAL} posições</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl border bg-teal-500/10 border-teal-500/20">
                            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-teal-400">Corredor Fundos</span>
                                <span className="text-[8px] font-bold text-white/40">Área de Passagem/Estoque</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-teal-600/5 border border-teal-600/20 rounded-2xl p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <ArrowRight className="text-teal-500" size={20} />
                            <span className="text-[9px] font-black bg-teal-600 text-white px-2 py-0.5 rounded uppercase">Info</span>
                        </div>
                        <h4 className="text-xs font-black text-white uppercase tracking-tight mb-1">Corredor Fundos</h4>
                        <p className="text-[10px] text-white/50 leading-tight">Corredor traseiro de movimentação e armazenamento temporário. Prefixo CF_.</p>
                    </div>
                </div>

                {/* Grid */}
                <div className="relative">
                    {hoveredPos && (
                        <div className="fixed z-[100] bg-black/90 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-2xl pointer-events-none animate-in fade-in zoom-in duration-200" style={{ left: '20px', bottom: '20px' }}>
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                    <span className="text-[10px] font-black text-teal-400 tracking-widest">{hoveredPos.address}</span>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${hoveredPos.data?.ocupado ? 'bg-red-600' : 'bg-green-600'} text-white uppercase`}>
                                        {hoveredPos.data?.ocupado ? 'OCUPADO' : 'LIVRE'}
                                    </span>
                                </div>
                                {hoveredPos.data?.ocupado ? (
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-bold text-white/40 uppercase">Produto / SKU</span>
                                        <span className="text-xs font-black text-white">{hoveredPos.data.item}</span>
                                        <span className="text-[10px] font-mono text-teal-400/80">{hoveredPos.data.sku}</span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-white/60 italic">Posição disponível.</span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-6 overflow-x-auto pb-10 custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-teal-500/20">
                                    CF
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Corredor Fundos</h2>
                                    <p className="text-sm font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2">
                                        Corredor Traseiro <ArrowRight size={14} className="text-white/20" /> {ROWS.length} linhas × {COLS.length} colunas <ArrowRight size={14} className="text-white/20" /> {TOTAL} posições
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1 bg-black rounded-lg border border-white/5 text-[10px] font-black text-white/60">COLUNAS: A a {COLS[COLS.length - 1]}</div>
                                <div className="px-3 py-1 bg-black rounded-lg border border-white/5 text-[10px] font-black text-white/60">LINHAS: 1 a {ROWS[ROWS.length - 1]}</div>
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-2xl p-8">
                            <div className={`grid grid-cols-[40px_repeat(${COLS.length},1fr)] gap-2`}>
                                <div className="w-10" />
                                {COLS.map(col => (
                                    <div key={col} className="text-center text-xs font-black text-white/20 uppercase">{col}</div>
                                ))}
                                {ROWS.map(row => (
                                    <React.Fragment key={row}>
                                        <div className="flex items-center justify-center text-xs font-black text-white/20 border-r border-white/5">{row}</div>
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
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(20,184,166,0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(20,184,166,0.4); }
            `}} />
        </EnterprisePageBase>
    );
};

export default CorredorFundos;
