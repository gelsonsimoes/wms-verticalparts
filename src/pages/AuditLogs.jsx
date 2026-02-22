import React, { useState } from 'react';
import { 
    ShieldCheck, 
    AlertTriangle, 
    Calendar, 
    Eye, 
    Search, 
    Filter, 
    User, 
    Clock, 
    FileJson, 
    X, 
    ChevronRight, 
    Download, 
    FileText,
    UserCheck,
    PackageX,
    ClipboardList,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

// ====== MOCK DATA: LOG DE SEGURANÇA ======
const SECURITY_LOGS = [
    { id: 'LOG-9921', date: '22/02/2026 03:45:12', user: 'DANILO', level: 'INFO', opId: 'USER_LOGIN', description: 'Autenticação bem sucedida via Desktop-WMS', details: { ip: '192.168.1.42', browser: 'Chrome 122', os: 'Windows 11' } },
    { id: 'LOG-9925', date: '22/02/2026 03:20:05', user: 'MATHEUS', level: 'CRITICAL', opId: 'DB_BACKUP_FAIL', description: 'Falha durante tentativa de backup automático', details: { error: 'Disk Quota Exceeded', mount: '/mnt/storage/backups', retry: 3 } },
    { id: 'LOG-9930', date: '22/02/2026 02:55:40', user: 'THIAGO', level: 'WARNING', opId: 'PERM_CHANGED', description: 'Alteração de nível de acesso para o grupo "Separadores"', details: { changedBy: 'Admin', affectedGroup: 'Picking', oldLevel: 2, newLevel: 4 } },
    { id: 'LOG-9935', date: '22/02/2026 01:15:22', user: 'SYSTEM_DAEMON', level: 'INFO', opId: 'API_SYNC_SUCCESS', description: 'Sincronização com ERP Omie finalizada - 45 Pedidos importados', details: { orders: 45, duration: '12s', provider: 'Omie API v4' } },
];

// ====== MOCK DATA: ERROS DE SEPARAÇÃO ======
const PICKING_ERRORS = [
    { id: 1, separator: 'DANILO', conferee: 'MATHEUS', date: '22/02/2026 00:30', order: 'SO-8842', task: 'PICK-552', sku: 'VEPEL-BPI-174FX', product: 'Barreira de Proteção Infravermelha (174 Feixes)', expected: 10, collected: 8, severity: 'SEVERE' },
    { id: 2, separator: 'THIAGO', conferee: 'DANILO', date: '21/02/2026 23:45', order: 'SO-8845', task: 'PICK-558', sku: 'VPER-ESS-NY-27MM', product: 'Escova de Segurança (Nylon - Base 27mm)', expected: 5, collected: 4, severity: 'MEDIUM' },
    { id: 3, separator: 'MATHEUS', conferee: 'THIAGO', date: '21/02/2026 21:10', order: 'SO-8850', task: 'PICK-562', sku: 'VPER-PAL-INO-1000', product: 'Pallet de Aço Inox (1000mm)', expected: 12, collected: 15, severity: 'SEVERE' },
    { id: 4, separator: 'DANILO', conferee: 'THIAGO', date: '21/02/2026 18:30', order: 'SO-8861', task: 'PICK-570', sku: 'VPER-INC-ESQ', product: 'InnerCap (Esquerdo) - Ref.: VERTICALPARTS', expected: 2, collected: 1, severity: 'LOW' },
];

export default function AuditLogs() {
    const [activeTab, setActiveTab] = useState('SECURITY'); // 'SECURITY' ou 'PICKING'
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [showParamsModal, setShowParamsModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    // Filter states
    const [dateRange, setDateRange] = useState({ start: '2026-02-21', end: '2026-02-22' });

    const handleViewDetails = (log) => {
        setSelectedLog(log);
        setShowDetailsModal(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ====== CABEÇALHO ====== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-secondary" /> Centro de Auditoria & Logs
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Rastreabilidade total das operações do VerticalParts WMS</p>
                </div>
                
                {/* Abas */}
                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('SECURITY')}
                        className={`px-5 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'SECURITY' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-primary'
                        }`}
                    >
                        <ShieldCheck className="w-4 h-4" /> Log de Segurança
                    </button>
                    <button 
                        onClick={() => setActiveTab('PICKING')}
                        className={`px-5 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'PICKING' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-primary'
                        }`}
                    >
                        <AlertTriangle className="w-4 h-4" /> Erros de Separação
                    </button>
                </div>
            </div>

            {/* ====== CONTEÚDO DA ABA 1: LOG DE SEGURANÇA ====== */}
            {activeTab === 'SECURITY' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                    {/* Toolbar de Controle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowPeriodModal(true)}
                                className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                            >
                                <Calendar className="w-4 h-4" /> Período
                            </button>
                            <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                <Download className="w-4 h-4" /> Exportar CSV
                            </button>
                        </div>
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Pesquisar por usuário ou descrição..."
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 w-[300px]"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    {/* Grid Log de Segurança */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-b-8 border-primary">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="px-8 py-5">Data e Hora</th>
                                        <th className="px-8 py-5">Nome do Usuário</th>
                                        <th className="px-8 py-5 text-center">Nível</th>
                                        <th className="px-8 py-5">ID Operação</th>
                                        <th className="px-8 py-5">Descrição do Log</th>
                                        <th className="px-8 py-5 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {SECURITY_LOGS.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-500">
                                                    <Clock className="w-3 h-3" /> {log.date}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="font-black text-xs text-slate-700 dark:text-slate-200 uppercase">{log.user}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg border ${
                                                    log.level === 'CRITICAL' ? 'bg-danger/10 text-danger border-danger/20' :
                                                    log.level === 'WARNING' ? 'bg-warning/10 text-warning border-warning/20' :
                                                    'bg-info/10 text-info border-info/20'
                                                }`}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="font-bold text-[10px] text-slate-400 tracking-tighter">#{log.opId}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[300px]">{log.description}</p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => handleViewDetails(log)}
                                                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-secondary hover:text-primary transition-all active:scale-95"
                                                    title="Visualizar JSON"
                                                >
                                                    <FileJson className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== CONTEÚDO DA ABA 2: ERROS DE SEPARAÇÃO ====== */}
            {activeTab === 'PICKING' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                    {/* Toolbar de Controle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowParamsModal(true)}
                                className="px-5 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <Filter className="w-4 h-4" /> Parâmetros de Filtro
                            </button>
                            <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                <Download className="w-4 h-4" /> Exportar Analítico
                            </button>
                        </div>
                        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="text-center px-4 border-r border-slate-100 dark:border-slate-700">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Divergências</p>
                                <p className="text-sm font-black text-danger">4</p>
                            </div>
                            <div className="text-center px-4">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Índice Erro</p>
                                <p className="text-sm font-black text-primary">0.8%</p>
                            </div>
                        </div>
                    </div>

                    {/* Grid Erros de Separação */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-b-8 border-danger/30">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                    <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="px-6 py-4">Separador / Conferente</th>
                                        <th className="px-6 py-4">Data Operação</th>
                                        <th className="px-6 py-4">Pedido / Tarefa</th>
                                        <th className="px-6 py-4">Cod. / Produto</th>
                                        <th className="px-6 py-4 text-center">Esp./Col.</th>
                                        <th className="px-6 py-4 text-right">Gravidade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {PICKING_ERRORS.map((err) => (
                                        <tr key={err.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all ${err.severity === 'SEVERE' ? 'bg-danger/[0.03]' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                                        <UserCheck className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-xs uppercase text-slate-700 dark:text-slate-200">{err.separator}</p>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Conf: {err.conferee}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-500">{err.date}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-xs text-primary">{err.order}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{err.task}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`font-black text-xs ${err.severity === 'SEVERE' ? 'text-danger' : 'text-slate-700 dark:text-slate-200'}`}>{err.product}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 font-mono tracking-tighter">{err.sku}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{err.expected} UN</span>
                                                    <span className={`text-[11px] font-black px-2 py-0.5 rounded ${err.collected > err.expected ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                                                        {err.collected} UN
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-lg border ${
                                                    err.severity === 'SEVERE' ? 'bg-danger text-white border-danger shadow-sm' :
                                                    err.severity === 'MEDIUM' ? 'bg-warning/10 text-warning border-warning/20' :
                                                    'bg-slate-100 text-slate-400 border-slate-200'
                                                }`}>
                                                    {err.severity === 'SEVERE' ? 'GRAVE' : err.severity === 'MEDIUM' ? 'MÉDIO' : 'LEVE'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== MODAL: PERÍODO (DATA INICIAL / FINAL) ====== */}
            {showPeriodModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black italic text-primary">Selecionar Período</h3>
                            <button onClick={() => setShowPeriodModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Inicial</label>
                                <input 
                                    type="date" 
                                    defaultValue={dateRange.start}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-primary"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Final</label>
                                <input 
                                    type="date" 
                                    defaultValue={dateRange.end}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowPeriodModal(false)}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-primary/95 transition-all shadow-xl shadow-primary/20"
                        >
                            <Search className="w-4 h-4 inline mr-2" /> Aplicar Filtro
                        </button>
                    </div>
                </div>
            )}

            {/* ====== MODAL: PARÂMETROS DE FILTRO (ERROS) ====== */}
            {showParamsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-secondary" />
                        
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black italic text-primary flex items-center gap-3">
                                <Filter className="w-6 h-6" /> Parâmetros Analíticos
                            </h3>
                            <button onClick={() => setShowParamsModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Destinatário</label>
                                <input type="text" placeholder="Nome do cliente..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pedido de Venda</label>
                                <input type="text" placeholder="SO-0000..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Conferente</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none appearance-none">
                                    <option>Selecione...</option>
                                    <option>ANA JULIA</option>
                                    <option>JOAO SILVA</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Separador</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none appearance-none">
                                    <option>Selecione...</option>
                                    <option>MARCOS BRITO</option>
                                    <option>ROGERIO LIMA</option>
                                    <option>GUSTAVO REIS</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Início</label>
                                <input type="date" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Fim</label>
                                <input type="date" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:border-primary outline-none" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setShowParamsModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Limpar</button>
                            <button onClick={() => setShowParamsModal(false)} className="flex-[2] py-4 bg-secondary text-primary rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-xl shadow-black/10">Visualizar Relatório Analítico</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== MODAL: DETALHES DO LOG (JSON VIEWER) ====== */}
            {showDetailsModal && selectedLog && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/10">
                        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary rounded-[1.5rem] shadow-lg shadow-black/20">
                                    <FileJson className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white italic">Objeto da Transação</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-0.5">Hash Id: {selectedLog.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailsModal(false)} className="p-2 bg-white/5 hover:bg-danger/20 hover:text-danger rounded-full transition-all">
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 md:p-10 font-mono text-[13px] leading-relaxed custom-scrollbar">
                            <div className="relative group">
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[8px] font-bold text-slate-500 bg-black px-2 py-1 rounded">JSON RAW</span>
                                </div>
                                <pre className="text-emerald-400 bg-black/30 p-8 rounded-3xl border border-white/5">
                                    {JSON.stringify(selectedLog, null, 4)}
                                </pre>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/10 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-white/40 font-bold text-xs">
                                    <Clock className="w-4 h-4" /> Logado por {selectedLog.user} em {selectedLog.date}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                    <span className="text-[8px] font-black text-success uppercase">Verificado</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowDetailsModal(false)}
                                className="w-full py-5 bg-secondary text-primary rounded-[2rem] font-black text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-xl shadow-black/20"
                            >
                                Fechar Objeto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
