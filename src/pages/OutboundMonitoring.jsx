import React, { useState, useRef, useEffect } from 'react';
import {
    Filter, CheckCircle2, AlertCircle, Clock,
    Truck, ShoppingCart, Box, X, RefreshCw,
    List, PackageCheck, Scissors, FileSignature, Zap,
    Check, BarChart3, CalendarDays,
} from 'lucide-react';

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
    const [situacao,      setSituacao]      = useState('Todas');
    const [movEstoque,    setMovEstoque]    = useState(null); // null = todos, true = sim, false = não
    const [solicitCancel, setSolicitCancel] = useState(null);
    const [selectedRows,  setSelectedRows]  = useState([]);
    const [drawerOpen,    setDrawerOpen]    = useState(false);
    const [drawerType,    setDrawerType]    = useState('');
    const [activeNf,      setActiveNf]      = useState(null);
    const [isLoading,     setIsLoading]     = useState(false);
    const [periodoOpen,   setPeriodoOpen]   = useState(false);
    const [periodo,       setPeriodo]       = useState('Hoje');

    // Timeout ref — evita memory leak ao desmontar o componente
    const loadingRef = useRef(null);
    useEffect(() => () => { if (loadingRef.current) clearTimeout(loadingRef.current); }, []);

    // Filter logic
    const filteredData = MOCK_NF_DATA.filter(item => {
        if (situacao !== 'Todas' && item.situacao !== situacao) return false;
        if (movEstoque    !== null && item.movEstoque    !== movEstoque)    return false;
        if (solicitCancel !== null && item.solicitCancel !== solicitCancel) return false;
        return true;
    });

    // Checkbox selecionar todos
    const allSelected = filteredData.length > 0 &&
        filteredData.every(item => selectedRows.includes(item.id));
    const someSelected = !allSelected && filteredData.some(item => selectedRows.includes(item.id));

    const toggleAll = () => {
        if (allSelected) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredData.map(item => item.id));
        }
    };

    const handleExibir = () => {
        setIsLoading(true);
        if (loadingRef.current) clearTimeout(loadingRef.current);
        loadingRef.current = setTimeout(() => setIsLoading(false), 500);
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
                {active
                    ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    : <Clock className="w-4 h-4" aria-hidden="true" />
                }
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
                        <Truck className="w-8 h-8 text-secondary" aria-hidden="true" /> Acompanhamento Saída por NF
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Cockpit Operacional de Expedição — Monitoramento Real-time</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-4 border border-slate-200 dark:border-slate-800 shadow-sm px-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase text-slate-400">Total NF na Grade</span>
                        <span className="text-lg font-black text-primary leading-none">{filteredData.length}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" aria-hidden="true" />
                    <button
                        onClick={handleExibir}
                        aria-label={isLoading ? 'Atualizando dados...' : 'Atualizar dados da grade'}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 text-secondary ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* ====== FILTROS RÁPIDOS ====== */}
            <div className="bg-primary p-6 rounded-[2rem] shadow-xl border-b-8 border-secondary/20 relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none" aria-hidden="true" />

                <div className="flex flex-wrap items-end gap-6 relative z-10">
                    <div className="space-y-2">
                        <label htmlFor="situacao-nf" className="text-[10px] font-black text-white/50 uppercase tracking-widest px-1">Situação da Nota</label>
                        <select
                            id="situacao-nf"
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
                        {/* Toggle: Movimenta Estoque — 3 estados: null/true/false */}
                        <div className="flex items-center gap-3">
                            <span id="lbl-mov-estoque" className="text-[10px] font-black text-white/50 uppercase tracking-widest">Movimenta Estoque</span>
                            <button
                                role="switch"
                                aria-checked={movEstoque === null ? 'mixed' : movEstoque}
                                aria-labelledby="lbl-mov-estoque"
                                onClick={() => setMovEstoque(v => v === null ? true : v === true ? false : null)}
                                className={`w-12 h-6 rounded-full p-1 transition-all focus:outline-none focus:ring-2 focus:ring-secondary ${
                                    movEstoque === true  ? 'bg-secondary' :
                                    movEstoque === false ? 'bg-red-500' :
                                    'bg-slate-700'
                                }`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-primary transition-transform ${
                                    movEstoque === true  ? 'translate-x-6' :
                                    movEstoque === false ? 'translate-x-3' :
                                    ''
                                }`} aria-hidden="true" />
                            </button>
                            <span className="text-[10px] font-black text-white uppercase">
                                {movEstoque === null ? 'TODOS' : movEstoque ? 'SIM' : 'NÃO'}
                            </span>
                        </div>
                        <div className="w-px h-6 bg-white/10" aria-hidden="true" />
                        {/* Toggle: Solicitação de Cancelamento */}
                        <div className="flex items-center gap-3">
                            <span id="lbl-solit-cancel" className="text-[10px] font-black text-white/50 uppercase tracking-widest">Solícit. Cancelamento</span>
                            <button
                                role="switch"
                                aria-checked={solicitCancel === null ? 'mixed' : solicitCancel}
                                aria-labelledby="lbl-solit-cancel"
                                onClick={() => setSolicitCancel(v => v === null ? true : v === true ? false : null)}
                                className={`w-12 h-6 rounded-full p-1 transition-all focus:outline-none focus:ring-2 focus:ring-secondary ${
                                    solicitCancel === true  ? 'bg-red-500' :
                                    solicitCancel === false ? 'bg-secondary' :
                                    'bg-slate-700'
                                }`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-primary transition-transform ${
                                    solicitCancel === true  ? 'translate-x-6' :
                                    solicitCancel === false ? 'translate-x-3' :
                                    ''
                                }`} aria-hidden="true" />
                            </button>
                            <span className="text-[10px] font-black text-white uppercase">
                                {solicitCancel === null ? 'TODOS' : solicitCancel ? 'SIM' : 'NÃO'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleExibir}
                        aria-label="Aplicar filtros e exibir dados"
                        className="bg-secondary text-primary font-black py-2.5 px-8 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mb-0.5"
                    >
                        <Filter className="w-4 h-4" aria-hidden="true" /> Exibir Dados
                    </button>

                    {/* Dropdown de Período (visual) */}
                    <div className="relative mb-0.5">
                        <button
                            onClick={() => setPeriodoOpen(v => !v)}
                            aria-haspopup="listbox"
                            aria-expanded={periodoOpen}
                            aria-label={`Período: ${periodo}`}
                            className="bg-white/10 border-2 border-white/20 rounded-xl px-4 py-2.5 text-white font-bold text-xs uppercase tracking-widest outline-none hover:border-secondary transition-all flex items-center gap-2"
                        >
                            <Clock className="w-4 h-4" aria-hidden="true" /> {periodo}
                        </button>
                        {periodoOpen && (
                            <div
                                role="listbox"
                                aria-label="Selecionar período"
                                className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden min-w-[160px]"
                            >
                                {['Hoje', '3 dias', '7 dias', '15 dias', '30 dias'].map(p => (
                                    <button
                                        key={p}
                                        role="option"
                                        aria-selected={periodo === p}
                                        onClick={() => { setPeriodo(p); setPeriodoOpen(false); }}
                                        className={`w-full px-5 py-3 text-left text-xs font-black uppercase tracking-wider transition-colors ${
                                            periodo === p
                                                ? 'bg-secondary text-primary'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ====== TOOLBAR DE AÇÕES ====== */}
            <div className="flex flex-wrap gap-2 pt-2">
                {/* Grupo Controle */}
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 mr-2" aria-hidden="true">Controle</span>
                    <button aria-label="Faturar NF selecionada" className="p-2 hover:bg-secondary/10 hover:text-secondary rounded-xl transition-all group">
                        <FileSignature className="w-5 h-5 text-slate-500 group-hover:text-secondary" aria-hidden="true" />
                    </button>
                    <button aria-label="Gerar Separação" className="p-2 hover:bg-secondary/10 hover:text-secondary rounded-xl transition-all group">
                        <ShoppingCart className="w-5 h-5 text-slate-500 group-hover:text-secondary" aria-hidden="true" />
                    </button>
                    <button aria-label="Gerar Conferência" className="p-2 hover:bg-secondary/10 hover:text-secondary rounded-xl transition-all group">
                        <PackageCheck className="w-5 h-5 text-slate-500 group-hover:text-secondary" aria-hidden="true" />
                    </button>
                    <button aria-label="Fura Fila — prioridade imediata" className="p-2 hover:bg-amber-100 hover:text-amber-600 rounded-xl transition-all group">
                        <Zap className="w-5 h-5 text-slate-500 group-hover:text-amber-600" aria-hidden="true" />
                    </button>
                </div>

                {/* Grupo Detalhes */}
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 mr-2" aria-hidden="true">Detalhes</span>
                    {['Itens', 'Lotes', 'Volumes', 'CT-e'].map(txt => (
                        <button key={txt} aria-label={`Ver ${txt}`} className="px-3 py-1.5 text-[9px] font-black uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all">{txt}</button>
                    ))}
                    <button aria-label="Corte Físico" className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group">
                        <Scissors className="w-5 h-5 text-slate-500 group-hover:text-red-600" aria-hidden="true" />
                    </button>
                </div>

                {/* Grupo Acompanhamento */}
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 mr-2" aria-hidden="true">Acompanhamento</span>
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
                                {/* Checkbox "selecionar todos" */}
                                <th scope="col" className="px-6 py-4 w-12">
                                    <button
                                        role="checkbox"
                                        aria-checked={allSelected ? true : someSelected ? 'mixed' : false}
                                        aria-label="Selecionar todas as notas fiscais visíveis"
                                        onClick={toggleAll}
                                        className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-secondary ${
                                            allSelected
                                                ? 'bg-secondary border-secondary'
                                                : 'border-slate-300 hover:border-secondary'
                                        }`}
                                    >
                                        {allSelected && <Check className="w-3 h-3 text-primary" aria-hidden="true" />}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">NF / Série</th>
                                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Situação Operacional</th>
                                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Etapas Expedição</th>
                                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente / Destinatário</th>
                                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ult. Atualiz.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredData.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => toggleRow(item.id)}
                                    className={`group transition-all cursor-pointer ${selectedRows.includes(item.id) ? 'bg-secondary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                                >
                                    {/* Checkbox da linha — stopPropagation evita dupla seleção */}
                                    <td className="px-6 py-4">
                                        <button
                                            role="checkbox"
                                            aria-checked={selectedRows.includes(item.id)}
                                            aria-label={`Selecionar NF ${item.nf}`}
                                            onClick={(e) => { e.stopPropagation(); toggleRow(item.id); }}
                                            className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-secondary ${
                                                selectedRows.includes(item.id) ? 'bg-secondary border-secondary' : 'border-slate-300 hover:border-secondary'
                                            }`}
                                        >
                                            {selectedRows.includes(item.id) && <Check className="w-3 h-3 text-primary" aria-hidden="true" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-black text-lg text-primary">{item.nf}</p>
                                        <p className="text-[10px] font-bold text-slate-400">Série: {item.serie} • {item.items} itens</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded border w-fit ${
                                                item.situacao === 'Processadas'              ? 'bg-green-100 text-green-700 border-green-200' :
                                                item.situacao === 'Aguardando Formação Onda' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                                                'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                            }`}>
                                                {item.situacao}
                                            </span>
                                            {item.solicitCancel && (
                                                <span className="flex items-center gap-1 text-[8px] font-black text-red-600 uppercase">
                                                    <AlertCircle className="w-3 h-3" aria-hidden="true" /> Solicit. Cancelamento
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-6">
                                            {renderStatusIndicator(item.status.sepIni,  'Sep. Iniciada')}
                                            {renderStatusIndicator(item.status.sepFim,  'Sep. Concluída')}
                                            <div className="w-4 h-px bg-slate-100 dark:bg-slate-700" aria-hidden="true" />
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
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDrawerOpen(false)}
                        aria-hidden="true"
                    />

                    <aside
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Detalhe por produto — NF ${activeNf?.nf}`}
                        className="w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl relative z-[110] flex flex-col animate-in slide-in-from-right duration-500"
                    >
                        {/* Drawer Header */}
                        <div className="p-8 border-b-8 border-secondary bg-primary text-white relative h-48 flex flex-col justify-end">
                            <button
                                onClick={() => setDrawerOpen(false)}
                                aria-label="Fechar detalhe da NF"
                                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all"
                            >
                                <X className="w-6 h-6 text-white" aria-hidden="true" />
                            </button>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-[2rem] bg-secondary flex items-center justify-center shadow-lg">
                                    {drawerType === 'SEP'
                                        ? <ShoppingCart className="w-8 h-8 text-primary" aria-hidden="true" />
                                        : <PackageCheck  className="w-8 h-8 text-primary" aria-hidden="true" />
                                    }
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic tracking-tight">Detalhe por Produto</h2>
                                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Nota Fiscal: #{activeNf?.nf}</p>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <List className="w-4 h-4" aria-hidden="true" /> Itens Processados
                                </h3>

                                {(activeNf
                                    ? Array.from({ length: Math.min(activeNf.items, 4) }, (_, i) => ({
                                        id: i + 1,
                                        desc: ['Barreira de Proteção Infravermelha', 'Escova de Segurança Nylon 27mm', 'Pallet de Aço Inox 1000mm', 'Luminária LED Verde 24V'][i] ?? `Item #${i+1}`,
                                        sku:  ['VEPEL-BPI-174FX', 'VPER-ESS-NY-27MM', 'VPER-PAL-INO-1000', 'VPER-LUM-LED-VRD-24V'][i] ?? `SKU-00${i+1}`,
                                        separado: drawerType === 'SEP' ? i + 1 : 0,
                                        total: 5,
                                    }))
                                    : []
                                ).map(item => {
                                    const pct = Math.round((item.separado / item.total) * 100);
                                    return (
                                        <div key={item.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-secondary/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                                                    <Box className="w-6 h-6 text-slate-400 group-hover:text-secondary transition-colors" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm tracking-tight text-primary">{item.desc}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">SKU: {item.sku}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 mb-1 justify-end">
                                                    <span className="text-lg font-black text-primary">{item.separado}</span>
                                                    <span className="text-[10px] font-bold text-slate-300">/ {item.total}</span>
                                                </div>
                                                <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-secondary transition-all duration-700"
                                                         style={{ width: `${pct}%` }}
                                                         role="progressbar"
                                                         aria-valuenow={pct}
                                                         aria-valuemin={0}
                                                         aria-valuemax={100}
                                                         aria-label={`${pct}% separado`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-6 rounded-3xl bg-secondary/10 border border-secondary/20 space-y-4">
                                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase">
                                    <BarChart3 className="w-4 h-4" aria-hidden="true" /> Estatísticas do Batch
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
