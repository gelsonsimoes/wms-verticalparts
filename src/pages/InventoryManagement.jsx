import React, { useState, useEffect } from 'react';
import { 
    ClipboardList, 
    Users, 
    Box, 
    MapPin, 
    AlertTriangle, 
    Play, 
    RefreshCcw, 
    Activity, 
    Diff, 
    CheckCircle2, 
    X,
    Layers,
    Search,
    Filter,
    ChevronRight,
    ArrowLeft,
    ShieldAlert,
    Save,
    Edit2,
    Check
} from 'lucide-react';

const MOCK_INVENTORIES = [
    { id: 'INV-2026-001', description: 'Inventário Geral - Setor A', status: 'Liberado para Contagem', type: 'Picking e Pulmão', startDate: '22/02/2026' },
    { id: 'INV-2026-002', description: 'Rotativo Mensal - Eletrônicos', status: 'Aguardando Liberação', type: 'Somente Picking', startDate: '23/02/2026' },
    { id: 'INV-2026-003', description: 'Auditoria de Lote - Peças Pesadas', status: 'Finalizado', type: 'Somente Pulmão', startDate: '15/02/2026' },
];

const MOCK_MONITOR_DATA = [
    { id: 1, local: 'A-10-01-02', produto: 'Barreira de Proteção Infravermelha (174 Feixes)', lote: 'VEPEL-BPI-174FX', count1: 15, count2: 15 },
    { id: 2, local: 'A-10-01-05', produto: 'Escova de Segurança (Nylon - Base 27mm)', lote: 'VPER-ESS-NY-27MM', count1: 120, count2: 118 },
    { id: 3, local: 'A-10-02-01', produto: 'Pallet de Aço Inox (1000mm)', lote: 'VPER-PAL-INO-1000', count1: 10, count2: 0 },
    { id: 4, local: 'A-10-03-01', produto: 'InnerCap (Esquerdo) - Ref.: VERTICALPARTS', lote: 'VPER-INC-ESQ', count1: 45, count2: 45 },
];

