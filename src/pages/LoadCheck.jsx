import React, { useState } from 'react';
import {
    Barcode,
    CircleCheck,
    CircleAlert,
    Printer,
    ArrowLeft,
    QrCode,
    Box,
    Truck,
    Scan
} from 'lucide-react';

const orderItems = [
    { id: 1, name: 'Pastilha de Freio Cerâmica', pn: 'VP-FR4429-X', total: 5, collected: 2, status: 'partial' },
    { id: 2, name: 'Disco de Freio Ventilado', pn: 'VP-DF882-M', total: 2, collected: 2, status: 'done' },
    { id: 3, name: 'Fluido de Freio DOT4', pn: 'VP-FL001', total: 10, collected: 0, status: 'pending' },
];

export default function LoadCheck() {
    const [showLabel, setShowLabel] = useState(false);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight uppercase">Conferência de Carga</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Checkout de Pedido #SO-8842</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-warning/10 text-warning rounded-lg border border-warning/20">
                    <CircleAlert className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase">Faltam 13 itens</span>
                </div>
            </div>

            {/* Scanner Simulator */}
            <div className="bg-slate-900 border-4 border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="flex flex-col items-center justify-center gap-6 text-center relative z-10">
                    <div className="w-20 h-20 rounded-full border-2 border-primary/40 flex items-center justify-center animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <Scan className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">Aguardando leitura de produto</h3>
                        <p className="text-slate-400 text-sm">Aponte o scanner para o código EAN do item</p>
                    </div>
                    <div className="w-full max-w-sm relative">
                        <input
                            type="text"
                            placeholder="Digite o código manualmente..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-white text-center focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                        />
                        <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
                {orderItems.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-all hover:translate-x-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${item.status === 'done' ? 'bg-success/5 border-success/20 text-success' :
                            item.status === 'partial' ? 'bg-warning/5 border-warning/20 text-warning' :
                                'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}>
                            {item.status === 'done' ? <CircleCheck className="w-6 h-6" /> : <Box className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">PN: {item.pn}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black leading-none">
                                {item.collected}<span className="text-slate-300 text-sm mx-1">/</span>{item.total}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Coletado</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setShowLabel(true)}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all shadow-sm group"
                >
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">
                        <Printer className="w-6 h-6" />
                    </div>
                    <span className="text-xs uppercase tracking-widest">Etiqueta Parcial</span>
                </button>
                <button className="bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 group">
                    <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform text-white">
                        <CircleCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xs uppercase tracking-widest">Finalizar Carga</span>
                </button>
            </div>

            {/* Shipping Label Modal (Simulated) */}
            {showLabel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowLabel(false)}></div>
                    <div className="bg-white p-8 rounded-3xl shadow-2xl relative z-10 w-full max-w-sm animate-in zoom-in-95 duration-300">
                        <div className="border-4 border-black p-4 space-y-4 text-black font-sans uppercase">
                            <div className="flex justify-between items-start border-b-2 border-black pb-4">
                                <Warehouse className="w-12 h-12" />
                                <div className="text-right">
                                    <p className="text-[10px] font-black">Ship To / Destinatário</p>
                                    <p className="text-sm font-bold">Distribuidora Veloz</p>
                                </div>
                            </div>
                            <div className="py-4 flex justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <p className="text-[10px] font-black">Order / Pedido</p>
                                    <p className="text-xl font-black">#SO-8842</p>
                                    <div className="pt-2">
                                        <p className="text-[10px] font-black">Volume / Box</p>
                                        <p className="font-bold">01 / 04</p>
                                    </div>
                                </div>
                                <div className="w-24 h-24 border-2 border-black p-1">
                                    <div className="bg-black w-full h-full flex items-center justify-center text-white">
                                        <QrCode className="w-16 h-16" />
                                    </div>
                                </div>
                            </div>
                            <div className="border-t-2 border-black pt-4 flex flex-col items-center gap-2">
                                <div className="w-full h-16 bg-black flex items-center justify-center text-white uppercase font-black text-2xl tracking-[0.5em]">
                                    <Barcode className="w-12 h-12 rotate-90 opacity-0" />
                                    VERTICAL
                                </div>
                                <p className="text-[10px] font-black tracking-widest">VerticalParts WMS - 2026-02-21</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowLabel(false)}
                            className="mt-6 w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
                        >
                            FECHAR E IMPRIMIR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
