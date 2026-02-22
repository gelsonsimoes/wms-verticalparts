import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    BarChart3, 
    FileSpreadsheet, 
    Filter, 
    Calendar, 
    ChevronDown, 
    X, 
    Search, 
    RefreshCw, 
    Layers, 
    Box, 
    Package, 
    Monitor, 
    DollarSign, 
    ArrowRightLeft,
    ChevronRight,
    Play,
    Info,
    ArrowUpRight,
    ArrowDownRight,
    GripVertical
} from 'lucide-react';

// ====== CONFIGURAÇÕES DOS RELATÓRIOS ======
const REPORT_CONFIGS = {
    '/billing/packaging': {
        title: 'Armazenagem por Embalagem',
        icon: Box,
        columns: ['Armazém', 'Data', 'Depositante', 'Setor', 'Local', 'Descrição do Produto', 'Qtd Unidade'],
        mockData: [
            { id: 1, Armazém: 'CD-01', Data: '22/02/2026', Depositante: 'Danilo (Supervisor)', Setor: 'Segurança', Local: 'A-10-01', 'Descrição do Produto': 'Barreira de Proteção Infravermelha (174 Feixes)', 'Qtd Unidade': 450 },
            { id: 2, Armazém: 'CD-01', Data: '22/02/2026', Depositante: 'Matheus (Expedição)', Setor: 'Peças', Local: 'A-10-02', 'Descrição do Produto': 'Escova de Segurança (Nylon - Base 27mm)', 'Qtd Unidade': 120 },
            { id: 3, Armazém: 'CD-02', Data: '22/02/2026', Depositante: 'Thiago (Logística)', Setor: 'Almoxarifado', Local: 'B-05-01', 'Descrição do Produto': 'Pallet de Aço Inox (1000mm)', 'Qtd Unidade': 85 },
        ]
    },
    '/billing/pallet': {
        title: 'Armazenagem por Palete',
        icon: Layers,
        columns: ['Armazém', 'Depositante', 'Tipo Palete', 'Posições Ocupadas', 'Setor de Alocação', 'Vencimento'],
        mockData: [
            { id: 1, Armazém: 'CD-01', Depositante: 'Nestlé SA', 'Tipo Palete': 'PBR', 'Posições Ocupadas': 124, 'Setor de Alocação': 'Pulmão Secos', Vencimento: '30/06/2026' },
            { id: 2, Armazém: 'CD-01', Depositante: 'Coca-Cola', 'Tipo Palete': 'CHEP', 'Posições Ocupadas': 88, 'Setor de Alocação': 'Picking Frios', Vencimento: '15/05/2026' },
        ]
    },
    '/billing/weight': {
        title: 'Armazenagem por Peso',
        icon: Package,
        columns: ['Armazém', 'Depositante', 'Peso Total (Kg)', 'Peso Médio/Palete', 'Status Carga', 'Local'],
        mockData: [
            { id: 1, Armazém: 'CD-02', Depositante: 'Vale Metais', 'Peso Total (Kg)': 12500, 'Peso Médio/Palete': 850, 'Status Carga': 'Alocado', Local: 'PÁTIO-A' },
            { id: 2, Armazém: 'CD-02', Depositante: 'Gerdau', 'Peso Total (Kg)': 8400, 'Peso Médio/Palete': 1200, 'Status Carga': 'Processando', Local: 'ENTRADA-1' },
        ]
    },
    '/billing/address': {
        title: 'Armazenagem por Endereço',
        icon: Monitor,
        columns: ['Localização', 'Status Ocupação', 'Tempo Permanente', 'Custo p/ Dia', 'Identificador'],
        mockData: [
            { id: 1, Localização: 'A-10-01-01', 'Status Ocupação': '100%', 'Tempo Permanente': '12 Dias', 'Custo p/ Dia': 12.50, Identificador: 'LOC-552' },
            { id: 2, Localização: 'A-10-01-02', 'Status Ocupação': '80%', 'Tempo Permanente': '4 Dias', 'Custo p/ Dia': 10.00, Identificador: 'LOC-553' },
        ]
    },
    '/billing/query': {
        title: 'Consulta para Cobrança (Billing)',
        icon: DollarSign,
        columns: ['Depositante', 'Saldo Palete', 'Saldo Peso (Kg)', 'Saldo Unidade', 'Vencimento Ciclo', 'Valor Acumulado'],
        mockData: [
            { id: 1, Depositante: 'VerticalParts Oficial', 'Saldo Palete': 450, 'Saldo Peso (Kg)': 1200, 'Saldo Unidade': 12500, 'Vencimento Ciclo': '05/03/2026', 'Valor Acumulado': 45850.22 },
            { id: 2, Depositante: 'Danilo (Logística)', 'Saldo Palete': 1240, 'Saldo Peso (Kg)': 15000, 'Saldo Unidade': 48000, 'Vencimento Ciclo': '10/03/2026', 'Valor Acumulado': 92300.50 },
        ]
    }
};

