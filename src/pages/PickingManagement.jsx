import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import {
    ClipboardList, ArrowRight, Clock, CheckCircle2, CalendarDays,
    AlertCircle, Play, Package, MapPin, ScanBarcode, History,
    Check, X, BarChart3, ShoppingCart
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
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);
    const scanInputRef        = useRef(null);
    const lastScannedTimeoutRef = useRef(null);
    const scanErrTimeoutRef     = useRef(null);
    const historyCloseBtnRef    = useRef(null);
    const finalizeCloseBtnRef   = useRef(null);
    const historyTitleId        = 'picking-history-title';
    const finalizeTitleId       = 'picking-finalize-title';

    // Cleanup de todos os timeouts ao desmontar
    useEffect(() => {
        return () => {
            if (lastScannedTimeoutRef.current) clearTimeout(lastScannedTimeoutRef.current);
            if (scanErrTimeoutRef.current)     clearTimeout(scanErrTimeoutRef.current);
        };
    }, []);

    // Escape + foco inicial no modal de histórico
    useEffect(() => {
        if (!showHistoryModal) return;
        historyCloseBtnRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') setShowHistoryModal(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [showHistoryModal]);

    // Escape + foco inicial no modal de finalização
    useEffect(() => {
        if (!showFinalizeModal) return;
        finalizeCloseBtnRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') setShowFinalizeModal(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [showFinalizeModal]);

    // Persistência da ordem selecionada para não perder o progresso em caso de refresh
    useEffect(() => {
        const savedOrderId = localStorage.getItem('vparts_active_picking_id');
        if (savedOrderId && view === 'LIST') {
            const order = orders.find(o => o.id === savedOrderId);
            if (order && order.status !== 'Concluído') {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedOrder(order);
                // eslint-disable-next-line react-hooks/set-state-in-effect
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
        if (order.status === 'Concluído') return; // Guarda: ordem já finalizada
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

            const eanUpper = ean.toUpperCase();
            const itemIndex = selectedOrder.orderItems.findIndex(item =>
                item.ean === ean ||
                item.ean.toUpperCase().includes(eanUpper) ||
                item.sku?.toUpperCase().includes(eanUpper)
            );

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
                    if (lastScannedTimeoutRef.current) clearTimeout(lastScannedTimeoutRef.current);
                    lastScannedTimeoutRef.current = setTimeout(() => setLastScannedId(null), 800);
                } else {
                    setScanError(`Quantidade máxima já coletada para o item "${item.desc}"`);
                    setScanValue('');
                    if (scanErrTimeoutRef.current) clearTimeout(scanErrTimeoutRef.current);
                    scanErrTimeoutRef.current = setTimeout(() => setScanError(null), 3000);
                }
            } else {
                setScanError(`Código "${ean}" não pertence a esta ordem.`);
                setScanValue('');
                if (scanErrTimeoutRef.current) clearTimeout(scanErrTimeoutRef.current);
                scanErrTimeoutRef.current = setTimeout(() => setScanError(null), 3000);
            }
        }
    };

    const handleFinalize = () => {
        const allCollected = selectedOrder.orderItems.every(
            item => item.collected === item.expected
        );
        if (!allCollected) {
            setShowFinalizeModal(true); // abre modal em vez de window.confirm
            return;
        }
        confirmarFinalizacao();
    };

    const confirmarFinalizacao = () => {
        updateOrderStatus(selectedOrder.id, 'Concluído');
        setShowFinalizeModal(false);
        handleBackToList();
    };

    const handlePularItem = (itemId) => {
        // Marca o item como pulado para revisitar depois
        const updatedItems = selectedOrder.orderItems.map(i =>
            i.id === itemId ? { ...i, pulado: true } : i
        );
        const updatedOrder = { ...selectedOrder, orderItems: updatedItems };
        setSelectedOrder(updatedOrder);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Concluído':    return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800/40';
            case 'Em Separação': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/40';
            default:             return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    // Performance dinâmica: % de ordens com status Concluído
    const performancePct = orders.length === 0
        ? 0
        : Math.round((orders.filter(o => o.status === 'Concluído').length / orders.length) * 100);

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
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Evolução
                        </p>
                        <p className="text-lg font-black">{progress}%</p>
                        <div className="mt-2 h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-secondary transition-all duration-1000 rounded-full" 
                                style={{ width: `${progress}%` }} 
                            />
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
                            <label htmlFor="picking-scan-input" className="sr-only">Bipe ou digite o SKU ou EAN do produto para coletar</label>
                            <input
                                id="picking-scan-input"
                                ref={scanInputRef}
                                type="text"
                                value={scanValue}
                                onChange={(e) => setScanValue(e.target.value)}
                                onKeyDown={handleScan}
                                placeholder="Bipe o SKU ou EAN do produto..."
                                className={`w-full bg-slate-50 dark:bg-slate-900 border-2 ${scanError ? 'border-red-400 animate-shake' : 'border-slate-200 dark:border-slate-700'} rounded-xl py-3.5 px-5 text-sm font-bold focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all`}
                            />
                        </div>
                    </div>
                    {scanError && (
                        <div role="alert" className="mt-3 flex items-center gap-2 text-red-600 text-xs font-black px-1 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" aria-hidden="true" /> {scanError}
                        </div>
                    )}
                </div>

                {showFinalizeModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={finalizeTitleId}
                            className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0" aria-hidden="true">
                                        <AlertCircle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p id={finalizeTitleId} className="text-sm font-black text-slate-800 dark:text-white">
                                            Itens pendentes
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            Nem todos os itens foram coletados. Deseja finalizar mesmo assim?
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        ref={finalizeCloseBtnRef}
                                        onClick={() => setShowFinalizeModal(false)}
                                        className="flex-1 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmarFinalizacao}
                                        className="flex-1 py-2.5 bg-secondary text-primary rounded-xl text-xs font-black hover:bg-secondary/90 active:scale-95 transition-all shadow-md"
                                    >
                                        Finalizar mesmo assim
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabela de Itens */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[9px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th scope="col" className="px-6 py-4">Produto / SKU</th>
                                <th scope="col" className="px-6 py-4">Endereço</th>
                                <th scope="col" className="px-6 py-4 text-center">Esperado</th>
                                <th scope="col" className="px-6 py-4 text-center">Coletado</th>
                                <th scope="col" className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {selectedOrder.orderItems.map((item) => {
                                const isDone = item.collected >= item.expected;
                                const isScanning = lastScannedId === item.id;
                                return (
                                    <tr key={item.id} className={`${isScanning ? 'bg-green-50 ring-2 ring-green-400 ring-inset' : ''} ${isDone ? 'opacity-60 bg-slate-50/30' : ''} transition-all duration-300`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`} aria-hidden="true">
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
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter border 
                                                    ${isDone 
                                                        ? 'bg-green-100 text-green-700 border-green-200' 
                                                        : item.pulado
                                                            ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/40'
                                                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                                    }`}>
                                                    {isDone ? 'Completo' : item.pulado ? 'Pulado' : 'Pendente'}
                                                </span>
                                                {!isDone && !item.pulado && (
                                                    <button
                                                        onClick={() => handlePularItem(item.id)}
                                                        className="text-[8px] font-black text-slate-400 hover:text-amber-600 uppercase tracking-wider transition-colors"
                                                    >
                                                        Pular →
                                                    </button>
                                                )}
                                            </div>
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
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm border-l-4 border-l-amber-400">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Em Processo</p>
                    <p className="text-xl font-black">{orders.filter(o => o.status === 'Em Separação').length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm border-l-4 border-l-green-500">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Concluídas Hoje</p>
                    <p className="text-xl font-black">{orders.filter(o => o.status === 'Concluído').length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm border-l-4 border-l-secondary">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
                    <p className="text-xl font-black">{performancePct}%</p>
                </div>
            </div>

            {/* Lista de Ordens */}
            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                    const progress = calculateProgress(order);
                    return (
                        <div key={order.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group flex flex-wrap items-center gap-6 relative overflow-hidden">
                            {/* Barra lateral de status */}
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${order.status === 'Concluído' ? 'bg-green-500' : (order.status === 'Em Separação' ? 'bg-amber-400' : 'bg-primary')}`} aria-hidden="true" />
                            
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
                                disabled={order.status === 'Concluído'}
                                aria-label={order.status === 'Concluído' ? `Ordem ${order.id} concluída` : order.status === 'Em Separação' ? `Continuar separação da ordem ${order.id}` : `Iniciar separação da ordem ${order.id}`}
                                className={`h-12 px-6 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 transition-all active:scale-95 ${
                                    order.status === 'Concluído' 
                                    ? 'bg-green-100 text-green-700 border border-green-200 cursor-default disabled:opacity-80'
                                    : 'bg-secondary text-primary shadow-lg shadow-black/5'
                                }`}
                            >
                                {order.status === 'Concluído' ? (
                                    <>Concluído <Check className="w-4 h-4" aria-hidden="true" /></>
                                ) : (
                                    order.status === 'Em Separação'
                                        ? <>Continuar <ArrowRight className="w-4 h-4" aria-hidden="true" /></>
                                        : <>Iniciar <Play className="w-4 h-4" aria-hidden="true" /></>
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
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={historyTitleId}
                        className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[70vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 id={historyTitleId} className="text-lg font-black italic">Histórico de Atividades</h2>
                            <button
                                ref={historyCloseBtnRef}
                                onClick={() => setShowHistoryModal(false)}
                                aria-label="Fechar histórico"
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="p-8 text-center opacity-50">
                            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" aria-hidden="true" />
                            <p className="text-xs font-bold uppercase tracking-widest">Módulo de Business Intelligence em desenvolvimento</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


