import React, { useState, useRef, useEffect } from 'react';
import { 
    FileCode, 
    Filter, 
    RefreshCw, 
    FileText, 
    Download, 
    UploadCloud, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Calendar,
    Search,
    ChevronDown,
    X,
    FileUp,
    Copy,
    Check,
    ArrowRightLeft,
    List,
    Layers,
    Table,
    Save,
    Eye as EyeIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import FileLayoutMapper from '../components/integration/FileLayoutMapper';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ====== DADOS FICTÍCIOS DE INTEGRAÇÃO ======
const MOCK_INTEGRATIONS = [
    { id: 'INT-4421', file: 'PEDIDOS_VENDA_2026.xml', type: 'Importação', status: 'Erro', date: '22/02/2026 03:45', progress: 100, error: 'Tag <ClientID> não encontrada na linha 42. Verifique a estrutura do schema XML.' },
    { id: 'INT-4422', file: 'ESTOQUE_VERTICAL.txt', type: 'Exportação', status: 'Concluído', date: '22/02/2026 03:20', progress: 100, error: null },
    { id: 'INT-4423', file: 'NOTAS_ENTRADA_OMIE.xml', type: 'Importação', status: 'Aguardando', date: '22/02/2026 04:00', progress: 0, error: null },
    { id: 'INT-4424', file: 'PICKING_SUMMARY.xml', type: 'Exportação', status: 'Agendado', date: '22/02/2026 04:15', progress: 0, error: null },
    { id: 'INT-4425', file: 'PRODUTOS_NOVOS.txt', type: 'Importação', status: 'Concluído', date: '22/02/2026 01:10', progress: 100, error: null },
];

const MOCK_LOGS = [
    { id: 1, action: 'Início do processamento', status: 'INFO', time: '03:45:01' },
    { id: 2, action: 'Leitura do cabeçalho finalizada', status: 'INFO', time: '03:45:05' },
    { id: 3, action: 'Validação de schema iniciada', status: 'INFO', time: '03:45:10' },
    { id: 4, action: 'ERRO: Falha na validação do campo ClientID', status: 'ERROR', time: '03:45:12' },
];

export default function FileIntegration() {
    const [selectedId, setSelectedId] = useState(null);
    const [showUploader, setShowUploader] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [filters, setFilters] = useState({
        status: ['Todos'],
        operation: ['Importação', 'Exportação']
    });
    const [activeTab, setActiveTab] = useState('history'); // 'history' ou 'mapper'
    const [dragActive, setDragActive] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);
    
    const clickTimeoutRef = useRef(null);
    const clickCountRef = useRef(0);

    // Seleção automática da primeira linha com erro para exemplo
    useEffect(() => {
        if (!selectedId) setSelectedId('INT-4421');
    }, []);

    const selectedFile = MOCK_INTEGRATIONS.find(i => i.id === selectedId);

    // Lógica de Triple Click
    const handleTripleClick = (content) => {
        clickCountRef.current += 1;
        
        if (clickCountRef.current === 1) {
            clickTimeoutRef.current = setTimeout(() => {
                clickCountRef.current = 0;
            }, 500);
        }

        if (clickCountRef.current === 3) {
            clearTimeout(clickTimeoutRef.current);
            clickCountRef.current = 0;
            copyToClipboard(content);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };

    const handleStatusFilter = (st) => {
        setFilters(prev => {
            if (st === 'Todos') return { ...prev, status: ['Todos'] };
            let newStatus = prev.status.filter(s => s !== 'Todos');
            if (newStatus.includes(st)) {
                newStatus = newStatus.filter(s => s !== st);
                if (newStatus.length === 0) newStatus = ['Todos'];
            } else {
                newStatus = [...newStatus, st];
            }
            return { ...prev, status: newStatus };
        });
    };

    const handleOpFilter = (op) => {
        setFilters(prev => {
            if (prev.operation.includes(op)) {
                return { ...prev, operation: prev.operation.filter(o => o !== op) };
            }
            return { ...prev, operation: [...prev.operation, op] };
        });
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        // Simulação de upload
        alert("Arquivo recebido com sucesso! Iniciando processamento...");
        setShowUploader(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* ====== CABEÇALHO ====== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <ArrowRightLeft className="w-8 h-8 text-secondary" /> Integração de Arquivo (ETL)
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Fluxos de arquivos TXT/XML entre VerticalParts e Parceiros</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white dark:bg-slate-800 px-6 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Aguardando</span>
                        <span className="text-xl font-black text-primary leading-none">02</span>
                    </div>
                    <button 
                        onClick={() => setShowUploader(true)}
                        className="bg-primary text-white p-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 group flex items-center gap-3"
                    >
                        <FileUp className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            {/* ====== NAVEGAÇÃO ENTRE ABAS ====== */}
            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'history' 
                            ? "bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <List className="w-4 h-4" /> Histórico de Integrações
                </button>
                <button
                    onClick={() => setActiveTab('mapper')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'mapper' 
                            ? "bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Layers className="w-4 h-4" /> Mapeador de Layouts (EDI)
                </button>
            </div>

            {activeTab === 'history' ? (
                <>
                    {/* ====== FILTROS (CHECKBOXES) ====== */}
            <div className="bg-primary p-8 rounded-[3rem] shadow-2xl border-b-8 border-secondary relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                    {/* Status Checkboxes */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block">Filtrar Status</label>
                        <div className="flex flex-wrap gap-3">
                            {['Todos', 'Aguardando', 'Agendado', 'Erro', 'Concluído'].map(st => (
                                <label key={st} className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only" 
                                            checked={filters.status.includes(st)}
                                            onChange={() => handleStatusFilter(st)}
                                        />
                                        <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                                            filters.status.includes(st) ? 'bg-secondary border-secondary shadow-[0_0_10px_rgba(255,215,0,0.4)]' : 'border-white/20'
                                        }`}>
                                            {filters.status.includes(st) && <Check className="w-3 h-3 text-primary stroke-[4]" />}
                                        </div>
                                    </div>
                                    <span className={`text-[11px] font-bold ${filters.status.includes(st) ? 'text-white' : 'text-white/40 group-hover:text-white/60'} transition-colors`}>
                                        {st}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Operação Checkboxes */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block">Tipo de Operação</label>
                        <div className="flex gap-6">
                            {['Importação', 'Exportação'].map(op => (
                                <label key={op} className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only" 
                                            checked={filters.operation.includes(op)}
                                            onChange={() => handleOpFilter(op)}
                                        />
                                        <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                                            filters.operation.includes(op) ? 'bg-secondary border-secondary shadow-[0_0_10px_rgba(255,215,0,0.4)]' : 'border-white/20'
                                        }`}>
                                            {filters.operation.includes(op) && <Check className="w-3 h-3 text-primary stroke-[4]" />}
                                        </div>
                                    </div>
                                    <span className={`text-[11px] font-bold ${filters.operation.includes(op) ? 'text-white' : 'text-white/40 group-hover:text-white/60'} transition-colors`}>
                                        {op}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Exibir Button */}
                    <div className="flex items-end justify-end">
                        <button className="bg-secondary text-primary font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 flex items-center gap-3">
                            <RefreshCw className="w-4 h-4" /> Exibir Integrações
                        </button>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* ====== TOOLBAR DE AÇÕES ====== */}
            <div className="flex flex-wrap gap-2">
                <button 
                    className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[9px] uppercase tracking-widest text-slate-500 hover:text-primary hover:border-secondary transition-all"
                    onClick={() => alert('Reprocessando ' + selectedId)}
                >
                    <RefreshCw className="w-4 h-4" /> Integrar Novamente
                </button>
                <button 
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${
                        showLogs ? 'bg-secondary text-primary shadow-lg shadow-black/10' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                    onClick={() => setShowLogs(!showLogs)}
                >
                    <FileText className="w-4 h-4" /> Log de Integração
                </button>
                {selectedFile?.status === 'Erro' && (
                    <button className="flex items-center gap-2 px-5 py-3 bg-danger text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-danger/90 transition-all shadow-lg shadow-danger/20">
                        <Download className="w-4 h-4" /> Baixar Arquivo com Erro
                    </button>
                )}
            </div>

            {/* ====== GRID PRINCIPAL ====== */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-b-8 border-slate-100 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-5">ID / Operação</th>
                                <th className="px-8 py-5">Nome do Arquivo</th>
                                <th className="px-8 py-5">Data / Hora</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5">Progresso</th>
                                <th className="px-8 py-5 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                            {MOCK_INTEGRATIONS.map(item => (
                                <tr 
                                    key={item.id} 
                                    onClick={() => setSelectedId(item.id)}
                                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group ${selectedId === item.id ? 'bg-secondary/5 border-l-4 border-secondary' : ''}`}
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-primary">{item.id}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{item.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                                <FileCode className="w-4 h-4 text-slate-400 group-hover:text-secondary group-hover:scale-110 transition-all" />
                                            </div>
                                            <span className="font-bold">{item.file}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 font-mono opacity-60">
                                            <Clock className="w-3 h-3" /> {item.date}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg border inline-block min-w-[80px] ${
                                            item.status === 'Concluído' ? 'bg-success/10 text-success border-success/20' :
                                            item.status === 'Erro' ? 'bg-danger/10 text-danger border-danger/20' :
                                            item.status === 'Agendado' ? 'bg-info/10 text-info border-info/20' :
                                            'bg-slate-100 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${item.status === 'Erro' ? 'bg-danger' : 'bg-secondary'}`}
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400">{item.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${selectedId === item.id ? 'rotate-180' : ''}`} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====== LOG ANALÍTICO (BOTTOM PANEL) ====== */}
            {showLogs && (
                <div className="bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-top-6 duration-500">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-lg">
                                <List className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white italic">Log de Processamento</h3>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-0.5">Arquivo: {selectedFile?.file}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {copyFeedback && (
                                <span className="text-[8px] font-black text-secondary uppercase animate-pulse">Copiado para o Clipboard!</span>
                            )}
                            <button onClick={() => setShowLogs(false)} className="p-2 bg-white/5 hover:bg-danger/20 hover:text-danger rounded-full transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/40">
                            <table className="w-full text-left order-collapse">
                                <thead className="bg-white/5 text-[9px] font-black uppercase text-white/30 tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Horário</th>
                                        <th className="px-6 py-4">Ação / Resposta do Sistema</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-[11px] font-bold text-white/70">
                                    {MOCK_LOGS.map(log => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-all">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                                                    log.status === 'ERROR' ? 'bg-danger text-white' : 'bg-info/20 text-info'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono opacity-50">{log.time}</td>
                                            <td 
                                                className={`px-6 py-4 cursor-pointer relative group/copy ${log.status === 'ERROR' ? 'text-danger' : ''}`}
                                                onClick={() => handleTripleClick(log.action)}
                                                title="Clique 3x para copiar"
                                            >
                                                {log.action}
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/copy:opacity-100 transition-opacity">
                                                    <Copy className="w-3 h-3 text-white/20" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {selectedFile?.error && (
                                        <tr className="bg-danger/5 text-danger font-mono text-[10px]">
                                            <td colSpan="3" className="px-6 py-6 border-l-4 border-danger">
                                                <div className="flex flex-col gap-2">
                                                    <span className="font-black text-[8px] uppercase tracking-widest flex items-center gap-2">
                                                        <AlertCircle className="w-3 h-3" /> Detalhe da Falha Fatal:
                                                    </span>
                                                    <p 
                                                        className="bg-black/50 p-4 rounded-xl border border-danger/20 cursor-help select-all"
                                                        onClick={() => handleTripleClick(selectedFile.error)}
                                                        title="Clique 3x para copiar"
                                                    >
                                                        {selectedFile.error}
                                                    </p>
                                                    <span className="text-[7px] text-danger/40 italic">Dica: Clique 3x no texto acima para copiar para a área de transferência.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    ) : (
        <FileLayoutMapper />
    )}

            {/* ====== MODAL: UPLOADER MANUAL ====== */}
            {showUploader && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="p-8 border-b-8 border-secondary bg-primary text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-lg">
                                    <FileUp className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic">Importação Manual</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Formatos aceitos: .XML, .TXT</p>
                                </div>
                            </div>
                            <button onClick={() => setShowUploader(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            {/* Drag and Drop Zone */}
                            <div 
                                className={`h-64 rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center gap-4 group ${
                                    dragActive ? 'bg-secondary/10 border-secondary scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className={`p-6 rounded-full transition-all ${dragActive ? 'bg-secondary text-primary scale-110 shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-300'}`}>
                                    <UploadCloud className="w-12 h-12" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-black text-primary">Arraste seu arquivo aqui</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ou clique para selecionar do computador</p>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".xml,.txt" />
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Diretrizes de Importação
                                </h4>
                                <ul className="space-y-3 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5" />
                                        Os arquivos XML devem seguir o schema oficial XSD v4.0.
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5" />
                                        Arquivos TXT devem usar separador ';' (ponto e vírgula).
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5" />
                                        O limite máximo por lote é de 50MB.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                            <button 
                                onClick={() => setShowUploader(false)}
                                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
                            >
                                Cancelar
                            </button>
                            <button 
                                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/95 shadow-xl shadow-primary/20"
                            >
                                Processar Agora
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
