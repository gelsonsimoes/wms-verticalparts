import React, { useState, useEffect } from 'react';
import { 
    Filter, Eye, FileText, CheckCircle2, AlertCircle, Clock, 
    Play, Truck, Settings, ArrowUpRight, Ban, Calculator, 
    ShoppingCart, Box, X, PanelRightClose, RefreshCw, 
    Search, LayoutGrid, List, Layers, ClipboardCheck, 
    TruckIcon, PackageCheck, Scissors, FileSignature, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ====== TIPOS E DADOS FICTÍCIOS PARA MONITORAMENTO ======
const MOCK_NF_DATA = [
    { 
        id: 1, nf: '11422', serie: '1', client: 'VERTICAL DISTRIBUIDORA LTDA', 
        situacao: 'Aguardando Formação Onda', movEstoque: true, solicitCancel: false,
        status: { sepIni: false, sepFim: false, confIni: false, confFim: false },
        lastUpdate: '10:45', items: 12, value: 'R$ 1.250,00'
    },
    { 
        id: 2, nf: '11423', serie: '1', client: 'OFICINA DO ZE CAR VALHO', 
        situacao: 'Pendentes', movEstoque: true, solicitCancel: false,
        status: { sepIni: true, sepFim: false, confIni: false, confFim: false },
        lastUpdate: '11:10', items: 5, value: 'R$ 480,00'
    },
    { 
        id: 3, nf: '11424', serie: '1', client: 'AUTO PECAS AVENIDA', 
        situacao: 'Pendentes', movEstoque: true, solicitCancel: true,
        status: { sepIni: true, sepFim: true, confIni: true, confFim: false },
        lastUpdate: '09:20', items: 28, value: 'R$ 4.100,00'
    },
    { 
        id: 4, nf: '11425', serie: '1', client: 'TRANSP. RAPIDO BRASIL', 
        situacao: 'Processadas', movEstoque: false, solicitCancel: false,
        status: { sepIni: true, sepFim: true, confIni: true, confFim: true },
        lastUpdate: '08:15', items: 45, value: 'R$ 12.800,00'
    }
];

export default function OutboundMonitoring() {
    const [situacao, setSituacao] = useState('Todas');
    const [movEstoque, setMovEstoque] = useState(true);
    const [solicitCancel, setSolicitCancel] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerType, setDrawerType] = useState(''); // 'SEP' ou 'CONF'
    const [activeNf, setActiveNf] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Filter logic
    const filteredData = MOCK_NF_DATA.filter(item => {
        if (situacao !== 'Todas' && item.situacao !== situacao) return false;
        if (item.movEstoque !== movEstoque) return false;
        if (item.solicitCancel !== solicitCancel) return false;
        return true;
    });

    const handleExibir = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
    };

    const toggleRow = (id) => {
        setSelectedRows(prev => 
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const openDrawer = (nf, type) => {
        setActiveNf(nf);
        setDrawerType(type);
        setDrawerOpen(true);
    };

    // Estilo dos status do grid
    const renderStatusIndicator = (active, label) => (
        <div className="flex flex-col items-center gap-1 group/status">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                active 
                ? 'bg-secondary text-primary shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-300'
            }`}>
                {active ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
            </div>
            <span className={`text-[7px] font-black uppercase tracking-tighter ${active ? 'text-primary' : 'text-slate-400 opacity-50'}`}>
                {label}
            </span>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* ====== CABEÇALHO ====== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Truck className="w-8 h-8 text-secondary" /> Acompanhamento Saída por NF
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Cockpit Operacional de Expedição — Monitoramento Real-time</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-4 border border-slate-200 dark:border-slate-800 shadow-sm px-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase text-slate-400">Total NF na Grade</span>
                        <span className="text-lg font-black text-primary leading-none">{filteredData.length}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" />
                    <button onClick={handleExibir} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <RefreshCw className={`w-5 h-5 text-secondary ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ====== FILTROS RÁPIDOS ====== */}
            <div className="bg-primary p-6 rounded-[2rem] shadow-xl border-b-8 border-secondary/20 relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none" />
                
                <div className="flex flex-wrap items-end gap-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/50 uppercase tracking-widest px-1">Situação da Nota</label>
                        <select 
                            value={situacao}
                            onChange={(e) => setSituacao(e.target.value)}
                            className="bg-white/10 border-2 border-white/20 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-secondary transition-all appearance-none pr-10 min-w-[220px]"
                        >
                            <option className="bg-primary text-white">Todas</option>
                            <option className="bg-primary text-white">Pendentes</option>
                            <option className="bg-primary text-white">Processadas</option>
                            <option className="bg-primary text-white">Canceladas</option>
                            <option className="bg-primary text-white">Aguardando Formação Onda</option>
                        </select>
                    </div>

                    <div className="flex gap-6 items-center bg-white/5 px-6 py-2.5 rounded-2xl border border-white/10 mb-0.5">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Movimenta Estoque</span>
                            <button 
                                onClick={() => setMovEstoque(!movEstoque)}
                                className={`w-12 h-6 rounded-full p-1 transition-all ${movEstoque ? 'bg-secondary' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-primary transition-transform ${movEstoque ? 'translate-x-6' : ''}`} />
                            </button>
                            <span className="text-[10px] font-black text-white uppercase">{movEstoque ? 'SIM' : 'NÃO'}</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Solícit. Cancelamento</span>
                            <button 
                                onClick={() => setSolicitCancel(!solicitCancel)}
                                className={`w-12 h-6 rounded-full p-1 transition-all ${solicitCancel ? 'bg-danger' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-primary transition-transform ${solicitCancel ? 'translate-x-6' : ''}`} />
                            </button>
                            <span className="text-[10px] font-black text-white uppercase">{solicitCancel ? 'SIM' : 'NÃO'}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleExibir}
                        className="bg-secondary text-primary font-black py-2.5 px-8 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mb-0.5"
                    >
                        <Filter className="w-4 h-4" /> Exibir Dados
                    </button>
                </div>
            </div>

            {/* ====== TOOLBAR DE AÇÕES ====== */}
            <div className="flex flex-wrap gap-2 pt-2">
                {/* Grupo Controle */}
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 mr-2">Controle</span>
                    <button className="p-2 hover:bg-secondary/10 hover:text-secondary rounded-xl transition-all group" title="Faturar">
                        <FileSignature className="w-5 h-5 text-slate-500 group-hover:text-secondary" />
                    </button>
                    <button className="p-2 hover:bg-secondary/10 hover:text-secondary rounded-xl transition-all group" title="Gerar Separação">
                        <ShoppingCart className="w-5 h-5 text-slate-500 group-hover:text-secondary" />
                    </button>
                    <button className="p-2 hover:bg-secondary/10 hover:text-secondary rounded-xl transition-all group" title="Gerar Conferência">
                        <PackageCheck className="w-5 h-5 text-slate-500 group-hover:text-secondary" />
                    </button>
                    <button className="p-2 hover:bg-warning/10 hover:text-warning rounded-xl transition-all group" title="Fura Fila">
                        <Zap className="w-5 h-5 text-slate-500 group-hover:text-warning" />
                    </button>
                </div>

                {/* Grupo Detalhes */}
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 mr-2">Detalhes</span>
                    {['Itens', 'Lotes', 'Volumes', 'CT-e'].map(txt => (
                        <button key={txt} className="px-3 py-1.5 text-[9px] font-black uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all">{txt}</button>
                    ))}
                    <button className="p-2 hover:bg-danger/10 hover:text-danger rounded-xl transition-all group" title="Corte Físico">
                        <Scissors className="w-5 h-5 text-slate-500 group-hover:text-danger" />
                    </button>
                </div>

                {/* Grupo Acompanhamento */}
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 mr-2">Acompanhamento</span>
                    <button 
                        onClick={() => selectedRows.length > 0 && openDrawer(MOCK_NF_DATA.find(n => n.id === selectedRows[0]), 'SEP')}
                        className="px-4 py-1.5 text-[9px] font-black uppercase bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-30 disabled:grayscale"
                        disabled={selectedRows.length === 0}
                    >
                        Separação por Produto
                    </button>
                    <button 
                        onClick={() => selectedRows.length > 0 && openDrawer(MOCK_NF_DATA.find(n => n.id === selectedRows[0]), 'CONF')}
                        className="px-4 py-1.5 text-[9px] font-black uppercase bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-30 disabled:grayscale"
                        disabled={selectedRows.length === 0}
                    >
                        Conferência por Produto
                    </button>
                </div>
            </div>

            {/* ====== GRID PRINCIPAL ====== */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 w-12">
                                    <div className="w-5 h-5 border-2 border-slate-300 rounded cursor-pointer" />
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">NF / Série</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Situação Operacional</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Etapas Expedição</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente / Destinatário</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ult. Atualiz.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredData.map((item) => (
                                <tr 
                                    key={item.id} 
                                    onClick={() => toggleRow(item.id)}
                                    className={`group transition-all cursor-pointer ${selectedRows.includes(item.id) ? 'bg-secondary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                                            selectedRows.includes(item.id) ? 'bg-secondary border-secondary' : 'border-slate-300'
                                        }`}>
                                            {selectedRows.includes(item.id) && <Check className="w-3 h-3 text-primary" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-black text-lg text-primary">{item.nf}</p>
                                        <p className="text-[10px] font-bold text-slate-400">Série: {item.serie} • {item.items} itens</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded border w-fit ${
                                                item.situacao === 'Processadas' ? 'bg-success/10 text-success border-success/20' : 
                                                item.situacao === 'Aguardando Formação Onda' ? 'bg-warning/10 text-warning border-warning/20' : 
                                                'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                            }`}>
                                                {item.situacao}
                                            </span>
                                            {item.solicitCancel && (
                                                <span className="flex items-center gap-1 text-[8px] font-black text-danger uppercase">
                                                    <AlertCircle className="w-3 h-3" /> Solicit. Cancelamento
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-6">
                                            {renderStatusIndicator(item.status.sepIni, 'Sep. Iniciada')}
                                            {renderStatusIndicator(item.status.sepFim, 'Sep. Concluída')}
                                            <div className="w-4 h-px bg-slate-100 dark:bg-slate-700" />
                                            {renderStatusIndicator(item.status.confIni, 'Conf. Iniciada')}
                                            {renderStatusIndicator(item.status.confFim, 'Conf. Concluída')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-black text-xs uppercase text-slate-700 dark:text-slate-200 truncate max-w-[280px]">{item.client}</p>
                                        <p className="text-[10px] font-bold text-slate-400 italic">Vlr: {item.value}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-slate-400 group-hover:text-primary transition-colors">{item.lastUpdate}</span>
                                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-300">Hoje</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====== GAVETA LATERAL (OFFCANVAS) ====== */}
            {drawerOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                    
                    <aside className="w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl relative z-[110] flex flex-col animate-in slide-in-from-right duration-500">
                        {/* Drawer Header */}
                        <div className="p-8 border-b-8 border-secondary bg-primary text-white relative h-48 flex flex-col justify-end">
                            <button onClick={() => setDrawerOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all">
                                <X className="w-6 h-6 text-white" />
                            </button>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-[2rem] bg-secondary flex items-center justify-center shadow-lg">
                                    {drawerType === 'SEP' ? <ShoppingCart className="w-8 h-8 text-primary" /> : <PackageCheck className="w-8 h-8 text-primary" />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic tracking-tight">Detalhe por Produto</h3>
                                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Nota Fiscal: #{activeNf?.nf}</p>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <List className="w-4 h-4" /> Itens Processados
                                </h4>
                                
                                {/* Mock Item Rows para a Gaveta */}
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-secondary/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                                                <Box className="w-6 h-6 text-slate-400 group-hover:text-secondary transition-colors" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm tracking-tight text-primary">Barreira de Proteção Infravermelha (174 Feixes)</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">SKU: VEPEL-BPI-174FX | Origem: RUA-12-D01</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 mb-1 justify-end">
                                                <span className="text-lg font-black text-primary">0{i}</span>
                                                <span className="text-[10px] font-bold text-slate-300">/ 05</span>
                                            </div>
                                            <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-secondary" style={{ width: `${(i/5)*100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 rounded-3xl bg-secondary/10 border border-secondary/20 space-y-4">
                                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase">
                                    <BarChart3 className="w-4 h-4" /> Estatísticas do Batch
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Tempo Médio</p>
                                        <p className="text-xl font-black">02:45 <span className="text-[10px]">min/sku</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Operador</p>
                                        <p className="text-sm font-black">{drawerType === 'SEP' ? 'Matheus (Expedição)' : 'Thiago (Logística)'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-8 border-t border-slate-100 dark:border-slate-800">
                            <button 
                                onClick={() => setDrawerOpen(false)}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/95 transition-all shadow-xl shadow-primary/20"
                            >
                                Fechar Detalhamento
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}

// Subcomponente de Check (Ícone)
function Check({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

// Subcomponente BarChart3 (Ícone)
function BarChart3({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
        </svg>
    );
}

// Subcomponente CalendarDays (Ícone)
function CalendarDays({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
            <path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" />
        </svg>
    );
}
