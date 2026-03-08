import React, { useState, useCallback } from 'react';
import {
    Barcode,
    CircleCheck,
    CircleAlert,
    Printer,
    ArrowLeft,
    QrCode,
    Box,
    Truck,
    Scan,
    Warehouse,
    X,
} from 'lucide-react';

// Dados iniciais como constante — serão copiados para o estado
const INITIAL_ITEMS = [
    { id: 1, name: 'Pastilha de Freio Cerâmica', pn: 'VP-FR4429-X', total: 5,  collected: 2, status: 'partial' },
    { id: 2, name: 'Disco de Freio Ventilado',   pn: 'VP-DF882-M',  total: 2,  collected: 2, status: 'done'    },
    { id: 3, name: 'Fluido de Freio DOT4',        pn: 'VP-FL001',    total: 10, collected: 0, status: 'pending' },
];

// Recalcula o status de um item com base nas quantidades
function calcStatus(collected, total) {
    if (collected >= total) return 'done';
    if (collected > 0)      return 'partial';
    return 'pending';
}

export default function LoadCheck() {
    const [showLabel,   setShowLabel]   = useState(false);
    const [manualCode,  setManualCode]  = useState('');
    const [items,       setItems]       = useState(INITIAL_ITEMS);
    const [lastScanned, setLastScanned] = useState(null); // feedback visual da última leitura

    // Calcula dinamicamente itens faltantes
    const missingItems = items.reduce((acc, item) => acc + Math.max(0, item.total - item.collected), 0);

    // Processa a leitura de um código (PN ou EAN simulado)
    const handleScan = useCallback((code) => {
        const upper = code.trim().toUpperCase();
        if (!upper) return;

        setItems(prev => {
            const idx = prev.findIndex(i => i.pn.toUpperCase() === upper);
            if (idx === -1) {
                setLastScanned({ code: upper, found: false });
                return prev;
            }
            setLastScanned({ code: upper, found: true, name: prev[idx].name });
            return prev.map((item, i) => {
                if (i !== idx) return item;
                // Não ultrapassar o total
                const newCollected = Math.min(item.collected + 1, item.total);
                return { ...item, collected: newCollected, status: calcStatus(newCollected, item.total) };
            });
        });

        setManualCode('');
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleScan(manualCode);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        aria-label="Voltar"
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight uppercase">Conferência de Carga</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Checkout de Pedido #SO-8842</p>
                    </div>
                </div>

                {/* Badge de itens faltantes — dinâmico */}
                {missingItems > 0 && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-200">
                        <CircleAlert className="w-4 h-4" aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase">
                            {missingItems === 1 ? 'Falta 1 item' : `Faltam ${missingItems} itens`}
                        </span>
                    </div>
                )}
                {missingItems === 0 && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg border border-green-200">
                        <CircleCheck className="w-4 h-4" aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase">Tudo coletado!</span>
                    </div>
                )}
            </div>

            {/* Scanner */}
            <div className="bg-slate-900 border-4 border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true" />
                <div className="flex flex-col items-center justify-center gap-6 text-center relative z-10">
                    <div className="w-20 h-20 rounded-full border-2 border-primary/40 flex items-center justify-center animate-pulse" aria-hidden="true">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <Scan className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">Aguardando leitura de produto</h3>
                        <p className="text-slate-400 text-sm">Aponte o scanner para o código EAN do item ou digite o PN manualmente</p>
                    </div>

                    {/* Feedback da última leitura */}
                    {lastScanned && (
                        <div className={`w-full max-w-sm px-4 py-2 rounded-xl text-xs font-bold ${lastScanned.found ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`} role="status" aria-live="polite">
                            {lastScanned.found
                                ? `✓ Bipado: ${lastScanned.name}`
                                : `✗ Código não encontrado: ${lastScanned.code}`
                            }
                        </div>
                    )}

                    {/* Input controlado com label sr-only */}
                    <div className="w-full max-w-sm relative">
                        <label htmlFor="scanner-input" className="sr-only">Código de barras ou PN do produto</label>
                        <input
                            id="scanner-input"
                            type="text"
                            autoFocus
                            value={manualCode}
                            onChange={e => setManualCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite o PN e pressione Enter..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-white text-center focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                        />
                        <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" aria-hidden="true" />
                    </div>
                </div>
            </div>

            {/* Lista de itens — reativa */}
            <div className="space-y-3" role="list" aria-label="Itens do pedido">
                {items.map((item) => (
                    <div
                        key={item.id}
                        role="listitem"
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-all hover:translate-x-1"
                    >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
                            item.status === 'done'
                                ? 'bg-green-50 border-green-200 text-green-600'
                                : item.status === 'partial'
                                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}>
                            {item.status === 'done'
                                ? <CircleCheck className="w-6 h-6" aria-hidden="true" />
                                : <Box className="w-6 h-6" aria-hidden="true" />
                            }
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">PN: {item.pn}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black leading-none">
                                <span className={item.status === 'done' ? 'text-green-600' : item.status === 'partial' ? 'text-amber-600' : ''}>{item.collected}</span>
                                <span className="text-slate-300 text-sm mx-1">/</span>
                                {item.total}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Coletado</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Ações */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setShowLabel(true)}
                    aria-label="Gerar etiqueta parcial de expedição"
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all shadow-sm group"
                >
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">
                        <Printer className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span className="text-xs uppercase tracking-widest">Etiqueta Parcial</span>
                </button>
                <button
                    disabled={missingItems > 0}
                    aria-label="Finalizar conferência de carga"
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform text-white">
                        <CircleCheck className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span className="text-xs uppercase tracking-widest">Finalizar Carga</span>
                </button>
            </div>

            {/* Modal de Etiqueta de Expedição */}
            {showLabel && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="label-modal-title"
                >
                    {/* Overlay — botão semântico para fechar */}
                    <button
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                        onClick={() => setShowLabel(false)}
                        aria-label="Fechar modal de etiqueta"
                    />

                    <div className="bg-white p-8 rounded-3xl shadow-2xl relative z-10 w-full max-w-sm animate-in zoom-in-95 duration-300">
                        {/* Botão fechar no canto */}
                        <button
                            onClick={() => setShowLabel(false)}
                            aria-label="Fechar modal"
                            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                        </button>

                        {/* Conteúdo da etiqueta */}
                        <div className="border-4 border-black p-4 space-y-4 text-black font-sans uppercase">
                            <div className="flex justify-between items-start border-b-2 border-black pb-4">
                                <Warehouse className="w-12 h-12" aria-hidden="true" />
                                <div className="text-right">
                                    <p className="text-[10px] font-black">Ship To / Destinatário</p>
                                    <p className="text-sm font-bold">Distribuidora Veloz</p>
                                </div>
                            </div>
                            <div className="py-4 flex justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <p className="text-[10px] font-black">Order / Pedido</p>
                                    <p id="label-modal-title" className="text-xl font-black">#SO-8842</p>
                                    <div className="pt-2">
                                        <p className="text-[10px] font-black">Volume / Box</p>
                                        <p className="font-bold">01 / 04</p>
                                    </div>
                                </div>
                                <div className="w-24 h-24 border-2 border-black p-1" aria-label="QR Code do pedido">
                                    <div className="bg-black w-full h-full flex items-center justify-center text-white">
                                        <QrCode className="w-16 h-16" aria-hidden="true" />
                                    </div>
                                </div>
                            </div>
                            <div className="border-t-2 border-black pt-4 flex flex-col items-center gap-2">
                                <div className="w-full h-16 bg-black flex items-center justify-center text-white uppercase font-black text-2xl tracking-[0.5em]" aria-hidden="true">
                                    <Barcode className="w-12 h-12 rotate-90 opacity-0" />
                                    VERTICAL
                                </div>
                                <p className="text-[10px] font-black tracking-widest">VerticalParts WMS - 2026-02-21</p>
                            </div>
                        </div>

                        {/* Ações: Fechar e Imprimir separados */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowLabel(false)}
                                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors text-sm"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={() => { window.print(); }}
                                className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" aria-hidden="true" /> Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
