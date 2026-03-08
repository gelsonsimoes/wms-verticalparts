import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { OmieApi } from '../services/omieApi';
import {
    FileText, Search, Scan, Plus, Printer, Trash2, CheckCircle2,
    AlertCircle, Package, Truck, History, Zap, ArrowRight, X,
    QrCode, Check, Database, ListFilter, Calendar,
    User as UserIcon, RefreshCw, ScanBarcode, BarChart3
} from 'lucide-react';

const INITIAL_ITEMS = [
    { id: 1, sku: 'VEPEL-BPI-174FX', desc: 'Barreira de Proteção Infravermelha (174 Feixes)', ean: '789123456001', expected: 100, counted: 0, unit: 'UN', lot: 'LOT-2026A', recorded: false },
    { id: 2, sku: 'VPER-ESS-NY-27MM', desc: 'Escova de Segurança (Nylon - Base 27mm)', ean: '7891149108718', expected: 50, counted: 0, unit: 'UN', lot: 'LOT-2026B', recorded: false },
    { id: 3, sku: 'VPER-PAL-INO-1000', desc: 'Pallet de Aço Inox (1000mm)', ean: '789123456003', expected: 200, counted: 0, unit: 'LT', lot: 'LOT-VPARTS', recorded: false },
];

const PRODUCT_MASTER = [
    { ean: '7890000000001', sku: 'VPER-INC-ESQ', desc: 'InnerCap (Esquerdo) - Ref.: VERTICALPARTS', unit: 'UN', lot: 'LOT-NEW' },
    { ean: '7890000000002', sku: 'VPER-AIR-FLOW', desc: 'Filtro de Ar VP-FLOW', unit: 'UN', lot: 'LOT-NEW' },
    { ean: '7890000000003', sku: 'VPER-WPR-BAR', desc: 'Barra de Segurança WPR-BAR', unit: 'UN', lot: 'LOT-NEW' },
];