export default function BillingReports() {
    const location = useLocation();
    const config = REPORT_CONFIGS[location.pathname] || REPORT_CONFIGS['/billing/packaging'];
    
    const [showParams, setShowParams] = useState(true);
    const [params, setParams] = useState({ start: '2026-02-01', end: '2026-02-28' });
    const [groupColumn, setGroupColumn] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Força o modal de parâmetros se as datas não estiverem confirmadas
    useEffect(() => {
        setShowParams(true);
        setDataLoaded(false);
    }, [location.pathname]);

    const handleApply = () => {
        setShowParams(false);
        setDataLoaded(true);
    };

    const handleExport = () => {
        setExporting(true);
        setTimeout(() => {
            setExporting(false);
            alert('Relatório exportado com sucesso para Excel (XLSX)! Verifique sua pasta de downloads.');
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* ====== CABEÇALHO ====== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 italic">
                        <config.icon className="w-8 h-8 text-secondary" /> {config.title}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Relatório Analítico de Armazenagem e Bilhetagem</p>
                </div>
                <div className="flex items-center gap-2">
                    {dataLoaded && (
                        <div className="bg-white dark:bg-slate-800 px-6 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-end mr-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Período Selecionado</span>
                            <span className="text-xs font-black text-primary leading-none">{params.start.split('-').reverse().join('/')} até {params.end.split('-').reverse().join('/')}</span>
                        </div>
                    )}
                    <button 
                        onClick={() => setShowParams(true)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                        title="Alterar Parâmetros"
                    >
                        <Filter className="w-5 h-5 text-slate-400" />
                    </button>
                    <button 
                        onClick={handleExport}
                        disabled={!dataLoaded || exporting}
                        className={`bg-emerald-600 text-white p-4 rounded-xl shadow-xl shadow-emerald-600/20 group flex items-center gap-3 transition-all ${!dataLoaded || exporting ? 'opacity-40 grayscale pointer-events-none' : 'hover:scale-105 active:scale-95'}`}
                    >
                        {exporting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform" />}
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Exportar Excel</span>
                    </button>
                </div>
            </div>

            {/* ====== DRAG TO GROUP AREA ====== */}
            <div className="bg-primary/5 border-2 border-dashed border-primary/20 p-4 rounded-3xl flex items-center gap-4">
                <div className="bg-primary p-3 rounded-2xl shadow-lg">
                    <Layers className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Área de Agrupamento</p>
                    <div className="flex items-center gap-2 mt-1 min-h-[40px]">
                        {groupColumn ? (
                            <div className="bg-secondary text-primary px-4 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2 animate-in zoom-in-75 duration-300">
                                <GripVertical className="w-3 h-3" /> {groupColumn}
                                <button onClick={() => setGroupColumn(null)}><X className="w-3 h-3 hover:scale-125 transition-all"/></button>
                            </div>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-400 italic">Arraste uma coluna aqui para agrupar os dados do relatório...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ====== GRID DINÂMICO ====== */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-b-8 border-slate-100 dark:border-slate-700 relative">
                {!dataLoaded && (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Calendar className="w-12 h-12 opacity-10 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aguardando definição de parâmetros obrigatórios</p>
                    </div>
                )}
                
                {dataLoaded && (
                    <div className="overflow-x-auto">
                        <div className="min-w-max">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {config.columns.map(col => (
                                            <th key={col} className="px-8 py-5 cursor-move hover:text-primary transition-colors group">
                                                <div className="flex items-center gap-2">
                                                    {col}
                                                    <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setGroupColumn(col);
                                                        }}
                                                        className="ml-auto opacity-0 group-hover:opacity-100 hover:text-secondary"
                                                        title="Agrupar por esta coluna"
                                                    >
                                                        <Layers className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                                    {config.mockData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all border-l-4 border-transparent hover:border-secondary">
                                            {config.columns.map(col => (
                                                <td key={col} className="px-8 py-5 font-bold">
                                                    {typeof row[col] === 'number' && col.includes('Valor') ? (
                                                        <span className="text-emerald-600">R$ {row[col].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                    ) : row[col]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ====== MODAL: PARÂMETROS OBRIGATÓRIOS ====== */}
            {showParams && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col border border-white/20">
                        <div className="p-8 border-b-8 border-secondary bg-primary text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary rounded-2xl shadow-lg">
                                    <Filter className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic">Filtros de Apuração</h3>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-0.5">Parâmetros Obrigatórios</p>
                                </div>
                            </div>
                            {!dataLoaded ? null : (
                                <button onClick={() => setShowParams(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            )}
                        </div>
                        
                        <div className="p-10 space-y-8">
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Início</label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            value={params.start}
                                            onChange={(e) => setParams({...params, start: e.target.value})}
                                            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-xs font-black outline-none focus:border-secondary transition-all"
                                        />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Término</label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            value={params.end}
                                            onChange={(e) => setParams({...params, end: e.target.value})}
                                            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-xs font-black outline-none focus:border-secondary transition-all"
                                        />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleApply}
                                className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/95 shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <Play className="w-4 h-4 text-secondary fill-current" /> Carregar Relatório Analítico
                            </button>
                            
                            <p className="text-[9px] text-center font-bold text-slate-400 italic px-4">
                                * É necessário definir o intervalo de datas para calcular os saldos acumulados de armazenagem.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
