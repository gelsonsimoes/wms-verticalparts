import React, { useState } from 'react';
import { 
    Activity, 
    Filter, 
    Calendar, 
    RefreshCw, 
    CheckCircle2, 
    AlertCircle, 
    Send, 
    Search,
    Clock,
    User,
    ArrowRightLeft,
    Check,
    X,
    FileJson,
    ChevronRight,
    Play
} from 'lucide-react';

// ====== DADOS FICTÍCIOS DE WEBHOOKS ======
const WEBHOOK_DATA = [
    { id: 'WH-991', date: '22/02/2026 04:05:12', status: 'Sucesso', interface: 'Faturamento_ERP', type: 'NF_ID', identifier: '55621', description: 'Webhook disparado com sucesso. Status 200 OK.', payload: { nf: 55621, serie: 1, action: 'EMIT' } },
    { id: 'WH-992', date: '22/02/2026 03:58:45', status: 'Erro', interface: 'Estoque_eCommerce', type: 'SKU', identifier: 'VP-FR4429', description: 'Falha na autenticação (Unauthorized). Verifique o Token.', payload: { sku: 'VP-FR4429', stock: 15, site_id: 'MAGAZINE_VP' } },
    { id: 'WH-993', date: '22/02/2026 03:42:20', status: 'Enviado', interface: 'Tracking_Transp', type: 'TRACK_CODE', identifier: 'BR-12345X', description: 'Aguardando confirmação do servidor de destino.', payload: { code: 'BR-12345X', carrier: 'JADLOG' } },
    { id: 'WH-994', date: '22/02/2026 03:15:10', status: 'Erro', interface: 'Cadastro_Cliente_Omie', type: 'CLIENT_ID', identifier: '88722', description: 'Campo "CNPJ" inválido no payload JSON.', payload: { id: 88722, cnpj: '00.000.000/0001-XX' } },
];

export default function IntegrationResults() {
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [reintegratingId, setReintegratingId] = useState(null);
    const [showPayload, setShowPayload] = useState(null);

    const handleReintegrate = (id) => {
        setReintegratingId(id);
        // Simulação de reprocessamento
        setTimeout(() => {
            setReintegratingId(null);
            alert('Registro reintegrado com sucesso! Redirecionando payload para o endpoint do cliente.');
        }, 1500);
    };

    const filteredData = WEBHOOK_DATA.filter(item => 
        statusFilter === 'Todos' || item.status === statusFilter
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* ====== CABEÇALHO ====== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Activity className="w-8 h-8 text-secondary" /> Resultados de Integração
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Monitoramento analítico de Webhooks e chamadas API REST</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowPeriodModal(true)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Calendar className="w-4 h-4" /> Período
                    </button>
                    <div className="bg-primary px-6 py-2 rounded-2xl border border-secondary/20 shadow-lg flex flex-col items-end">
                        <span className="text-[10px] font-black text-white/40 uppercase">Erros Hoje</span>
                        <span className="text-xl font-black text-secondary leading-none">02</span>
                    </div>
                </div>
            </div>

            {/* ====== FILTROS RÁPIDOS ====== */}
            <div className="bg-primary p-6 rounded-[2rem] shadow-xl border-b-8 border-secondary/20 relative overflow-hidden group">
                <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
                    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                        {['Todos', 'Enviado', 'Sucesso', 'Erro'].map(st => (
                            <button 
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    statusFilter === st ? 'bg-secondary text-primary shadow-lg shadow-black/20' : 'text-white/40 hover:text-white'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex-1 flex justify-end">
                        <button 
                            className="bg-secondary text-primary font-black py-3 px-8 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Atualizar Dashboard
                        </button>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none" />
            </div>

            {/* ====== GRID DE RESULTADOS ====== */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-b-8 border-slate-100 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-5">Data e Hora</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5">Interface / Destino</th>
                                <th className="px-8 py-5">Identificador</th>
                                <th className="px-8 py-5">Descrição do Log (Terceiro)</th>
                                <th className="px-8 py-5 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                            {filteredData.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-primary">{item.date.split(' ')[0]}</span>
                                            <span className="text-[10px] font-mono font-bold text-slate-400">{item.date.split(' ')[1]}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg border inline-block min-w-[80px] ${
                                            item.status === 'Sucesso' ? 'bg-success/10 text-success border-success/20' :
                                            item.status === 'Erro' ? 'bg-danger/10 text-danger border-danger/20' :
                                            'bg-info/10 text-info border-info/20'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                                <ArrowRightLeft className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <span className="font-black uppercase tracking-tight">{item.interface}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.type}</span>
                                            <span className="font-bold">{item.identifier}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className={`text-xs font-bold truncate max-w-[250px] ${item.status === 'Erro' ? 'text-danger' : 'text-slate-500 italic'}`}>
                                            {item.description}
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setShowPayload(item)}
                                                className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-secondary hover:text-primary transition-all"
                                                title="Ver Payload JSON"
                                            >
                                                <FileJson className="w-4 h-4" />
                                            </button>
                                            {item.status === 'Erro' && (
                                                <button 
                                                    onClick={() => handleReintegrate(item.id)}
                                                    className="p-2 bg-danger/10 text-danger rounded-xl hover:bg-danger hover:text-white transition-all group/btn"
                                                    title="Reintegrar Log"
                                                    disabled={reintegratingId === item.id}
                                                >
                                                    <RefreshCw className={`w-4 h-4 ${reintegratingId === item.id ? 'animate-spin' : ''}`} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====== MODAL: PAYLOAD JSON ====== */}
            {showPayload && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-900 w-full max-w-2xl h-[70vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/10">
                        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary rounded-2xl shadow-lg">
                                    <FileJson className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white italic">Payload da Transação</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-0.5">Webhook ID: #{showPayload.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPayload(null)} className="p-2 bg-white/5 hover:bg-danger/20 hover:text-danger rounded-full transition-all">
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 font-mono text-[13px] leading-relaxed">
                            <pre className="text-emerald-400 bg-black/30 p-8 rounded-[2.5rem] border border-white/5 select-all">
                                {JSON.stringify(showPayload.payload, null, 4)}
                            </pre>
                        </div>

                        <div className="p-8 border-t border-white/10 bg-white/[0.02]">
                            <button 
                                onClick={() => handleReintegrate(showPayload.id)}
                                className="w-full py-5 bg-secondary text-primary rounded-[2rem] font-black text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-xl shadow-secondary/10 flex items-center justify-center gap-3"
                            >
                                <Play className="w-4 h-4 fill-current" /> Forçar Reenvio do Webhook
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== MODAL: PERÍODO ====== */}
            {showPeriodModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black italic text-primary">Filtrar Período</h3>
                            <button onClick={() => setShowPeriodModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Início</label>
                                <input type="date" defaultValue="2026-02-21" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-primary" />
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Fim</label>
                                <input type="date" defaultValue="2026-02-22" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-primary" />
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowPeriodModal(false)}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-primary/95 transition-all shadow-xl shadow-primary/20"
                        >
                            Aplicar Filtro Temporal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