export default function InventoryManagement() {
    const [view, setView] = useState('master'); // 'master' or 'monitor'
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [monitorData, setMonitorData] = useState(MOCK_MONITOR_DATA);
    const [criticaActive, setCriticaActive] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleMonitor = (inv) => {
        setSelectedInventory(inv);
        setView('monitor');
    };

    const toggleCritica = () => setCriticaActive(!criticaActive);

    const handleEditCount = (item) => setEditingItem(item);

    const saveManualCount = (id, field, value) => {
        setMonitorData(prev => prev.map(item => 
            item.id === id ? { ...item, [field]: parseInt(value) || 0 } : item
        ));
        setEditingItem(null);
    };

    if (view === 'monitor') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => setView('master')}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-black text-xs uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-5 h-5" /> Voltar para Gestão
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-secondary/20 px-4 py-2 rounded-xl border border-secondary/30">
                            <span className="text-[10px] font-black text-secondary uppercase tracking-tighter">Inventário Ativo: </span>
                            <span className="text-xs font-black text-primary">{selectedInventory?.id}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-primary p-8 rounded-[3rem] shadow-2xl border-b-8 border-secondary relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-white italic flex items-center gap-3">
                                <Activity className="w-8 h-8 text-secondary animate-pulse" /> Monitoramento em Tempo Real
                            </h2>
                            <p className="text-white/40 text-xs font-bold mt-1 uppercase tracking-widest">Controle de contagens por operador e divergências</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={toggleCritica}
                                className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 outline-none ${
                                    criticaActive ? 'bg-secondary text-primary shadow-xl shadow-black/20 ring-4 ring-secondary/20' : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                <RefreshCcw className={`w-4 h-4 ${criticaActive ? 'animate-spin-slow' : ''}`} /> Atualizar Crítica
                            </button>
                            <button className="bg-white/10 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                                <Diff className="w-4 h-4" /> Diferença por Produto
                            </button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-b-8 border-slate-100 dark:border-slate-700">
                    <table className="w-full text-left order-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-5">Localização</th>
                                <th className="px-8 py-5">Produto / Lote</th>
                                <th className="px-8 py-5 text-center">1ª Contagem</th>
                                <th className="px-8 py-5 text-center">2ª Contagem</th>
                                <th className="px-8 py-5 text-center">Situação</th>
                                <th className="px-8 py-5 text-right">Ação Superv.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                            {monitorData.map(item => {
                                const isMatch = item.count1 === item.count2 && item.count1 > 0;
                                const isDivergent = item.count1 !== item.count2 && item.count2 > 0;
                                
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all">
                                        <td className="px-8 py-5 font-black text-primary">{item.local}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{item.produto}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">LOTE: {item.lote}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center font-mono text-base">
                                            {editingItem?.id === item.id && editingItem?.field === 'count1' ? (
                                                <input 
                                                    autoFocus
                                                    type="number"
                                                    className="w-20 bg-secondary/10 border-2 border-secondary rounded-lg text-center font-black text-primary outline-none"
                                                    onBlur={(e) => saveManualCount(item.id, 'count1', e.target.value)}
                                                />
                                            ) : (
                                                <span className="font-black text-slate-400 italic">{item.count1}</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-center font-mono text-base">
                                            {editingItem?.id === item.id && editingItem?.field === 'count2' ? (
                                                <input 
                                                    autoFocus
                                                    type="number"
                                                    className="w-20 bg-secondary/10 border-2 border-secondary rounded-lg text-center font-black text-primary outline-none"
                                                    onBlur={(e) => saveManualCount(item.id, 'count2', e.target.value)}
                                                />
                                            ) : (
                                                <span className="font-black text-slate-400 italic">{item.count2}</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {criticaActive ? (
                                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-tighter animate-in zoom-in duration-300 ${
                                                    isMatch ? 'bg-success/10 text-success border border-success/20' : 
                                                    isDivergent ? 'bg-danger/10 text-danger border border-danger/20' : 
                                                    'bg-warning/10 text-warning border border-warning/20'
                                                }`}>
                                                    {isMatch ? <Check className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                                    {isMatch ? 'Concluído' : isDivergent ? 'Recontar' : 'Aguardando'}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 font-black italic">--</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => handleEditCount({ id: item.id, field: 'count2' })}
                                                className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-secondary hover:text-primary rounded-xl transition-all group"
                                                title="Alteração Manual Autorizada"
                                            >
                                                <Edit2 className="w-4 h-4 group-hover:scale-110" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* ====== CABEÇALHO ====== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-secondary" /> Gestão de Inventário
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Planejamento e auditoria de acuracidade de estoque</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="bg-primary text-white px-6 py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 group flex items-center gap-3">
                        <PlusCircle className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Novo Inventário</span>
                    </button>
                </div>
            </div>

            {/* ====== TOOLBOX: PLANEJAMENTO ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-secondary/10 rounded-2xl">
                            <Layers className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-primary italic">Fase 1: Planejamento</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Vínculo de recursos e auditoria analítica</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl hover:border-secondary transition-all group flex flex-col gap-3">
                            <Users className="w-6 h-6 text-slate-400 group-hover:text-secondary group-hover:scale-110 transition-all" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Vincular Usuários</span>
                        </button>
                        <button className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl hover:border-secondary transition-all group flex flex-col gap-3">
                            <Box className="w-6 h-6 text-slate-400 group-hover:text-secondary group-hover:scale-110 transition-all" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Vincular Produtos</span>
                        </button>
                        <button className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl hover:border-secondary transition-all group flex flex-col gap-3">
                            <MapPin className="w-6 h-6 text-slate-400 group-hover:text-secondary group-hover:scale-110 transition-all" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Vincular Locais</span>
                        </button>
                        <button className="bg-primary/5 border-2 border-dashed border-primary/20 p-5 rounded-3xl hover:bg-primary/10 transition-all group flex flex-col gap-3 justify-center text-center">
                            <AlertTriangle className="w-6 h-6 text-primary/40 mx-auto group-hover:text-primary transition-colors" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Verificar Pendências</span>
                        </button>
                    </div>
                </div>

                {/* ====== TOOLBOX: EXECUÇÃO ====== */}
                <div className="bg-primary p-8 rounded-[3rem] shadow-2xl border-b-8 border-secondary relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-8 relative z-10">
                        <div className="p-4 bg-white/10 rounded-2xl">
                            <Play className="w-6 h-6 text-secondary fill-current" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white italic">Fase 2: Execução e Controle</h3>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-0.5">Operacionalização em tempo real</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <button className="bg-secondary text-primary p-6 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 flex flex-col items-center gap-2">
                            <Play className="w-6 h-6 fill-current" /> Liberar Contagem
                        </button>
                        <button 
                            onClick={() => selectedInventory && handleMonitor(selectedInventory)}
                            disabled={!selectedInventory}
                            className={`p-6 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl flex flex-col items-center gap-2 ${
                                selectedInventory 
                                ? 'bg-white/10 text-white hover:bg-white/20 shadow-black/10' 
                                : 'bg-white/5 text-white/20 cursor-not-allowed shadow-none'
                            }`}
                        >
                            <Activity className="w-6 h-6" /> Monitorar
                        </button>
                        <button className="bg-white/10 text-white p-6 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all flex flex-col items-center gap-2">
                            <RefreshCcw className="w-6 h-6" /> Atualizar Estoque
                        </button>
                        <button className="bg-white text-primary p-6 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl shadow-black/10 flex flex-col items-center gap-2">
                            <Diff className="w-6 h-6" /> Divergência Produto
                        </button>
                    </div>
                    {/* Decor */}
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full -mr-40 -mb-40 blur-3xl pointer-events-none group-hover:bg-secondary/20 transition-all duration-1000" />
                </div>
            </div>

            {/* ====== GRID MASTER ====== */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-b-8 border-slate-100 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left order-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-5">idInventário</th>
                                <th className="px-8 py-5">Descrição / Objeto</th>
                                <th className="px-8 py-5">Tipo de Contagem</th>
                                <th className="px-8 py-5">Situação</th>
                                <th className="px-8 py-5">Data de Início</th>
                                <th className="px-8 py-5 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                            {MOCK_INVENTORIES.map(inv => (
                                <tr 
                                    key={inv.id} 
                                    onClick={() => setSelectedInventory(inv)}
                                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group ${selectedInventory?.id === inv.id ? 'bg-secondary/5 border-l-4 border-secondary' : 'border-l-4 border-transparent'}`}
                                >
                                    <td className="px-8 py-5 font-black text-primary">{inv.id}</td>
                                    <td className="px-8 py-5 font-bold">{inv.description}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                {inv.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 text-[8px] font-black uppercase rounded-lg border flex items-center gap-1.5 w-fit ${
                                            inv.status === 'Liberado para Contagem' ? 'bg-success/10 text-success border-success/20' :
                                            inv.status === 'Aguardando Liberação' ? 'bg-warning/10 text-warning border-warning/20' :
                                            'bg-info/10 text-info border-info/20'
                                        }`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 font-mono text-slate-400 italic">{inv.startDate}</td>
                                    <td className="px-8 py-5 text-right">
                                        <ChevronRight className={`w-5 h-5 text-slate-200 group-hover:text-secondary group-hover:translate-x-1 transition-all ${selectedInventory?.id === inv.id ? 'rotate-90' : ''}`} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Custom animations defined in globals, but using Tailwind classes for standard flow
const PlusCircle = Plus;
function Plus(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