export default function ReceivingCheckIn() {
    const { addToInventory, addReceiptLog, receiptHistory } = useApp();
    const [scanValue, setScanValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [receivingProgess, setReceivingProgress] = useState(0);
    const [showFinishedModal, setShowFinishedModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showDivergenceModal, setShowDivergenceModal] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [scanError, setScanError] = useState(null);
    const [lastScannedId, setLastScannedId] = useState(null);
    const [manualInputId, setManualInputId] = useState(null);
    const [lotModal, setLotModal] = useState(null); // { product } quando aberto
    const [lotInput, setLotInput] = useState('');
    const eanInputRef   = useRef(null);
    const scanErrRef    = useRef(null);
    const lastScanRef   = useRef(null);

    // Cleanup de todos os timeouts ao desmontar
    useEffect(() => () => {
        if (scanErrRef.current)  clearTimeout(scanErrRef.current);
        if (lastScanRef.current) clearTimeout(lastScanRef.current);
    }, []);

    // Escape — Modal Histórico
    useEffect(() => {
        if (!showHistoryModal) return;
        const fn = (e) => { if (e.key === 'Escape') setShowHistoryModal(false); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [showHistoryModal]);

    // Escape — Modal Reset
    useEffect(() => {
        if (!showResetModal) return;
        const fn = (e) => { if (e.key === 'Escape') setShowResetModal(false); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [showResetModal]);

    // Escape — Modal Etiqueta
    useEffect(() => {
        if (!showPrintModal) return;
        const fn = (e) => { if (e.key === 'Escape') setShowPrintModal(false); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [showPrintModal]);

    // Escape — Modal Divergência
    useEffect(() => {
        if (!showDivergenceModal) return;
        const fn = (e) => { if (e.key === 'Escape') setShowDivergenceModal(false); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [showDivergenceModal]);

    // Escape — Modal Lote (listener global além do onKeyDown do input)
    useEffect(() => {
        if (!lotModal) return;
        const fn = (e) => { if (e.key === 'Escape') setLotModal(null); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [lotModal]);

    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('vparts_receiving_temp');
        return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    });

    useEffect(() => { localStorage.setItem('vparts_receiving_temp', JSON.stringify(items)); }, [items]);

    useEffect(() => {
        if (eanInputRef.current && !manualInputId && !showHistoryModal && !showFinishedModal && !showResetModal && !lotModal && !showDivergenceModal) {
            eanInputRef.current.focus();
        }
    }, [showFinishedModal, showResetModal, showPrintModal, showHistoryModal, scanError, items.length, manualInputId, lotModal, showDivergenceModal]);

    useEffect(() => {
        const totalExpected = items.reduce((acc, item) => acc + item.expected, 0);
        const totalCounted = items.reduce((acc, item) => acc + item.counted, 0);
        if (totalExpected === 0) setReceivingProgress(0);
        else setReceivingProgress(Math.min(Math.round((totalCounted / totalExpected) * 100), 100));
    }, [items]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setScanValue(value);
        if (value.length >= 2) {
            const combinedList = [
                ...items.map(i => ({ ...i, source: 'SESSION' })),
                ...PRODUCT_MASTER.filter(m => !items.find(i => i.ean === m.ean)).map(m => ({ ...m, source: 'MASTER' }))
            ];
            const filtered = combinedList.filter(p =>
                p.desc.toLowerCase().includes(value.toLowerCase()) ||
                p.ean.includes(value) ||
                p.sku.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectProduct = (product) => {
        // Abre modal para coletar lote antes de confirmar
        setLotModal(product);
        setLotInput('');
        setScanValue('');
        setSuggestions([]);
    };

    const confirmarBipagem = (product, lote) => {
        const itemIndex = items.findIndex(item => item.ean === product.ean);
        if (itemIndex !== -1) {
            const newItems = [...items];
            newItems[itemIndex] = {
                ...newItems[itemIndex],
                counted: newItems[itemIndex].counted + 1,
                lot: lote || newItems[itemIndex].lot
            };
            setItems(newItems);
            setLastScannedId(newItems[itemIndex].id);
        } else {
            const newItem = {
                id: Date.now(), sku: product.sku, desc: product.desc,
                ean: product.ean, expected: product.expected || 0,
                counted: 1, unit: product.unit || 'UN',
                lot: lote || product.lot || 'S/L',
                recorded: false, isNew: true
            };
            setItems(prev => [...prev, newItem]);
            setLastScannedId(newItem.id);
        }
        setLotModal(null);
        setLotInput('');
        setScanError(null);
        if (lastScanRef.current) clearTimeout(lastScanRef.current);
        lastScanRef.current = setTimeout(() => setLastScannedId(null), 800);
    };

    const handleScan = (e) => {
        if (e.key === 'Enter') {
            const ean = scanValue.trim();
            if (!ean) return;
            const exactMatch = items.find(item => item.ean === ean) || PRODUCT_MASTER.find(m => m.ean === ean);
            if (exactMatch) { handleSelectProduct(exactMatch); }
            else if (suggestions.length > 0) { handleSelectProduct(suggestions[0]); }
            else {
                setScanError(`Produto ou EAN "${ean}" não identificado.`);
                if (scanErrRef.current) clearTimeout(scanErrRef.current);
                scanErrRef.current = setTimeout(() => setScanError(null), 3000);
                setScanValue('');
            }
        }
    };

    const updateCountManual = (id, value) => {
        const val = parseInt(value) || 0;
        setItems(items.map(it => it.id === id ? { ...it, counted: val } : it));
        setManualInputId(null);
    };

    const handleReset = () => {
        setItems(INITIAL_ITEMS);
        localStorage.removeItem('vparts_receiving_temp');
        setShowResetModal(false);
    };

    const executarGravacao = async () => {
        setSyncing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const transactionId = Math.floor(Date.now() / 1000);
            const dateString = new Date().toLocaleString();
            const receivedItems = items.filter(i => i.counted > 0).map(i => ({
                sku: i.sku, ean: i.ean, descricao: i.desc,
                quantidade_recebida: i.counted, lote: i.lot,
                data_entrada: dateString, operador: 'João Silva',
                id_transacao: transactionId, localizacao: 'DOCA-RECEBIMENTO'
            }));
            await OmieApi.recordReceiptInOmie({ nf: 'NF-8842', items: receivedItems });
            addToInventory(receivedItems);
            addReceiptLog({
                id: transactionId, date: dateString, nf: 'NF-8842',
                operator: 'João Silva', items: receivedItems.length,
                totalUnits: items.reduce((acc, i) => acc + i.counted, 0),
                status: 'CONCLUÍDO'
            });
            setSyncing(false);
            setShowFinishedModal(true);
        } catch (err) {
            alert('Erro no processamento: ' + err.message);
            setSyncing(false);
        }
    };

    const handleFinalize = async () => {
        const totalCounted = items.reduce((acc, i) => acc + i.counted, 0);
        if (totalCounted === 0) {
            setScanError('Nenhum item foi contado para finalizar.');
            if (scanErrRef.current) clearTimeout(scanErrRef.current);
            scanErrRef.current = setTimeout(() => setScanError(null), 3000);
            return;
        }
        const hasPendent = items.some(item => item.counted < item.expected);
        if (hasPendent) {
            setShowDivergenceModal(true);
            return;
        }
        await executarGravacao();
    };

    const finalizeAndReset = () => {
        setItems(INITIAL_ITEMS);
        localStorage.removeItem('vparts_receiving_temp');
        setShowFinishedModal(false);
    };

    const getStatusInfo = (item) => {
        if (item.counted === 0)
            return { label: 'PENDENTE',  color: 'text-slate-400',  bg: 'bg-slate-100 dark:bg-slate-800',      bar: 'bg-slate-300' };
        if (item.expected > 0 && item.counted > item.expected)
            return { label: 'EXCESSO',   color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950/20',        bar: 'bg-red-500' };
        if (item.counted >= item.expected && item.expected > 0)
            return { label: 'CONCLUÍDO', color: 'text-green-700',  bg: 'bg-green-50 dark:bg-green-950/20',   bar: 'bg-green-500' };
        return     { label: 'EM CURSO',  color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/20',     bar: 'bg-blue-500' };
    };

    const getRowHighlight = (item) => {
        if (lastScannedId === item.id) return 'ring-2 ring-green-400 ring-inset bg-green-50 dark:bg-green-950/20';
        if (item.isNew) return 'bg-amber-50/50 dark:bg-amber-950/10';
        return '';
    };

    const totalUnitsScanned = items.reduce((acc, i) => acc + i.counted, 0);
    const skusProcessados = items.filter(i => i.counted > 0).length;
    const skusConcluidos = items.filter(i => i.counted >= i.expected && i.expected > 0).length;

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ====== CABEÇALHO ====== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">2.13 Recebimento (Check-in)</h1>
                    <p className="text-sm text-slate-500 font-medium">Conferência física de mercadorias na entrada</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowHistoryModal(true)} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                        <History className="w-4 h-4" /> Consultas
                    </button>
                    <button onClick={() => setShowPrintModal(true)} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                        <Printer className="w-4 h-4" /> Etiqueta
                    </button>
                    <button onClick={() => setShowResetModal(true)} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 hover:text-danger hover:border-danger/30 transition-all flex items-center gap-2 shadow-sm">
                        <Trash2 className="w-4 h-4" /> Limpar
                    </button>
                    <button onClick={handleFinalize} disabled={syncing || totalUnitsScanned === 0} className="px-5 py-2.5 bg-secondary text-primary rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all flex items-center gap-2 shadow-lg shadow-black/10 disabled:opacity-40 disabled:cursor-not-allowed">
                        {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {syncing ? 'Sincronizando...' : 'Gravar & Finalizar'}
                    </button>
                </div>
            </div>

            {/* ====== CARDS DE RESUMO ====== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ordem / NF</p>
                    </div>
                    <p className="text-lg font-black">OR-55920</p>
                    <p className="text-[9px] font-bold text-slate-400">NF-8842 • DOCA-01</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center" aria-hidden="true"><Package className="w-4 h-4 text-amber-600" /></div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SKUs</p>
                    </div>
                    <p className="text-lg font-black">{skusProcessados}<span className="text-slate-300 font-bold"> / {items.length}</span></p>
                    <p className="text-[9px] font-bold text-green-600">{skusConcluidos} concluídos</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center" aria-hidden="true"><BarChart3 className="w-4 h-4 text-green-600" /></div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Conferido</p>
                    </div>
                    <p className="text-lg font-black">{totalUnitsScanned} <span className="text-xs font-bold text-slate-400">un</span></p>
                    <p className="text-[9px] font-bold text-slate-400">Operador: João Silva</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center"><Zap className="w-4 h-4 text-secondary" /></div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Evolução</p>
                    </div>
                    <p className="text-lg font-black">{receivingProgess}%</p>
                    <div className="mt-1 h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="h-full bg-secondary transition-all duration-1000 rounded-full" style={{ width: `${receivingProgess}%` }} />
                    </div>
                </div>
            </div>

            {/* ====== SCANNER / INPUT ====== */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center shrink-0">
                        <ScanBarcode className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1 relative">
                        <label htmlFor="barcode-input" className="sr-only">Código de barras do produto — bipe ou digite para pesquisar</label>
                        <input
                            id="barcode-input"
                            ref={eanInputRef}
                            type="text"
                            value={scanValue}
                            onChange={handleInputChange}
                            onKeyDown={handleScan}
                            disabled={syncing}
                            placeholder="Bipe o código de barras ou digite o nome do produto..."
                            className={`w-full bg-slate-50 dark:bg-slate-900 border-2 ${scanError ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} rounded-xl py-3.5 px-5 pr-28 text-sm font-bold focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all placeholder:text-slate-300`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">ENTER ↵</span>
                            <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-amber-400 animate-pulse' : 'bg-green-500 animate-pulse'}`} aria-hidden="true" />
                        </div>

                        {/* Sugestões */}
                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><ListFilter className="w-3 h-3" /> Sugestões</p>
                                </div>
                                {suggestions.map((p, idx) => (
                                    <button key={p.ean + idx} onClick={() => handleSelectProduct(p)} className="w-full text-left px-4 py-3 hover:bg-secondary/5 transition-colors flex items-center justify-between border-b border-slate-50 dark:border-slate-800 last:border-0 group">
                                        <div className="flex items-center gap-3">
                                            <Package className="w-4 h-4 text-slate-400 group-hover:text-secondary transition-colors" />
                                            <div>
                                                <p className="font-black text-xs">{p.desc}</p>
                                                <p className="text-[9px] font-bold text-slate-400">SKU: {p.sku} • EAN: {p.ean}</p>
                                            </div>
                                        </div>
                                        <Plus className="w-4 h-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {scanError && (
                    <div role="alert" className="mt-3 flex items-center gap-2 text-red-600 text-xs font-black">
                        <AlertCircle className="w-4 h-4" aria-hidden="true" /> {scanError}
                    </div>
                )}
            </div>

            {/* ====== GRADE DE CONFERÊNCIA ====== */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        Grade de Conferência <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-lg text-[9px]">{items.length} SKUs</span>
                    </h3>
                    <div className="text-[9px] font-black px-3 py-1.5 bg-secondary text-primary rounded-lg flex items-center gap-1.5">
                        <Package className="w-3 h-3" /> {totalUnitsScanned} unidades conferidas
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[9px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th scope="col" className="px-6 py-4">Produto</th>
                                <th scope="col" className="px-6 py-4">EAN</th>
                                <th scope="col" className="px-6 py-4 text-center">Previsto</th>
                                <th scope="col" className="px-6 py-4 text-center">Contado</th>
                                <th scope="col" className="px-6 py-4 text-center">Progresso</th>
                                <th scope="col" className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {items.map((item) => {
                                const status = getStatusInfo(item);
                                const pct = item.expected > 0 ? Math.min((item.counted / item.expected) * 100, 100) : (item.counted > 0 ? 100 : 0);
                                return (
                                    <tr key={item.id} className={`${getRowHighlight(item)} transition-all duration-500 hover:bg-slate-50/50`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.isNew ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`} aria-hidden="true">
                                                    <Package className={`w-4 h-4 ${item.isNew ? 'text-amber-600' : 'text-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-xs">{item.desc}</p>
                                                    <p className="text-[9px] font-bold text-slate-400">{item.sku} {item.isNew && <span className="text-amber-600 ml-1">• NOVO</span>}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-[10px] text-slate-500 font-bold">{item.ean}</td>
                                        <td className="px-6 py-4 text-center font-black text-slate-400 text-sm">{item.expected}</td>
                                        <td className="px-6 py-4 text-center">
                                            {manualInputId === item.id ? (
                                                <input autoFocus type="number" onBlur={(e) => updateCountManual(item.id, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && updateCountManual(item.id, e.target.value)} className="w-16 bg-secondary/10 border-2 border-secondary rounded-lg py-1 px-2 text-center font-black text-sm outline-none no-spinner font-mono" />
                                            ) : (
                                                <button onClick={() => !item.recorded && setManualInputId(item.id)} className="text-lg font-black hover:text-secondary transition-colors cursor-pointer">
                                                    {item.counted}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 justify-center">
                                                <div className="h-2 w-20 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                                                    <div className={`h-full transition-all duration-700 rounded-full ${status.bar}`} style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 w-8">{Math.round(pct)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${status.bg} ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====== MODAL HISTÓRICO ====== */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="history-modal-title"
                        className="bg-white dark:bg-slate-800 w-full max-w-3xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center" aria-hidden="true"><History className="w-5 h-5 text-primary" /></div>
                                <div>
                                    <h2 id="history-modal-title" className="text-base font-black">Histórico de Recebimento</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Transações registradas</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                aria-label="Fechar histórico"
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {receiptHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {receiptHistory.map((log) => (
                                        <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center" aria-hidden="true">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="font-black text-sm">#{log.id}</span>
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded uppercase">Concluído</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {log.date}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><FileText className="w-3 h-3" /> {log.nf}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><UserIcon className="w-3 h-3" /> {log.operator}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Itens</p>
                                                    <p className="text-sm font-black">{log.items}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Unidades</p>
                                                    <p className="text-sm font-black">{log.totalUnits}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-center opacity-40">
                                    <History className="w-12 h-12 text-slate-300 mb-3" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum registro encontrado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ====== MODAL RESET ====== */}
            {showResetModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reset-modal-title"
                        className="bg-white dark:bg-slate-800 w-full max-w-sm p-6 rounded-3xl shadow-2xl space-y-5 text-center"
                    >
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto" aria-hidden="true">
                            <Trash2 className="w-7 h-7 text-red-600" />
                        </div>
                        <div>
                            <h2 id="reset-modal-title" className="text-lg font-black">Limpar Conferência?</h2>
                            <p className="text-xs text-slate-500 mt-1">Todo progresso será apagado. Esta ação é irreversível.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowResetModal(false)} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                            <button onClick={handleReset} className="py-3 bg-red-600 text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-red-700 transition-all">Sim, Limpar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== MODAL SUCESSO ====== */}
            {showFinishedModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="success-modal-title"
                        className="bg-white dark:bg-slate-800 w-full max-w-sm p-8 rounded-3xl shadow-2xl text-center space-y-5"
                    >
                        <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto" aria-hidden="true">
                            <CheckCircle2 className="w-10 h-10 text-green-600" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 id="success-modal-title" className="text-xl font-black">Recebido & Gravado!</h2>
                            <p className="text-xs text-slate-500 mt-2">
                                {totalUnitsScanned} unidades integradas ao estoque VerticalParts via ERP Omie.
                            </p>
                        </div>
                        <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-xl text-left flex items-start gap-2">
                            <Database className="w-4 h-4 text-secondary shrink-0 mt-0.5" aria-hidden="true" />
                            <p className="text-[10px] font-bold text-slate-600">Lote consolidado na <span className="font-black text-secondary">DOCA-RECEBIMENTO</span>.</p>
                        </div>
                        <button onClick={finalizeAndReset} className="w-full py-3.5 bg-secondary text-primary rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2">
                            Novo Recebimento <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}

            {/* ====== MODAL ETIQUETA ====== */}
            {showPrintModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="print-modal-title"
                        className="bg-white dark:bg-slate-800 w-full max-w-sm p-6 rounded-3xl shadow-2xl space-y-5"
                    >
                        <div className="flex items-center justify-between">
                            <h2 id="print-modal-title" className="text-base font-black">Etiqueta de Palete</h2>
                            <button
                                onClick={() => setShowPrintModal(false)}
                                aria-label="Fechar etiqueta"
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="border-4 border-black p-5 space-y-4 font-black uppercase text-center text-black bg-white rounded-xl">
                            <p className="text-lg border-b-2 border-black pb-2">VerticalParts WMS</p>
                            <QrCode className="w-20 h-20 mx-auto" aria-label="QR Code da etiqueta de palete" />
                            <div className="space-y-1 border-y-2 border-dashed border-black py-3">
                                <p className="text-[10px] tracking-widest">LOCAL: DOCA-RECEBIMENTO</p>
                                <p className="text-xl">
                                    PALET-{String(Math.floor(Date.now() / 1000) % 10000).padStart(4, '0')}
                                </p>
                                <p className="text-[9px] mt-1">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowPrintModal(false)} className="w-full py-3 bg-secondary text-primary rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all">Fechar</button>
                    </div>
                </div>
            )}

            {/* ====== MODAL DIVERGÊNCIA ====== */}
            {showDivergenceModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="divergence-modal-title"
                        className="bg-white dark:bg-slate-800 w-full max-w-sm p-6 rounded-3xl shadow-2xl space-y-5 text-center"
                    >
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto" aria-hidden="true">
                            <AlertCircle className="w-7 h-7 text-amber-600" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 id="divergence-modal-title" className="text-lg font-black">Recebimento com Divergência</h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Existem itens com contagem abaixo do previsto na OR.
                                Deseja finalizar e registrar a divergência?
                            </p>
                            <div className="mt-3 space-y-1">
                                {items.filter(i => i.counted < i.expected).map(i => (
                                    <div key={i.id}
                                         className="flex items-center justify-between px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-left">
                                        <span className="text-[10px] font-black text-slate-600 truncate max-w-[200px]">{i.desc}</span>
                                        <span className="text-[10px] font-black text-amber-700 ml-2 shrink-0">
                                            {i.counted}/{i.expected}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowDivergenceModal(false)}
                                className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    setShowDivergenceModal(false);
                                    await executarGravacao();
                                }}
                                className="py-3 bg-amber-500 text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-amber-600 transition-all"
                            >
                                Finalizar com Divergência
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== MODAL LOTE INDÚSTRIA ====== */}
            {lotModal && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="lot-modal-title"
                        className="bg-white dark:bg-slate-800 w-full max-w-sm p-6 rounded-3xl shadow-2xl space-y-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                                <Package className="w-5 h-5 text-secondary" aria-hidden="true" />
                            </div>
                            <div>
                                <p id="lot-modal-title" className="font-black text-sm">{lotModal.desc}</p>
                                <p className="text-[9px] text-slate-400 font-bold">{lotModal.sku}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="lot-input" className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Lote Indústria
                            </label>
                            <input
                                id="lot-input"
                                autoFocus
                                type="text"
                                value={lotInput}
                                onChange={e => setLotInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') confirmarBipagem(lotModal, lotInput || lotModal.lot);
                                    if (e.key === 'Escape') setLotModal(null);
                                }}
                                placeholder={`Ex: ${lotModal.lot || 'LOT-2026A'}`}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
                            />
                            <p className="text-[9px] text-slate-400">
                                Pressione Enter para confirmar ou Esc para cancelar
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setLotModal(null)}
                                className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => confirmarBipagem(lotModal, lotInput || lotModal.lot)}
                                className="py-3 bg-secondary text-primary rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
