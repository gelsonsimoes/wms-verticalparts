import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import {
    Package,
    Search,
    Scan,
    CheckCircle2,
    Printer,
    QrCode,
    Box,
    ArrowRight,
    ShieldCheck,
    Zap,
    AlertCircle,
    X,
} from 'lucide-react';

export default function PackingStation() {
    const { orders } = useApp();
    const [showLabel,     setShowLabel]     = useState(false);
    const [step,          setStep]          = useState(1); // 1: Select Order, 2: Double Check, 3: Finished
    const [activeOrder,   setActiveOrder]   = useState(null);
    const [scanInput,     setScanInput]     = useState('');
    const [scanError,     setScanError]     = useState(null);
    const [lastScannedId, setLastScannedId] = useState(null);

    const scanRef              = useRef(null);
    const errorTimeoutRef      = useRef(null);
    const lastScannedTimeoutRef= useRef(null);
    const modalCloseBtnRef     = useRef(null);
    const titleId              = 'label-modal-title';

    // Cleanup de todos os timeouts pendentes ao desmontar
    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current)       clearTimeout(errorTimeoutRef.current);
            if (lastScannedTimeoutRef.current) clearTimeout(lastScannedTimeoutRef.current);
        };
    }, []);

    // Foco no input de scan após cada bipe (lastScannedId resetado → null)
    useEffect(() => {
        if (step === 2 && lastScannedId === null) {
            scanRef.current?.focus();
        }
    }, [step, lastScannedId]);

    // Fecha modal de etiqueta com Escape
    useEffect(() => {
        if (!showLabel) return;
        const onKey = (e) => { if (e.key === 'Escape') setShowLabel(false); };
        document.addEventListener('keydown', onKey);
        // Foca o botão de fechar ao abrir
        modalCloseBtnRef.current?.focus();
        return () => document.removeEventListener('keydown', onKey);
    }, [showLabel]);

    // ── Busca e carregamento de ordem real ──────────────────────────────────
    const handleLoadOrder = (value) => {
        const input = value.trim().toUpperCase();
        // Tenta correspondência exata primeiro; fallback para substring (busca assistida)
        const found = orders.find(o =>
            o.id.toUpperCase() === input ||
            o.id.toUpperCase().includes(input)
        );
        if (found) {
            const orderWithCheck = {
                ...found,
                checkItems: found.orderItems.map(i => ({
                    ...i,
                    conferido: 0,
                }))
            };
            setActiveOrder(orderWithCheck);
            setScanInput('');
            setScanError(null); // Reseta erro de scan anterior ao trocar de pedido
            setStep(2);
        } else {
            alert('Pedido não encontrado. Tente SO-8842.');
        }
    };

    // ── Bipagem funcional no Double Check ────────────────────────────────────
    const handlePackingScan = (e) => {
        if (e.key !== 'Enter') return;
        const ean = scanInput.trim().toUpperCase();
        if (!ean || !activeOrder) return;

        // Busca por EAN (campo disponível no contexto) ou por SKU (fallback)
        const idx = activeOrder.checkItems.findIndex(i =>
            i.ean?.toUpperCase() === ean ||
            i.sku?.toUpperCase().includes(ean)
        );

        if (idx === -1) {
            setScanError(`Código "${ean}" não pertence a este pedido.`);
            setScanInput('');
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = setTimeout(() => setScanError(null), 3000);
            return;
        }

        const item = activeOrder.checkItems[idx];
        if (item.conferido >= item.expected) {
            setScanError(`Quantidade máxima já conferida para "${item.desc}".`);
            setScanInput('');
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = setTimeout(() => setScanError(null), 3000);
            return;
        }

        const updated = [...activeOrder.checkItems];
        updated[idx] = { ...item, conferido: item.conferido + 1 };
        setActiveOrder(prev => ({ ...prev, checkItems: updated }));
        setLastScannedId(item.id);
        setScanInput('');
        if (lastScannedTimeoutRef.current) clearTimeout(lastScannedTimeoutRef.current);
        lastScannedTimeoutRef.current = setTimeout(() => setLastScannedId(null), 800);
    };

    // Calcular totais para o header
    const totalConferido = activeOrder?.checkItems.reduce((acc, i) => acc + i.conferido, 0) ?? 0;
    const totalEsperado  = activeOrder?.checkItems.reduce((acc, i) => acc + i.expected,  0) ?? 0;
    const allDone        = totalEsperado > 0 && totalConferido >= totalEsperado;

    // Reset ao voltar para step 1
    const handleNextOrder = () => {
        setStep(1);
        setActiveOrder(null);
        setScanInput('');
        setScanError(null);
        setLastScannedId(null);
        setShowLabel(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight uppercase">2.11 Embalar Pedidos</h1>
                    <p className="text-sm text-slate-500">Double Check de itens e fechamento de volumes</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Estação</span>
                        <span className="text-sm font-bold">PACK-01 (Norte)</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-100 border border-green-200 flex items-center justify-center" aria-hidden="true">
                        <Zap className="w-5 h-5 text-green-600 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* ── STEP 1 — Selecionar Ordem ── */}
            {step === 1 && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center space-y-6 shadow-xl shadow-primary/5 border-b-8 border-b-primary/10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center" aria-hidden="true">
                            <Package className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Pronto para iniciar novo volume?</h2>
                        <p className="text-slate-500 max-w-sm mx-auto text-sm">Bipe a etiqueta de picking ou digite o número do pedido abaixo para iniciar a conferência.</p>
                    </div>
                    <div className="max-w-md mx-auto relative group">
                        <Scan className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" aria-hidden="true" />
                        {/* Label sr-only associa o campo ao leitor de tela sem texto visível */}
                        <label htmlFor="order-search" className="sr-only">Buscar pedido por código ou número SO</label>
                        <input
                            id="order-search"
                            type="text"
                            placeholder="Digite SO #8842 para testar..."
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLoadOrder(scanInput)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-5 px-14 text-lg font-black tracking-widest focus:ring-4 focus:ring-primary/10 transition-all text-center outline-none"
                        />
                        <button
                            onClick={() => handleLoadOrder(scanInput)}
                            aria-label="Carregar pedido"
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white p-3 rounded-xl hover:scale-105 transition-transform"
                        >
                            <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 2 — Double Check com dados reais ── */}
            {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                            {/* Header com dados reais */}
                            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                                <div>
                                    <h2 className="text-lg font-black uppercase">
                                        {activeOrder?.id ?? 'SO #8842'} — Conferência
                                    </h2>
                                    <p className="text-xs text-slate-400 font-bold">
                                        Cliente: {activeOrder?.client ?? 'Distribuidora Veloz'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black leading-none">
                                        {totalConferido}
                                        <span className="text-slate-300 mx-1">/</span>
                                        {totalEsperado}
                                    </p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Conferidos</p>
                                </div>
                            </div>

                            {/* Campo de bipe — foco mantido automaticamente via useEffect */}
                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-primary transition-all mb-4">
                                <Scan className="w-5 h-5 text-primary shrink-0 animate-pulse" aria-hidden="true" />
                                <label htmlFor="scan-double-check" className="sr-only">Bipe o produto para conferência</label>
                                <input
                                    id="scan-double-check"
                                    ref={scanRef}
                                    autoFocus
                                    type="text"
                                    value={scanInput}
                                    onChange={e => setScanInput(e.target.value)}
                                    onKeyDown={handlePackingScan}
                                    placeholder="Bipe o produto para conferir..."
                                    className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
                                />
                            </div>
                            {scanError && (
                                <p
                                    role="alert"
                                    className="text-xs font-black text-red-600 flex items-center gap-1.5 mb-3 px-1"
                                >
                                    <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" /> {scanError}
                                </p>
                            )}

                            {/* Lista de itens com dados reais */}
                            <div className="space-y-3">
                                {(activeOrder?.checkItems ?? []).map((item) => {
                                    const isDone  = item.conferido >= item.expected;
                                    const isFlash = lastScannedId === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-default
                                                ${isFlash
                                                    ? 'bg-green-50 border-green-200'
                                                    : isDone
                                                        ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60'
                                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm
                                                ${isDone
                                                    ? 'bg-green-100 border-green-200 text-green-600'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300'
                                                }`}
                                                aria-hidden="true"
                                            >
                                                {isDone
                                                    ? <CheckCircle2 className="w-6 h-6" />
                                                    : <Box className="w-6 h-6" />
                                                }
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">{item.desc}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.sku}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-black px-2 py-1 rounded-lg
                                                    ${isDone
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                    }`}
                                                >
                                                    {isDone ? 'COMPLETO' : `FALTAM ${item.expected - item.conferido}`}
                                                </span>
                                                <span className="text-sm font-black tabular-nums">
                                                    {item.conferido}
                                                    <span className="text-slate-300 mx-0.5">/</span>
                                                    {item.expected}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-primary p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                            <div className="relative z-10">
                                <ShieldCheck className="w-10 h-10 mb-4 opacity-50" aria-hidden="true" />
                                <h3 className="text-xl font-black leading-tight mb-2">Double Check Ativado</h3>
                                <p className="text-xs opacity-80 leading-relaxed font-bold">O sistema não permite o fechamento do volume se houver divergências com o pedido original Omie.</p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-10" aria-hidden="true">
                                <Box className="w-32 h-32" />
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (!allDone) {
                                    alert(
                                        `Existem itens pendentes de conferência.\n` +
                                        `Conferidos: ${totalConferido} / ${totalEsperado}\n\n` +
                                        `O Double Check impede o fechamento com divergências.`
                                    );
                                    return;
                                }
                                setShowLabel(true);
                                setStep(3);
                            }}
                            aria-disabled={!allDone}
                            className={`w-full font-black py-5 rounded-3xl shadow-xl transition-all flex flex-col items-center gap-1 group
                                ${allDone
                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20 cursor-pointer'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                FECHAR VOLUME <CheckCircle2 className="w-5 h-5 group-hover:scale-125 transition-transform" aria-hidden="true" />
                            </div>
                            <span className="text-[10px] opacity-80 uppercase tracking-widest font-black">Gerar Etiqueta de Embarque</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 3 — Confirmação com dados reais ── */}
            {step === 3 && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 border-4 border-green-100" aria-hidden="true">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">Volume Fechado!</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Pedido {activeOrder?.id ?? 'SO #8842'} sincronizado com
                        status 'Pronto para Embarque' no Omie.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <button
                            onClick={() => setShowLabel(true)}
                            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                        >
                            <Printer className="w-5 h-5" aria-hidden="true" /> REIMPRIMIR
                        </button>
                        <button
                            onClick={handleNextOrder}
                            className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                        >
                            PRÓXIMO PEDIDO <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Modal Etiqueta ── */}
            {showLabel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    {/* Overlay — botão para acessibilidade por teclado */}
                    <button
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm cursor-default"
                        onClick={() => setShowLabel(false)}
                        aria-label="Fechar modal de etiqueta"
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        className="bg-white p-10 rounded-[40px] shadow-2xl relative z-10 w-full max-w-md animate-in zoom-in-95 duration-300"
                    >
                        {/* Botão fechar — recebe foco automaticamente via useEffect */}
                        <button
                            ref={modalCloseBtnRef}
                            onClick={() => setShowLabel(false)}
                            aria-label="Fechar modal de etiqueta"
                            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
                        >
                            <X className="w-5 h-5" aria-hidden="true" />
                        </button>

                        <div className="border-[6px] border-black p-6 space-y-6 text-black font-sans uppercase">
                            <div className="flex justify-between items-center border-b-4 border-black pb-4">
                                <div id={titleId} className="font-black italic text-3xl">V-PARTS</div>
                                <div className="text-right">
                                    <p className="text-xs font-black">Transporte</p>
                                    <p className="text-lg font-black leading-none">JADLOG</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black mb-1">Destinatário</p>
                                    <p className="text-xs font-bold leading-tight">
                                        {activeOrder?.client ?? 'Distribuidora Veloz'}<br />
                                        Av. das Américas, 2000<br />Rio de Janeiro - RJ
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black mb-1">Pedido ERP</p>
                                    <p className="text-2xl font-black">#{activeOrder?.id ?? '8842'}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center py-6 border-y-4 border-black border-dashed">
                                <QrCode className="w-40 h-40" aria-label="QR Code da etiqueta de embarque" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-full h-20 bg-black flex items-center justify-center text-white text-3xl font-black tracking-[0.6em]">
                                    VOLUME 01/04
                                </div>
                                <p className="text-[10px] font-black mt-2 tracking-widest">VerticalParts WMS - High Accuracy Logistics</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowLabel(false)}
                            className="mt-8 w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-black transition-colors shadow-lg"
                        >
                            ENVIAR PARA IMPRESSORA (ZPL)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
