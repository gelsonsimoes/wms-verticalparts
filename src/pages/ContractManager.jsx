import React, { useState } from 'react';
import { 
    FileSignature, 
    Plus, 
    Edit3, 
    Ban, 
    CheckCircle2, 
    Warehouse, 
    Briefcase, 
    Search, 
    Filter, 
    Calendar,
    ChevronDown,
    X,
    Building2,
    DollarSign,
    Clock,
    Layers,
    Save,
    Trash2,
    PlusCircle,
    Info
} from 'lucide-react';

// ====== MOCK DATA ======
const MOCK_CONTRACTS = [
    { id: 'CTR-2026-001', description: 'Logística de Entrada - VerticalParts SP', payer: 'LogiTech Solutions Ltda', status: 'Em Vigência', startDate: '01/01/2026', endDate: '31/12/2026' },
    { id: 'CTR-2026-002', description: 'Armazenagem Especial - Motores Export', payer: 'BMW Automotive BR', status: 'Aguardando Revisão', startDate: '15/02/2026', endDate: '15/02/2027' },
    { id: 'CTR-2026-003', description: 'Distribuição Sudeste - E-commerce', payer: 'Mercado Livre WMS', status: 'Aberto', startDate: '01/03/2026', endDate: '01/03/2028' },
    { id: 'CTR-2026-004', description: 'Consultoria Logística - Inventário', payer: 'ConsultLog BR', status: 'Finalizado', startDate: '01/01/2025', endDate: '31/12/2025' },
    { id: 'CTR-2026-005', description: 'Operação Temporária - Black Friday', payer: 'Retail Group SA', status: 'Cancelado', startDate: '01/11/2025', endDate: '30/11/2025' },
];

const MOCK_WAREHOUSES = [
    { id: 'WH-01', name: 'CD Matriz - Cajamar', location: 'Cajamar, SP' },
    { id: 'WH-02', name: 'CD Nordeste - Salvador', location: 'Salvador, BA' },
    { id: 'WH-03', name: 'CD Sul - Curitiba', location: 'Curitiba, PR' },
    { id: 'WH-04', name: 'Filial Interna - VerticalParts', location: 'São Paulo, SP' },
];

const MOCK_SERVICES = [
    { id: 'SRV-001', code: 'LOG-01', name: 'Recebimento por Volume', shift: 'Diurno', value: 12.50, calcType: 'Unidade' },
    { id: 'SRV-002', code: 'LOG-02', name: 'Armazenagem por Palete/Dia', shift: 'Geral', value: 3.80, calcType: 'Diária' },
    { id: 'SRV-003', code: 'LOG-03', name: 'Expedição Urgente (Zap)', shift: 'Noturno', value: 25.00, calcType: 'Unidade' },
];

