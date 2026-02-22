import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
    ClipboardList, Search, Filter, ArrowRight, Clock, User, CheckCircle2,
    AlertCircle, Play, Package, MapPin, ScanBarcode, Zap, History,
    Check, X, RefreshCw, BarChart3, ChevronRight, ShoppingCart
} from 'lucide-react';

export default function PickingManagement() {
    const { orders, updateOrderStatus } = useApp();
    const [view, setView] = useState('LIST'); // 'LIST' ou 'ACTIVE'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filter, setFilter] = useState('Todos');
    const [scanValue, setScanValue] = useState('');
    const [scanError, setScanError] = useState(null);
    const [lastScannedId, setLastScannedId] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const scanInputRef = useRef(null);

    // Persistência da ordem selecionada para não perder o progresso em caso de refresh
    useEffect(() => {
        const savedOrderId = localStorage.getItem('vparts_active_picking_id');
        if (savedOrderId && view === 'LIST') {
            const order = orders.find(o => o.id === savedOrderId);
            if (order && order.status !== 'Concluído') {
                setSelectedOrder(order);
                setView('ACTIVE');
            }
        }
    }, [orders]);

    useEffect(() => {
        if (view === 'ACTIVE' && scanInputRef.current) {
            scanInputRef.current.focus();
        }
    }, [view, scanError]);

    const handleStartPicking = (order) => {
        setSelectedOrder(order);
        setView('ACTIVE');
        localStorage.setItem('vparts_active_picking_id', order.id);
        if (order.status === 'Pendente') {
            updateOrderStatus(order.id, 'Em Separação');
        }
    };

    const handleBackToList = () => {
        setView('LIST');
        setSelectedOrder(null);
        localStorage.removeItem('vparts_active_picking_id');
    };

    const handleScan = (e) => {
        if (e.key === 'Enter') {
            const ean = scanValue.trim();
            if (!ean) return;

            const itemIndex = selectedOrder.orderItems.findIndex(item => item.ean === ean);

            if (itemIndex !== -1) {
                const item = selectedOrder.orderItems[itemIndex];
                
                if (item.collected < item.expected) {
                    // Clonar e atualizar a ordem selecionada localmente
                    const updatedItems = [...selectedOrder.orderItems];
                    updatedItems[itemIndex] = { ...item, collected: item.collected + 1 };
                    
                    const updatedOrder = { ...selectedOrder, orderItems: updatedItems };
                    setSelectedOrder(updatedOrder);
                    
                    setLastScannedId(item.id);
                    setScanError(null);
                    setScanValue('');
                    setTimeout(() => setLastScannedId(null), 800);
                } else {
                    setScanError(`Quantidade máxima já coletada para o item "${item.desc}"`);
                    setScanValue('');
                    setTimeout(() => setScanError(null), 3000);
                }
            } else {
                setScanError(`Código "${ean}" não pertence a esta ordem.`);
                setScanValue('');
                setTimeout(() => setScanError(null), 3000);
            }
        }
    };

    const handleFinalize = () => {
        const allCollected = selectedOrder.orderItems.every(item => item.collected === item.expected);
        
        if (!allCollected) {
            if (!window.confirm('Existem itens pendentes. Deseja finalizar a separação assim mesmo?')) {
                return;
            }
        }

        updateOrderStatus(selectedOrder.id, 'Concluído');
        handleBackToList();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Concluído': return 'bg-success/10 text-success border-success/20';
            case 'Em Separação': return 'bg-warning/10 text-warning border-warning/20';
            default: return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    const filteredOrders = filter === 'Todos' ? orders : orders.filter(o => o.status === filter);

    // ====== CÁLCULOS ======
    const calculateProgress = (order) => {
        if (!order || !order.orderItems) return 0;
        const totalExpected = order.orderItems.reduce((acc, i) => acc + i.expected, 0);
        const totalCollected = order.orderItems.reduce((acc, i) => acc + i.collected, 0);
        return totalExpected === 0 ? 0 : Math.round((totalCollected / totalExpected) * 100);
    };

    if (view === 'ACTIVE' && selectedOrder) {
        const progress = calculateProgress(selectedOrder);
        const totalExpected = selectedOrder.orderItems.reduce((acc, i) => acc + i.expected, 0);
        const totalCollected = selectedOrder.orderItems.reduce((acc, i) => acc + i.collected, 0);

        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Ativo */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={handleBackToList} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                Separação Ativa — <span className="text-secondary">{selectedOrder.id}</span>
                            </h1>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">{selectedOrder.client}</p>
                        </div>
                    </div>
                    <button onClick={handleFinalize} className="px-6 py-2.5 bg-secondary text-primary rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Finalizar Ordem
                    </button>
                </div>

                {/* Cards de Info Ativa */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Ordem</p>
                        <p className="font-black flex items-center gap-2 text-sm"><CalendarDays className="w-3.5 h-3.5 text-primary" /> {selectedOrder.date}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Itens Coletados</p>
                        <p className="text-lg font-black">{totalCollected} <span className="text-slate-300">/ {totalExpected}</span></p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Progresso Geral</p>
                        <p className="text-lg font-black">{progress}%</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Barra Evolução</p>
                        <div className="mt-3 h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>

                {/* Área de Scanner */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center shrink-0">
                            <ScanBarcode className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="flex-1">
                            <input
                                ref={scanInputRef}
                                type="text"
                                value={scanValue}
                                onChange={(e) => setScanValue(e.target.value)}
                                onKeyDown={handleScan}
                                placeholder="Bipe o SKU ou EAN do produto..."
                                className={`w-full bg-slate-50 dark:bg-slate-900 border-2 ${scanError ? 'border-danger animate-shake' : 'border-slate-200 dark:border-slate-700'} rounded-xl py-3.5 px-5 text-sm font-bold focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all`}
                            />
                        </div>
                    </div>
                    {scanError && (
                        <div className="mt-3 flex items-center gap-2 text-danger text-xs font-black px-1 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" /> {scanError}
                        </div>
                    )}
                </div>

                {/* Tabela de Itens */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[9px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4">Produto / SKU</th>
                                <th className="px-6 py-4">Endereço</th>
                                <th className="px-6 py-4 text-center">Esperado</th>
                                <th className="px-6 py-4 text-center">Coletado</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {selectedOrder.orderItems.map((item) => {
                                const isDone = item.collected >= item.expected;
                                const isScanning = lastScannedId === item.id;
                                return (
                                    <tr key={item.id} className={`${isScanning ? 'bg-success/10 ring-2 ring-success ring-inset' : ''} ${isDone ? 'opacity-60 bg-slate-50/30' : ''} transition-all duration-300`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? 'bg-success/10 text-success' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                                                    {isDone ? <Check className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-xs">{item.desc}</p>
                                                    <p className="text-[9px] font-bold text-slate-400">{item.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/5 text-primary rounded-lg border border-primary/10">
                                                <MapPin className="w-3 h-3" />
                                                <span className="text-[10px] font-black">{item.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-black text-sm">{item.expected}</td>
                                        <td className="px-6 py-4 text-center font-black text-lg text-secondary">{item.collected}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter border ${isDone ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                                {isDone ? 'Completo' : 'Pendente'}
                                            </span>
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Cabeçalho Lista */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <ShoppingCart className="w-8 h-8 text-secondary" /> Fila de Separação
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Gestão de Ordens de Venda procedentes do Omie</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowHistoryModal(true)} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                        <History className="w-4 h-4" /> Histórico
                    </button>
                    <div className="flex p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        {['Todos', 'Pendente', 'Em Separação', 'Concluído'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${filter === s ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-primary'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cards de Métricas da Fila */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm border-l-4 border-l-primary">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total na Fila</p>
                    <p className="text-xl font-black">{orders.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm border-l-4 border-l-warning">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Em Processo</p>
                    <p className="text-xl font-black">{orders.filter(o => o.status === 'Em Separação').length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm border-l-4 border-l-success">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Concluídas Hoje</p>
                    <p className="text-xl font-black">{orders.filter(o => o.status === 'Concluído').length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm border-l-4 border-l-secondary">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
                    <p className="text-xl font-black">100%</p>
                </div>
            </div>

            {/* Lista de Ordens */}
            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                    const progress = calculateProgress(order);
                    return (
                        <div key={order.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group flex flex-wrap items-center gap-6 relative overflow-hidden">
                            {/* Barra lateral de status */}
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${order.status === 'Concluído' ? 'bg-success' : (order.status === 'Em Separação' ? 'bg-warning' : 'bg-primary')}`} />
                            
                            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                    <ClipboardList className="w-6 h-6 text-slate-400 group-hover:text-secondary transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-black text-lg">{order.id}</span>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-xs text-slate-600 dark:text-slate-300 uppercase truncate max-w-[200px]">{order.client}</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" /> {order.date}
                                        </span>
                                        <div className="flex-1 max-w-[150px]">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Progresso</p>
                                                <p className="text-[8px] font-black text-primary">{progress}%</p>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                                                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 pr-4 border-l border-slate-50 dark:border-slate-700 pl-8">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">SKUs</p>
                                    <p className="font-black text-xl text-primary">{order.items}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Unidades</p>
                                    <p className="font-black text-xl text-primary">{order.totalQty || '-'}</p>
                                </div>
                                <div className="text-center hidden sm:block">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Valor</p>
                                    <p className="font-black text-sm text-slate-600">{order.value}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleStartPicking(order)}
                                className={`h-12 px-6 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 transition-all active:scale-95 ${
                                    order.status === 'Concluído' 
                                    ? 'bg-success/10 text-success border border-success/20 cursor-default'
                                    : 'bg-secondary text-primary shadow-lg shadow-black/5'
                                }`}
                            >
                                {order.status === 'Concluído' ? (
                                    <>Concluído <Check className="w-4 h-4" /></>
                                ) : (
                                    order.status === 'Em Separação' ? <>Continuar <ArrowRight className="w-4 h-4" /></> : <>Iniciar <Play className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    );
                }) : (
                    <div className="py-20 flex flex-col items-center justify-center opacity-30 select-none">
                        <ShoppingCart className="w-20 h-20 mb-4" />
                        <p className="font-black uppercase tracking-widest">Nenhuma ordem encontrada</p>
                    </div>
                )}
            </div>

            {/* Modal Histórico (Consultas) */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[70vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-black italic">Histórico de Atividades</h3>
                            <button onClick={() => setShowHistoryModal(false)} className="p-2 text-slate-400 hover:text-danger transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-8 text-center opacity-50">
                            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <p className="text-xs font-bold uppercase tracking-widest">Módulo de Business Intelligence em desenvolvimento</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Subcomponente de Calendário para os Cards
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