export default function ContractManager() {
    const [viewStatus, setViewStatus] = useState('Todos');
    const [selectedId, setSelectedId] = useState(null);
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);
    const [showServicesModal, setShowServicesModal] = useState(false);
    const [selectedWarehouses, setSelectedWarehouses] = useState(['WH-01', 'WH-02']);

    const selectedContract = MOCK_CONTRACTS.find(c => c.id === selectedId);

    const handleWarehouseToggle = (id) => {
        setSelectedWarehouses(prev => 
            prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* ====== CABEÇALHO ====== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <FileSignature className="w-8 h-8 text-secondary" /> Gerenciador de Contrato
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Gestão de bilhetagem logística e vigência contratual</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="bg-primary text-white p-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 group flex items-center gap-3">
                        <Plus className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Cadastrar Contrato</span>
                    </button>
                </div>
            </div>

            {/* ====== TOOLBAR & FILTROS ====== */}
            <div className="bg-primary p-8 rounded-[3rem] shadow-2xl border-b-8 border-secondary relative overflow-hidden group">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block">Filtrar Visão</label>
                        <div className="relative">
                            <select 
                                value={viewStatus}
                                onChange={(e) => setViewStatus(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-10 text-xs font-black text-white outline-none focus:border-secondary transition-all appearance-none cursor-pointer"
                            >
                                <option className="bg-primary">Todos</option>
                                <option className="bg-primary">Aberto</option>
                                <option className="bg-primary">Em Vigência</option>
                                <option className="bg-primary">Finalizado</option>
                                <option className="bg-primary">Cancelado</option>
                                <option className="bg-primary">Aguardando Revisão</option>
                            </select>
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60 pointer-events-none" />
                        </div>
                    </div>

                    <div className="lg:col-span-3 flex flex-wrap items-end justify-end gap-3">
                        <button 
                            disabled={!selectedId || selectedContract?.status !== 'Aguardando Revisão'}
                            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                !selectedId || selectedContract?.status !== 'Aguardando Revisão' 
                                ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                : 'bg-secondary text-primary shadow-xl shadow-black/20 hover:scale-105 active:scale-95'
                            }`}
                        >
                            <Edit3 className="w-4 h-4" /> Alterar Contrato
                        </button>
                        <button 
                            disabled={!selectedId}
                            onClick={() => setShowWarehouseModal(true)}
                            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                !selectedId 
                                ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            <Warehouse className="w-4 h-4" /> Definir Armazém
                        </button>
                        <button 
                            disabled={!selectedId}
                            onClick={() => setShowServicesModal(true)}
                            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                !selectedId 
                                ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            <Briefcase className="w-4 h-4" /> Gestão de Serviços
                        </button>
                        <button 
                            disabled={!selectedId}
                            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                !selectedId 
                                ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                : 'bg-danger text-white shadow-xl shadow-danger/20 hover:bg-danger/90'
                            }`}
                        >
                            <X className="w-4 h-4" /> Cancelar / Finalizar
                        </button>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none group-hover:bg-secondary/20 transition-all duration-1000" />
            </div>

            {/* ====== GRID DE CONTRATOS ====== */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-b-8 border-slate-100 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-5">Número</th>
                                <th className="px-8 py-5">Descrição / Objeto</th>
                                <th className="px-8 py-5 text-center">Protocolo</th>
                                <th className="px-8 py-5">Situação</th>
                                <th className="px-8 py-5">Início / Término</th>
                                <th className="px-8 py-5 text-right">Acordo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                            {MOCK_CONTRACTS.filter(c => viewStatus === 'Todos' || c.status === viewStatus).map(item => (
                                <tr 
                                    key={item.id} 
                                    onClick={() => setSelectedId(item.id)}
                                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group ${selectedId === item.id ? 'bg-secondary/5 border-l-4 border-secondary' : ''}`}
                                >
                                    <td className="px-8 py-5">
                                        <span className="font-black text-primary">{item.id}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{item.description}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                                <Building2 className="w-3 h-3" /> {item.payer}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-full font-mono text-[10px] text-slate-400">
                                            #TX-{(Math.random() * 10000).toFixed(0)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg border inline-block min-w-[100px] text-center ${
                                            item.status === 'Em Vigência' ? 'bg-success/10 text-success border-success/20' :
                                            item.status === 'Aguardando Revisão' ? 'bg-warning/10 text-warning border-warning/20' :
                                            item.status === 'Aberto' ? 'bg-info/10 text-info border-info/20' :
                                            item.status === 'Cancelado' ? 'bg-danger/10 text-danger border-danger/20' :
                                            'bg-slate-100 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 font-mono text-slate-500">
                                            {item.startDate} <span className="opacity-30">→</span> {item.endDate}
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

            {/* ====== MODAL: DEFINIR ARMAZÉM ====== */}
            {showWarehouseModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="p-8 border-b-8 border-secondary bg-primary text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary rounded-2xl shadow-lg">
                                    <Warehouse className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic">Associação de Armazéns</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-0.5">Contrato: {selectedContract?.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowWarehouseModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        
                        <div className="p-10 space-y-6 flex-1 overflow-y-auto max-h-[60vh]">
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-6">
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic flex items-center gap-3">
                                    <Info className="w-5 h-5 text-secondary" />
                                    Selecione abaixo os Centros de Distribuição onde as regras de cobrança deste contrato serão aplicadas automaticamente durante a bilhetagem de serviços.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {MOCK_WAREHOUSES.map(wh => (
                                    <label key={wh.id} className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${
                                        selectedWarehouses.includes(wh.id) 
                                        ? 'bg-secondary/10 border-secondary' 
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-slate-200'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl transition-all ${selectedWarehouses.includes(wh.id) ? 'bg-secondary text-primary' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-black text-xs text-primary">{wh.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{wh.location}</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only" 
                                                checked={selectedWarehouses.includes(wh.id)}
                                                onChange={() => handleWarehouseToggle(wh.id)}
                                            />
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                                selectedWarehouses.includes(wh.id) ? 'bg-primary border-primary shadow-lg' : 'border-slate-200'
                                            }`}>
                                                {selectedWarehouses.includes(wh.id) && <CheckCircle2 className="w-4 h-4 text-secondary stroke-[4]" />}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                            <button 
                                onClick={() => setShowWarehouseModal(false)}
                                className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => setShowWarehouseModal(false)}
                                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                            >
                                <Save className="w-4 h-4" /> Confirmar Vínculo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== MODAL: GESTÃO DE SERVIÇOS ====== */}
            {showServicesModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="p-10 border-b-8 border-secondary bg-primary text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-secondary rounded-[1.5rem] shadow-lg">
                                    <Briefcase className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic">Tabela de Serviços & Preços</h3>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-0.5">Definição de bilhetagem operacional</p>
                                </div>
                            </div>
                            <button onClick={() => setShowServicesModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                <X className="w-8 h-8 text-white" />
                            </button>
                        </div>
                        
                        <div className="p-10 space-y-8 flex-1 overflow-y-auto max-h-[70vh]">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Serviços Contratados</h4>
                                    <p className="text-xs text-slate-500 italic font-medium">Cadastre abaixo todos os códigos de faturamento do contrato.</p>
                                </div>
                                <button className="bg-secondary text-primary font-black py-3 px-8 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-black/10 flex items-center gap-2 hover:scale-105 transition-all">
                                    <PlusCircle className="w-4 h-4" /> Novo Serviço
                                </button>
                            </div>

                            <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/50 shadow-inner">
                                <table className="w-full text-left order-collapse">
                                    <thead className="bg-white dark:bg-slate-800 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Código</th>
                                            <th className="px-6 py-4">Serviço</th>
                                            <th className="px-6 py-4">Turno</th>
                                            <th className="px-6 py-4">Tipo Cálculo</th>
                                            <th className="px-6 py-4 text-center">Valor Unit.</th>
                                            <th className="px-6 py-4 text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                        {MOCK_SERVICES.map(srv => (
                                            <tr key={srv.id} className="hover:bg-white dark:hover:bg-slate-800 transition-all group">
                                                <td className="px-6 py-4">
                                                    <span className="bg-primary/5 px-2 py-0.5 rounded text-primary font-black">#{srv.code}</span>
                                                </td>
                                                <td className="px-6 py-4">{srv.name}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-tighter opacity-70">
                                                        <Clock className="w-3 h-3 text-secondary" /> {srv.shift}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[9px] font-black uppercase text-slate-400">{srv.calcType}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1 font-black text-emerald-600">
                                                        <span className="text-[9px] opacity-40">R$</span>
                                                        {srv.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-secondary hover:text-primary rounded-lg transition-all">
                                                            <Edit3 className="w-3 h-3" />
                                                        </button>
                                                        <button className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-danger hover:text-white rounded-lg transition-all">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic">Alterar a tabela de preços afetará novos cálculos de bilhetagem pro-rata.</p>
                            <button 
                                onClick={() => setShowServicesModal(false)}
                                className="bg-primary text-white py-5 px-12 rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] hover:bg-primary/95 shadow-2xl shadow-primary/30 flex items-center gap-3 ml-auto animate-pulse hover:animate-none"
                            >
                                <CheckCircle2 className="w-5 h-5 text-secondary" /> Concluir Revisão Técnica
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
